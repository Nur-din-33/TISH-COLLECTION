# Testing TISH COLLECTION UI

## Project Structure
- Next.js 14 app lives in `client/` directory
- Tailwind CSS for styling with custom design system tokens in `tailwind.config.js`
- Global styles and utility classes in `client/src/app/globals.css`
- Supabase backend (may not be configured in dev — expect API errors)
- Backend seed file at `server/src/prisma/seed.js` — categories here must match frontend slugs

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
- Use the DOM output from the computer tool to verify link hrefs and text content programmatically, not just visually

## Key Pages to Test
| Page | URL | Key Elements |
|------|-----|-------------|
| Homepage | `/` | Hero section, category cards, trust section, newsletter |
| Products | `/products` | Dark header banner, category filter pills |
| Login | `/login` | Split-panel layout (dark left, form right) |
| Register | `/register` | Form + email verification step |
| Footer | Any page | Brand strip, social icons, payment badges |

## Category Testing Checklist
When categories change, verify consistency across ALL of these locations:
1. **Navbar links** — `client/src/components/layout/Navbar.js` (desktop + mobile menu)
2. **Homepage category cards** — `client/src/app/page.js` (categories array)
3. **Products page filter pills** — `client/src/app/products/page.js` (categories array)
4. **Footer shop links** — `client/src/components/layout/Footer.js`
5. **Backend seed file** — `server/src/prisma/seed.js` (category slugs must match frontend)
6. **Hero text & metadata** — `client/src/app/page.js` and `client/src/app/layout.js`

Common bug: frontend category slugs might get updated without updating the backend seed file, causing all category navigation to return 0 products.

## Navbar Behavior
- Homepage (`/`): Navbar uses `transparent` prop — transparent with white text over dark hero, becomes solid white `fixed` nav on scroll past 50px
- Other pages: Navbar is always `sticky top-0` with solid white background
- Announcement bar at top: "Free delivery on orders over KES 5,000"
- Hero section has `pt-28` to prevent text from overlapping with the transparent navbar

## Known Tailwind Gotchas
- Tailwind border-width scale: 0, 2, 4, 8 — NOT 3 (use `border-2` not `border-3`)
- Tailwind opacity scale: 0, 5, 10, 15, 20...100 — arbitrary values like `/8` won't generate CSS
- Don't mix `sticky` and `absolute` on the same element — use conditional classes
- CSS `position` property is NOT animatable — switching between absolute/sticky causes instant layout shifts. Use `fixed` for both states if you need smooth transitions

## Devin Secrets Needed
None required for UI testing. Backend API testing would require Supabase credentials.
