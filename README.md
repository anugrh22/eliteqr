## Features

### 🔐 Authentication
- User Registration
- User Login
- JWT-Based Authentication
- Protected API Routes

### 🔄 Dynamic QR Codes
Unlike traditional QR codes, EliteQR generates dynamic QR codes.

A generated QR code contains a unique redirect URL:

```text
https://your-domain.com/r/<qr_id>
```

When scanned:

```text
QR Scan
   ↓
EliteQR Redirect Server
   ↓
Stored Destination URL
```

The destination URL can be edited at any time without generating a new QR code.

Example:

```text
QR Created → Google
```

Later:

```text
Same QR → YouTube
```

No new QR image is required.

### 📂 QR Management
- Create QR Codes
- View Personal QR Codes
- Edit QR Destinations
- Delete QR Codes
- User Ownership Validation

### 📊 Scan Analytics
Every QR scan is automatically recorded.

Features include:

- Real-time Scan Counting
- Total Scan Display
- Automatic Increment on Every Redirect

Example:

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

### 🛡️ Security
- Password Hashing
- JWT Authentication
- URL Validation
- Protected User Resources
- Ownership Verification for Edit/Delete Operations
