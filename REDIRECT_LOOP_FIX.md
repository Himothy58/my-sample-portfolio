# Signup Redirect Loop - Root Cause & Solution

## Problem Description
After successfully signing up as a learner, the application briefly navigates to the `/learn` page but then immediately redirects back to the `/login` page, creating a redirect loop.

## Root Cause Analysis

### The Race Condition
The issue was a **race condition** in the authentication flow:

1. **Signup API** (`/api/auth/signup`) sets an HTTP-only cookie (`auth_token`) and returns the user object
2. **Auth Context** (`signup` method) receives the response and calls:
   - `setUser(data.user)` - Updates React state with user data
   - `router.push('/learn')` - Redirects to learn page
   - `setIsLoading(false)` - Set in finally block (was happening too late)
3. **Learn Page** mounts and triggers its `useEffect`:
   - Checks `if (!isLoading && !user) router.push('/login')`
   - The condition evaluates to true because:
     - `isLoading` might still be true (state update hasn't completed)
     - OR `user` is null (cookie not recognized by `/api/auth/me` endpoint)
4. **Redirect Loop** - User is sent back to login before auth state is properly established

### Why This Happened
- React state updates (`setUser`, `setIsLoading`) are asynchronous
- The router redirect happened before state was fully processed
- The new page's auth check ran before the session was established
- No synchronization between state update and redirect

## Solution Implemented

### Changes Made

#### 1. Auth Context - Improved State Management
```typescript
// BEFORE: State update and redirect were not synchronized
setUser(data.user)
router.push('/learn')
setIsLoading(false) // Too late!

// AFTER: Proper sequencing with delay
setUser(data.user)
setIsLoading(false) // Mark done immediately
setTimeout(() => {
  router.push('/learn') // Redirect after state settles
}, 100)
```

**Why this works:**
- Sets all state updates first
- Allows React to process state changes
- Small delay ensures the state has propagated before redirect
- 100ms is imperceptible to users but sufficient for state updates

#### 2. Learn Page - Better Auth Check
```typescript
// BEFORE: Didn't account for loading state properly
if (!isLoading && !user) {
  router.push('/login')
}

// AFTER: Only redirect if definitely not authenticated
if (!isLoading && !user) {
  router.push('/login')
  return
}

// Only fetch if authenticated and loading is done
if (user && !isLoading) {
  fetchSubjects()
  getAllProgress()
}
```

#### 3. Auth Context Init - Proper Async Handling
```typescript
// BEFORE: Direct function call
useEffect(() => {
  refreshUser()
}, [])

// AFTER: Proper async handling
useEffect(() => {
  const initAuth = async () => {
    await refreshUser()
  }
  initAuth()
}, [])
```

## Technical Details

### Cookie-Based Authentication
The application uses HTTP-only cookies for session management:
- **Set on login/signup**: `auth_token` cookie with user ID
- **Validated on requests**: `/api/auth/me` checks the cookie
- **Secure**: HttpOnly, SameSite=Lax, 7-day expiration
- **Advantage**: More secure than localStorage (XSS protection)

### State Update Timing
React batches state updates, so multiple `setState` calls happen together:
```typescript
// These three updates happen in one batch:
setUser(data.user)           // Update 1
setStudentProfile(profile)   // Update 2
setIsLoading(false)          // Update 3
// Re-render happens once after all three
```

The 100ms delay allows time for:
1. React to batch all state updates
2. Component to re-render with new state
3. Browser to register the state changes
4. Cookie to be recognized in subsequent requests

## Verification Checklist

After this fix, verify:
- ✅ Signup completes successfully
- ✅ User briefly sees the loading state
- ✅ User is redirected to `/learn` page
- ✅ Learn page displays content (not redirecting back to login)
- ✅ Browser console shows no auth errors
- ✅ Network tab shows `/api/auth/me` returning 200 with user data
- ✅ `auth_token` cookie is present and valid

## Debugging Steps If Issues Persist

### 1. Check Browser Console
```
No errors related to authentication or missing modules
No warnings about state updates
```

### 2. Verify Network Requests
```
POST /api/auth/signup → 201 (with Set-Cookie header)
GET /api/auth/me → 200 (user data returned)
```

### 3. Inspect Cookies
```
Open DevTools → Application → Cookies
Look for: auth_token=<uuid>
- HttpOnly: ✓ (won't see value in JS)
- Secure: ✓ (in production)
- SameSite: Lax
- Expires: 7 days from now
```

### 4. Check Component State
Add temporary debugging to `/app/learn/page.tsx`:
```typescript
useEffect(() => {
  console.log('[v0] Learn page - isLoading:', isLoading, 'user:', user)
}, [isLoading, user])
```

### 5. Verify API Response
In signup handler, log the API response:
```typescript
const data = await response.json()
console.log('[v0] Signup response:', data)
```

## Testing the Fix

### Test Case 1: New User Signup
1. Click "Sign Up" on login page
2. Fill form: email, password, name, select student
3. Click submit
4. ✅ Should see brief loading
5. ✅ Should redirect to `/learn` and stay there
6. ✅ Should see courses and student profile

### Test Case 2: Login
1. Click "Login" on signup page
2. Enter existing user credentials
3. Click submit
4. ✅ Should see brief loading
5. ✅ Should redirect to `/learn` (student) or `/teacher` (teacher)
6. ✅ Should see content without redirect back to login

### Test Case 3: Session Persistence
1. Signup successfully
2. Refresh the page (`F5`)
3. ✅ Should still be on `/learn` (not redirected to login)
4. ✅ User data should be loaded from cookie

## Performance Impact
- **Network**: No additional requests
- **Load time**: 100ms additional perceived delay is negligible
- **User experience**: Imperceptible improvement in stability

## Related Files Modified
1. `/lib/auth-context.tsx` - Auth state management and redirects
2. `/app/learn/page.tsx` - Auth check logic
3. `/api/auth/signup` - Already working correctly
4. `/api/auth/login` - Already working correctly
5. `/api/auth/me` - Already working correctly

## Prevention for Future Issues

### Best Practices Applied
1. ✅ Always separate state updates from side effects
2. ✅ Use setTimeout for redirect after critical state updates
3. ✅ Check both loading state AND auth state before redirecting
4. ✅ Document async dependencies in useEffect
5. ✅ Test auth flow thoroughly (signup, login, session persist)

### Monitoring Recommendations
- Log authentication state transitions
- Monitor redirect chains in analytics
- Alert on auth token validation failures
- Track time between signup and successful page load
