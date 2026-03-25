# Authentication Flow Verification Checklist

## Pre-Deployment Checks

### 1. Cookie Configuration
- [ ] `auth_token` cookie is set with `httpOnly: true` (secure)
- [ ] Cookie `sameSite` is set to `'lax'` for CSRF protection
- [ ] Cookie `maxAge` is set appropriately (7 days in current implementation)
- [ ] Cookie is set on `secure` in production environments

**Verify in code:**
```typescript
cookieStore.set('auth_token', user.id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60,
})
```

### 2. Fetch Configuration
- [ ] All auth requests include `credentials: 'include'`
- [ ] Auth validation requests include `cache: 'no-store'`
- [ ] Content-Type headers are properly set

**Verify auth context methods have:**
```typescript
credentials: 'include'
cache: 'no-store' // for GET requests to /api/auth/me
```

### 3. Authentication Flow
- [ ] Signup creates user and student profile (if student)
- [ ] Signup sets auth token cookie
- [ ] Signup updates auth context state
- [ ] Signup redirects after 100ms delay
- [ ] Login retrieves user and student profile
- [ ] Login sets auth token cookie
- [ ] Login updates auth context state
- [ ] Login redirects after 100ms delay

### 4. Protected Pages
- [ ] `/learn` checks auth before rendering
- [ ] `/learn` has minimal useEffect dependencies
- [ ] `/learn` fetches data only when user is confirmed
- [ ] `/learn` redirects to `/login` if not authenticated
- [ ] `/teacher` checks for teacher role
- [ ] Protected pages don't cause redirect loops

### 5. API Endpoints
- [ ] `/api/auth/me` validates cookie correctly
- [ ] `/api/auth/me` returns 401 if no valid token
- [ ] `/api/auth/me` includes student profile for students
- [ ] Other protected endpoints check auth token

### 6. Session Management
- [ ] Logout clears user state
- [ ] Logout calls `/api/auth/logout`
- [ ] Logout redirects to `/login`
- [ ] `refreshUser()` is called on app mount
- [ ] `refreshUser()` properly handles async operations

## Testing Checklist

### Happy Path: New User Signup
```
[ ] User fills signup form
[ ] User submits form
[ ] Request sent to /api/auth/signup
[ ] ✓ 201 response received
[ ] User data returned in response
[ ] Student profile created (if applicable)
[ ] Auth token cookie set on client
[ ] Auth context state updated
[ ] Navigate to /learn (or /teacher)
[ ] Page loads without redirect
[ ] Subjects/dashboard displayed
```

### Happy Path: Returning User Login
```
[ ] User navigates to /login
[ ] User enters credentials
[ ] User submits form
[ ] Request sent to /api/auth/login
[ ] ✓ 200 response received
[ ] User data returned in response
[ ] Auth token cookie set on client
[ ] Auth context state updated
[ ] Navigate to /learn (or /teacher)
[ ] Page loads without redirect
[ ] User data is displayed
```

### Unhappy Path: Invalid Credentials
```
[ ] User enters invalid email
[ ] Error message displayed
[ ] User stays on login page
[ ] Auth context not updated
[ ] No redirect occurs
```

### Unhappy Path: Session Expires
```
[ ] User loads protected page
[ ] Auth token is missing or invalid
[ ] /api/auth/me returns 401
[ ] User redirected to /login
[ ] No console errors
```

### Edge Case: Direct URL Access
```
[ ] User navigates directly to /learn
[ ] Page checks auth on mount
[ ] If authenticated: page loads
[ ] If not authenticated: redirected to /login
```

## Browser DevTools Verification

### Network Tab
1. **After Signup/Login:**
   - [ ] Request to `/api/auth/signup` or `/api/auth/login` 
   - [ ] Response includes `Set-Cookie` header with `auth_token`
   - [ ] Cookie includes `HttpOnly`, `SameSite=Lax`, `Path=/`
   - [ ] Subsequent requests include `Cookie` header

2. **Protected Page Navigation:**
   - [ ] Request to `/api/auth/me` includes `Cookie` header
   - [ ] Response returns user data (200 OK)
   - [ ] No 401 or 403 errors
   - [ ] No infinite redirect loops

### Application > Cookies (Chrome DevTools)
1. **After Successful Auth:**
   - [ ] Domain shows a cookie entry
   - [ ] Cookie name is `auth_token`
   - [ ] Cookie value is a valid UUID
   - [ ] HttpOnly: ✓ (checked)
   - [ ] Secure: ✓ (in production)
   - [ ] SameSite: Lax
   - [ ] Path: /

2. **Cookie Lifecycle:**
   - [ ] Cookie present immediately after signup/login
   - [ ] Cookie persists across page navigations
   - [ ] Cookie cleared after logout
   - [ ] Cookie expires after maxAge (7 days)

### Console
1. **No Errors:**
   - [ ] No "Can't resolve" module errors
   - [ ] No auth-related errors
   - [ ] No "Cannot read property" errors
   - [ ] No CORS errors

2. **Expected Behavior:**
   - [ ] Auth context logs indicate proper state flow
   - [ ] No warnings about missing dependencies
   - [ ] No warnings about state updates in unmounted components

## Production Readiness

### Security Checks
- [ ] Passwords are hashed with bcrypt (checked in implementation)
- [ ] Password hashes are never returned to client
- [ ] Tokens are HTTP-only cookies (not in localStorage)
- [ ] CSRF protection enabled (SameSite=Lax)
- [ ] HTTPS enforced in production (secure flag set)
- [ ] No sensitive data in JWT or localStorage

### Performance Checks
- [ ] Auth context doesn't cause unnecessary re-renders
- [ ] No N+1 queries when fetching user and profile
- [ ] Cookie is checked efficiently
- [ ] Auth endpoints respond quickly (<100ms)

### Error Handling
- [ ] All auth endpoints have error responses
- [ ] Client catches and displays auth errors
- [ ] Logout works even if server unavailable
- [ ] Invalid tokens are handled gracefully

### Monitoring
- [ ] Log auth failures for debugging
- [ ] Monitor redirect loop issues
- [ ] Track failed login attempts (optional: implement rate limiting)
- [ ] Alert on unusual auth patterns (optional: implement anomaly detection)

## Sign-Off

- [ ] All checks completed
- [ ] No redirect loop issues observed
- [ ] All auth flows working correctly
- [ ] No console errors or warnings
- [ ] Ready for production deployment

**Last Verified:** _______________
**Verified By:** _______________
**Notes:** _______________
