# EliteQR

EliteQR is a full-stack QR Code Generator built with React, FastAPI, and SQLite.

Users can register, log in, generate QR codes, view their QR history, and manage their own QR codes securely using JWT authentication.

---

## Features

### Authentication
- User Registration
- User Login
- JWT Token Authentication
- Protected API Routes

### QR Management
- Generate QR Codes
- Download QR Codes as PNG
- View QR History
- Delete QR Codes
- QR Ownership (Users can only view and delete their own QRs)

### UI Features
- Dark Mode / Light Mode
- Search QR History
- Export QR History
- Responsive Interface

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- FastAPI
- SQLAlchemy
- Passlib (bcrypt)
- Python-JOSE (JWT)

### Database
- SQLite

---

## Project Structure

```text
eliteqr/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── auth.py
│   ├── qr_generator.py
│   └── qr.db
│
├── src/
│   ├── App.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── ...
│
└── README.md
