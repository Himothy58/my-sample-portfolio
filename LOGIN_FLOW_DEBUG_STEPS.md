# Step-by-Step Login Flow Debugging Guide

## Quick Diagnosis

The login flow redirects users back to `/login` immediately after showing `/learn` briefly. This indicates the authentication state isn't being properly maintained.

## Step 1: Check Browser Console for Errors
**Action**: Open DevTools (F12) → Console tab

**What to look for**:
```
❌ Module not found: Can't resolve '@/components/ui/input'
   - This prevents login page from loading

❌ [v0] Login attempt for: user@email.com
   [v0] Login success, user: {...}
   [v0] Redirecting to: /learn
   - If these appear, login succeeded

❌ [v0] Learn page effect - isLoading: true, user: null
   [v0] Redirecting to login - no user
   - This means auth state was lost
```

**Expected Output After Login**:
```
[v0] Login attempt for: user@email.com
[v0] Login success, user: {id: '...', email: 'user@email.com', name: 'User', role: 'student'}
[v0] Redirecting to: /learn
[v0] Learn page effect - isLoading: false, user: user@email.com
[v0] User authenticated, fetching data
[v0] Checking authentication...
[v0] Auth valid, user: {id: '...', email: 'user@email.com', name: 'User', role: 'student'}
```

## Step 2: Check Network Requests

### In Browser DevTools:
1. Go to **Network** tab
2. Clear existing requests
3. Perform login workflow
4. Look for these requests:

**Request 1: POST /api/auth/login**
- **Status**: Should be `200`
- **Request Headers**: Should include `Content-Type: application/json`
- **Response Headers**: Should include `Set-Cookie: auth_token=...`
- **Response Body**: Should contain user data
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@email.com",
      "name": "User Name",
      "role": "student"
    },
    "studentProfile": { ... }
  }
  ```

**Request 2: GET /api/auth/me** (from /learn page)
- **Status**: Should be `200`
- **Request Headers**: Should include `Cookie: auth_token=...`
- **Response Body**: Should return same user data

### Common Network Issues:
```
❌ POST /api/auth/login returns 401
   → User credentials are wrong or API failed

❌ GET /api/auth/me returns 401
   → Cookie not being sent or token expired

❌ Set-Cookie header missing in /api/auth/login response
   → Server not setting authentication cookie

❌ Cookie header missing in /api/auth/me request
   → Browser not sending cookies (missing credentials: 'include')
```

## Step 3: Check Application Storage

### Cookies:
1. DevTools → **Application** tab
2. Go to **Cookies** → Your domain
3. Look for `auth_token` cookie
4. Verify it has:
   - **Value**: Non-empty string
   - **Expires**: Future date/time
   - **HttpOnly**: Checked (can't access via JavaScript)
   - **Secure**: Checked (HTTPS only)
   - **SameSite**: Lax or Strict

### Local Storage:
1. DevTools → **Application** → **Local Storage**
2. Should see any app state stored there
3. Check for `authState` or similar keys

## Step 4: Verify Component Props & State

### In Login Page (`/app/login/page.tsx`):
Add this to track state:
```javascript
console.log('[v0] Login page - isLoading:', isLoading)
```

Expected:
- Initially: `isLoading: false`
- While logging in: `isLoading: true`
- After login: `isLoading: false` then redirect

### In Learn Page (`/app/learn/page.tsx`):
The debug logging is already added. Check console for:
```
[v0] Learn page effect - isLoading: false, user: user@email.com
[v0] User authenticated, fetching data
```

If instead you see:
```
[v0] Learn page effect - isLoading: false, user: null
[v0] Redirecting to login - no user
```

This means the authentication state was lost between redirect.

## Step 5: Check Authentication API Routes

### File: `/app/api/auth/login/route.ts`
Verify:
- [ ] Accepts POST requests
- [ ] Validates email and password
- [ ] Queries database for user
- [ ] Verifies password with bcrypt
- [ ] Creates auth token/session
- [ ] Sets HTTP-only cookie
- [ ] Returns user data in response

### File: `/app/api/auth/me/route.ts`
Verify:
- [ ] Accepts GET requests
- [ ] Reads cookie from request headers
- [ ] Validates token
- [ ] Returns user data if valid
- [ ] Returns 401 if invalid/missing

### File: `/lib/auth-context.tsx`
Verify the login method includes:
```typescript
credentials: 'include' // ← CRITICAL: Sends cookies
```

And the refreshUser method includes:
```typescript
credentials: 'include'  // ← CRITICAL: Sends cookies
cache: 'no-store'       // ← Prevents stale auth data
```

## Step 6: Test Each Component

### Test Login Form:
```
1. Go to /login
2. Enter email: testuser@example.com
3. Enter password: testpass123
4. Click Login
5. Check console for [v0] messages
6. Check Network tab for API calls
7. Check Cookies for auth_token
```

**Expected Success Path**:
```
Console:
  [v0] Login attempt for: testuser@example.com
  [v0] Login success, user: {...}
  [v0] Redirecting to: /learn

Network:
  POST /api/auth/login → 200
  ✓ Set-Cookie header present

Cookies:
  ✓ auth_token cookie exists

Navigation:
  ✓ Page navigates to /learn
  ✓ Learn page loads and stays visible
```

**Expected Failure Path** (if user doesn't exist):
```
Console:
  [v0] Login attempt for: testuser@example.com
  [v0] Login error: User not found or password incorrect

Network:
  POST /api/auth/login → 401

Result:
  ✓ Stay on /login page
  ✓ Show error message to user
```

### Test Session Persistence:
```
1. Login successfully (reach /learn page)
2. Refresh page (F5)
3. Check if still on /learn page
```

**Expected**:
- Page stays on /learn
- User data is loaded (not blank)
- Console shows `[v0] Auth valid, user: ...`

**Actual Issue** (if failing):
- Redirected back to /login
- Console shows `[v0] Auth invalid`
- Cookie is missing or invalid

## Step 7: Identify Root Cause

### If Login Page Won't Load:
```
Error: Module not found: Can't resolve '@/components/ui/input'

Fix:
1. Clear build cache: rm -rf .next
2. Reinstall dependencies: npm install
3. Rebuild: npm run dev
```

### If Login Form Submits But Fails:
```
Check console for error message
Check /api/auth/login response for details
Verify database has test users created
Verify bcryptjs is properly installed
```

### If Login Succeeds But Redirects Back:
```
Two possible causes:

A) Auth State Lost Between Pages
   - Cookie not being set: Check Set-Cookie header
   - Cookie not being sent: Check credentials: 'include'
   - Cookie being rejected: Check cookie attributes

B) Auth Check Failed
   - /api/auth/me returning 401: Token invalid
   - refreshUser not being called: Check useEffect
   - isLoading state incorrect: Check state updates
```

## Step 8: Common Fixes

### Fix #1: Missing Build Cache Clear
```bash
rm -rf .next
npm run dev
```

### Fix #2: Missing credentials in Fetch
**Before**:
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
```

**After**:
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ← ADD THIS LINE
  body: JSON.stringify({ email, password }),
})
```

### Fix #3: Problematic useEffect Dependencies
**Before**:
```typescript
useEffect(() => {
  // ...
}, [isLoading, user, router, getAllProgress]) // ← Too many
```

**After**:
```typescript
useEffect(() => {
  // ...
}, [isLoading, user]) // ← Only these two
```

## Step 9: Verification Checklist

Before considering the issue fixed:

- [ ] Login page loads without module errors
- [ ] Can enter credentials and submit
- [ ] POST /api/auth/login succeeds (200)
- [ ] Set-Cookie header present in response
- [ ] auth_token cookie exists and is valid
- [ ] Redirects to /learn page
- [ ] /learn page loads without redirecting back
- [ ] Console shows auth validation success
- [ ] GET /api/auth/me succeeds (200)
- [ ] Page refresh keeps user logged in
- [ ] Logout works and clears session
- [ ] Logged out user redirected to /login

## Next Steps

If you've followed all steps and still having issues:

1. **Clear everything**:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run dev
   ```

2. **Check API implementations**:
   - Verify `/app/api/auth/login/route.ts` creates user session
   - Verify `/app/api/auth/me/route.ts` reads session correctly
   - Ensure both use correct header names for cookies

3. **Review Database**:
   - Verify users table has test data
   - Check passwords are hashed with bcrypt
   - Ensure student_profiles table created for students

4. **Monitor Logs**:
   - Server logs during login: `npm run dev`
   - Browser console: Open DevTools
   - Network requests: DevTools → Network tab

