# DermaScan Frontend

## Description

This is the frontend user interface for the DermaScan application. It provides a responsive and interactive platform for users to register, log in, manage their profile, upload skin images for AI analysis, view their analysis history, interact with an AI chatbot for skin health information, and manage their settings. Built with React, Vite, TypeScript, and Shadcn/ui components styled with Tailwind CSS.

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [Running the Application](#running-the-application)

   * [Development Server](#development-server)
   * [Production Build](#production-build)
   * [Preview Build](#preview-build)
7. [Project Structure](#project-structure)
8. [Key Features & Components](#key-features--components)
9. [API Integration](#api-integration)
10. [State Management](#state-management)
11. [Routing](#routing)
12. [Styling](#styling)
13. [Deployment](#deployment)
14. [Contributing](#contributing)
15. [License](#license)

---

## Features

* **User Authentication**: Secure Sign Up and Log In pages using email/password. Authentication state managed via context.
* **Profile Management**: View and update personal details and medical information (DOB, gender, address, skin type, allergies, conditions) on the `/profile` page.
* **AI Skin Analyser**: Upload skin images (PNG, JPG, WEBP; max 10MB) for AI-driven analysis via Google Gemini. Displays and saves results.
* **Analysis History**: View past analysis records with thumbnails and details; inspect records in a modal view.
* **AI Chatbot**: Ask general dermatology and skin health questions via an integrated chatbot.
* **Responsive Design**: Adaptive layout and components powered by Tailwind CSS and Shadcn/ui.
* **Protected Routes**: Restrict routes (Analyser, Profile, Chatbot) to authenticated users.
* **Notifications**: Toast feedback using `sonner` and `react-toast`.
* **Informational Pages**: Includes FAQ, Contact, Pricing, and Terms pages.

## Technology Stack

* **Framework**: React 18
* **Build Tool**: Vite
* **Language**: TypeScript
* **Routing**: React Router DOM
* **UI Components**: Shadcn/ui
* **Styling**: Tailwind CSS, PostCSS
* **State Management**: React Context (`AuthContext`), React Query
* **Forms & Validation**: React Hook Form, Zod
* **API Client**: Fetch API via React Query
* **AI Integration**: Google Generative AI (`@google/generative-ai`)
* **Animations**: Framer Motion
* **Linting**: ESLint
* **Package Manager**: npm, yarn, or Bun

## Prerequisites

* Node.js v16 or later
* npm, yarn, or Bun
* Running instance of the [DermaScan Backend](../backend/README.md)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ADITYAVOFFICIAL/DermaScan-New.git
   cd adityavofficial-dermascan-new/frontend
   ```

2. **Install dependencies**

   ```bash
   # npm
   npm install

   # yarn
   yarn install

   # Bun
   bun install
   ```

## Environment Variables

Create a `.env` or `.env.local` file in the project root with:

```dotenv
# URL of the running DermaScan backend server
VITE_API_BASE_URL=http://localhost:5069

# API Key for Google Gemini
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **Note**: Never commit sensitive keys to version control. Add `.env*` to `.gitignore`.

## Running the Application

### Development Server

```bash
# npm
npm run dev

# yarn
yarn dev

# Bun
bun dev
```

Starts the server at `http://localhost:8080` (by default) with hot reloading.

### Production Build

```bash
# npm
npm run build

# yarn
yarn build

# Bun
bun build
```

Generates optimized static assets in the `dist/` directory.

### Preview Build

```bash
# npm
npm run preview

# yarn
yarn preview

# Bun
bun preview
```

Serves the production build locally for testing.

## Project Structure

```
frontend/
├── public/              # Static assets (favicon, robots.txt)
├── src/                 # Source code
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Shadcn/ui primitives
│   │   ├── Layout.tsx   # Main layout (Navbar + content)
│   │   ├── Navbar.tsx   # Navigation bar
│   │   ├── ProtectedRoute.tsx # Route guard
│   │   └── AnalysisViewModal.tsx
│   ├── context/         # React Context providers
│   │   └── AuthContext.tsx
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities & API integrations
│   ├── pages/           # Route views
│   ├── App.tsx          # App entry (routing setup)
│   ├── main.tsx         # Render entry
│   ├── index.css        # Global styles
│   └── vite-env.d.ts    # TypeScript env definitions
├── .env                 # Environment variables
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Key Features & Components

* **Authentication**: Managed by `AuthContext`; uses HTTP-only cookies for security.
* **Skin Analyser**: Page at `/analyser`; handles image uploads and displays AI results.
* **Profile**: Page at `/profile`; edit user details and view analysis history.
* **Chatbot**: Page at `/chatbot`; interactive AI chat interface.
* **UI**: Built with Shadcn/ui and Tailwind; animations via Framer Motion.

## API Integration

* Base URL: `VITE_API_BASE_URL`
* All requests include `credentials: 'include'` to send auth cookies.
* Server state managed with React Query for caching and auto-refetch.

## State Management

* **Global**: `AuthContext` for user state.
* **Server**: React Query for API data.
* **Local**: React `useState` / `useReducer` for UI state.
* **Forms**: React Hook Form + Zod validation.

## Routing

* Handled by `react-router-dom`.
* Defined in `App.tsx` inside `<BrowserRouter>`.
* Protected routes wrapped with `ProtectedRoute`.

## Styling

* **Tailwind CSS**: Utility-first styling.
* **Shadcn/ui**: Pre-built components.
* Global styles in `index.css`.

## Deployment

1. Set environment variables on your hosting platform (Vercel, Netlify, etc.).
2. Build (`npm run build`).
3. Deploy the contents of `dist/` as a static site.