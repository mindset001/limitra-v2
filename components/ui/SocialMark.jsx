/* Social glyph icon — originally defined inside legacy/pages-auth.jsx and reused by
   pages-home, videos, pages-account, share; given a real shared home here. */
import { SOCIAL_GLYPHS } from '@/lib/data';

export function SocialMark({ name, size = 18 }) {
  const d = (SOCIAL_GLYPHS || {})[name];
  if (!d) return null;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>;
}
