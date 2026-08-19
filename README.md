# Academy ERP — Student Management System (SMS)

Full-stack rewrite: **React (frontend)** + **Node/Express + MongoDB (backend)**.
No Supabase, no email confirmation — plain username/password login.

```
sms/
  frontend/   React + Vite + Tailwind (port 5173)
  backend/    Node + Express + MongoDB (port 5000)
```

## 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a MongoDB Atlas connection string

If you don't have MongoDB installed locally:
- Easiest: create a free cluster at https://www.mongodb.com/cloud/atlas and copy its connection string.
- Or install locally: https://www.mongodb.com/docs/manual/installation/

## 2. Backend setup
```bash
cd backend
npm install
```

Edit `backend/.env` if needed (defaults work for a local MongoDB):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sms_db
JWT_SECRET=change_this_to_a_long_random_secret_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Create the default admin account:
```bash
npm run seed:admin
```

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

## 4. Login
- Username: `admin`
- Password: `admin123`

## Features
- Username/password auth with JWT (no email verification needed)
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

## 5. Deploy to Vercel (Full Stack)

This project is prepared for Vercel with:
- React + Vite frontend
- Node.js + Express backend
- MongoDB Atlas database

### A. Push to GitHub safely

Do **not** push `.env` files. They are ignored by `.gitignore`.

Create your local files from the examples:

Backend:
```bash
cd backend
copy .env.example .env
```

Frontend:
```bash
cd frontend
copy .env.example .env
```

Put your real MongoDB Atlas URI and secrets in `backend/.env`.

> If a MongoDB password or other secret was ever committed to GitHub, change/rotate it before using production. Removing the `.env` file from a new commit does not remove old secrets from Git history.

### B. Deploy the backend

1. In Vercel choose **Add New → Project**.
2. Import this same GitHub repository.
3. Set **Root Directory** to `backend`.
4. Framework Preset can be **Other**.
5. Leave Build Command and Output Directory at their defaults.
6. Add these Environment Variables from `backend/.env`:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
7. Deploy.

After deployment, test:
```text
https://YOUR-BACKEND.vercel.app/api/health
```

It should return:
```json
{"ok":true}
```

### C. Deploy the frontend

Create another Vercel project using the **same GitHub repository**.

1. Import the repository again.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Add this Environment Variable:
   - `VITE_API_URL` = `https://YOUR-BACKEND.vercel.app/api`
5. Deploy.

The frontend already includes a Vercel SPA rewrite so React Router routes such as `/dashboard`, `/students`, and `/reports` work after refresh.

### D. Database

MongoDB itself is not deployed to Vercel. Keep the database on MongoDB Atlas and put its connection string in Vercel's backend Environment Variables as `MONGO_URI`.

You do not need a separate database deployment on Vercel.

### E. Admin login

The admin account is created with:
```bash
cd backend
npm run seed:admin
```

For production, run the seed command once with the same production environment variables, or create the admin user through your existing database setup. Do not use the example password in production.

