import { ApiError } from './client';

// Laravel-style validation errors: { field: ["msg", ...] } -> { field: "msg" }.
// Field names match the API body (e.g. "email", "address_line_1") — map them to
// a form's own state keys at the call site if they differ.
export function fieldErrorsFrom(error) {
  if (!(error instanceof ApiError) || !error.errors) return {};
  return Object.fromEntries(
    Object.entries(error.errors).map(([field, msgs]) => [field, Array.isArray(msgs) ? msgs[0] : msgs])
  );
}

// A message safe to show the user for any top-level/non-field failure
// (401/403/5xx, or a network error that never reached the server).
export function messageFrom(error) {
  if (error instanceof ApiError) return error.message || 'Something went wrong. Please try again.';
  return 'Network error — check your connection and try again.';
}
