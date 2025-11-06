# Railway Deployment Guide - Test Drive LIFF App

## 🎯 Overview
This guide covers deploying the Nuxt.js 2 LIFF (LINE Frontend Framework) application to Railway.

### Project Details
- **Framework**: Nuxt.js 2.15.7 (SPA mode with ssr: false)
- **Node Version**: 20.x (specified in .nvmrc and nixpacks.toml)
- **Port**: 4000 (production)
- **Backend API**: https://isuzustock-management-production.up.railway.app
- **Expected URL**: https://testdrive-liff-app-production.up.railway.app

---

## 📋 Pre-Deployment Checklist

### ✅ Repository Configuration
- [x] `package.json` has correct build and start scripts
- [x] `nuxt.config.js` configured for production (PORT, HOST, baseURL)
- [x] `.gitignore` properly ignores build directories (.nuxt, dist)
- [x] `.nvmrc` specifies Node 20.11.1
- [x] `.npmrc` has legacy-peer-deps configuration
- [x] Dependencies correctly categorized (nuxt in dependencies, not devDependencies)

### ✅ Railway Configuration Files Created
- [x] `railway.json` - Railway-specific configuration
- [x] `nixpacks.toml` - Nixpacks build configuration
- [x] `.env.example` - Environment variable template

---

## 🚀 Railway Deployment Steps

### Step 1: Push Code to GitHub
```bash
# Make sure all changes are committed
git add .
git commit -m "feat: configure for Railway deployment"
git push origin main
```

### Step 2: Create Railway Project
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: `pxrxmett/testdrive-liff-app`
5. Railway will auto-detect Nuxt.js and start building

### Step 3: Configure Environment Variables
In Railway Dashboard → Your Project → Variables, add:

```bash
# Required Environment Variables
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Backend API
API_URL=https://isuzustock-management-production.up.railway.app/api
BASE_URL=https://isuzustock-management-production.up.railway.app

# LINE LIFF
LIFF_ID=2006746784-e1y9NRqn

# Build Configuration
NPM_CONFIG_LEGACY_PEER_DEPS=true
```

### Step 4: Verify Build Configuration
Railway should automatically detect:
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start`

If not, manually set in Settings:
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start`

### Step 5: Deploy
1. Railway will automatically deploy after pushing to main
2. Wait for build to complete (typically 3-5 minutes)
3. Check deployment logs for any errors

---

## 🔍 Build Process Explained

### What Happens During Build:
```bash
1. npm ci                    # Clean install dependencies
2. npm run build             # Runs: nuxt build
   ├── Compiles Vue components
   ├── Bundles JavaScript/CSS
   ├── Generates .nuxt/dist/  # THIS IS CRITICAL
   └── Creates server files
```

### What Happens at Runtime:
```bash
npm run start               # Runs: nuxt start
├── Looks for .nuxt/dist/server/
├── Starts Node.js server
├── Listens on PORT 4000
└── Serves SPA application
```

### Expected Directory Structure After Build:
```
.nuxt/
├── dist/
│   ├── client/           # Static assets
│   └── server/           # Server bundle (REQUIRED)
├── router.js
├── routes.json
└── ...
```

---

## 🐛 Troubleshooting

### Error: "No build files found in /app/.nuxt/dist/server"

**Root Cause**: Build didn't run or failed silently

**Solutions**:

#### 1. Check Build Command
```bash
# Railway Settings → Build Command should be:
npm ci && npm run build
```

#### 2. Check Environment Variables
```bash
# Ensure NODE_ENV is set
NODE_ENV=production
```

#### 3. Verify Locally
```bash
# Test build locally before deploying
npm ci
npm run build
npm run start

# Check if .nuxt/dist/ was created
ls -la .nuxt/dist/
```

#### 4. Check Railway Logs
```bash
# In Railway Dashboard → Deployments → View Logs
# Look for:
- "Building Nuxt.js..."
- "Client built successfully"
- "Server built successfully"
```

### Error: "Cannot find module '@nuxt/core'"

**Solution**: Ensure `nuxt` is in `dependencies`, not `devDependencies`

```json
{
  "dependencies": {
    "nuxt": "^2.15.7"
  }
}
```

### Error: "ECONNREFUSED when calling API"

**Solution**: Check API_URL environment variable

```bash
# Verify in Railway Variables:
API_URL=https://isuzustock-management-production.up.railway.app/api
BASE_URL=https://isuzustock-management-production.up.railway.app
```

### Error: "npm ERR! peer dep missing"

**Solution**: Add to Railway environment variables:

```bash
NPM_CONFIG_LEGACY_PEER_DEPS=true
```

---

## 📊 Validation Steps

### After Successful Deployment:

#### 1. Check Health Endpoint
```bash
curl https://testdrive-liff-app-production.up.railway.app
# Should return HTML (not 404 or 502)
```

#### 2. Check API Connection
```bash
# Open browser console at your Railway URL
# Check Network tab for API calls to:
https://isuzustock-management-production.up.railway.app/api/*
```

#### 3. Test LIFF Initialization
```bash
# In browser console:
liff.isInClient()  // Should return boolean
liff.isLoggedIn()  // Should return boolean
```

#### 4. Check Railway Logs
```bash
# Should see:
✓ Listening on: http://0.0.0.0:4000/
```

---

## 🔧 Railway Settings Reference

### Build Settings
```
Build Command:  npm ci && npm run build
Start Command:  npm run start
Watch Paths:    /
```

### Environment Variables
| Variable | Value | Required |
|----------|-------|----------|
| NODE_ENV | production | ✅ |
| PORT | 4000 | ✅ |
| HOST | 0.0.0.0 | ✅ |
| API_URL | https://isuzustock-management-production.up.railway.app/api | ✅ |
| BASE_URL | https://isuzustock-management-production.up.railway.app | ✅ |
| LIFF_ID | 2006746784-e1y9NRqn | ✅ |
| NPM_CONFIG_LEGACY_PEER_DEPS | true | ⚠️ Recommended |

### Health Check
```
Path: /
Timeout: 300 seconds (for initial build)
```

---

## 🧪 Local Testing Commands

Before deploying to Railway, test locally:

```bash
# 1. Install dependencies
npm ci

# 2. Build for production
npm run build

# 3. Verify .nuxt/dist/ was created
ls -la .nuxt/dist/server/

# 4. Start production server
npm run start

# 5. Test in another terminal
curl http://localhost:4000

# 6. Test with production environment variables
NODE_ENV=production \
API_URL=https://isuzustock-management-production.up.railway.app/api \
LIFF_ID=2006746784-e1y9NRqn \
npm run start
```

Expected output:
```
ℹ Listening on: http://0.0.0.0:4000/
✓ Client
  Compiled successfully in X.XXs

✓ Server
  Compiled successfully in X.XXs
```

---

## 📝 Files Created for Railway

### 1. `railway.json`
- Specifies build and deploy commands
- Configures restart policy
- Sets health check parameters

### 2. `nixpacks.toml`
- Alternative to railway.json
- Specifies Node.js version
- Defines build phases
- Sets start command

### 3. `.env.example`
- Template for required environment variables
- Documents all configuration options
- Includes Railway production URLs

### 4. `.nvmrc`
- Locks Node.js version to 20.11.1
- Ensures consistent builds

### 5. `.npmrc`
- Contains legacy-peer-deps=true
- Resolves peer dependency warnings

---

## 🎯 Next Steps After Deployment

### 1. Update LINE Developers Console
```
Endpoint URL: https://testdrive-liff-app-production.up.railway.app
```

### 2. Configure CORS on Backend
Ensure backend allows requests from:
```
https://testdrive-liff-app-production.up.railway.app
```

### 3. Test LIFF Flow
1. Open in LINE app
2. Test login/logout
3. Test API calls (bookings, vehicles, etc.)
4. Verify role-based access control

### 4. Monitor Railway Logs
```bash
# Watch for errors:
- API connection failures
- LIFF initialization errors
- Role middleware issues
```

---

## 📞 Support

### Railway Issues
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

### Nuxt.js Issues
- Nuxt 2 Docs: https://nuxtjs.org
- Deployment Guide: https://nuxtjs.org/deployments/railway

### Project-Specific Issues
- GitHub: https://github.com/pxrxmett/testdrive-liff-app/issues

---

## ✅ Deployment Success Criteria

Your deployment is successful when:
- ✅ Railway build completes without errors
- ✅ Application starts and listens on port 4000
- ✅ Health check returns 200 OK
- ✅ Can access app at Railway URL
- ✅ API calls to backend succeed
- ✅ LIFF initializes correctly in LINE app
- ✅ Login/logout works
- ✅ Role-based access control functions

---

## 🔄 Continuous Deployment

Railway automatically deploys when you push to main:

```bash
# Make changes
git add .
git commit -m "feat: your changes"
git push origin main

# Railway will automatically:
# 1. Detect push
# 2. Run build
# 3. Deploy if successful
# 4. Keep previous version if build fails
```

---

**Last Updated**: 2025-11-06
**Maintained By**: Claude Code
**Status**: Production Ready ✅
