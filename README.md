# DermaScan: AI-Powered Skin Analysis (Full Stack)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Disclaimer:** DermaScan provides experimental, informational suggestions based on visual AI analysis. **It is NOT a medical diagnosis tool and does NOT replace consultation with qualified healthcare professionals.**

---

## Table of Contents

1. [Description](#description)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Environment Variables](#environment-variables)

   * [Backend (`backend/.env`)](#backend-backendenv)
   * [Frontend (`frontend/.env`)](#frontend-frontendenv)
   * [Vercel Backend (`backend/vercel/.env`)](#vercel-backend-backendvercelenv)
8. [Running the Application Locally](#running-the-application-locally)
9. [API Endpoints](#api-endpoints)
10. [Key Components & Logic](#key-components--logic)

    * [Frontend](#frontend)
    * [Backend](#backend)
11. [Deployment](#deployment)
12. [Contributing](#contributing)
13. [License](#license)

---

## Description

DermaScan is a full-stack web application that delivers AI-driven insights into potential skin conditions. Users can register, manage their profile (including medical details), upload skin images for analysis, view historical results, and interact with an AI chatbot. The application consists of a React/TypeScript frontend and a Node.js/Express/MongoDB backend.

## Features

* **Secure Authentication:** Email/password registration and login using JWT tokens stored in HTTP-only cookies.
* **Profile Management:** Edit personal details, contact info, medical history (skin type, allergies, conditions), and account settings (notifications, data sharing).
* **AI Skin Image Analysis:** Upload JPG/PNG/WEBP images (max 10MB) for AI analysis via Google Gemini; view and store results.
* **Analysis History:** Browse past analyses with thumbnails and detailed modal views.
* **AI Chatbot:** Gemini-powered chatbot for general dermatology and skin health queries.
* **Responsive UI:** Built with React, Shadcn/ui, and Tailwind CSS.
* **Protected Routes:** Secure access to sensitive pages (Profile, Analyser, Chatbot).
* **File Upload Handling:** Local storage via Multer or Vercel Blob storage for serverless deployments.
* **Vercel-Ready:** Backend configured for easy deployment to Vercel Serverless Functions.

## Technology Stack

| Tier       | Technology                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Frontend   | React 18, Vite, TypeScript, React Router DOM, Shadcn/ui, Tailwind CSS, React Query, React Hook Form, Zod, Framer Motion      |
| Backend    | Node.js, Express.js, MongoDB (Mongoose), JWT (`jsonwebtoken`), bcryptjs, Multer, `@vercel/blob`, CORS, cookie-parser, dotenv |
| Deployment | Vercel (Serverless Functions + Blob), Netlify, AWS S3/CloudFront                                                             |

## Project Structure

```
adityavofficial-dermascan-new/
├── backend/                # Express/MongoDB API
│   ├── config/             # DB and service configurations
│   ├── controllers/        # Business logic handlers
│   ├── middleware/         # Auth, error handling, file uploads
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── uploads/            # Local image storage (if used)
│   ├── vercel/             # Vercel-specific server and config
│   ├── .env                # Local environment variables
│   ├── package.json
│   └── server.js           # Main server (local uploads)
├── frontend/               # React/Vite application
│   ├── public/             # Static assets (favicon, robots.txt)
│   ├── src/                # Source code
│   │   ├── assets/         # Images, fonts
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility and API integration
│   │   ├── pages/          # Routed views
│   │   ├── App.tsx         # Routing setup
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── .env                # Frontend environment variables
│   ├── package.json
│   └── vite.config.ts
├── .gitignore              # Root gitignore
└── README.md               # This file
```

## Prerequisites

* **Node.js:** v16 or later
* **Package Manager:** npm, yarn, or bun
* **Database:** MongoDB instance (local or Atlas)
* **Git:** for source control

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ADITYAVOFFICIAL/DermaScan-New.git
   cd adityavofficial-dermascan-new
   ```
2. **Install Backend dependencies**

   ```bash
   cd backend
   npm install  # or yarn install / bun install
   ```
3. **Install Frontend dependencies**

   ```bash
   cd ../frontend
   npm install  # or yarn install / bun install
   ```

## Environment Variables

> **Note:** Do not commit `.env` files. Add `*.env` to `.gitignore`.

### Backend (`backend/.env`)

```dotenv
# Database connection
MONGO_URI=<your_mongodb_connection_string>

# JWT settings
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRE=1d
COOKIE_EXPIRE=1

# Server settings
PORT=5069
FRONTEND_URL=http://localhost:8080

# File upload (local)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Vercel Blob (used in backend/vercel)
# BLOB_READ_WRITE_TOKEN=<your_blob_token>
```

### Frontend (`frontend/.env`)

```dotenv
VITE_API_BASE_URL=http://localhost:5069
VITE_GEMINI_API_KEY=<your_gemini_api_key>
```

### Vercel Backend (`backend/vercel/.env`)

*Configure these in Vercel dashboard, do not commit.*

```
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
FRONTEND_URL=<your_deployed_frontend_url>
BLOB_READ_WRITE_TOKEN=<your_blob_token>
```

## Running the Application Locally

### 1. Start Backend

```bash
cd backend
npm run dev   # for nodemon auto-reload
# or
npm start     # production mode
```

*To test Vercel functions locally:*

```bash
cd backend/vercel
vercel dev
```

### 2. Start Frontend

```bash
cd frontend
npm run dev   # or yarn bun dev
```

Visit `http://localhost:8080` in your browser.

## API Endpoints

All routes are prefixed with `/api`.

* **Auth** (`/api/auth`): `POST /register`, `POST /login`, `POST /logout`, `GET /me`
* **Profile** (`/api/profile`): `GET /me`, `POST /me`
* **Settings** (`/api/settings`): `PUT /`
* **Analysis** (`/api/analysis`): `POST /` (multipart), `GET /`

Refer to individual READMEs or route files for request/response schemas.

## Key Components & Logic

### Frontend

* **AuthContext**: Manages authentication state and provides login/logout.
* **ProtectedRoute**: Guards secured pages.
* **Analyser**: Handles image upload, calls Gemini API, displays and saves analysis.
* **Profile**: Fetches and updates user data; shows analysis history.
* **Chatbot**: Interactive skin health chat via Gemini.

### Backend

* **server.js / vercel/server.js**: Express setup, middleware, route registration.
* **Models**: Mongoose schemas (`User`, `Profile`, `AnalysisResult`).
* **Controllers**: Route handlers for business logic.
* **Middleware**: JWT auth, error handling, Multer/file validation.

## Deployment

### Backend (Vercel)

1. Push to GitHub and connect to Vercel.
2. Set Root Directory to `backend/vercel`.
3. Configure environment variables in Vercel dashboard.
4. Deploy — Vercel builds serverless functions automatically.

### Frontend (Static Hosting)

1. Configure env vars (`VITE_API_BASE_URL`, `VITE_GEMINI_API_KEY`).
2. Run:

   ```bash
   cd frontend
   npm run build
   ```
3. Deploy `dist/` to Vercel, Netlify, or another static host.

## Contributing

Contributions welcome! Fork the repo, create a branch, and open a PR. Please adhere to existing code style and pass lint checks.