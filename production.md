# Production Deployment Guide (Netlify + Render/Railway)

This document provides a step-by-step guide to deploying the Library Management System to production.

Since the system consists of a **Vite React Frontend** and an **Express.js Backend**, the recommended architecture is:

1. **Frontend**: Hosted on **Netlify** (optimized for static files and React).
2. **Backend**: Hosted on **Render** or **Railway** (since Netlify is serverless and Express requires a persistent server to run background crons/sessions).
3. **Database**: Hosted on **MongoDB Atlas** (cloud cluster).

---

## Part 1: Preparing the Code for Production

> [!NOTE]
> **Status: Already Completed**
> All code preparation steps (integrating dynamic environment variables, securing cross-origin cookies, configuring CORS, and writing redirects) have already been set up for you in the codebase. You only need to follow the dashboard deployment steps below.

### 1. Externalize the Frontend API URL

The frontend has been updated to dynamically load the API base URL. It reads the `VITE_API_URL` variable, falling back to localhost during local development:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

A template `.env.production` file has been added to `Frontend/` for you.

### 2. Configure Backend CORS

In `Backend/index.js`, update the CORS configuration to accept requests from your production Netlify URL instead of only `http://localhost:5173`:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
```

### 3. Production Cookie Security

In `Backend/Controller/UserController.js`, when signing and setting cookies, ensure you set the `secure`, `sameSite`, and `domain` parameters correctly so cookies function across domains:

```javascript
res.cookie("token", token, {
  httpOnly: true,
  secure: true, // Required for HTTPS
  sameSite: "none", // Required for cross-domain cookies
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

---

## Part 2: Deploying the Frontend to Netlify

### Step 1: Create a Redirects File for React Router SPA

Single Page Applications (SPAs) like React need redirects configured so that refreshing pages (like `/seats` or `/dashboard`) doesn't lead to a Netlify `404 Not Found` error.

Create a new file named `_redirects` inside the `Frontend/public/` directory with the following content:

```text
/*    /index.html   200
```

Netlify will automatically pick this up and redirect all route paths back to `index.html` to let React Router handle routing.

### Step 2: Connect to Netlify

1. Sign in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** -> **Import from an existing project**.
3. Link your GitHub repository.
4. Configure the Build settings:
   - **Base directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `Frontend/dist`
5. Click **Deploy Site**.

### Step 3: Add Frontend Environment Variables

1. Go to **Site Settings** -> **Environment variables** in Netlify.
2. Add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://library-management-tool.onrender.com` (Your production backend URL)
3. Trigger a redeploy to apply the environment variable.

---

## Part 3: Deploying the Express Backend

Since Netlify hosting is static, you need to host the backend server elsewhere. We recommend **Render** or **Railway**.

### Option A: Hosting on Render

1. Create a free account at [Render.com](https://render.com/).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure build settings:
   - **Root Directory**: `Backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js` (Ensure your `package.json` uses `"type": "module"`)
5. In the **Environment** tab, add your production environment variables:
   - `PORT`: `10000`
   - `MONGO_URI`: `your_production_mongodb_connection_string`
   - `JWT_SECRET`: `your_production_secure_jwt_secret`
   - `FRONTEND_URL`: `https://your-app-name.netlify.app` (Your Netlify site URL)
6. Deploy the web service.

---

## Part 4: Database Configuration (MongoDB Atlas)

Ensure your database accepts connections from your production backend:

1. Log into your [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Navigate to **Network Access** under Security in the left sidebar.
3. Click **Add IP Address**.
4. Since Render/Railway dynamic IP ranges change, you must add `0.0.0.0/0` (Allow Access from Anywhere) or configure secure VPC peering.
5. Ensure your connection string in your backend `.env` matches your production credentials.
