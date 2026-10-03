import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80, 'Name must be 80 characters or fewer.'),
  email: z.string().trim().email('Enter a valid email address.').max(254).transform((value) => value.toLowerCase()),
  password: z.string()
    .min(10, 'Use at least 10 characters.')
    .max(72, 'Password must be 72 characters or fewer.')
    .refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value), 'Use upper and lowercase letters, a number, and a symbol.')
});

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'Enter your password.').max(72)
});

function issueToken(user) {
  return jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '7d', issuer: 'se-commerce-engine' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export function createAuthController({ User }) {
  return {
    register: async (request, response, next) => {
      try {
        const parsed = registerSchema.safeParse(request.body);
        if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);

        const existing = await User.findOne({ email: parsed.data.email });
        if (existing) throw new HttpError(409, 'An account with this email already exists.');

        const passwordHash = await bcrypt.hash(parsed.data.password, 12);
        const user = await User.create({ name: parsed.data.name, email: parsed.data.email, passwordHash });
        response.status(201).json({ token: issueToken(user), user: publicUser(user) });
      } catch (error) {
        if (error.code === 11000) return next(new HttpError(409, 'An account with this email already exists.'));
        next(error);
      }
    },

    login: async (request, response, next) => {
      try {
        const parsed = loginSchema.safeParse(request.body);
        if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message);

        const user = await User.findOne({ email: parsed.data.email }).select('+passwordHash');
        if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
          throw new HttpError(401, 'Email or password is incorrect.');
        }

        response.json({ token: issueToken(user), user: publicUser(user) });
      } catch (error) {
        next(error);
      }
    },

    me: (request, response) => response.json({ user: publicUser(request.user) })
  };
}