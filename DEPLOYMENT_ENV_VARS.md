# 🚀 Deployment Environment Variables Guide

## For Deploying to Production

When deploying your Baat Kare application, you need to set these environment variables on your hosting platform.

---

## Backend Environment Variables

### For Railway / Render / Heroku

Set these in your hosting platform's environment variables section:

```env
# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb+srv://shivamyadav10981_db_user:yLCauUZvHGvM9Hwk@cluster0.dpmuyrs.mongodb.net/baatkare

# Server Port (usually auto-set by platform)
PORT=8080

# JWT Secret (CHANGE THIS!)
JWT_SECRET=BaatKare_Super_Secret_Key_2026_Change_This_In_Production_Min_32_Characters

# Frontend URL (IMPORTANT - Set to your deployed frontend URL)
FRONTEND_URL=https://your-app-name.vercel.app
CLIENT_URL=https://your-app-name.vercel.app

# Node Environment
NODE_ENV=production
```

### Important Notes:

1. **FRONTEND_URL** - This MUST be your deployed frontend URL
   - Example: `https://baat-kare.vercel.app`
   - Example: `https://your-app.netlify.app`
   
2. **JWT_SECRET** - MUST change this to a strong random string
   - Minimum 32 characters
   - Use a password generator
   - Example: `BaatKare_2026_SuperSecret_RandomKey_12345678`

3. **MONGODB_URI** - Make sure it includes the database name
   - Current: `...mongodb.net/`
   - Should be: `...mongodb.net/baatkare`

---

## Frontend Environment Variables

### For Vercel / Netlify

Set these in your hosting platform's environment variables section:

```env
# Backend API URL (REQUIRED)
VITE_API_URL=https://your-backend-url.railway.app/api

# Backend Socket URL (REQUIRED)
VITE_SOCKET_URL=https://your-backend-url.railway.app
```

### Important Notes:

1. **VITE_API_URL** - Your deployed backend URL + `/api`
   - Example: `https://baat-kare-backend.railway.app/api`
   - Example: `https://baat-kare-api.render.com/api`

2. **VITE_SOCKET_URL** - Your deployed backend URL (without /api)
   - Example: `https://baat-kare-backend.railway.app`
   - Example: `https://baat-kare-api.render.com`

---

## Step-by-Step Deployment

### 1. Deploy Backend First

#### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `Baat-kare` repository
4. Railway will auto-detect Node.js
5. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://shivamyadav10981_db_user:yLCauUZvHGvM9Hwk@cluster0.dpmuyrs.mongodb.net/baatkare
   PORT=8080
   JWT_SECRET=BaatKare_Super_Secret_Key_2026
   FRONTEND_URL=https://your-app.vercel.app
   CLIENT_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
6. Set root directory to `Backend`
7. Click "Deploy"
8. Copy your Railway URL (e.g., `https://baat-kare-production.up.railway.app`)

#### Option B: Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** baat-kare-backend
   - **Root Directory:** Backend
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables (same as above)
6. Click "Create Web Service"
7. Copy your Render URL

### 2. Deploy Frontend

#### Option A: Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Import from GitHub
3. Select your `Baat-kare` repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** Frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://baat-kare-production.up.railway.app/api
   VITE_SOCKET_URL=https://baat-kare-production.up.railway.app
   ```
6. Click "Deploy"
7. Copy your Vercel URL (e.g., `https://baat-kare.vercel.app`)

#### Option B: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repository
4. Configure:
   - **Base directory:** Frontend
   - **Build command:** `npm run build`
   - **Publish directory:** `Frontend/dist`
5. Add environment variables (same as Vercel)
6. Click "Deploy"

### 3. Update Backend with Frontend URL

1. Go back to your Railway/Render dashboard
2. Update environment variable:
   ```
   FRONTEND_URL=https://baat-kare.vercel.app
   CLIENT_URL=https://baat-kare.vercel.app
   ```
3. Redeploy your backend

---

## Testing After Deployment

### 1. Test Backend
Visit: `https://your-backend-url/api/health`

Should return:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### 2. Test Frontend
1. Visit your frontend URL
2. Try to register a new user
3. Create a chat
4. Send a message
5. Check if translation works

### 3. Test CORS
Open browser console (F12) and check for CORS errors:
- ❌ If you see "CORS policy: No 'Access-Control-Allow-Origin'"
  - Check FRONTEND_URL in backend matches your frontend URL
  - Make sure both URLs use HTTPS (not HTTP)
  - Redeploy backend after changing env vars

---

## Common CORS Issues & Fixes

### Issue 1: "CORS policy blocked"
**Fix:** Make sure FRONTEND_URL in backend env vars matches your deployed frontend URL exactly
```env
# Backend
FRONTEND_URL=https://baat-kare.vercel.app  # ✅ Correct
FRONTEND_URL=http://baat-kare.vercel.app   # ❌ Wrong (http vs https)
FRONTEND_URL=https://baat-kare.vercel.app/ # ❌ Wrong (trailing slash)
```

### Issue 2: Socket.io connection failed
**Fix:** Check VITE_SOCKET_URL in frontend env vars
```env
# Frontend
VITE_SOCKET_URL=https://backend.railway.app     # ✅ Correct
VITE_SOCKET_URL=https://backend.railway.app/api # ❌ Wrong (no /api for socket)
```

### Issue 3: 404 on API calls
**Fix:** Check VITE_API_URL includes `/api`
```env
# Frontend
VITE_API_URL=https://backend.railway.app/api  # ✅ Correct
VITE_API_URL=https://backend.railway.app      # ❌ Wrong (missing /api)
```

### Issue 4: Mixed Content (HTTP/HTTPS)
**Fix:** Ensure both frontend and backend use HTTPS
- Railway provides HTTPS by default ✅
- Vercel provides HTTPS by default ✅
- Never use HTTP URLs in production

---

## Environment Variables Checklist

### Backend (Railway/Render)
- [ ] MONGODB_URI set correctly with database name
- [ ] PORT set (or let platform auto-set)
- [ ] JWT_SECRET changed from default
- [ ] FRONTEND_URL set to deployed frontend URL
- [ ] CLIENT_URL set to deployed frontend URL
- [ ] NODE_ENV=production

### Frontend (Vercel/Netlify)
- [ ] VITE_API_URL set to backend URL + /api
- [ ] VITE_SOCKET_URL set to backend URL (no /api)
- [ ] Both URLs use HTTPS

---

## MongoDB Atlas Configuration

Make sure your MongoDB Atlas allows connections from anywhere (for deployment):

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

**Note:** In production, you should whitelist specific IPs, but for Railway/Render, they use dynamic IPs, so you need to allow all.

---

## Quick Deploy Commands

### Backend Test Locally
```bash
cd Backend
npm install
npm start
```

### Frontend Test Locally
```bash
cd Frontend
npm install
npm run build
npm run preview
```

---

## Full Example Configuration

### Your Setup Should Look Like This:

**Backend (Railway):**
```
URL: https://baat-kare-production.up.railway.app
Environment Variables:
  MONGODB_URI=mongodb+srv://shivamyadav10981_db_user:yLCauUZvHGvM9Hwk@cluster0.dpmuyrs.mongodb.net/baatkare
  PORT=8080
  JWT_SECRET=BaatKare_2026_SuperSecret_Key_Change_This
  FRONTEND_URL=https://baat-kare.vercel.app
  CLIENT_URL=https://baat-kare.vercel.app
  NODE_ENV=production
```

**Frontend (Vercel):**
```
URL: https://baat-kare.vercel.app
Environment Variables:
  VITE_API_URL=https://baat-kare-production.up.railway.app/api
  VITE_SOCKET_URL=https://baat-kare-production.up.railway.app
```

---

## Troubleshooting

### Can't connect to backend
1. Check backend logs in Railway/Render
2. Test `/api/health` endpoint
3. Verify MongoDB connection

### CORS errors persist
1. Check FRONTEND_URL matches exactly
2. No trailing slashes
3. HTTPS on both
4. Redeploy backend after changing env vars

### Socket.io won't connect
1. Check VITE_SOCKET_URL has no /api
2. Check backend Socket.io logs
3. Verify allowedOrigins in socket.js includes your frontend URL

---

**Status:** ✅ CORS Fixed for Deployment

Your app is now configured to work in production with proper CORS handling!
