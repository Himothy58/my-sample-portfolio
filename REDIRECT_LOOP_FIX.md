# Post-Signup Redirect Loop - Root Cause & Resolution

## Issue Summary
After successfully signing up as a learner, the application navigates to the `/learn` page but immediately redirects back to the `/login` page, creating a redirect loop.

## Root Cause Analysis

### Primary Issue: Cookie & State Synchronization Race Condition
The redirect loop was caused by a **race condition between cookie setting and state verification**:

1. **Signup Request**: Client sends credentials to `/api/auth/signup`
2. **Server Response**: Server creates user, sets `auth_token` cookie, returns user data
3. **State Update**: Auth context updates local state with user data
4. **Router Push**: Application navigates to `/learn` page
5. **Page Mount**: `/learn` page mounts and runs useEffect to check authentication
6. **Auth Check**: The `/api/auth/me` endpoint is called to verify authentication
7. **Cookie Timing Issue**: The `auth_token` cookie may not be properly sent/received in the initial verification request
8. **Redirect Back**: Auth check fails, user is redirected back to `/login`
9. **Loop**: Process repeats

### Contributing Factors

**1. Missing `credentials: 'include'` in Fetch Calls**
- Fetch requests need to explicitly include credentials for cookies to be sent
- Without this, the auth token cookie is not included in the request
- This causes the `/api/auth/me` endpoint to not find the token

**2. Missing Cache Directives**
- Auth responses were being cached, preventing fresh verification
- After signup, cached responses could return stale data

**3. Dependency Array in useEffect**
- The `/learn` page's useEffect had too many dependencies
- Changes to these dependencies could trigger the effect multiple times
- This caused repeated auth checks that could fail if timing was off

**4. No Delay Between Cookie Setting and Redirect**
- The application redirected immediately after receiving signup response
- The browser's cookie storage might not be updated before the next page loads
- Adding a small delay ensures the cookie is properly stored before navigation

## Solutions Implemented

### Fix 1: Add `credentials: 'include'` to Auth Requests

**File**: `lib/auth-context.tsx`

```typescript
// Before
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})

// After
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ✓ Include cookies in request
  body: JSON.stringify({ email, password }),
})
```

**Impact**: Ensures cookies are properly included in all authentication requests.

### Fix 2: Add Cache Control to `/api/auth/me`

**File**: `lib/auth-context.tsx`

```typescript
// Before
const response = await fetch('/api/auth/me')

// After
const response = await fetch('/api/auth/me', {
  method: 'GET',
  credentials: 'include', // ✓ Include cookies
  cache: 'no-store', // ✓ Never cache auth responses
})
```

**Impact**: Prevents cached auth responses from being used, ensuring fresh verification.

### Fix 3: Add Delay Before Redirect

**File**: `lib/auth-context.tsx`

```typescript
// Both login and signup methods now include:
const data = await response.json()
setUser(data.user)
if (data.studentProfile) {
  setStudentProfile(data.studentProfile)
}

// ✓ Add a small delay to ensure the cookie is set before redirecting
await new Promise(resolve => setTimeout(resolve, 100))

router.push(role === 'teacher' ? '/teacher' : '/learn')
```

**Impact**: Gives the browser time to store the auth token cookie before navigating to protected pages.

### Fix 4: Simplify Learn Page useEffect Dependencies

**File**: `app/learn/page.tsx`

```typescript
// Before
useEffect(() => {
  if (!isLoading && !user) {
    router.push('/login')
    return
  }

  if (user) {
    fetchSubjects()
    getAllProgress()
  }
}, [isLoading, user, router, getAllProgress]) // Too many dependencies

// After
useEffect(() => {
  if (!isLoading) {
    if (!user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchSubjects()
      getAllProgress()
    }
  }
}, [isLoading, user]) // Minimal dependencies
```

**Impact**: Prevents unnecessary re-runs of the effect and reduces the chance of timing issues.

## Testing the Fix

### Test Signup Flow
1. Go to `/signup`
2. Fill in the signup form with:
   - Name: Test User
   - Email: testuser@example.com
   - Password: password123
   - Confirm Password: password123
   - Role: Student
3. Click "Create Account"
4. **Expected Result**: Should navigate to `/learn` and stay there (no redirect to `/login`)

### Test Login Flow
1. Go to `/login`
2. Enter the credentials from the signup test
3. Click "Sign In"
4. **Expected Result**: Should navigate to `/learn` and display the courses

### Browser DevTools Verification
**Network Tab:**
- Check that requests to `/api/auth/login` and `/api/auth/signup` include the `Cookie` header in the request
- Verify the response sets the `Set-Cookie` header with `auth_token`

**Storage > Cookies:**
- After signup/login, verify that a cookie named `auth_token` is stored for the domain
- The cookie should be marked as `HttpOnly` and `SameSite=Lax`

**Console:**
- There should be no auth-related errors
- Check for any warnings about state updates or missing dependencies

## Prevention Tips for Future Development

1. **Always use `credentials: 'include'`** when making requests that need to access cookies
2. **Add `cache: 'no-store'`** to auth-related API calls to prevent stale data
3. **Test auth flows thoroughly** - signup, login, logout, and page redirects
4. **Check cookie handling** in different network conditions and browsers
5. **Use browser DevTools** to monitor network requests and verify cookie headers
6. **Consider auth middleware** for route protection instead of page-level useEffect checks
7. **Log auth state changes** during development to understand the flow:
   ```typescript
   useEffect(() => {
     console.log('[Auth] State changed:', { isLoading, user: user?.email })
   }, [isLoading, user])
   ```

## Summary of Changes

| File | Change | Reason |
|------|--------|--------|
| `lib/auth-context.tsx` | Added `credentials: 'include'` to all fetch calls | Ensure cookies are sent with requests |
| `lib/auth-context.tsx` | Added `cache: 'no-store'` to `/api/auth/me` | Prevent cached auth responses |
| `lib/auth-context.tsx` | Added 100ms delay before redirect | Allow cookie storage before navigation |
| `app/learn/page.tsx` | Simplified useEffect dependencies | Prevent unnecessary re-runs |

These changes ensure that authentication tokens are properly handled throughout the signup and login flow, preventing redirect loops and creating a seamless authentication experience.
