# Smart Event Ticketing & QR Entry Management System

Full-stack MERN application: React.js + Node.js/Express + MongoDB.

## Project Status — Complete ✅

All core modules are built and fully tested end-to-end (backend APIs verified via Thunder Client, frontend verified through real browser usage):

- [x] **Auth** — Register/login/logout, forgot/reset password, change password, JWT, role-based access (student/organizer/admin)
- [x] **Events** — CRUD, organizer approval workflow, banner upload, search/filter/pagination
- [x] **Bookings + QR** — Unique ticket ID generation, QR code creation, duplicate booking prevention, cancellation
- [x] **QR Scan + Check-in** — Camera-based scanning (html5-qrcode), validation, duplicate check-in detection
- [x] **Attendance + CSV Export** — Per-event attendance tracking, downloadable CSV
- [x] **Notifications** — In-app notifications, real-time delivery via Socket.IO, unread badge
- [x] **Reviews & Ratings** — Backend complete (event rating aggregation)
- [x] **Dashboards** — Student (bookings/tickets), Organizer (events/registrations/scanner), Admin (stats/approvals)
- [x] **Profile** — Photo upload, personal info, booking stats, security (change password), notification preferences, recent activity
- [x] **Frontend UI** — Full React app with Tailwind CSS, dark/light/system theme toggle, entrance animations, custom favicon
- [x] **Downloadable Ticket** — Canvas-generated ticket image with photo, QR code, and event details

## Tech Stack

**Frontend:** React (Vite), React Router, Tailwind CSS, Axios, React Hook Form, React Hot Toast, React Icons, Recharts, html5-qrcode, Socket.IO Client, date-fns

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, Multer, QRCode, Socket.IO, json2csv, uuid

**Database:** MongoDB Atlas (Free Tier)

## Local Development Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set your own MONGO_URI (MongoDB Atlas connection string) and JWT_SECRET
npm run seed     # creates a default admin account + categories (credentials set in your local .env / seed script)
npm run dev      # starts server on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev      # starts on http://localhost:5173
```

## Folder Structure
backend/
config/db.js
models/          User, Event, Booking, Attendance, Category, Review, Notification
middleware/       authMiddleware, errorMiddleware, uploadMiddleware
controllers/      authController, eventController, bookingController, scanController,
attendanceController, categoryController, notificationController,
reviewController, userController, adminController
routes/           one route file per controller
utils/            seed.js, sendNotification.js
uploads/          uploaded images (banners, avatars)
server.js         app entry point (Express + Socket.IO)
frontend/
src/
components/     Navbar, EventCard, ProtectedRoute
context/        AuthContext, ThemeContext
layouts/        MainLayout
pages/           Home, Events, EventDetails, StudentDashboard, Profile, Notifications,
auth/ (Login, Register, ForgotPassword, ResetPassword)
organizer/ (OrganizerDashboard, CreateEvent, ScanQR, Registrations)
admin/ (AdminDashboard)
services/        api, authService, eventService, bookingService, attendanceService,
notificationService, adminService, socket

## Deployment

- **Frontend** → Vercel
- **Backend** → Render
- **Database** → MongoDB Atlas

Environment variables (`MONGO_URI`, `JWT_SECRET`, etc.) must be configured separately on each platform's dashboard — never commit real credentials to the repository.

## Notes

- Uploaded files (event banners, profile photos) are stored on the server's local filesystem — on Render's free tier this is ephemeral and resets on redeploy. For permanent storage, integrate a service like Cloudinary.
- Real-time notifications require both frontend and backend running simultaneously with Socket.IO connected.
- Default admin credentials are set via the seed script (`backend/utils/seed.js`) and your local `.env` — not stored in this README for security.