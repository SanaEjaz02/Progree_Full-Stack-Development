const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export async function apiRequest(path, { token, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error("The store server isn't running. Start it with run.bat.");
  }
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message ?? 'We could not complete that request.');
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const imageFallback = '/images/bags-01.jpg';

export function formatPrice(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}