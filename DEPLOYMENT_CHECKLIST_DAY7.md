# 🚀 MANDI DEALS - DEPLOYMENT CHECKLIST (DAY 7)

**Date:** February 27, 2026  
**Status:** Ready for Production Deployment

---

## 📋 QUICK START CHECKLIST

### What You Need to Do (Manual Steps)
- [ ] Create GitHub account (if not already done)
- [ ] Create Railway account at https://railway.app
- [ ] Create Vercel account at https://vercel.com  
- [ ] Create GitHub repositories for backend and frontend
- [ ] Deploy to Railway and Vercel via their web interfaces

---

## 🔧 STEP-BY-STEP DEPLOYMENT GUIDE

### PART 1: GITHUB SETUP

#### 1.1 Initialize Git in Project
Run this in PowerShell:
```powershell
cd e:\MandiDeals
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
git add .
git commit -m "Initial commit: Mandi Deals v1.0"
```

#### 1.2 Create GitHub Repositories
Go to https://github.com/new and create:
- **Repository 1:** `mandi-deals-backend`
- **Repository 2:** `mandi-deals-frontend`

After creating, note down your repository URLs.

#### 1.3 Push Backend Code
```powershell
cd e:\MandiDeals\backend
git init
git add .
git commit -m "Backend: Initial commit for Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mandi-deals-backend.git
git push -u origin main
```

#### 1.4 Push Frontend Code
```powershell
cd e:\MandiDeals\frontend
git init
git add .
git commit -m "Frontend: Initial commit for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mandi-deals-frontend.git
git push -u origin main
```

---

### PART 2: RAILWAY BACKEND DEPLOYMENT

#### 2.1 Create Railway Project
1. Go to https://railway.app/
2. Sign up with GitHub account
3. Click **New Project** → **Deploy from GitHub repo**
4. Select `mandi-deals-backend` repository
5. Click **Deploy**

#### 2.2 Configure Railway Environment Variables
After deployment starts, go to **Project Settings** and set these variables:

```
SERVER_PORT=3001
NODE_ENV=production
DATABASE_URL=file:./mandi-deals.db
CORS_ORIGIN=https://your-vercel-url.vercel.app
SMS_API_KEY=demo_key_for_testing
SMS_FROM=Mandi Deals
```

#### 2.3 Wait for Deployment
- Railway will automatically build and deploy
- Deployment takes 2-5 minutes
- You'll get a URL like: `https://mandi-deals-backend-prod.up.railway.app`

**Save this URL!** You'll need it for the frontend.

---

### PART 3: VERCEL FRONTEND DEPLOYMENT

#### 3.1 Create Vercel Project
1. Go to https://vercel.com/
2. Sign up with GitHub account
3. Click **New Project** → **Import Git Repository**
4. Select `mandi-deals-frontend` repository
5. Click **Import**

#### 3.2 Set Environment Variables
In Vercel project settings, set:
```
VITE_API_URL=https://your-railway-url.up.railway.app
```

(Replace `your-railway-url` with the actual Railway URL from Part 2)

#### 3.3 Deploy
1. Click **Deploy**
2. Wait for deployment (3-5 minutes)
3. You'll get a Vercel URL like: `https://mandi-deals-frontend.vercel.app`

**Save this URL!**

---

### PART 4: UPDATE CORS ON RAILWAY BACKEND

After you have the Vercel URL, update Railway environment variable:

1. Go back to Railway dashboard
2. Find your `mandi-deals-backend` project
3. Update environment variable:
   ```
   CORS_ORIGIN=https://mandi-deals-frontend.vercel.app
   ```
4. Railway will automatically redeploy

---

## ✅ POST-DEPLOYMENT TESTING

### Test Backend Health
```powershell
$url = "https://your-railway-url.up.railway.app/api/health"
(Invoke-WebRequest $url -UseBasicParsing).Content | ConvertFrom-Json | Format-List
```

Expected response:
```json
{
  "status": "OK",
  "database": "connected",
  "message": "Mandi Deals API is running!"
}
```

### Test Frontend
1. Open https://your-vercel-url.vercel.app in browser
2. Login with test credentials:
   - Phone: `9876543210`
   - Password: `password`
3. Test the full POS flow:
   - Browse products
   - Go to POS page
   - Add items to bill
   - Complete transaction
   - Verify receipt opens
   - Verify stock updated

### Test API Integration
1. In browser, open DevTools (F12)
2. Go to Network tab
3. Perform a transaction in POS
4. Check that API calls go to your Railway backend
5. Verify responses are successful (200 status)

---

## 📊 DEPLOYMENT SUCCESS CHECKLIST

Backend (Railway):
- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint responds (200 OK)
- [ ] URL obtained and saved

Frontend (Vercel):
- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set (`VITE_API_URL`)
- [ ] Deployment successful
- [ ] App loads in browser
- [ ] URL obtained and saved

Integration:
- [ ] CORS updated on Railway
- [ ] Login works
- [ ] Products display
- [ ] POS transaction completes
- [ ] Receipt shows
- [ ] Stock updates
- [ ] Points work
- [ ] No API errors in DevTools

---

## 🔗 FINAL PRODUCTION URLs

Once deployed, save these URLs:

```
Frontend URL:   https://
Backend URL:    https://
```

Share these with your users!

---

## 🎯 LIVE DEMO CREDENTIALS

Users can login with:
- **Phone:** 9876543210
- **Password:** password

---

## 📝 TROUBLESHOOTING

### Backend Issues

**Problem:** Railway shows "Build Failed"
```
Solution:
1. Check console logs in Railway dashboard
2. Verify package.json has all dependencies
3. Check Node version is 18.x or higher
4. Ensure .env variables are set
5. Try redeploying from Railway dashboard
```

**Problem:** API returns 404 or CORS errors
```
Solution:
1. Wait 5 minutes after deployment (sometimes takes time to stabilize)
2. Check CORS_ORIGIN matches your Vercel URL
3. Verify backend is running (check Railway logs)
4. Test health endpoint first
5. Check browser DevTools Network tab
```

### Frontend Issues

**Problem:** Blank page on Vercel
```
Solution:
1. Check browser DevTools Console for errors
2. Verify VITE_API_URL environment variable is set
3. Check Vercel deployment logs
4. Ensure React build succeeded (check Vercel logs)
5. Clear browser cache (Ctrl+F5)
```

**Problem:** API requests fail / 404 errors
```
Solution:
1. Check DevTools Network tab - see what URL is being called
2. Verify VITE_API_URL in Vercel environment variables
3. Check it matches your Railway backend URL exactly
4. Ensure Railway backend is running
5. Test health endpoint from browser to verify API is reachable
```

---

## 🎉 YOU'RE DEPLOYED!

Once all tests pass, your production app is live! 

**Share with users:**
- Frontend URL
- Demo credentials
- Features list

Congratulations on completing Mandi Deals v1.0! 🚀

---

**Time to Deploy:** ~45 minutes  
**Difficulty:** Medium (mostly UI clicks, ~4 Git commands)  
**Status:** ✅ READY
