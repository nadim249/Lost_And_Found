# 🔍 Lost & Found

A modern, full-stack, real-time web platform designed to help communities report, search, and recover lost & found items.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚡ Quick Start](#-quick-start)

---

## ✨ Features

- 📦 **Post & Manage Items**: Easily create and browse listings for lost or found items with photos, descriptions, and locations.
- 🔍 **Search & Filter**: Quickly find items by keyword, status (Lost/Found), or category.
- 💬 **Real-Time Messaging**: Chat directly with item posters in real-time powered by **Socket.io**.
- 🔔 **Live Notifications**: Get instant alerts for incoming messages and listing updates.
- 🔒 **Secure Auth**: Authentication using JWTs in secure, HTTP-only cookies and password recovery via email.
- 🖼️ **Image Hosting**: Cloud-hosted images with fast CDN delivery via **Cloudinary**.
- 📱 **Clean Responsive UI**: Minimalist, responsive design built with Tailwind CSS and Lucide icons.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router DOM|
| **Backend** | Node.js, Express 5, Socket.io |
| **Database** | PostgreSQL, Prisma ORM |
| **Media & CDN** | Cloudinary |
| **Authentication** | JWT, Bcrypt |

---

## ⚡ Quick Start

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- A PostgreSQL database (e.g., free tier on [Neon.tech](https://neon.tech))

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/LostAndFound.git
cd LostAndFound
```

---

### 2. Setup & Run the Backend

```bash
cd server
npm install
```

1. Create a `.env` file in `server/` (see [Environment Variables](#server-serverenv) below).
2. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```
   Backend will run on **`http://localhost:4000`**.

---

### 3. Setup & Run the Frontend

In a new terminal window:

```bash
cd client
npm install
```

1. Create a `.env` file in `client/`:
   ```env
   VITE_API_URL=http://localhost:4000
   ```
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Frontend will run on **`http://localhost:5173`**.

---
