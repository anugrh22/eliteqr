# EliteQR Frontend

A starter React + Vite front-end for creating and previewing QR codes with backend persistence.

## Setup

1. Open a terminal in the project folder
2. Run `npm install`
3. Run `npm run dev:backend` in one terminal
4. Run `npm run dev` in another terminal

## Backend

The backend runs on `http://localhost:4000` and exposes:

- `GET /api/qrs` — fetch saved QR codes
- `POST /api/qrs` — save a QR code to disk
- `POST /api/generate` — generate a QR payload from a URL
- `GET /api/qrs/:id/redirect` — redirect using a saved QR entry

The frontend proxies `/api` requests to the backend in development.

## What this includes

- React + TypeScript app
- Backend persistence with Express
- QR code generation both in frontend preview and backend save
- Saved QR list stored on the server and synced to browser localStorage
- Simple form for URL and QR label
