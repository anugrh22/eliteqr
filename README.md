# EliteQR 🚀

EliteQR is a Dynamic QR Code Generator built with FastAPI, React, SQLite, and JWT Authentication.

Unlike traditional static QR codes, EliteQR allows users to update the destination URL of a QR code even after it has been generated. The same QR image can redirect to different websites without needing to create a new QR code.

---

## Features

### 🔐 Authentication
- User Registration
- User Login
- JWT-Based Authentication
- Protected API Routes

### 📱 Dynamic QR Codes
- Generate QR Codes for any valid URL
- Dynamic redirection using unique QR IDs
- Edit destination URLs anytime
- No need to regenerate QR codes after updating links

### 📂 QR Management
- View all personal QR codes
- Edit QR destinations
- Delete QR codes
- Ownership verification for all operations

### 📊 Scan Tracking
- Track the number of QR scans
- Display scan count in the dashboard
- Automatic scan count updates on every redirect

### 🛡️ Security
- Password hashing
- JWT authentication
- URL validation
- Protected user-specific resources

---

# Tech Stack

## Backend
- FastAPI
- SQLAlchemy
- SQLite
- Python-Jose (JWT)
- Passlib
- qrcode

## Frontend
- React
- TypeScript
- Vite

---

# Project Structure

```text
eliteqr/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── auth.py
│   ├── schemas.py
│   ├── qr_generator.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# Installation

## Backend Setup

Create a virtual environment:

```bash
python -m venv venv
```

Activate it:

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
py -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Backend URL:

```text
http://localhost:8001
```

---

## Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5174
```

---

# API Endpoints

## Authentication

### Register

```http
POST /register
```

### Login

```http
POST /login
```

Returns:

```json
{
  "access_token": "jwt_token",
  "token_type": "bearer"
}
```

---

## QR Operations

### Create QR

```http
POST /create-qr
```

### Get User QRs

```http
GET /api/qrs
```

### Update QR

```http
PUT /api/qrs/{id}
```

### Delete QR

```http
DELETE /api/qrs/{id}
```

---

## Redirect Endpoint

```http
GET /r/{qr_id}
```

Functionality:

```text
QR Scan
   ↓
Redirect Route
   ↓
Scan Count +1
   ↓
Destination Website
```

---

# Example Workflow

### Step 1

Create a QR code for:

```text
https://google.com
```

### Step 2

Scan the QR code.

Result:

```text
Google opens
```

### Step 3

Edit the QR destination:

```text
https://youtube.com
```

### Step 4

Scan the same QR code again.

Result:

```text
YouTube opens
```

No new QR generation required.

---

# Future Improvements

- Custom QR Labels
- Download QR as PNG
- Advanced Analytics Dashboard
- QR Categories
- Admin Dashboard
- Abuse Reporting System
- Google Safe Browsing Integration
- Email Verification
- Public Deployment & Custom Domain Support

---

# Authors

**EliteQR** was collaboratively developed by:

- **Anugrah**
- **Arjun KS**

A full-stack Dynamic QR Code Management Platform built using FastAPI, React, SQLite, and JWT Authentication.

---
© 2026 EliteQR. All rights reserved.
