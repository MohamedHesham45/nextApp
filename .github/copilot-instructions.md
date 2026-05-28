# Copilot Instructions

## Project Overview

**Sitara Mall (ستارة مول)** — Arabic-language e-commerce store for decorative pillows and curtains, based in Port Said, Egypt. Built with Next.js 14 App Router, MongoDB, and Cloudinary.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint (next lint)
npm run start    # Start production server
```

No test suite is configured.

## Architecture

### Dual UI Versions
The app has two parallel route trees that mirror each other:
- **Root** (`/`) — primary storefront, uses `V2Navbar`
- **`/v2/`** — alternate UI, uses `Navbar`

`ConditionalLayout.js` controls which navbar renders based on `pathname.startsWith("/v2")`. **Note**: the condition is inverted — non-v2 routes get `V2Navbar` and v2 routes get `Navbar`. V2 components are prefixed with `V2` (e.g., `V2Navbar`, `V2ProductCardHome`, `V2FiveProductsPerCategory`).

### Databases (MongoDB)
Two separate MongoDB databases accessed via `clientPromise` from `@/lib/mongodb`:
- **`productDB`** — collections: `products`, `categories`
- **`userDB`** — collections: `profiles`

`mongoose` is used only for the `Product` model in `src/models/Product.js`. All other DB access uses the native MongoDB driver directly (`clientPromise`).

### Authentication
- JWT-based, stored in `localStorage` under key `authToken`
- Token verified via `POST /api/auth/verify-token`
- User roles: `"user"` (customer) vs admin/manager (any other role or null)
- Auth state lives in `AuthContext` (`src/app/context/AuthContext.js`); access via `useAuth()`

### Cart & Favorites
Managed entirely client-side in `localStorage` (`"cart"`, `"favorite"` keys). State accessible via `useCartFavorite()` from `CartFavoriteContext`.

### Image/Video Uploads
Uploads go to an **external server** at `93.127.202.37:3001` via:
- `POST /upload-images` — returns `{ files: string[] }`
- `POST /upload-video` — returns `{ file: string }`
- `DELETE /remove-images` — body: `{ filenames: string[] }`
- `DELETE /remove-videos` — body: `{ filenames: string[] }`

Static images are also hosted on Cloudinary (configured in `src/lib/cloudinary.js`).

### Customizable Settings
Site settings (hero image, WhatsApp number, display mode, etc.) are stored in the `customize` collection and fetched via `/api/customize?name=<Arabic-key>`. Keys are in Arabic (e.g., `"رقم الواتس"`, `"صوره الوجهه"`, `"وضع العرض"`).

### Facebook Pixel
Two Pixel IDs are initialized in the root layout via inline script. Server-side conversion events are sent via `/api/meta-conversion`.

## Key Conventions

### API Routes
- All route handlers use `NextResponse.json()` and follow `src/app/api/<resource>/route.js` structure
- Error messages returned to clients are in **Arabic**
- All API routes have `no-store` cache headers (configured in `next.config.mjs`)

### Product Reference Codes
Products are assigned codes in the format `AB01`, `AB02`, etc. Auto-incremented from the latest `referenceCode` in the DB.

### Tailwind Theme
Custom color palette extends Tailwind with Amazon-inspired colors:
```
amazon (dark navy)  #232f3e
amazon-orange       #ff9900
amazon-orange-dark  #ff6600
amazon-yellow       #febd69
amazon-light-gray   #eaeded
amazon-blue         #48a3c6
```

### Path Alias
`@/` resolves to `src/` (configured in `jsconfig.json`).

### Client vs Server Components
Pages and components that use hooks or browser APIs must have `"use client"` as the first line. API route files are always server-side and never need this directive.

### Admin Access Guard Pattern
```js
const auth = useAuth();
useEffect(() => {
  if (isLoaded) {
    if (!token || (isLoggedIn && role === "user")) {
      router.push("/");
    }
  }
}, [isLoaded, role, token]);
```

## Environment Variables

Required in `.env.local`:
```
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
