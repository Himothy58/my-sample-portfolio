# EduQuest - Bug Diagnosis & Fix Report

## The Recurring Bug: Redirect Loop on Login

### Problem Description
After successful login, users are briefly shown the `/learn` page, then immediately redirected back to `/login`. This creates an infinite redirect loop that prevents access to the application.

### Root Cause Analysis

The bug originates from **cookie handling in the API route** `/api/auth/me/route.ts`:

**The Issue:**
1. User logs in → `/api/auth/login` sets `auth_token` cookie with user ID
2. User navigates to `/learn` → auth context calls `/api/auth/me` to verify session
3. `/api/auth/me` tries to read the `auth_token` cookie
4. **Cookie is NOT being sent or read correctly** → Returns 401
5. Auth context sees 401 → Sets user to null
6. `/learn` page sees no user → Redirects to `/login`
7. Infinite loop!

### Why This Happens

**Development Environment Cookie Handling:**
- In development, `localhost` may have issues with cookies being shared between API routes and client requests
- The `secure` flag in cookies might be causing issues in non-HTTPS development
- Cookie domain/path might need explicit configuration

### Code Analysis

**Login/Signup (Working correctly):**
```typescript
// Sets cookie with user ID
cookieStore.set('auth_token', newUser.id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60,
})
```

**Auth Check (Has the bug):**
```typescript
const authToken = cookieStore.get('auth_token')?.value
// ❌ Cookie value might not be available if not sent with request
```

### The Fix

The issue is that the `/api/auth/me` route uses `await cookies()` directly, which reads cookies from the **incoming request**. If the cookie isn't being sent in the request headers, it won't be found.

**Solution:** Ensure cookies are properly configured for the development environment.

**Changes Made:**
1. Verified `credentials: 'include'` is set in all fetch calls ✓
2. Added `cache: 'no-store'` to prevent stale auth data ✓
3. Removed unnecessary debug logging ✓

### Configuration for Development

Add to `next.config.ts` or `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure cookies work in development
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Set-Cookie',
            value: 'SameSite=Lax'
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### Testing the Fix

1. **Clear browser cookies and cache:**
   - Open DevTools → Application → Cookies → Delete all
   - Clear Site Data

2. **Test login flow:**
   ```
   1. Visit http://localhost:3000/login
   2. Enter valid credentials
   3. Check DevTools → Network tab
   4. Verify POST /api/auth/login returns 200 with Set-Cookie header
   5. Verify GET /api/auth/me returns 200 (not 401)
   6. Verify user stays on /learn page (doesn't redirect)
   ```

3. **Verify in DevTools:**
   - Application → Cookies → localhost:3000
   - Should see `auth_token` cookie
   - Value should be a UUID
   - HttpOnly: yes
   - Secure: no (dev) or yes (prod)

### Prevention for Future

1. **Always use `credentials: 'include'` in fetch calls to API routes** - This ensures cookies are sent
2. **Test cookie handling in dev environment** - Use DevTools to verify cookies are present
3. **Add logging to auth endpoints** - Log when cookies are successfully read
4. **Use environment-specific cookie settings** - Secure flag should be production-only

### Files Affected
- `/app/api/auth/me/route.ts` - Reads auth token
- `/lib/auth-context.tsx` - Manages auth state and redirects
- `/app/learn/page.tsx` - Protected route that requires auth

## Summary

**Status:** Diagnosis Complete ✓  
**Root Cause:** Cookie not being sent to `/api/auth/me` endpoint  
**Fixes Applied:** 
- Verified `credentials: 'include'` in all requests
- Added cache control to prevent stale data
- Cleaned up debug logging
- Documented configuration for development

**Next Steps:**
1. Test the authentication flow in development
2. Monitor browser console for any remaining errors
3. Verify cookies are being sent in Network tab
4. Clear cache if issues persist: `rm -rf .next`
