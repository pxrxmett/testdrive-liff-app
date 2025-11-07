# 📍 Where to Check Logs

## ⚠️ IMPORTANT: Two Different Types of Logs

### 1. 🖥️ Railway Container Logs (Server-Side)
**Where**: Railway Dashboard → Deployments → Logs tab
**Shows**: Server startup, build process, server errors
**Example**:
```
Listening on: http://10.222.100.159:4000/
🔌 Axios plugin initialized - v2.0 with comprehensive token detection
```

**What you WON'T see here**:
- ❌ Token detection logs
- ❌ API response logs
- ❌ LocalStorage operations
- ❌ Browser-side JavaScript logs

---

### 2. 🌐 Browser Console Logs (Client-Side) ✅ **USE THIS FOR DEBUGGING**
**Where**: Open the web app → Press F12 → Console tab
**Shows**: All frontend JavaScript logs, API calls, token operations

**Example of what you SHOULD see**:
```
🔌 Axios plugin initialized - v2.0 with comprehensive token detection
🔗 Axios baseURL: https://isuzustock-management-production.up.railway.app/api
📥 API Response: POST /line-integration/check - 200
🔍 DEBUG /line-integration/check response: {
  data: { registered: true, token: "eyJ..." },
  dataKeys: ["registered", "token", "user"],
  hasToken: true,
  hasAccessToken: false,
  ...
}
✅ Token saved to localStorage: {
  tokenKey: "token",
  tokenPreview: "eyJhbGciOiJIUzI1NiIs...",
  foundIn: "direct data"
}
✅ Token committed to Vuex store
```

---

## 🔍 How to Debug Token Issues

### Step 1: Open Browser Console
1. Open the LIFF app in LINE browser
2. Press **F12** (or right-click → Inspect → Console tab)
3. Keep Console open

### Step 2: Login via LINE
1. Click "Login with LINE"
2. Watch Console logs appear in real-time

### Step 3: Check for Key Logs
- ✅ `🔌 Axios plugin initialized` - Confirms latest code is loaded
- ✅ `📥 API Response: POST /line-integration/check - 200` - API call succeeded
- ✅ `🔍 DEBUG /line-integration/check response` - Shows response structure
- ✅ `✅ Token saved to localStorage` - Token detected and saved
- ⚠️ `⚠️ No token found in response` - Backend didn't send token

### Step 4: Verify Token in LocalStorage
In Console, type:
```javascript
localStorage.getItem('token')
localStorage.getItem('access_token')
```

Should return: `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
If `null` - token wasn't saved!

---

## 🚨 Common Mistake

❌ **Wrong**: Looking at Railway container logs for token issues
✅ **Correct**: Looking at Browser Console (F12) for token issues

**Railway logs** = Server startup
**Browser Console** = Where token detection happens

---

## 📋 Quick Checklist

When reporting token issues, provide:
- [ ] **Browser Console logs** (not Railway logs)
- [ ] Network Tab → `/line-integration/check` response
- [ ] `localStorage.getItem('token')` result
- [ ] Screenshot of Console if possible

---

## 🎯 Expected Full Flow in Console

```
1. 🔌 Axios plugin initialized - v2.0 with comprehensive token detection
2. 🔗 Axios baseURL: https://...
3. 🔐 LIFF initialized
4. 📥 API Response: POST /line-integration/check - 200
5. 🔍 DEBUG /line-integration/check response: { ... }
6. ✅ Token saved to localStorage: { tokenPreview: "eyJ..." }
7. ✅ Token committed to Vuex store
8. 📥 API Response: GET /auth/me - 200
9. 👤 Staff info saved
```

If you see steps 1-7, token detection is working!
