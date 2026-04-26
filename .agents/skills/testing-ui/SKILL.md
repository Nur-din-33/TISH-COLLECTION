# Testing TISH COLLECTION UI

## Project Structure
- Next.js 14 app lives in `client/` directory
- Tailwind CSS for styling with custom design system tokens in `tailwind.config.js`
- Global styles and utility classes in `client/src/app/globals.css`
- Supabase backend (may not be configured in dev — expect API errors)

## Local Dev Setup
```bash
cd client && npm install
npx next dev -p 3001
```
- Build: `cd client && npm run build`
- The app will be available at http://localhost:3001
- If port 3001 is in use: `fuser -k 3001/tcp` then restart
- If CSS doesn't load on first visit, the `.next` cache may be stale — delete it and restart: `rm -rf client/.next && cd client && npx next dev -p 3001`
- Opening a fresh browser tab (not refreshing a cached one) may also fix CSS issues

## Testing Approach
- This is a frontend-only app — test through the browser UI
- No backend API credentials needed for UI testing (pages render without API data)
- Products page will show "NO PRODUCTS FOUND" without backend — this is expected
- Product card hover interactions require actual products from the API to test
- Use browser at localhost:3001, not the Vercel preview (which may require Vercel login)

## Key Pages to Test
| Page | URL | Key Elements |
|------|-----|-------------|
| Homepage | `/` | Hero section, category cards, trust section, newsletter |
| Products | `/products` | Dark header banner, category filter pills |
| Login | `/login` | Split-panel layout (dark left, form right) |
| Register | `/register` | Form + email verification step |
| Footer | Any page | Brand strip, social icons, payment badges |

## Navbar Behavior
- Homepage (`/`): Navbar uses `transparent` prop — transparent with white text over dark hero, becomes solid white `fixed` nav on scroll past 50px
- Other pages: Navbar is always `sticky top-0` with solid white background
- Announcement bar at top: "Free delivery on orders over KES 5,000"

## Known Tailwind Gotchas
- Tailwind border-width scale: 0, 2, 4, 8 — NOT 3 (use `border-2` not `border-3`)
- Tailwind opacity scale: 0, 5, 10, 15, 20...100 — arbitrary values like `/8` won't generate CSS
- Don't mix `sticky` and `absolute` on the same element — use conditional classes
- CSS `position` property is NOT animatable — switching between absolute/sticky causes instant layout shifts. Use `fixed` for both states if you need smooth transitions

## Devin Secrets Needed
None required for UI testing. Backend API testing would require Supabase credentials.
