# UTA Marketplace — Dev Notes (Frontend + Backend)

> **Updated decision (IMPORTANT):**  
> We are **NOT building an in-app chat**.  
> The “Message/Chat” action will **redirect to the seller’s WhatsApp or Email** using `wa.me` or `mailto:` links.

This doc explains what’s built so far and how a developer can extend it.

---

## 0) Current Architecture (MVP)

### Frontend (React + TS)
- Marketplace UI: browse listings + filters
- Auth state stored via `useAuth()` (`token` + `userId`)
- “Message seller” button: **opens WhatsApp / Email** (no chat page needed)

### Backend (Node/Express + TS)
- Used mainly for:
  - **Dev auth** (JWT token)
  - **Listings API** (currently from arrays)
- Messaging endpoints can be **removed / ignored** since in-app chat is no longer required.

### Future
- Replace array-based listings with DB + gRPC (teammate handles gRPC + DB side)

---

## 1) Frontend

### 1.1 Routing
Layout wrapper pattern:

```tsx
<Route element={<Layout />}>
  <Route path="/listings" element={<Listings />} />
  <Route path="/profile" element={<Profile />} />
</Route>
```



### 1.2 `components/Layout.tsx` (App Shell)

**Important:** The project uses **`components/Layout.tsx`** for the entire app shell.

Current Layout.tsx responsibilities:
- Top bar: brand + nav
- Desktop nav + mobile nav
- Auth controls:
  - If logged in → show `userId` + “Sign out”
  - Logout uses the existing setter:

```ts
setAuth("", "");
nav("/auth");
```

Layout.tsx imports (current):
- `NAV_ITEMS`, `DIS` from `../config/marketpkace` (watch spelling)
- `useAuth` from `../state/auth`

Auth assumption:
- `useAuth()` returns `{ token, userId, setAuth }`

---

### 1.3 Listings Page

Listings page responsibilities:
- Render listing cards
- Filters (search/category/condition/price etc. depending on current UI)
- “Message seller” button:
  - If not logged in → navigate to `/auth`
  - If logged in → open WhatsApp or Email

✅ Replace any in-app chat logic (like `startConversation(...)` or routing to `/chat/...`) with WhatsApp/email redirect.

---

### 1.4 WhatsApp + Email Redirect (Implementation)

Each listing should include seller contact fields:
- `sellerWhatsapp?: string` (E.164 preferred without `+`, ex: `18175551234`)
- `sellerEmail?: string`

**WhatsApp (recommended)**
```ts
const phone = l.sellerWhatsapp; // e.g. "18175551234"
const text = encodeURIComponent(
  `Hi! I'm interested in: ${l.title} ($${l.price}). Is it still available?`
);
window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
```

**Email fallback**
```ts
const subject = encodeURIComponent(`Interested in: ${l.title}`);
const body = encodeURIComponent(
  `Hi,\n\nI'm interested in your listing: ${l.title} ($${l.price}). Is it still available?\n\nThanks!`
);
window.location.href = `mailto:${l.sellerEmail}?subject=${subject}&body=${body}`;
```

Recommended decision rule:
- If `sellerWhatsapp` exists → open WhatsApp
- Else if `sellerEmail` exists → open email
- Else → show UI message: “Seller contact not available”

---

### 1.5 Frontend API helper (`lib/api.ts`)
Still useful now:
- `devLogin(userId)` → `POST /auth/dev-login`

Optional next:
- add `getListings()` → `GET /listings` once you switch from mock listings.

Frontend env:
- `.env`:
  - `VITE_API_BASE=http://localhost:8080`

---

## 2) Backend (Node/Express + TS)

### 2.1 Install / Run

Install:
```bash
npm i express cors dotenv jsonwebtoken
npm i -D typescript tsx @types/node @types/express @types/cors @types/jsonwebtoken
```

Dev:
```bash
npm run dev
```

Build + start:
```bash
npm run build
npm start
```

---

### 2.2 Backend tsconfig (ESM)
Backend `package.json` uses `"type": "module"`.  
Recommended `tsconfig.json` (stable for Node + Express):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```

Note:
- If you used `"moduleResolution": "Bundler"`, some editors show false underlines.
- `NodeNext` is safest for backend ESM.

---

### 2.3 Backend Folder Structure (intended)

```text
backend/
  src/
    index.ts
    auth.ts
    middleware/
      requireAuth.ts
    routes/
      auth.ts
      listings.ts
    data/
      listings.ts
```

✅ Since chat is removed:
- remove or ignore:
  - `routes/messaging.ts`
  - `data/messaging.ts`

---

## 3) Backend Endpoints

### 3.1 Dev Auth
`POST /auth/dev-login`

Body:
```json
{ "userId": "someUserId" }
```

Response:
```json
{ "token": "<jwt>", "userId": "someUserId" }
```

Notes:
- This is for demo/testing only.
- Later replace with real auth (DB-backed) if needed.

---

### 3.2 Listings API
`GET /listings?categoryId=&q=&maxPrice=`

Response:
```json
{ "listings": [ ... ] }
```

Current behavior:
- filters against `LISTINGS` array in `src/data/listings.ts`

✅ Update listing shape to include contact info:

Example listing object:
```ts
{
  id: "listingA",
  title: "MacBook Pro 13 (M1)",
  price: 650,
  categoryId: "electronics",
  conditionId: "like_new",
  sellerId: "seller456",
  sellerWhatsapp: "18175551234",
  sellerEmail: "seller456@uta.edu",
  imageUrl: "...",
  meetSpotId: "library"
}
```

TODO:
- Replace array with DB/gRPC later.

---

## 4) Local Dev Environment

### Backend `.env` (example)
Create `backend/.env`:
- `PORT=8080`
- `JWT_SECRET=dev_secret_change_me`
- `CORS_ORIGIN=http://localhost:5173`

Backend should do:
- `dotenv.config()` in `src/index.ts`
- enable CORS:

```ts
cors({ origin: process.env.CORS_ORIGIN, credentials: true })
```

### Frontend `.env` (example)
Create `frontend/.env`:
- `VITE_API_BASE=http://localhost:8080`

---

## 5) API Contract Summary

### Auth
**POST** `/auth/dev-login`  
Body: `{ userId }`  
Resp: `{ token, userId }`

### Listings
**GET** `/listings`  
Query: `q`, `categoryId`, `maxPrice`  
Resp: `{ listings }`

No messaging endpoints are required anymore.

---

## 6) What Teammate Should Implement Next

### Backend
1. Replace `LISTINGS` array → DB via gRPC service
2. Add `GET /listings/:id`
3. Add `POST /listings` (protected) for creating listings
4. Add validation for `sellerWhatsapp` / `sellerEmail`

### Frontend
1. Replace local mock listings with `GET /listings`
2. Add seller contact info to listing cards (WhatsApp + email)
3. Implement WhatsApp/email fallback routing
4. Remove unused chat routes/pages/buttons if any remain

---

## 7) Quick File Map

Frontend:
- `components/Layout.tsx` → app shell + nav + auth signout
- `pages/Listings.tsx` → browse listings + “message seller”
- `lib/api.ts` → `devLogin` (and later `getListings`)
- `state/auth.ts` → stores `{ token, userId }`

Backend:
- `src/index.ts` → Express app + middleware + route mounting
- `src/routes/auth.ts` → dev login endpoint
- `src/routes/listings.ts` → listings API (array for now)
- `src/data/listings.ts` → listings array (temporary)

---

## 8) Notes for Grading / Documentation

We intentionally:
- use arrays for data storage now
- include TODO comments indicating DB + gRPC will replace arrays later
- do not implement in-app chat (redirect to WhatsApp/email instead)

