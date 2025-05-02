# DermaScan Backend

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Configuration & Environment Variables](#configuration--environment-variables)
7. [Running the Server](#running-the-server)
8. [API Endpoints](#api-endpoints)

   * [Authentication (`/api/auth`)](#authentication-apiauth)
   * [Profile (`/api/profile`)](#profile-apiprofile)
   * [Settings (`/api/settings`)](#settings-apisettings)
   * \[Analysis (`/api/analysis`)]n
9. [File Uploads](#file-uploads)
10. [Error Handling](#error-handling)
11. [Directory Structure](#directory-structure)

---

## Overview

DermaScan Backend is a Node.js/Express server that powers the DermaScan application. It handles user registration, login, profile management, secure storage of medical data, image uploads for AI-driven skin analysis, and serves data to the frontend via a RESTful API.

## Features

* **User Authentication**: Secure registration & login using JWT stored in HTTP-only cookies.
* **Profile Management**: View/update personal details, medical info (skin type, allergies), and preferences.
* **Analysis History**: Store uploaded skin images and AI-generated analysis linked to user profiles.
* **Secure File Uploads**: Image uploads via `multer`, with file type/size validation.
* **Settings Management**: Manage notification and data-sharing preferences.
* **CORS Enabled**: Configure allowed frontend origins.
* **Comprehensive API**: RESTful endpoints for all functionality.

## Technology Stack

* **Runtime**: Node.js (v14+)
* **Framework**: Express.js
* **Database**: MongoDB (via Mongoose ODM)
* **Auth**: JWT, bcryptjs
* **File Uploads**: multer
* **Environment**: dotenv
* **Security**: cookie-parser, CORS

## Prerequisites

* Node.js (v14 or later)
* npm (installed with Node.js)
* MongoDB (local or Atlas cluster)

## Installation

1. **Clone the repo**

   ```bash
   git clone https://github.com/ADITYAVOFFICIAL/DermaScan-New.git
   cd DermaScan-New/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

## Configuration & Environment Variables

In the root of the `backend` directory, create a `.env` file with the following:

```dotenv
# MongoDB connection string (local or Atlas)
MONGO_URI=<YOUR_MONGODB_URI>

# JWT secret key (keep this secure)
JWT_SECRET=<YOUR_JWT_SECRET>

# Server port (default 5069)
PORT=5069

# Frontend URL for CORS
FRONTEND_URL=http://localhost:8080
```

> **Note**: You can change `PORT` and `FRONTEND_URL` to match your setup.

## Running the Server

* **Production**

  ```bash
  node server.js
  ```

* **Development** (with `nodemon`)

  ```bash
  npm run dev
  ```

On startup, you should see:

```
MongoDB Connected...
Server started on port 5069
```

## API Endpoints

Base URL: `http://localhost:<PORT>/api`

### Authentication (`/api/auth`)

* **POST** `/register` - Register a new user.

  ```json
  // Request body
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password123"
  }
  ```

* **POST** `/login` - Log in an existing user. Sets an HTTP-only `token` cookie.

  ```json
  // Request body
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

* **POST** `/logout` - Log out the current user (clears cookie). Requires authentication.

* **GET** `/me` - Get basic details of the logged-in user. Requires authentication.

### Profile (`/api/profile`)

* **GET** `/me` - Retrieve full profile (user details + medical data). Auth required.
* **POST** `/me` - Update profile fields (e.g., `firstName`, `skinType`, etc.). Auth required.

### Settings (`/api/settings`)

* **PUT** `/` - Update user settings:

  ```json
  // Request body
  {
    "emailNotifications": true,
    "dataSharing": false
  }
  ```

### Analysis (`/api/analysis`)

* **POST** `/` - Upload a skin image and analysis data.

  * **Content-Type**: `multipart/form-data`
  * **Fields**:

    * `skinImage` (file)
    * `analysisData` (JSON string)

* **GET** `/` - Fetch all analysis records for the logged-in user.

## File Uploads

* Handled via `multer`, stored in `./uploads/`.
* **Allowed types**: `.jpeg`, `.jpg`, `.png`, `.webp`
* **Max size**: 10 MB
* Filenames: `<userId>-<timestamp>.<ext>`
* Static route: `http://localhost:<PORT>/uploads/<filename>`

## Error Handling

* **400 Bad Request**: Missing fields, validation errors, multer errors.
* **401 Unauthorized**: Missing/invalid JWT.
* **500 Internal Server Error**: Database or unexpected errors.
* Global error-handling middleware formats JSON error responses.

## Directory Structure

```
backend/
├── uploads/               # Uploaded images (auto-created)
├── node_modules/          # Project dependencies
├── .env                   # Environment variables
├── package.json           # Project metadata & scripts
├── package-lock.json      # Locked dependency tree
├── server.js              # Entry point (app, routes, DB)
└── README.md              # This documentation
```

---