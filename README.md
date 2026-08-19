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
