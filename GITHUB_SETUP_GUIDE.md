# 🔧 GITHUB REPOSITORY SETUP GUIDE

## STEP 1: CREATE GITHUB ACCOUNT
- Go to https://github.com/signup
- Sign up with email and password
- Verify your email
- Note your GitHub username

---

## STEP 2: CREATE TWO REPOSITORIES ON GITHUB

### 2.1 Create Backend Repository
1. Go to https://github.com/new
2. Repository name: **mandi-deals-backend**
3. Description: "Mandi Deals API - Backend server with POS system"
4. Public or Private (your choice)
5. DO NOT add README, .gitignore, or license
6. Click **Create repository**
7. **COPY the repository URL** (it shows: `https://github.com/YOUR_USERNAME/mandi-deals-backend.git`)

### 2.2 Create Frontend Repository
1. Go to https://github.com/new
2. Repository name: **mandi-deals-frontend**
3. Description: "Mandi Deals Frontend - React-based POS UI"
4. Public or Private (your choice)
5. DO NOT add README, .gitignore, or license
6. Click **Create repository**
7. **COPY the repository URL** (it shows: `https://github.com/YOUR_USERNAME/mandi-deals-frontend.git`)

---

## STEP 3: PUSH BACKEND TO GITHUB

Run these commands in PowerShell (copy & paste each block):

### 3.1 Initialize backend repository
```powershell
cd e:\MandiDeals\backend
git init
git config user.name "Your Name"
git config user.email "your.email@gmail.com"
```

### 3.2 Add all files and create first commit
```powershell
git add .
git commit -m "Initial commit: Mandi Deals Backend API - Production Ready"
```

### 3.3 Add remote repository and push to GitHub
```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mandi-deals-backend.git
git push -u origin main
```

⚠️ Replace `YOUR_USERNAME` with your actual GitHub username!

---

## STEP 4: PUSH FRONTEND TO GITHUB

Run these commands in PowerShell (copy & paste each block):

### 4.1 Initialize frontend repository
```powershell
cd e:\MandiDeals\frontend
git init
git config user.name "Your Name"
git config user.email "your.email@gmail.com"
```

### 4.2 Add all files and create first commit
```powershell
git add .
git commit -m "Initial commit: Mandi Deals Frontend - React POS Interface"
```

### 4.3 Add remote repository and push to GitHub
```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mandi-deals-frontend.git
git push -u origin main
```

⚠️ Replace `YOUR_USERNAME` with your actual GitHub username!

---

## STEP 5: VERIFY ON GITHUB

1. Go to your GitHub profile: https://github.com/YOUR_USERNAME
2. You should see 2 new repositories:
   - `mandi-deals-backend`
   - `mandi-deals-frontend`
3. Click each one to verify the code is there

---

## ✅ GITHUB SETUP COMPLETE

Once both repos are pushed to GitHub, you're ready for:
- ✅ Railway backend deployment
- ✅ Vercel frontend deployment

---

## 🆘 COMMON ISSUES

### "fatal: remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/mandi-deals-backend.git
git push -u origin main
```

### "Permission denied (publickey)"
You need to set up SSH keys. Quick fix - use HTTPS instead:
```powershell
# When pushing, GitHub will ask for your username/password
# For password, use a Personal Access Token (PAT):
# 1. Go to https://github.com/settings/tokens
# 2. Click "Generate new token (classic)"
# 3. Check "repo" scope
# 4. Generate and copy the token
# 5. Use as password when git asks

git push -u origin main
# Username: your-github-username
# Password: your-personal-access-token
```

### "nothing to commit"
Make sure you're in the right directory:
```powershell
cd e:\MandiDeals\backend  # for backend
# or
cd e:\MandiDeals\frontend  # for frontend
```

---

## 📋 QUICK REFERENCE

| Command | What it does |
|---------|------------|
| `git init` | Initialize empty Git repo |
| `git add .` | Stage all files |
| `git commit -m "msg"` | Create commit |
| `git branch -M main` | Rename branch to main |
| `git remote add origin URL` | Connect to GitHub repo |
| `git push -u origin main` | Upload to GitHub |
| `git status` | Check what's staged |
| `git log` | View commit history |

---

**Date:** February 27, 2026  
**Status:** Ready to push to GitHub
