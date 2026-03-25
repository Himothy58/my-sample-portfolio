# Redirect Loop Debugging Checklist

Use this checklist when debugging redirect loops or infinite redirects in authentication flows.

## Immediate Diagnostics

### 1. Check Browser Console
- [ ] Open DevTools (F12)
- [ ] Look for errors or warnings
- [ ] Look for repeated console logs indicating infinite loops
- [ ] Check if Network tab shows repeated API calls to same endpoint

### 2. Network Analysis
- [ ] Are auth API calls succeeding (200 status)?
- [ ] Are cookies being set (look in Response Headers: `Set-Cookie`)?
- [ ] Are cookies being sent with requests (look in Request Headers: `Cookie:`)?
- [ ] Are there any CORS errors?
- [ ] Are requests being made with `credentials: 'include'`?

### 3. Component State Verification
- [ ] Add debug logs to useEffect dependencies
- [ ] Verify `user` state is being set correctly after login/signup
- [ ] Verify `isLoading` state transitions from true to false
- [ ] Check if component unmounts/remounts repeatedly

## Common Redirect Loop Causes

### Pattern 1: Dependency Array Issues
**Symptoms:** useEffect runs continuously, same logs repeat rapidly

```typescript
// ❌ WRONG - causes infinite loop
useEffect(() => {
  if (!user) router.push('/login')
  fetchData()
}, [isLoading, user, router, fetchData]) // fetchData is a callback!

// ✅ CORRECT - fetchData removed from deps
useEffect(() => {
  if (!user) router.push('/login')
  fetchData()
}, [isLoading, user])
```

**Check List:**
- [ ] Are useCallback functions in dependencies?
- [ ] Are object literals in dependencies?
- [ ] Are new function references created each render?
- [ ] Run ESLint plugin `eslint-plugin-react-hooks` to check

### Pattern 2: Missing Credentials
**Symptoms:** User data lost after redirect, authentication fails

```typescript
// ❌ WRONG - cookies not sent
fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
})

// ✅ CORRECT - cookies included
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // This is critical!
  body: JSON.stringify({ email, password }),
})
```

**Check List:**
- [ ] Do all auth API calls have `credentials: 'include'`?
- [ ] Is server setting cookies (Set-Cookie headers present)?
- [ ] Are cookies HTTP-only (secure)?
- [ ] Is domain/path configuration correct?

### Pattern 3: Race Conditions
**Symptoms:** Redirect happens before state updates, inconsistent behavior

```typescript
// ❌ WRONG - redirects before state update
setUser(data.user)
router.push('/learn') // Redirects immediately

// ✅ CORRECT - waits for state to update
setUser(data.user)
setTimeout(() => router.push('/learn'), 100) // Gives React time to update
```

**Check List:**
- [ ] Is there a delay before redirect?
- [ ] Are state updates happening synchronously?
- [ ] Is the redirect happening in a callback (not immediately)?

### Pattern 4: Stale Auth Data
**Symptoms:** Old authentication data cached, doesn't reflect fresh login

```typescript
// ❌ WRONG - may return cached response
fetch('/api/auth/me')

// ✅ CORRECT - always gets fresh data
fetch('/api/auth/me', {
  cache: 'no-store',
  credentials: 'include',
})
```

**Check List:**
- [ ] Is `cache: 'no-store'` set for auth endpoints?
- [ ] Are response headers preventing caching?
- [ ] Is the browser cache cleared?
- [ ] Check Network tab: is response coming from cache?

## Debugging Steps (In Order)

1. **Identify the Loop**
   - [ ] Which pages are involved? (e.g., /signup → /learn → /login → /signup)
   - [ ] Does it happen on fresh signup, login, page refresh, or all?
   - [ ] Use console.log to trace execution order

2. **Add Debug Logging**
   ```typescript
   useEffect(() => {
     console.log('[v0] useEffect running - isLoading:', isLoading, 'user:', user?.email)
     if (!isLoading && !user) {
       console.log('[v0] Redirecting to login')
       router.push('/login')
       return
     }
     console.log('[v0] Not redirecting')
   }, [isLoading, user])
   ```

3. **Check Dependencies**
   - [ ] Open DevTools → Sources → add breakpoints to useEffect
   - [ ] Step through execution
   - [ ] Check what values are in dependency array
   - [ ] Verify they only change when expected

4. **Verify Authentication**
   - [ ] Check Network tab for auth API responses
   - [ ] Verify cookie is present in Response Headers
   - [ ] Verify cookie is sent in subsequent Request Headers
   - [ ] Check `/api/auth/me` returns user data

5. **Test Isolation**
   - [ ] Create minimal test component
   - [ ] Copy only the auth logic, remove other features
   - [ ] See if loop still happens with minimal setup
   - [ ] Gradually add back features to identify culprit

## Quick Fixes to Try

```typescript
// Issue: useEffect runs too often
// Fix: Review and minimize dependency array
useEffect(() => {
  // code
}, [essentialDepsOnly])

// Issue: User data lost on redirect
// Fix: Add credentials to fetch
fetch(url, { credentials: 'include' })

// Issue: Stale cached responses
// Fix: Add cache control
fetch(url, { cache: 'no-store' })

// Issue: Race condition on redirect
// Fix: Add delay before redirect
setTimeout(() => router.push(url), 100)

// Issue: Component state not synced
// Fix: Properly await async operations
await loginFunction()
setLocalState(data)
router.push(url)
```

## Testing After Fix

After applying fixes, test these scenarios:

- [ ] **Fresh Signup:** Go to /signup → fill form → submit → should land on /learn
- [ ] **Fresh Login:** Go to /login → enter credentials → submit → should land on /learn
- [ ] **Page Refresh:** On /learn → F5 → should stay on /learn
- [ ] **Logout + Login:** Logout → redirect to /login → login again → /learn
- [ ] **Close and Reopen:** Sign out → close browser → reopen → navigate to /learn → should redirect to /login
- [ ] **Multiple Tabs:** Login in tab 1 → check if tab 2 knows you're logged in (if applicable)

## Console Logs to Monitor

Good signs:
```
[v0] useEffect running - isLoading: true user: null
[v0] API call: /api/auth/me
[v0] useEffect running - isLoading: false user: john@example.com
[v0] Not redirecting - user is authenticated
```

Bad signs (indicates loop):
```
[v0] useEffect running - isLoading: false user: null
[v0] Redirecting to login
[v0] useEffect running - isLoading: false user: null
[v0] Redirecting to login
[v0] useEffect running - isLoading: false user: null
[v0] Redirecting to login
```

## Resources

- React Hooks Rules: https://react.dev/reference/react/useEffect
- useCallback Documentation: https://react.dev/reference/react/useCallback
- Fetch Credentials: https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials
- Next.js Router: https://nextjs.org/docs/app/api-reference/functions/use-router
