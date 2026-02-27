# GITHUB REPOSITORY SETUP - AUTOMATED INSTRUCTIONS

## FAST SETUP (5 minutes)

### Step 1: Go to GitHub and Create 2 Repositories

**URL:** https://github.com/new

**Repository 1 - Backend**
```
Name:        mandi-deals-backend
Description: Mandi Deals API - Backend Express server
Public:      ✓ (recommended for deployment)
Skip "Add README.md" checkbox
Skip "Add .gitignore" checkbox
Skip "Choose a license" checkbox
```
After creating → **Copy the URL** (should look like: `https://github.com/YOUR_USERNAME/mandi-deals-backend.git`)

**Repository 2 - Frontend** 
```
Name:        mandi-deals-frontend
Description: Mandi Deals Frontend - React POS Interface
Public:      ✓ (recommended for deployment)
Skip "Add README.md" checkbox
Skip "Add .gitignore" checkbox
Skip "Choose a license" checkbox
```
After creating → **Copy the URL** (should look like: `https://github.com/YOUR_USERNAME/mandi-deals-frontend.git`)

---

### Step 2: Push Backend Code

Open PowerShell and run these commands one at a time:

```powershell
# Go to backend directory
cd e:\MandiDeals\backend

# Initialize git
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add and commit files
git add .
git commit -m "Initial commit: Mandi Deals Backend API"

# Set main branch and add remote
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mandi-deals-backend.git

# Push to GitHub
git push -u origin main
```

⚠️ **Replace `YOUR_USERNAME` with your GitHub username!**  
⚠️ **When prompted for password, use a Personal Access Token (see troubleshooting)**

---

### Step 3: Push Frontend Code

Open PowerShell (in a new window) and run these commands:

```powershell
# Go to frontend directory
cd e:\MandiDeals\frontend

# Initialize git
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add and commit files
git add .
git commit -m "Initial commit: Mandi Deals Frontend React App"

# Set main branch and add remote
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mandi-deals-frontend.git

# Push to GitHub
git push -u origin main
```

⚠️ **Replace `YOUR_USERNAME` with your GitHub username!**

---

### Step 4: Verify on GitHub

1. Go to https://github.com/YOUR_USERNAME
2. You should see both repositories listed
3. Click on each repo to verify the code is there

✅ **GitHub Setup Complete!**

---

## TROUBLESHOOTING

### Issue 1: "fatal: repository already exists"
```powershell
# Run this first to clean up
git remote remove origin

# Then re-run the git remote add and push commands
```

### Issue 2: "Authentication failed" or "Permission denied"

You need a GitHub Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "Mandi Deals Deployment"
4. Check the "repo" checkbox (full control of private repositories)
5. Scroll down and click "Generate token"
6. **COPY the token** (you'll only see it once!)
7. Use this token as your password when git asks:
   ```
   Username: YOUR_GITHUB_USERNAME
   Password: ghp_xxxxxxxxxxxx (the token you just created)
   ```

### Issue 3: "Could not resolve host"
- Check your internet connection
- Try again in a few moments
- GitHub may be temporarily down

### Issue 4: Git not found
Install Git from: https://git-scm.com/download/win

---

## ✅ MANUAL COMMANDS SUMMARY

**For Backend:**
```powershell
cd e:\MandiDeals\backend
git init
git config user.name "Your Name"
git config user.email "your@email.com"
git add .
git commit -m "Initial commit: Mandi Deals Backend API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mandi-deals-backend.git
git push -u origin main
```

**For Frontend:**
```powershell
cd e:\MandiDeals\frontend
git init
git config user.name "Your Name"
git config user.email "your@email.com"
git add .
git commit -m "Initial commit: Mandi Deals Frontend React App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mandi-deals-frontend.git
git push -u origin main
```

---

## ✨ WHAT HAPPENS NEXT

Once both repos are on GitHub:

1. **Railway** (Backend Deployment)
   - Go to https://railway.app
   - Connect GitHub
   - Select `mandi-deals-backend` repo
   - Deploy
   - Get your API URL

2. **Vercel** (Frontend Deployment)
   - Go to https://vercel.com
   - Connect GitHub
   - Select `mandi-deals-frontend` repo
   - Set environment variable: `VITE_API_URL=<your-railway-url>`
   - Deploy
   - Get your frontend URL

✅ **Your app will be live on the internet!**

---

**Status:** Ready to push to GitHub  
**Time to complete:** 5-10 minutes
