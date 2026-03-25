# Comprehensive Login Flow Troubleshooting Guide

## Executive Summary
The login flow issue manifests as the user being unable to access the `/learn` page despite providing valid credentials. The page briefly shows "loading" before redirecting back to the login page. This document provides a systematic diagnostic approach to identify and resolve the root cause.

## Problem Statement
- **Symptom**: User logs in with valid credentials → briefly sees `/learn` page → immediately redirected to `/login`
- **Affected Pages**: `/login`, `/signup`, `/learn`
- **Root Cause**: Module resolution failure in the build system preventing login page from rendering

---

## Part 1: Build System Diagnostics

### Issue #1: Input Component Module Not Found
**Error**: `Module not found: Can't resolve '@/components/ui/input'`

**Root Cause Analysis**:
- The `components/ui/input.tsx` file EXISTS and contains valid code
- The build cache may be stale or the module resolver may not be picking it up
- This prevents the login page from rendering at all

**Verification Steps**:
```bash
# 1. Check if the file physically exists
ls -la components/ui/input.tsx

# 2. Verify file integrity
cat components/ui/input.tsx | head -20

# 3. Check for circular imports
grep -r "from.*input" components/ lib/

# 4. Verify import path
grep -n "@/components/ui/input" app/login/page.tsx
```

**Files Involved**:
- `components/ui/input.tsx` - Input component (EXISTS)
- `app/login/page.tsx` - Imports Input on line 6
- `app/signup/page.tsx` - Imports Input on line 5
- `lib/utils.ts` - Provides `cn()` utility needed by Input

---

## Part 2: Authentication State Diagnostics

### Issue #2: Authentication State Not Persisting
The login appears to succeed momentarily, but the auth state is lost on redirect.

**Diagnostic Steps**:

#### Step 1: Check Auth Context Implementation
**File**: `lib/auth-context.tsx`

Key functions to verify:
```typescript
const login = async (email: string, password: string) => {
  // 1. Verify fetch includes credentials
  // ✓ Should have: credentials: 'include'
  
  // 2. Verify state updates happen before redirect
  // ✓ Should call setUser() and setStudentProfile()
  
  // 3. Verify redirect delay
  // ✓ Should have small delay before router.push()
}

const refreshUser = async () => {
  // 1. Verify fetch for /api/auth/me
  // ✓ Should have: credentials: 'include'
  // ✓ Should have: cache: 'no-store'
  
  // 2. Verify error handling
  // ✓ Should set user to null on failure
  // ✓ Should set isLoading to false
}
```

#### Step 2: Check Cookie Storage
**In Browser DevTools**:

1. Open DevTools → Application → Cookies
2. Look for cookie named `auth_token` or similar
3. Verify properties:
   - **Domain**: matches your app domain
   - **Path**: `/`
   - **HttpOnly**: Should be `true` (secure)
   - **Secure**: Should be `true` for HTTPS
   - **SameSite**: Should be `Lax` or `Strict`

**Network Analysis**:
1. Open DevTools → Network tab
2. Login and monitor:
   - **POST /api/auth/login**
     - Response: Should set `Set-Cookie` header
     - Check response body for user data
   - **GET /api/auth/me** (after redirect)
     - Request: Should include `Cookie` header
     - Response: Should return user data

#### Step 3: Check /learn Page Redirect Logic
**File**: `app/learn/page.tsx`

```typescript
useEffect(() => {
  // Current check - should be:
  if (!isLoading && !user) {
    router.push('/login')
  }
  
  // Issue: Runs too early or dependencies cause re-runs
  // Verify dependencies: [isLoading, user] only
  // NOT: [isLoading, user, router, getAllProgress]
}, [isLoading, user]) // Only these two!
```

---

## Part 3: Session Management Diagnostics

### Step 1: API Route Verification
**Files to check**:
- `app/api/auth/login/route.ts` - Sets cookie on successful login
- `app/api/auth/me/route.ts` - Reads cookie and returns user
- `app/api/auth/signup/route.ts` - Creates user and sets cookie

**Key verification**:
```typescript
// Login API should:
// 1. Validate credentials
// 2. Create user session
// 3. Set HTTP-only cookie with session token
// 4. Return user data in response

// Me API should:
// 1. Read auth cookie from request
// 2. Validate token
// 3. Return user data
// 4. Handle missing/invalid cookie gracefully
```

### Step 2: Token Validation Flow
**Diagram**:
```
Login Form Submit
    ↓
POST /api/auth/login (credentials)
    ↓
[Database: Find user, verify password]
    ↓
Create Session Token
    ↓
Set HTTP-Only Cookie
    ↓
Return {user, token} to client
    ↓
Auth Context: setUser(user)
    ↓
Wait 100ms (allow cookie to set)
    ↓
router.push('/learn')
    ↓
/learn page mounts
    ↓
useEffect checks: isLoading=false, user=exists
    ↓
Page renders (no redirect)
    ↓
fetchSubjects() and getAllProgress() called
```

---

## Part 4: Component State Diagnostics

### Adding Debug Logging

**In `/learn/page.tsx`**:
```typescript
useEffect(() => {
  console.log('[v0] Learn page effect - isLoading:', isLoading, 'user:', user)
  
  if (!isLoading && !user) {
    console.log('[v0] Redirecting to login - no user')
    router.push('/login')
    return
  }

  if (user && !isLoading) {
    console.log('[v0] User authenticated, fetching data')
    fetchSubjects()
    getAllProgress()
  }
}, [isLoading, user])
```

**In `/lib/auth-context.tsx`**:
```typescript
const login = async (email: string, password: string) => {
  console.log('[v0] Login attempt for:', email)
  // ... login code ...
  console.log('[v0] Login success, user:', data.user)
  setUser(data.user)
  console.log('[v0] Redirecting to:', data.user.role === 'teacher' ? '/teacher' : '/learn')
}

const refreshUser = async () => {
  console.log('[v0] Checking authentication...')
  // ... refresh code ...
  if (response.ok) {
    console.log('[v0] Auth valid, user:', data.user)
  } else {
    console.log('[v0] Auth invalid, redirecting to login')
  }
}
```

**Expected Console Output After Login**:
```
[v0] Login attempt for: user@example.com
[v0] Login success, user: {id: '...', name: 'User', role: 'student'}
[v0] Redirecting to: /learn
[v0] Learn page effect - isLoading: false, user: {id: '...', name: 'User', role: 'student'}
[v0] User authenticated, fetching data
[v0] Checking authentication...
[v0] Auth valid, user: {id: '...', name: 'User', role: 'student'}
```

---

## Part 5: Network Request Analysis

### Login Flow Network Sequence

1. **POST /api/auth/login**
   - Status: 200
   - Headers: 
     - Request: `Content-Type: application/json`
     - Response: `Set-Cookie: auth_token=...`
   - Body Response: `{user: {...}, studentProfile: {...}}`

2. **GET /api/auth/me** (from /learn page)
   - Status: 200
   - Headers:
     - Request: `Cookie: auth_token=...`
   - Body Response: `{user: {...}, studentProfile: {...}}`

### Common Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Missing credentials in fetch | Cookie not sent | Add `credentials: 'include'` |
| Cache-busting needed | Stale auth data | Add `cache: 'no-store'` |
| Circular dependency | Infinite re-renders | Remove unnecessary dependencies |
| Missing student profile | Undefined data | Ensure profile created at signup |

---

## Part 6: Debugging Checklist

- [ ] Input component file exists at `components/ui/input.tsx`
- [ ] Input component is properly exported
- [ ] Build cache is cleared (`rm -rf .next`)
- [ ] Login page can render (no module errors)
- [ ] Signup page successfully creates user and session
- [ ] Auth cookie is set after login (check DevTools)
- [ ] Auth context properly updates user state
- [ ] `/learn` page receives user data in state
- [ ] `/learn` page doesn't redirect authenticated users
- [ ] `getAllProgress` removed from `/learn` useEffect dependencies
- [ ] API routes set `credentials: 'include'` headers
- [ ] API routes have proper error handling
- [ ] Session persists on page refresh

---

## Part 7: Implementation Verification

### Critical Code Sections

**✓ Auth Context - Login Method**
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // ← CRITICAL
    body: JSON.stringify({ email, password }),
  })
  
  const data = await response.json()
  setUser(data.user)
  
  await new Promise(resolve => setTimeout(resolve, 100)) // ← Small delay
  router.push(data.user.role === 'teacher' ? '/teacher' : '/learn')
}
```

**✓ /learn Page - useEffect**
```typescript
useEffect(() => {
  if (!isLoading && !user) {
    router.push('/login')
    return
  }

  if (user && !isLoading) {
    fetchSubjects()
    getAllProgress()
  }
}, [isLoading, user]) // ← ONLY these dependencies
```

**✓ Auth Context - RefreshUser**
```typescript
const refreshUser = async () => {
  const response = await fetch('/api/auth/me', {
    credentials: 'include', // ← CRITICAL
    cache: 'no-store', // ← CRITICAL
  })
  // ... handle response ...
}
```

---

## Resolution Steps

1. **Clear build cache**: `rm -rf .next`
2. **Verify dependencies**: `npm install` or `pnpm install`
3. **Check all API routes** have `credentials: 'include'`
4. **Remove problematic dependencies** from useEffect arrays
5. **Add debug logging** to trace execution flow
6. **Test login flow** in incognito mode (no cached data)
7. **Monitor network** in DevTools during login
8. **Verify cookies** are being set and sent

---

## Success Criteria

Once the issue is resolved:
- Login page renders without errors
- User can enter credentials and submit
- Post-login user redirects to `/learn` (or `/teacher`)
- `/learn` page displays student profile and courses
- Page refresh maintains login state
- User can navigate between pages
- Logout removes authentication session

