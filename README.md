# Lost & Found

A full-stack, real-time web platform for communities to report, search, and recover lost and found items.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)

## Features

- **Post & Manage Items** — Create and browse listings for lost or found items with photos, descriptions, and locations
- **Search & Filter** — Find items by keyword, status (Lost/Found), or category
- **Real-Time Messaging** — Chat directly with item posters, powered by Socket.io
- **Live Notifications** — Instant alerts for incoming messages and listing updates
- **Secure Auth** — JWT-based authentication with password recovery via email
- **Image Hosting** — Cloud-hosted images with fast CDN delivery via Cloudinary
- **Responsive UI** — Clean, minimalist design built with Tailwind CSS and Lucide icons

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router DOM |
| Backend | Node.js, Express 5, Socket.io |
| Database | PostgreSQL, Prisma ORM |
| Media & CDN | Cloudinary |
| Authentication | JWT, Bcrypt |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- A PostgreSQL database (a free tier on [Neon.tech](https://neon.tech) works fine)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/LostAndFound.git
cd LostAndFound
```

### 2. Set up the backend

```bash
cd server
npm install
```

1. Create a `.env` file in `server/` (see Environment Variables below).
2. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```
3. Start the backend dev server:
   ```bash
   npm run dev
   ```
   The backend runs on `http://localhost:4000`.

### 3. Set up the frontend

In a new terminal window:

```bash
cd client
npm install
```

1. Create a `.env` file in `client/`:
   ```env
   VITE_API_URL=http://localhost:4000
   ```
2. Start the frontend dev server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`.
