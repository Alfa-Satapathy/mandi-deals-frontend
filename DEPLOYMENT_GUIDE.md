# 🚀 DEPLOYMENT GUIDE - FOR DAY 7 (TOMORROW)

**Date Prepared:** February 27, 2026  
**Status:** Ready for Production Deployment  
**Target Platforms:** Railway (Backend) + Vercel (Frontend)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying, verify everything is working locally:

```bash
# 1. Verify Backend
cd backend
npm start
# Should show: Mandi Deals API Running on http://localhost:3001
# Test: curl http://localhost:3001/api/health

# 2. Verify Frontend (in another terminal)
cd frontend
npm run dev
# Should show: Local: http://localhost:5174/
# Open in browser and test login flow
```

### Test Coverage
- [x] User can login
- [x] User can browse products
- [x] User can access POS page
- [x] User can complete a sale
- [x] Receipt modal opens and displays
- [x] Stock updates after sale
- [x] Customer lookup works
- [x] Points redemption works

---

## ⚙️ BACKEND DEPLOYMENT (Railway)

### Step 1: Create Railway Account
1. Go to https://railway.app/
2. Sign up with GitHub account
3. Authorize Railway to access GitHub

### Step 2: Prepare Backend for Railway

Update `backend/.env`:
```
SERVER_PORT=3001
NODE_ENV=production
DATABASE_URL=file:./mandi-deals.db
CORS_ORIGIN=https://your-vercel-url.vercel.app
```

Update `backend/package.json`:
```json
{
  "name": "mandi-deals-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "sqlite3": "^5.1.6",
    "uuid": "^9.0.0"
  }
}
```

### Step 3: Push to GitHub
```bash
# In backend directory
git init
git add .
git commit -m "Initial backend for Railway deployment"
git remote add origin https://github.com/YOUR_USERNAME/mandi-deals-backend.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy on Railway

1. Go to Railway Dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose `mandi-deals-backend` repository
5. Set environment variables in Railway:
   - `SERVER_PORT`: 3001
   - `NODE_ENV`: production
   - `DATABASE_URL`: file:./mandi-deals.db
6. Click "Deploy"
7. Wait for deployment to complete (2-5 minutes)
8. Get the Railway URL (e.g., `https://mandi-deals-xyz.railway.app`)

### Step 5: Test Backend Deployment
```bash
# Test health endpoint
curl https://mandi-deals-xyz.railway.app/api/health

# Should return:
# {
#   "status": "OK",
#   "database": "connected",
#   "message": "Mandi Deals API is running!"
# }
```

---

## 🎨 FRONTEND DEPLOYMENT (Vercel)

### Step 1: Create Vercel Account
1. Go to https://vercel.com/
2. Sign up with GitHub account
3. Authorize Vercel to access GitHub

### Step 2: Prepare Frontend for Vercel

Update `frontend/.env`:
```
VITE_API_URL=https://mandi-deals-xyz.railway.app
```

Update `frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

### Step 3: Push Frontend to GitHub
```bash
# In frontend directory
git init
git add .
git commit -m "Initial frontend for Vercel deployment"
git remote add origin https://github.com/YOUR_USERNAME/mandi-deals-frontend.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy on Vercel

1. Go to Vercel Dashboard
2. Click "Import Project"
3. Import Git repository: `mandi-deals-frontend`
4. Set environment variables:
   - `VITE_API_URL`: https://mandi-deals-xyz.railway.app
5. Click "Deploy"
6. Wait for deployment (3-5 minutes)
7. Get the Vercel URL (e.g., `https://mandi-deals-frontend.vercel.app`)

### Step 5: Test Frontend Deployment
1. Open `https://mandi-deals-frontend.vercel.app` in browser
2. Login with test credentials
3. Test POS flow
4. Verify API calls connect to Railway backend

---

## 🔗 FINAL STEPS

### Update CORS in Backend

Once you have Vercel URL, update backend CORS:

In `backend/.env`:
```
CORS_ORIGIN=https://mandi-deals-frontend.vercel.app
```

Or update in `backend/server.js`:
```javascript
app.use(cors({
  origin: 'https://mandi-deals-frontend.vercel.app',
  credentials: true
}));
```

Re-deploy backend on Railway.

### Update Frontend Environment

Once you have Railway URL confirmed, ensure frontend `.env` has:
```
VITE_API_URL=https://mandi-deals-xyz.railway.app
```

Re-deploy frontend on Vercel if needed.

---

## 🧪 POST-DEPLOYMENT TESTING

### Quick Test Scenario

1. **Login**
   - Open frontend URL
   - Use demo credentials: phone `9876543210`, password `password`

2. **Browse Products**
   - Homepage should show all products
   - Stock quantities should be visible

3. **POS Transaction**
   - Click "POS" in navbar
   - Search customer: `9876543210`
   - Add products to bill
   - Use some points
   - Complete sale
   - **NEW:** Receipt modal should open
   - **NEW:** Click "Print Receipt"
   - **NEW:** Check console for SMS notification log

4. **Verify Stock Update**
   - Go back to homepage
   - Verify product quantities decreased

5. **Verify SMS**
   - Check backend logs (Railway logs) for SMS notification output

---

## 📊 DEPLOYMENT CHECKLIST

### Backend (Railway)
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health endpoint responds
- [ ] API endpoints working
- [ ] Database initialized

### Frontend (Vercel)
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project imported
- [ ] Environment variables set (`VITE_API_URL`)
- [ ] Deployment successful
- [ ] App loads in browser
- [ ] Login works
- [ ] API calls successful

### Integration
- [ ] Backend and Frontend connected
- [ ] Full POS flow works end-to-end
- [ ] Receipt modal displays
- [ ] Print functionality works
- [ ] SMS notifications logged
- [ ] Stock updates reflected
- [ ] Points system working

---

## 🆘 TROUBLESHOOTING

### Backend Deploy Issues

**Problem:** Deployment fails on Railway
```
Solution:
1. Check package.json has "type": "module"
2. Ensure all dependencies listed
3. Check .env variables set
4. Review Railway build logs
5. Ensure database.js paths are correct
```

**Problem:** API returns 404
```
Solution:
1. Check backend service is running
2. Verify Railway URL is correct
3. Check CORS headers
4. Test health endpoint: /api/health
```

### Frontend Deploy Issues

**Problem:** Blank page on Vercel
```
Solution:
1. Check browser console for errors
2. Verify VITE_API_URL is set
3. Check frontend build logs
4. Ensure React version compatible
```

**Problem:** API calls fail
```
Solution:
1. Verify VITE_API_URL matches Railway URL
2. Check CORS enabled on backend
3. Check network tab in browser DevTools
4. Verify backend is accessible from Vercel
```

---

## 🎯 SUCCESS METRICS

After deployment, verify:
- ✅ Frontend loads: https://mandi-deals-frontend.vercel.app
- ✅ Backend responds: https://mandi-deals-xyz.railway.app/api/health
- ✅ Login works
- ✅ Products display
- ✅ POS transaction completes
- ✅ Receipt shows
- ✅ Stock updates
- ✅ Points deduct
- ✅ SMS logged to backend console

---

## 📝 DOCUMENTATION LINK

Once deployed, create a README with:
```markdown
# Mandi Deals - Production Environment

## URLs
- **Frontend:** https://mandi-deals-frontend.vercel.app
- **API:** https://mandi-deals-xyz.railway.app

## Demo Credentials
- Phone: 9876543210
- Password: password

## Features
- Product browsing with real-time stock
- Point-of-sale counter system
- Customer lookup and quick registration
- Points-based loyalty system
- Receipt display and printing
- SMS notifications
```

---

## ✅ YOU'RE READY!

All code is complete, tested, and ready for production deployment.
Just follow the steps above tomorrow (Day 7) and you'll have a live application!

**Time Estimate:** 30-45 minutes from start to finish  
**Difficulty:** Easy (mostly clicking buttons and setting variables)

---

**Last Updated:** February 27, 2026 - Session 6  
**Status:** ✅ READY FOR DEPLOYMENT
