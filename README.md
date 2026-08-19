# Academy ERP — Student Management System (SMS)

Full-stack rewrite: **React (frontend)** + **Node/Express + MongoDB (backend)**.

Login is now **two-step**: username + password, then a 6-digit code emailed to
the admin's address. A password alone can no longer get anyone in.

```
sms/
  frontend/   React + Vite + Tailwind (port 5173)
  backend/    Node + Express + MongoDB (port 5000)
```

## 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a MongoDB Atlas connection string
- An email account to send OTP codes from (Gmail works out of the box, see below)

If you don't have MongoDB installed locally:
- Easiest: create a free cluster at https://www.mongodb.com/cloud/atlas and copy its connection string.
- Or install locally: https://www.mongodb.com/docs/manual/installation/

## 2. Backend setup
```bash
cd backend
npm install
```

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sms_db
JWT_SECRET=change_this_to_a_long_random_secret_in_production

ADMIN_USERNAME=admin
ADMIN_EMAIL=your_real_admin_email@example.com
# ADMIN_PASSWORD=            # leave commented out — a strong one is generated for you

EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_16_digit_app_password
EMAIL_FROM_NAME=Global Learning Center
OTP_EXPIRY_MINUTES=5
```

**Getting a Gmail "App Password"** (needed to send OTP emails — your normal Gmail
password will NOT work):
1. Go to your Google Account → Security → turn on **2-Step Verification**
2. Search for **"App Passwords"** in your Google Account settings
3. Create one (name it anything, e.g. "SMS OTP"), copy the 16-character code
4. Paste it into `EMAIL_PASS` in `.env` (no spaces)

Prefer a different email provider? Swap the `service: "gmail"` line in
`backend/src/utils/mailer.js` for your provider's SMTP host/port — Nodemailer
supports any SMTP service (Outlook, Zoho, SendGrid, Mailgun, etc.).

Create the admin account (**run this once**):
```bash
npm run seed:admin
```
This prints your admin **username / email / password** to the terminal exactly
once — copy the password somewhere safe immediately, it is never shown again
and is not stored in plain text anywhere.

Start the API:
```bash
npm run dev
```
API runs at `http://localhost:5000`.

## 3. Frontend setup
In a **new terminal**:
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`.

## 4. Logging in
1. Enter the username + password shown by `npm run seed:admin`
2. Check the inbox of `ADMIN_EMAIL` for a 6-digit code (arrives within seconds)
3. Enter the code — you're in. Codes expire after 5 minutes and can only be
   used once; you can request a new one every 45 seconds.

## Security notes
- Passwords are hashed with bcrypt; OTP codes are hashed too — nothing sensitive
  is ever stored in plain text.
- A password check alone no longer issues a session — the short-lived token
  returned after step 1 only proves the password was right, and is rejected by
  every protected API route until the correct OTP has been verified.
- OTP attempts are capped (5 tries) and codes expire after 5 minutes.
- **⚠️ Action needed:** this project's `backend/.env` (with a real MongoDB
  Atlas username/password) was already committed to this repo's Git history
  before a `.gitignore` existed. A `.gitignore` has now been added so it won't
  happen again going forward, but the old commit still has the credentials in
  it as long as it's in your GitHub history. Please:
  1. Go to MongoDB Atlas → Database Access → change/reset that database
     user's password right now (takes 1 minute, invalidates the old one).
  2. Update `MONGO_URI` in your local `backend/.env` with the new password.
  3. Optionally scrub the old commit from history with a tool like
     `git filter-repo` or by squashing history — not required once the
     password is rotated, but good practice if the repo is public.

## Features
- Two-step admin auth: password + emailed OTP, JWT session after verification

## Deploying — 100% free, no credit card (frontend + backend both on Vercel)

The backend is set up to run as a Vercel serverless function (`backend/api/index.js`),
so you don't need Render, Railway, or any other paid host. Only the database
lives elsewhere — MongoDB Atlas's free M0 tier, which you're already using and
which doesn't require a card either.

**1. Push the code to GitHub** (both `frontend/` and `backend/` folders, same repo is fine).

**2. Deploy the backend on Vercel:**
- vercel.com → New Project → import your repo
- Root Directory: `backend`
- Framework Preset: **Other**
- Environment Variables — add every value from `backend/.env`:
  `MONGO_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_EMAIL`, `EMAIL_USER`,
  `EMAIL_PASS`, `EMAIL_FROM_NAME`, `OTP_EXPIRY_MINUTES`
- Deploy. You'll get a URL like `https://glc-sfms-backend.vercel.app`
- Test it: open `https://glc-sfms-backend.vercel.app/api/health` — should show `{"ok":true}`

**3. Deploy the frontend on Vercel:**
- New Project again → same repo → Root Directory: `frontend`
- Framework Preset: **Vite** (auto-detected)
- Environment Variable: `VITE_API_URL` = `https://glc-sfms-backend.vercel.app/api`
  (use your actual backend URL from step 2, keep the `/api` at the end)
- Deploy. You'll get your live app URL, e.g. `https://glc-sfms.vercel.app`

**4. Create the admin account** — since there's no terminal on Vercel, run
`npm run seed:admin` once from your local machine with `MONGO_URI` in your
local `.env` pointed at the same Atlas database. It writes directly to Atlas,
so it reaches the same database your deployed backend uses.

**5. Open your live frontend URL, log in, check email for the OTP, done.**

Note: Vercel's free serverless functions "cold start" after being idle for a
bit — the very first request after inactivity can take a couple seconds
longer while it wakes up. Normal on the free tier, nothing to worry about.
- Students: create, list, search/filter, view detail, delete
- **Class-wise sections**: sidebar now has its own page for 8th, 9th, 10th, 11th,
  12th, Computer and Tuition, plus an "All Students" page that shows everyone.
  Each class section has its own "Add New Student" button — the class is locked
  automatically to that section so you never have to pick it manually.
- Fees: monthly fee auto-generation, mark fee as paid, per-student fee history
  (works identically inside every class section, same as the All Students page)
- WhatsApp: a "Message Parent" button next to each student opens a wa.me chat
  with the parent's saved WhatsApp number (Pakistani numbers like 03xx... are
  auto-converted to the international format)
- Dashboard: KPIs, 6-month revenue trend, paid/unpaid breakdown
- Reports: revenue charts + monthly summary
- Branding: Global Learning Center logo + name across sidebar, mobile header and login screen

## Notes / things to improve next
- No password-reset flow yet
- WhatsApp is click-to-chat only (wa.me links) — no automated/bulk sending yet
- No pagination on the students table (fine for small schools, worth adding for large ones)
- Single admin role only — no multi-user/permission levels yet
