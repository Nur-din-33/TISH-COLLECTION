# 🇰🇪 Kenya Dropshipping Website — Step-by-Step Setup Guide

This guide walks you through setting up the full-stack dropshipping platform from scratch using VS Code.

---

## 📋 WHAT YOU ARE BUILDING

A real-time dropshipping website with:
- Product catalogue with live stock updates
- M-Pesa STK Push payments (Safaricom Daraja API)
- Order management with supplier routing
- Admin dashboard with live analytics
- SMS notifications via AfricasTalking
- PostgreSQL database with Prisma ORM

---

## ✅ STEP 1 — Install Required Software

Open your terminal and install the following tools if you don't have them:

### 1A. Install Node.js (v18+)
Go to https://nodejs.org and download the LTS version. After installing, verify:
```
node --version
npm --version
```

### 1B. Install PostgreSQL
Go to https://www.postgresql.org/download/ and install for your OS.
After installing, open pgAdmin (comes with PostgreSQL) and create a database called `dropshipping_ke`.

### 1C. Install Git
Go to https://git-scm.com and install Git.

### 1D. Install VS Code Extensions
Open VS Code, go to Extensions (Ctrl+Shift+X), and install:
- **Prisma** (by Prisma)
- **Thunder Client** (for testing APIs, like Postman)
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **GitLens**
- **PostgreSQL** (by Chris Kolkman)

---

## ✅ STEP 2 — Open the Project in VS Code

1. Move this entire `dropshipping-ke` folder to your preferred location (e.g. `C:\Projects\` or `~/Projects/`)
2. Open VS Code
3. Click **File → Open Folder**
4. Select the `dropshipping-ke` folder
5. You should see the full project tree in the sidebar

---

## ✅ STEP 3 — Set Up the Backend (Server)

Open the **integrated terminal** in VS Code: Press **Ctrl+`** (backtick)

### 3A. Navigate to server and install dependencies
```bash
cd server
npm install
```

### 3B. Create your environment file
In the `server/` folder, create a file called `.env` (there is a `.env.example` file for reference).
Fill in your values:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/dropshipping_ke"
JWT_SECRET="put-any-long-random-string-here-like-abc123xyz456"
PORT=5000

# Get these from https://developer.safaricom.co.ke (sandbox first)
MPESA_CONSUMER_KEY="your-daraja-consumer-key"
MPESA_CONSUMER_SECRET="your-daraja-consumer-secret"
MPESA_SHORTCODE="174379"
MPESA_PASSKEY="your-daraja-passkey"
MPESA_CALLBACK_URL="https://your-domain.com/api/payments/mpesa/callback"

# Get these from https://account.africastalking.com
AT_API_KEY="your-africastalking-key"
AT_USERNAME="sandbox"

# Get from https://cloudinary.com (free account)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3C. Set up the database with Prisma
```bash
npx prisma migrate dev --name init
npx prisma db seed
```
This creates all your tables and adds sample products.

### 3D. Start the backend server
```bash
npm run dev
```
You should see: `Server running on port 5000`

---

## ✅ STEP 4 — Set Up the Frontend (Client)

Open a **second terminal** in VS Code: Click the **+** icon in the terminal panel.

### 4A. Navigate to client and install dependencies
```bash
cd client
npm install
```

### 4B. Create frontend environment file
In the `client/` folder, create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4C. Start the frontend
```bash
npm run dev
```
You should see: `ready - started server on http://localhost:3000`

Open your browser and go to **http://localhost:3000** — your site is running!

---

## ✅ STEP 5 — Test the Application

### 5A. Test as a Customer
1. Go to http://localhost:3000
2. Browse products
3. Register an account
4. Add items to cart
5. Checkout (use M-Pesa sandbox number: 254708374149)

### 5B. Test as Admin
1. Go to http://localhost:3000/admin
2. Login with: admin@dropke.com / Admin@1234
3. Explore orders, products, and analytics

### 5C. Test APIs with Thunder Client
1. Open Thunder Client in VS Code sidebar
2. Import the collection from `docs/thunder-client-collection.json`
3. Test each endpoint

---

## ✅ STEP 6 — M-Pesa Daraja Setup (Sandbox)

1. Go to https://developer.safaricom.co.ke
2. Create a free account
3. Go to **My Apps** → Create App
4. Copy your Consumer Key and Consumer Secret into `.env`
5. Use the Daraja sandbox shortcode: `174379`
6. Use test phone number: `254708374149`
7. For local testing, use **ngrok** to expose your localhost:
```bash
npx ngrok http 5000
```
Copy the https URL and set it as `MPESA_CALLBACK_URL` in your `.env`

---

## ✅ STEP 7 — Deploy to Production (When Ready)

### Backend → Railway.app (free tier)
1. Go to https://railway.app
2. Connect your GitHub repo
3. Add your environment variables
4. Railway auto-deploys on every git push

### Frontend → Vercel (free tier)
1. Go to https://vercel.com
2. Import your GitHub repo
3. Set root directory to `client`
4. Add `NEXT_PUBLIC_API_URL` pointing to your Railway backend URL

### Database → Railway PostgreSQL
Railway provides a free PostgreSQL instance — copy the DATABASE_URL into your env vars.

---

## 📁 PROJECT STRUCTURE EXPLAINED

```
dropshipping-ke/
├── server/                    ← Node.js + Express backend
│   ├── src/
│   │   ├── routes/            ← API route definitions
│   │   ├── controllers/       ← Business logic handlers
│   │   ├── middleware/        ← Auth, validation, error handling
│   │   ├── services/          ← M-Pesa, SMS, email services
│   │   └── prisma/            ← Database seed data
│   ├── prisma/
│   │   └── schema.prisma      ← Database schema (tables & relations)
│   ├── .env.example           ← Environment variable template
│   └── package.json
│
├── client/                    ← Next.js frontend
│   ├── src/
│   │   ├── app/               ← Next.js App Router pages
│   │   ├── components/        ← Reusable React components
│   │   ├── hooks/             ← Custom React hooks
│   │   └── lib/               ← API client & utilities
│   └── package.json
│
└── GUIDE.md                   ← This file
```

---

## 🆘 COMMON ERRORS & FIXES

| Error | Fix |
|-------|-----|
| `Cannot connect to database` | Make sure PostgreSQL is running. Open pgAdmin and check. |
| `Port 5000 already in use` | Run `npx kill-port 5000` in terminal |
| `Prisma migration failed` | Make sure DATABASE_URL in .env is correct |
| `M-Pesa callback not received` | Make sure ngrok is running and URL is updated in .env |
| `Module not found` | Run `npm install` again inside the correct folder |

---

## 📞 KEY ENDPOINTS REFERENCE

| Method | URL | What it does |
|--------|-----|--------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/products | Get all products |
| POST | /api/orders | Place an order |
| POST | /api/payments/mpesa/initiate | Start M-Pesa payment |
| GET | /api/admin/orders | Admin: all orders |
| GET | /api/admin/analytics | Admin: dashboard stats |
