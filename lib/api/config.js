// Base URL of the Limitra backend API. Set NEXT_PUBLIC_API_URL in .env.local
// (copy .env.example) once a backend is running. Falls back to localhost for dev.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
