#!/usr/bin/env pwsh
# MANDI DEALS - GITHUB SETUP AUTOMATION SCRIPT
# This script sets up and pushes both backend and frontend to GitHub

param(
    [string]$GitHubUsername = "",
    [string]$GitEmail = "",
    [string]$GitName = "Mandi Deals Developer"
)

# Colors for output
$Green = "`e[32m"
$Yellow = "`e[33m"
$Red = "`e[31m"
$Reset = "`e[0m"

Write-Host "$Yellow`n╔════════════════════════════════════════════════╗" -NoNewline
Write-Host "`n║  Mandi Deals - GitHub Repository Setup Script  ║`n" -NoNewline
Write-Host "╚════════════════════════════════════════════════╝$Reset`n"

# Check if GitHub username is provided
if ([string]::IsNullOrEmpty($GitHubUsername)) {
    Write-Host "${Red}❌ Error: GitHub username is required!$Reset"
    Write-Host "`nUsage: .\github-setup.ps1 -GitHubUsername 'your-username' -GitEmail 'your@email.com'"
    exit 1
}

Write-Host "${Green}✓ GitHub Username: $GitHubUsername$Reset"
Write-Host "${Green}✓ Git Name: $GitName$Reset"
Write-Host "${Green}✓ Git Email: $GitEmail$Reset`n"

# Function to push a repository
function Push-Repository {
    param(
        [string]$RepoPath,
        [string]$RepoName,
        [string]$RepoDescription
    )

    Write-Host "$Yellow`n┌─ $RepoName $Reset"
    Write-Host "│ Path: $RepoPath"
    Write-Host "│ Repository: https://github.com/$GitHubUsername/$RepoName.git`n"

    # Check if directory exists
    if (-not (Test-Path $RepoPath)) {
        Write-Host "${Red}✗ Directory not found: $RepoPath$Reset"
        return $false
    }

    Push-Location $RepoPath

    try {
        # Initialize git
        Write-Host "│ 📦 Initializing repository..."
        git init | Out-Null
        git config user.name "$GitName" 2>&1 | Out-Null
        git config user.email "$GitEmail" 2>&1 | Out-Null

        # Check if there are changes
        $status = git status -s
        if ([string]::IsNullOrEmpty($status)) {
            Write-Host "│ ✓ Repository already up to date"
        } else {
            Write-Host "│ 📝 Staging files..."
            git add . 2>&1 | Out-Null

            Write-Host "│ 💾 Creating commit..."
            $commitMsg = "Initial commit: $RepoDescription"
            git commit -m $commitMsg 2>&1 | Out-Null
        }

        # Set branch to main
        Write-Host "│ 🌿 Setting main branch..."
        git branch -M main 2>&1 | Out-Null

        # Remove existing remote if present
        $remoteExists = git remote get-url origin 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "│ 🔗 Updating remote..."
            git remote remove origin 2>&1 | Out-Null
        } else {
            Write-Host "│ 🔗 Adding remote..."
        }

        git remote add origin "https://github.com/$GitHubUsername/$RepoName.git" 2>&1 | Out-Null

        Write-Host "│ 🚀 Pushing to GitHub..."
        Write-Host "│    (You may be asked for credentials)"
        git push -u origin main 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "${Green}│ ✓ Successfully pushed to GitHub!$Reset"
            Write-Host "│ 📍 Repository: https://github.com/$GitHubUsername/$RepoName`n"
            return $true
        } else {
            Write-Host "${Red}│ ✗ Failed to push to GitHub$Reset"
            return $false
        }
    }
    catch {
        Write-Host "${Red}│ ✗ Error: $_$Reset"
        return $false
    }
    finally {
        Pop-Location
    }
}

# Push backend
$backendSuccess = Push-Repository `
    "e:\MandiDeals\backend" `
    "mandi-deals-backend" `
    "Mandi Deals Backend API - Express.js POS Server"

# Push frontend
$frontendSuccess = Push-Repository `
    "e:\MandiDeals\frontend" `
    "mandi-deals-frontend" `
    "Mandi Deals Frontend - React POS Interface"

# Summary
Write-Host "`n$Yellow╔════════════════════════════════════════════════╗$Reset"
Write-Host "$Yellow║  Setup Complete - Summary$Reset"
Write-Host "$Yellow╚════════════════════════════════════════════════╝$Reset`n"

$backendStatus = if ($backendSuccess) { "${Green}✓ Pushed$Reset" } else { "${Red}✗ Failed$Reset" }
$frontendStatus = if ($frontendSuccess) { "${Green}✓ Pushed$Reset" } else { "${Red}✗ Failed$Reset" }

Write-Host "Backend:  $backendStatus"
Write-Host "Frontend: $frontendStatus"

if ($backendSuccess -and $frontendSuccess) {
    Write-Host "`n${Green}✓ All repositories pushed successfully!$Reset"
    Write-Host "`n📍 Repositories:"
    Write-Host "   - https://github.com/$GitHubUsername/mandi-deals-backend"
    Write-Host "   - https://github.com/$GitHubUsername/mandi-deals-frontend"
    Write-Host "`n${Green}Next steps:$Reset"
    Write-Host "   1. Deploy Backend: Go to https://railway.app"
    Write-Host "   2. Deploy Frontend: Go to https://vercel.com"
} else {
    Write-Host "`n${Red}✗ Some repositories failed to push. Check errors above.$Reset"
}

Write-Host "`n"
