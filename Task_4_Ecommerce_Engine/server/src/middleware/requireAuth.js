import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export async function requireAuth(request, _response, next) {
  try {
    const authorization = request.get('authorization') ?? '';
    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next(Object.assign(new Error('Please sign in to continue.'), { status: 401 }));
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id name email');
    if (!user) return next(Object.assign(new Error('Your session is no longer valid.'), { status: 401 }));

    request.user = user;
    next();
  } catch {
    next(Object.assign(new Error('Your session is no longer valid.'), { status: 401 }));
  }
}