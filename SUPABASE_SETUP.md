# 🗄️ Supabase Database Setup Guide

Supabase gives you a FREE cloud PostgreSQL database that works perfectly
with your DropKE site. Follow these steps carefully.

---

## STEP 1 — Create Your Supabase Project

1. Go to **https://supabase.com** and click **Start for Free**
2. Sign up with GitHub or Google
3. Click **New Project**
4. Fill in:
   - **Name**: `dropshipping-ke`
   - **Database Password**: create a strong password — SAVE IT SOMEWHERE SAFE
   - **Region**: Choose `East US (N. Virginia)` or `EU West` — closest to Kenya
5. Click **Create new project**
6. Wait about 2 minutes for it to be ready (you'll see a green status)

---

## STEP 2 — Get Your Database Connection String

1. In your Supabase project, click **Settings** (gear icon, bottom left)
2. Click **Database**
3. Scroll down to **Connection String**
4. Click the **URI** tab
5. Copy the connection string — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the password you set in Step 1

Open your `server/.env` file and set:
```
DATABASE_URL="postgresql://postgres:YourPassword@db.abcdefghijk.supabase.co:5432/postgres"
```

---

## STEP 3 — Get Your API Keys

1. In Supabase, click **Settings → API**
2. Copy these values into your `.env` files:

**server/.env:**
```
SUPABASE_URL="https://abcdefghijk.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGc..."   ← this is the "service_role" key (secret!)
```

**client/.env.local:**
```
NEXT_PUBLIC_SUPABASE_URL="https://abcdefghijk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."   ← this is the "anon" key (safe to expose)
```

⚠️ NEVER put the service_role key in the frontend (.env.local). Only use it server-side.

---

## STEP 4 — Enable Real-Time on Your Tables

Supabase real-time is not enabled by default on all tables. Enable it:

1. In Supabase, click **Database** → **Replication**
2. Click **0 tables** next to `supabase_realtime`
3. Toggle ON these tables:
   - ✅ `orders`
   - ✅ `products`
   - ✅ `payments`
   - ✅ `users`
4. Click **Update**

---

## STEP 5 — Push Your Schema to Supabase

In your **server terminal** in VS Code:

```powershell
npx prisma migrate dev --name init
```

This creates all your tables (users, products, orders, payments, etc.)
in the Supabase cloud database.

Then seed the database with sample products and admin account:
```powershell
node src/prisma/seed.js
```

---

## STEP 6 — Install New Packages

In the **server terminal**:
```powershell
npm install --legacy-peer-deps
```

In the **client terminal**:
```powershell
npm install --legacy-peer-deps
```

Then restart both servers.

---

## STEP 7 — Verify Everything Works

1. Open your Supabase dashboard → **Table Editor**
2. You should see all your tables: users, products, orders, etc.
3. Click on `users` — you should see the admin account
4. Click on `products` — you should see the 6 sample products

In your browser:
- Go to http://localhost:3000/admin
- The real-time indicator should show **"Supabase real-time connected"** in green

---

## How Real-Time Works Now

| What happens          | Who sees it instantly           |
|-----------------------|--------------------------------|
| User places an order  | Admin dashboard shows new order |
| Admin updates status  | Customer orders page updates    |
| Product stock changes | All product pages update        |
| Payment confirmed     | Order status changes live       |

---

## Supabase Free Tier Limits

The free tier is very generous for starting out:
- 500 MB database storage
- 5 GB bandwidth per month
- 50,000 monthly active users
- Unlimited API requests
- Real-time connections included

When you grow, the Pro plan is $25/month.

---

## View Your Database Online

You can see and edit your data directly in Supabase:
- **Table Editor** — browse and edit rows like a spreadsheet
- **SQL Editor** — run SQL queries directly
- **Auth** — see all registered users
- **Storage** — file uploads (optional)
- **Logs** — see all database queries

Go to https://supabase.com/dashboard and open your project anytime.
