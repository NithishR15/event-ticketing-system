# Smart Event Ticketing & QR Entry Management System

Full-stack MERN application: React.js + Node.js/Express + MongoDB.

## Project Status — Module 1 of 6 Complete ✅

This build is being delivered module by module. Completed so far:

- [x] **Module 1: Project Setup + Database Models + Authentication**
  - Folder structure (backend/frontend)
  - MongoDB models: User, Event, Booking, Attendance, Category, Review, Notification
  - JWT authentication (register/login/logout/forgot-password/reset-password)
  - Role-based authorization middleware (student/organizer/admin)
  - File upload middleware (Multer)
  - Central error handling
  - Seed script for default admin + categories
- [ ] Module 2: Event Management APIs (CRUD, approval workflow, image upload)
- [ ] Module 3: Booking + QR Ticket Generation + QR Scanner/Check-in
- [ ] Module 4: Dashboards, Notifications, Reviews, CSV export, Analytics
- [ ] Module 5: React Frontend (all pages + components)
- [ ] Module 6: Deployment (Vercel + Render + MongoDB Atlas)

## Backend Setup (do this now)

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI (MongoDB Atlas connection string) and JWT_SECRET
npm run seed     # creates default admin (admin@eventticketing.com / Admin@123) + categories
npm run dev      # starts server on http://localhost:5000
```

Test it's alive:
```bash
curl http://localhost:5000/api/health
```

Test registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123","role":"student"}'
```

## Folder Structure (backend)

```
backend/
  config/db.js               MongoDB connection
  models/                    User, Event, Booking, Attendance, Category, Review, Notification
  middleware/                authMiddleware, errorMiddleware, uploadMiddleware
  controllers/authController.js
  routes/                    authRoutes (complete) + placeholders for remaining modules
  utils/seed.js              seeds default admin + categories
  uploads/                   uploaded images stored here
  server.js                  app entry point
```

## Next Step

Reply "continue with module 2" (or just "continue") and I'll build:
- Event CRUD APIs with organizer approval workflow
- Booking APIs with unique ticket ID + QR code generation (qrcode package)
- QR scan/validation + attendance check-in logic
