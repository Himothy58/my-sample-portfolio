# Authentication Debugging Strategies

## Identifying Redirect Loop Issues

### Symptoms to Look For
1. **User redirected immediately after login/signup**
   - Appears on protected page briefly then redirects to login
   - Happens consistently and repeatedly

2. **Infinite redirect loop in browser**
   - Browser shows redirect warning
   - Network tab shows repeated requests to same URLs

3. **Auth state inconsistencies**
   - Console shows user is authenticated
   - But page redirects as if not authenticated

### Quick Diagnosis: 30-Second Check

```typescript
// 1. Open Browser DevTools Console
// 2. Check auth context state
// In any page's useEffect, add temporary debug logging:

useEffect(() => {
  console.log('[Auth Debug]', {
    isLoading,
    user: user?.email,
    isAuthenticated: !!user,
  })
}, [isLoading, user])

// 3. Check what happens after signup:
// - User should change from null to User object
// - isLoading should go from true to false
// - Component should render with authenticated content

// 4. Check Network Tab
// - Look for Set-Cookie response header in signup/login response
// - Verify subsequent requests include Cookie request header
```

---

## Step-by-Step Debugging Process

### Step 1: Check Browser Console for Errors

**What to look for:**
- Module not found errors (missing imports)
- Unhandled promise rejections
- Type errors in auth context
- "Cannot read property" errors

**Action:**
```bash
# Open DevTools → Console tab
# Check for any red error messages
# Copy any error messages for research
```

**Example Error to Fix:**
```
Module not found: Can't resolve '@/components/ui/input'
→ Create the missing component file
```

### Step 2: Inspect Network Requests

**Open DevTools → Network tab and reproduce the issue:**

1. **Check Authentication Requests**
   ```
   Request: POST /api/auth/signup
   Look for:
   - ✓ Status: 201 or 200
   - ✓ Response includes user data
   - ✓ Response has Set-Cookie header with auth_token
   ```

2. **Check Cookie Headers**
   ```
   After signup, any request to protected pages should have:
   Request Headers:
     Cookie: auth_token=<uuid>; ...
   
   If missing:
   → Problem: credentials not included in fetch
   → Fix: Add credentials: 'include' to fetch options
   ```

3. **Check Auth Verification Requests**
   ```
   Request: GET /api/auth/me
   Look for:
   - ✓ Cookie header present in request
   - ✓ Status: 200
   - ✓ Response includes user data
   
   If status is 401:
   → Problem: Token not valid or not sent
   → Fix: Verify credentials: 'include' in fetch
   ```

### Step 3: Examine Application State in DevTools

**Chrome DevTools → Sources → Debugger:**

```typescript
// Set a breakpoint in the useEffect that checks auth
useEffect(() => {
  debugger; // Execution pauses here
  if (!isLoading && !user) {
    router.push('/login')
  }
}, [isLoading, user])

// When paused, check in Console:
console.log({ isLoading, user, isAuthenticated: !!user })
// This shows the exact state at the time of redirect
```

**What to verify:**
- Is `isLoading` false before checking `!user`?
- Is `user` actually null/undefined?
- Should the redirect happen?

### Step 4: Check Authentication Context State

**In any component using useAuth():**

```typescript
const { user, isLoading, isAuthenticated } = useAuth()

// Add temporary debug output
useEffect(() => {
  console.log('[Auth State]', {
    user: user?.email,
    isLoading,
    isAuthenticated,
    role: user?.role,
  })
}, [user, isLoading, isAuthenticated])
```

**Expected flow after signup:**
```
1. [Auth State] { user: null, isLoading: true, isAuthenticated: false }
2. [Auth State] { user: "test@example.com", isLoading: false, isAuthenticated: true }
3. Navigate to /learn
4. /learn page loads, no redirect
```

**If you see:**
```
1. [Auth State] { user: "test@example.com", isLoading: false, isAuthenticated: true }
2. [Auth State] { user: null, isLoading: false, isAuthenticated: false }
→ Auth context lost the user! Check why refreshUser() is clearing it
```

### Step 5: Verify Cookie Storage

**Chrome DevTools → Application → Cookies:**

1. **After Signup/Login:**
   - Click your domain in Cookies list
   - Look for a row with Name: `auth_token`
   - Verify:
     - ✓ Value is a UUID (looks like: 550e8400-e29b-41d4-a716-446655440000)
     - ✓ Domain is correct
     - ✓ Path is /
     - ✓ Expires: Shows a future date
     - ✓ HttpOnly: ✓ (checked)
     - ✓ Secure: ✓ (in production)
     - ✓ SameSite: Lax

2. **Cookie Missing?**
   - The `/api/auth/signup` or `/api/auth/login` response didn't set the cookie
   - Causes: Server error, client not accepting cookies, credentials not included

3. **Cookie Cleared?**
   - Cookie cleared immediately after being set
   - Causes: Logout called, auth failed, cookie expired

### Step 6: Test API Endpoints Directly

**Using cURL or browser Fetch API:**

```bash
# Test signup API
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"student"}' \
  -i

# Expected response:
# 201 Created
# Set-Cookie: auth_token=...
# { "user": {...}, "studentProfile": {...} }
```

```bash
# Test auth check API (without cookie)
curl -X GET http://localhost:3000/api/auth/me -i

# Expected response:
# 401 Unauthorized
# { "message": "Not authenticated" }
```

```bash
# Test auth check API (with cookie from login)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: auth_token=YOUR_TOKEN_HERE" \
  -i

# Expected response:
# 200 OK
# { "user": {...}, "studentProfile": {...} }
```

---

## Common Issues and Solutions

### Issue: "Module not found: Can't resolve '@/components/ui/input'"

**Diagnosis:**
```
1. Check if file exists: /components/ui/input.tsx
2. Check import statement is correct: import { Input } from '@/components/ui/input'
3. Check file exports Input component: export { Input }
```

**Solution:**
```typescript
// Create /components/ui/input.tsx with proper export
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn("...", className)}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
```

### Issue: Redirect Loop After Signup

**Diagnosis Checklist:**
```
□ Is auth_token cookie set? (DevTools → Cookies)
□ Is credentials: 'include' in fetch calls? (Auth context)
□ Is cookie sent in requests? (Network tab → Request Headers → Cookie)
□ Does /api/auth/me return 200? (Network tab → auth/me response)
□ Is there a delay before redirect? (Check code)
□ Are useEffect dependencies correct? (No router/getAllProgress in deps)
```

**Most Likely Cause:**
Missing `credentials: 'include'` in fetch calls

**Fix:**
```typescript
// In auth-context.tsx, all fetch calls should have:
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ← Add this line
  body: JSON.stringify({ email, password }),
})
```

### Issue: Auth State Not Persisting After Page Reload

**Diagnosis:**
```
1. Log in successfully
2. Reload page (F5)
3. Check if user is still logged in
```

**If user is logged out:**
- The `refreshUser()` call on app mount isn't finding the token
- Check: Is auth token cookie present? (DevTools → Cookies)
- Check: Does /api/auth/me return 200 with Cookie header?

**Fix:**
```typescript
// In refreshUser(), ensure fetch includes credentials
const response = await fetch('/api/auth/me', {
  method: 'GET',
  credentials: 'include', // ← Must include this
  cache: 'no-store',
})
```

### Issue: "user" State Updates in Console But Page Still Redirects

**Diagnosis:**
```
1. Add logging to see state changes:
   console.log('[Auth] User updated:', user?.email)

2. Check if multiple state updates happen:
   // If you see:
   // [Auth] User updated: test@example.com
   // [Auth] User updated: null
   // ← Something is clearing the user!

3. Find what's clearing the user:
   - Is refreshUser() being called multiple times?
   - Is logout() being triggered?
   - Is there a race condition?
```

**Solution:**
```typescript
// Use useCallback to prevent function recreation
const refreshUser = useCallback(async () => {
  // ... implementation
}, [])

// Use useMemo for dependencies
const authValue = useMemo(() => ({
  user,
  studentProfile,
  // ...
}), [user, studentProfile, isLoading])
```

---

## Logging Strategy for Auth Debugging

### Add Detailed Logging (Temporary)

```typescript
// In lib/auth-context.tsx
const login = async (email: string, password: string) => {
  console.log('[Auth Login] Starting login for:', email)
  setIsLoading(true)
  try {
    console.log('[Auth Login] Sending request to /api/auth/login')
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    console.log('[Auth Login] Response status:', response.status)
    
    if (!response.ok) {
      const error = await response.json()
      console.error('[Auth Login] Error response:', error)
      throw new Error(error.message || 'Login failed')
    }

    const data = await response.json()
    console.log('[Auth Login] Received user data:', data.user.email)
    
    setUser(data.user)
    if (data.studentProfile) {
      setStudentProfile(data.studentProfile)
    }

    console.log('[Auth Login] Waiting 100ms before redirect')
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('[Auth Login] Redirecting to:', data.user.role === 'teacher' ? '/teacher' : '/learn')
    router.push(data.user.role === 'teacher' ? '/teacher' : '/learn')
  } finally {
    setIsLoading(false)
  }
}
```

**Remove after debugging:**
```typescript
// Simply delete all console.log statements
// Or wrap in: if (process.env.NODE_ENV === 'development')
```

---

## Prevention: Best Practices

### 1. Always Use `credentials: 'include'`
```typescript
// ✗ Wrong - won't send cookies
fetch('/api/auth/me')

// ✓ Correct - includes cookies
fetch('/api/auth/me', { credentials: 'include' })
```

### 2. Never Cache Auth Requests
```typescript
// ✗ Wrong - could return stale data
fetch('/api/auth/me', { credentials: 'include' })

// ✓ Correct - always fresh
fetch('/api/auth/me', { 
  credentials: 'include',
  cache: 'no-store'
})
```

### 3. Minimize useEffect Dependencies
```typescript
// ✗ Wrong - too many dependencies
useEffect(() => {
  if (!user) router.push('/login')
}, [isLoading, user, router, logout, refreshUser, ...])

// ✓ Correct - only what's needed
useEffect(() => {
  if (!isLoading && !user) {
    router.push('/login')
  }
}, [isLoading, user])
```

### 4. Test Auth Flows Thoroughly
- Signup and verify redirect works
- Login and verify redirect works
- Logout and verify redirect works
- Reload and verify session persists
- Test with invalid credentials
- Test with expired tokens (future work)

### 5. Document Auth Assumptions
```typescript
/**
 * Auth Token Storage:
 * - Stored in httpOnly cookie named 'auth_token'
 * - Value is the user ID (UUID)
 * - Valid for 7 days
 * 
 * Auth Check:
 * - Done on app mount via refreshUser()
 * - Also checked before rendering protected pages
 * - Verified via /api/auth/me endpoint
 * 
 * Redirect Behavior:
 * - After login/signup: redirect after 100ms delay
 * - If not authenticated: redirect to /login
 */
```

---

## Quick Reference Checklist

When auth is broken:

- [ ] Check console for errors (Module not found, TypeError, etc.)
- [ ] Check Network tab for Set-Cookie header in responses
- [ ] Check DevTools Cookies for auth_token
- [ ] Verify credentials: 'include' in fetch calls
- [ ] Verify cache: 'no-store' in /api/auth/me call
- [ ] Check /api/auth/me returns 200 (not 401)
- [ ] Check useEffect dependencies (minimize them)
- [ ] Look for multiple state updates in logging
- [ ] Test with fresh incognito window
- [ ] Check server logs for errors

**Most common fix:** Add `credentials: 'include'` to fetch calls
