# EliteQR 🚀

EliteQR is a Dynamic QR Code Management Platform built with FastAPI, React, SQLite, and JWT Authentication.

Unlike traditional static QR codes, EliteQR allows users to update the destination URL of a QR code even after it has been generated. The same QR image can redirect to different websites without requiring a new QR code to be created.

In addition to dynamic redirection, EliteQR provides scan tracking, allowing users to monitor how many times their QR codes have been scanned.

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- JWT-Based Authentication
- Protected API Routes
- Secure Password Hashing

---

## 🔄 Dynamic QR Codes

EliteQR generates dynamic QR codes.

Instead of storing the final destination directly inside the QR code, each QR contains a unique redirect URL.

### Example

QR Code contains:

```text
https://eliteqr.com/r/abc123
```

When scanned:

```text
QR Scan
   ↓
EliteQR Server
   ↓
Stored Destination URL
```

### Why Dynamic?

Traditional QR:

```text
QR → Google
```

If you want YouTube:

```text
Generate New QR
```

EliteQR:

```text
QR → Google
```

Later:

```text
Same QR → YouTube
```

No new QR image required.

---

## 📂 QR Management

Users can:

- Create QR Codes
- View All Personal QR Codes
- Edit Destination URLs
- Delete QR Codes
- Manage Multiple QR Codes from a Dashboard

---

## 📊 Scan Analytics

EliteQR automatically tracks scans.

Every time a QR code is opened:

```text
Scan Count +1
```

### Example

Before scanning:

```text
Scans: 0
```

After one scan:

```text
Scans: 1
```

After ten scans:

```text
Scans: 10
```

This allows users to measure engagement and monitor QR performance.

---

## 🛡️ Security Features

- JWT Authentication
- Password Hashing
- URL Validation
- User Ownership Verification
- Protected CRUD Operations

Users can only:

- Edit their own QR codes
- Delete their own QR codes
- View their own QR codes

---

# 🛠️ Tech Stack

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

# 📁 Project Structure

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

# ⚙️ Installation

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

Start the backend:

```bash
py -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Backend runs on:

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

Run the development server:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5174
```

---

# 🔌 API Endpoints

## Authentication

### Register

```http
POST /register
```

### Login

```http
POST /login
```

Response:

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

Creates a new dynamic QR code.

---

### Get User QRs

```http
GET /api/qrs
```

Returns all QR codes belonging to the authenticated user.

---

### Update QR

```http
PUT /api/qrs/{id}
```

Updates the destination URL of an existing QR code.

---

### Delete QR

```http
DELETE /api/qrs/{id}
```

Deletes a QR code owned by the authenticated user.

---

## Dynamic Redirect Endpoint

### Redirect QR

```http
GET /r/{qr_id}
```

Workflow:

```text
QR Scan
   ↓
EliteQR Redirect Route
   ↓
Scan Count +1
   ↓
Redirect User
```

---

# 🚀 Example Workflow

## Step 1

Create a QR code for:

```text
https://google.com
```

---

## Step 2

Scan the QR code.

Result:

```text
Google opens
```

---

## Step 3

Edit the destination URL.

Change:

```text
https://google.com
```

To:

```text
https://youtube.com
```

---

## Step 4

Scan the same QR code again.

Result:

```text
YouTube opens
```

No new QR generation required.

---

# 📈 Scan Tracking Example

User creates:

```text
My Portfolio QR
```

Dashboard:

```text
My Portfolio QR

Scans: 0
```

Someone scans it:

```text
Scans: 1
```

Five more scans:

```text
Scans: 6
```

This helps users measure QR engagement and popularity.

---

# 🔮 Future Improvements

- Custom QR Labels
- Download QR as PNG
- QR Categories
- Advanced Analytics Dashboard
- Admin Dashboard
- Abuse Reporting System
- Google Safe Browsing Integration
- Email Verification
- Public Deployment
- Custom Domain Support

---

# 👨‍💻 Authors

**EliteQR** was collaboratively developed by:

- **Anugrah**
- **Arjun KS**

A full-stack Dynamic QR Code Management Platform featuring authentication, editable QR destinations, scan tracking, and secure QR management.

---

## 📄 License

This project is intended for educational and portfolio purposes.

© 2026 EliteQR. All Rights Reserved.
