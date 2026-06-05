# Production Deployment Steps

All code-level preparations (dynamic API environment setup, CORS configuration, cookie security settings, and route redirects) have already been configured and pushed to your GitHub repository.

Follow these direct steps to deploy your application:

---

## Step 1: Deploy the Frontend on Netlify

1. Sign in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** ➔ **Import from an existing project**.
3. Link your GitHub repository.
4. Configure the **Build Settings**:
   - **Base directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `Frontend/dist`
5. Go to **Site Settings** ➔ **Environment variables** (under Environment) and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://library-management-tool.onrender.com`
6. Click **Deploy Site**.
7. Note down your final Netlify site URL (e.g., `https://your-app-name.netlify.app`) for the backend configuration.


> [!TIP]
> **How to update the backend URL on Netlify after deployment:**
> 1. Go to your **Netlify Dashboard** and select your site.
> 2. Navigate to **Site configuration** (or **Site settings**) ➔ **Environment variables** in the left menu.
> 3. Find `VITE_API_URL`, click the **options (three dots)** button next to it, and click **Edit**.
> 4. Change the value to your new backend URL: `https://library-management-tool.onrender.com` (ensure there is **no trailing slash**).
> 5. Click **Save**.
> 6. **Crucial**: Because React embeds environment variables at build-time, you must trigger a rebuild. Go to the **Deploys** tab in Netlify, click the **Trigger deploy** dropdown, and select **Deploy site**.

---

## Step 2: Deploy the Backend on Render

1. Log into your [Render Dashboard](https://render.com/).
2. Click **New +** ➔ **Web Service**.
3. Link your GitHub repository.
4. Configure the **Web Service Settings**:
   - **Name**: `library-management-tool` (ensure it matches your subdomain)
   - **Root Directory**: `Backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Go to the **Environment** tab and click **Add Environment Variable** to add:
   - **Key**: `PORT` | **Value**: `5000`
   - **Key**: `MONGO_URI` | **Value**: `mongodb+srv://admin:Success01!@cluster0.hqq71l7.mongodb.net/?appName=Cluster0`
   - **Key**: `JWT_SECRET` | **Value**: `dfjkghfjkghs979879djkhkjsadhfkj`
   - **Key**: `FRONTEND_URL` | **Value**: `https://your-app-name.netlify.app` *(Replace with your actual Netlify site URL from Step 1)*
6. Click **Deploy Web Service**.

---

## Step 3: Configure Database Access (MongoDB Atlas)

Ensure your cloud database accepts incoming requests from Render's hosting environment:

1. Log into your [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. In the left sidebar under **Security**, click **Network Access**.
3. Click the **Add IP Address** button.
4. Select **Allow Access From Anywhere** (or manually input `0.0.0.0/0`).
5. Click **Confirm** to apply.
