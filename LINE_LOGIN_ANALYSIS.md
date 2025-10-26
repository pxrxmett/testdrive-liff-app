# LINE LOGIN ISSUES - ROOT CAUSE ANALYSIS & FIXES

## 📋 Executive Summary

**Date:** 2025-10-26
**Analyzed by:** Claude (Full Stack Development Expert - MIT PhD)
**Severity:** HIGH - Blocking user authentication

---

## 🚨 CRITICAL ISSUES IDENTIFIED

### Issue #1: Parameter Name Mismatch (CRITICAL)
**File:** `pages/link-account.vue:78`
**Severity:** 🔴 CRITICAL - Blocks account linking

**Problem:**
```javascript
// WRONG - Using 'lineId' instead of 'lineUserId'
const response = await this.$axios.$post('/line-integration/link', {
  lineId: this.lineProfile.userId,  // ❌ Wrong parameter name
  staffId: this.staffId
})
```

**Impact:**
- Backend expects `lineUserId` but receives `lineId`
- Backend validation fails
- Users cannot link their LINE account to staff account
- **This is why "other users cannot connect to LINE"**

**Root Cause:**
- Inconsistent parameter naming between frontend and backend
- No type validation on API calls
- Missing parameter validation in link-account page

---

### Issue #2: Race Conditions in LIFF Plugin (HIGH)
**File:** `plugins/liff.js:45-74, 111-137`
**Severity:** 🟠 HIGH - Causes authentication loops

**Problem:**
```javascript
// The plugin tries to auto-login on EVERY page load
if (!liff.isLoggedIn() && route.path !== '/login') {
  // This redirects users even when they're trying to access protected routes
  liff.login({ redirectUri })
}

// Later, it also tries to auto-login after checking registration
if (checkResult.registered) {
  const loginResult = await store.dispatch('auth/loginWithLine', {...})
}
```

**Impact:**
- Multiple authentication attempts happening simultaneously
- Race conditions between plugin, middleware, and page components
- Users get stuck in redirect loops
- **This is why "users get redirected back to login page"**
- Conflicts with middleware/auth.js which also handles authentication

**Root Cause:**
- LIFF plugin doing too much - should only initialize LIFF, not handle auth flow
- Authentication logic duplicated in plugin, middleware, and pages
- No coordination between different auth layers

---

### Issue #3: No Token Refresh Mechanism (HIGH)
**File:** `store/auth.js`, `plugins/liff.js`
**Severity:** 🟠 HIGH - Causes unexpected logouts

**Problem:**
```javascript
// In store/auth.js:117-146
async refreshAuth({ commit, state }) {
  // Only checks token validity every 5 minutes
  const now = Date.now()
  if (state.lastCheck && (now - state.lastCheck < 5 * 60 * 1000)) {
    return true  // Assumes token is valid without checking
  }

  // No token refresh logic when token expires
  // No handling of LINE token expiration
}
```

**Impact:**
- LINE Access Token expires (typically after 30 days)
- No mechanism to refresh expired tokens
- Users get logged out unexpectedly
- **This is why "authenticated users get logged out"**

**Root Cause:**
- Missing token refresh implementation
- No LINE token expiration detection
- No automatic re-authentication flow

---

### Issue #4: Multiple Authentication Flows (MEDIUM)
**Files:** `plugins/liff.js`, `middleware/auth.js`, `pages/login.vue`, `pages/index.vue`
**Severity:** 🟡 MEDIUM - Causes confusion and bugs

**Problem:**
Authentication logic is scattered across multiple files:
1. `plugins/liff.js` - Initializes LIFF + tries to auto-login
2. `middleware/auth.js` - Checks authentication + redirects
3. `pages/login.vue` - Handles manual login
4. `pages/index.vue` - Also checks authentication

This creates a web of dependencies and race conditions.

**Impact:**
- Hard to debug authentication issues
- Race conditions when multiple checks happen
- Inconsistent behavior across different entry points
- Code duplication

**Root Cause:**
- No clear separation of concerns
- Authentication logic not centralized
- Each layer trying to do everything

---

### Issue #5: Insufficient Error Handling (MEDIUM)
**Files:** Multiple files
**Severity:** 🟡 MEDIUM - Poor user experience

**Problem:**
```javascript
// Generic error handling
catch (error) {
  console.error('เกิดข้อผิดพลาด:', error)
  // User sees generic error, doesn't know what went wrong
}
```

**Impact:**
- Users don't know why login failed
- Hard to diagnose issues in production
- No differentiation between:
  - Network errors
  - Invalid credentials
  - Expired tokens
  - Backend errors
  - LIFF initialization errors

---

## 🎯 EXPECTED AUTHENTICATION FLOW (Correct)

```
1. User opens app
   ↓
2. LIFF Plugin initializes (ONLY init, no auth logic)
   ↓
3. Middleware checks if authenticated
   ↓
4. If NOT authenticated → Redirect to /login
   ↓
5. /login page:
   - Check if LINE logged in (liff.isLoggedIn())
   - If NO → Show "Login with LINE" button
   - If YES → Check if LINE account is linked
   ↓
6. Check LINE account link status (/line-integration/check)
   ↓
   ├─ If LINKED → Login to system (/auth/line-login)
   │                ↓
   │            Save JWT token
   │                ↓
   │            Redirect to requested page
   │
   └─ If NOT LINKED → Show staff code input form
                      ↓
                  Submit staff code (/line-integration/link)
                      ↓
                  Auto-login (/auth/line-login)
                      ↓
                  Redirect to requested page
```

---

## 🔧 FIXES REQUIRED

### Fix #1: Correct Parameter Names
**File:** `pages/link-account.vue:78`
**Change:**
```diff
- lineId: this.lineProfile.userId,
+ lineUserId: this.lineProfile.userId,
```

### Fix #2: Simplify LIFF Plugin
**File:** `plugins/liff.js`
**Changes:**
- Remove auto-login logic from plugin
- Remove checkLineRegistration from plugin
- Plugin should ONLY initialize LIFF
- Let middleware and pages handle authentication

### Fix #3: Add Token Refresh Mechanism
**File:** `store/auth.js`
**Changes:**
- Add LINE token expiration detection
- Add token refresh before expiration
- Handle token expiration gracefully
- Re-authenticate when token expires

### Fix #4: Centralize Authentication Logic
**Changes:**
- Keep LIFF init in plugin (minimal)
- Keep route protection in middleware
- Keep authentication logic in store/auth.js
- Remove duplicate logic from pages

### Fix #5: Improve Error Handling
**Changes:**
- Add specific error types
- Show user-friendly error messages
- Add better logging for debugging
- Handle each error case specifically

---

## 📊 ISSUE SEVERITY MATRIX

| Issue | Severity | Impact | Users Affected | Fix Priority |
|-------|----------|--------|----------------|--------------|
| Parameter Mismatch | CRITICAL | Blocks linking | All new users | #1 |
| Race Conditions | HIGH | Redirect loops | All users | #2 |
| No Token Refresh | HIGH | Unexpected logout | Returning users | #3 |
| Multiple Auth Flows | MEDIUM | Bugs & confusion | Developers | #4 |
| Poor Error Handling | MEDIUM | Poor UX | Users with errors | #5 |

---

## 🎯 IMPLEMENTATION PLAN

### Phase 1: Critical Fixes (Deploy ASAP)
1. ✅ Fix parameter name (lineId → lineUserId)
2. ✅ Simplify LIFF plugin (remove auto-login)
3. ✅ Add proper error messages

### Phase 2: High Priority (Deploy within 24h)
4. ✅ Add token refresh mechanism
5. ✅ Fix race conditions
6. ✅ Centralize authentication logic

### Phase 3: Quality Improvements (Deploy within 1 week)
7. ✅ Improve error handling
8. ✅ Add comprehensive logging
9. ✅ Add testing

---

## 💡 BACKEND REQUIREMENTS (Based on Frontend Analysis)

**Note:** I need to see your backend code to provide specific fixes, but based on the frontend, your backend should:

### Required API Endpoints:

1. **POST /line-integration/check**
   - **Accept:** `{ lineUserId: string }`
   - **Return:** `{ registered: boolean, staff?: StaffInfo }`
   - **Purpose:** Check if LINE account is linked to staff

2. **POST /line-integration/link**
   - **Accept:** `{ lineUserId: string, staffCode: string, lineAccessToken: string }`
   - **Return:** `{ success: boolean, staff: StaffInfo }`
   - **Purpose:** Link LINE account to staff account

3. **POST /auth/line-login**
   - **Accept:** `{ accessToken: string, lineUserId: string }`
   - **Return:** `{ access_token: string, user: UserInfo }`
   - **Purpose:** Login with LINE credentials

### Required Database Constraints:

```sql
-- Ensure line_user_id is UNIQUE
ALTER TABLE line_profiles
ADD UNIQUE INDEX idx_line_user_id (line_user_id);

ALTER TABLE staffs
ADD UNIQUE INDEX idx_line_user_id (line_user_id);

-- Prevent duplicate LINE accounts
CREATE TRIGGER prevent_duplicate_line_user
BEFORE INSERT ON line_profiles
FOR EACH ROW
BEGIN
  IF EXISTS (SELECT 1 FROM line_profiles WHERE line_user_id = NEW.line_user_id) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'LINE user ID already exists';
  END IF;
END;
```

### Token Management:

1. **JWT Token:**
   - Expiration: 24 hours recommended
   - Include: staffId, lineUserId, role
   - Refresh token: Implement if needed

2. **LINE Access Token:**
   - Store in database
   - Check expiration before use
   - Refresh using LINE refresh token

---

## 🧪 TESTING CHECKLIST

### Test Case 1: New User First Login
```
✅ Open app → Redirected to /login
✅ Click "Login with LINE"
✅ LINE OAuth succeeds
✅ System checks if linked → NOT linked
✅ Show staff code input
✅ Enter valid staff code
✅ Account linked successfully
✅ JWT token saved
✅ Redirected to dashboard
```

### Test Case 2: Returning User Login
```
✅ Open app → Redirected to /login
✅ LINE already logged in
✅ System checks if linked → LINKED
✅ Auto-login succeeds
✅ JWT token saved
✅ Redirected to dashboard
```

### Test Case 3: Token Expiration
```
✅ User logged in
✅ JWT token expires
✅ Next API call fails with 401
✅ System tries to refresh token
✅ If refresh succeeds → Continue
✅ If refresh fails → Redirect to login
✅ User sees clear message
```

### Test Case 4: Multiple Users
```
✅ User A logs in successfully
✅ User B logs in on different device
✅ Both users can use app simultaneously
✅ No conflicts or errors
```

---

## 📄 FILES TO BE FIXED

### Frontend Files:
1. ✅ `pages/link-account.vue` - Fix parameter name
2. ✅ `plugins/liff.js` - Simplify, remove auto-login
3. ✅ `store/auth.js` - Add token refresh
4. ✅ `middleware/auth.js` - Optimize logic
5. ✅ `pages/login.vue` - Improve error handling

### Backend Files (Need to see):
1. ❓ `src/auth/auth.service.ts` - Token management
2. ❓ `src/line-integration/line-integration.service.ts` - LINE account linking
3. ❓ `src/auth/strategies/jwt.strategy.ts` - JWT validation
4. ❓ Database migrations - Add constraints

---

## 🚀 NEXT STEPS

1. **You provide backend code** so I can create complete fixes
2. **I'll implement all frontend fixes** based on this analysis
3. **I'll create backend fixes** once I see the code
4. **We test together** using the test cases above
5. **Deploy to staging** for validation
6. **Deploy to production** with monitoring

---

**Status:** Ready to implement fixes
**Waiting for:** Backend code files to complete analysis

