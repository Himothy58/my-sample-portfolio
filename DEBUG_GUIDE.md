# EduQuest - Comprehensive Debugging Guide

## Issue: White Screen on Login Page

### Root Cause Analysis

The login page was displaying a blank white screen due to a **missing UI component dependency**: the `@/components/ui/input` component was imported but did not exist in the project.

**Error Log:**
```
Module not found: Can't resolve '@/components/ui/input'
```

### Resolution Applied

✅ **Created `/components/ui/input.tsx`** - A shadcn/ui-compatible Input component with:
- Full TypeScript support with React.forwardRef
- Tailwind CSS styling matching the design system
- Focus states and accessibility features
- Disabled and placeholder state handling

---

## Debugging Strategies & Troubleshooting Steps

### 1. Browser Console Error Inspection

**Action Steps:**
1. Open the browser DevTools (F12 or Cmd+Option+I on Mac)
2. Navigate to the **Console** tab
3. Check for red error messages indicating:
   - Missing imports or modules
   - Syntax errors in JSX components
   - Network request failures
   - Unhandled promise rejections

**Common Console Errors:**
- `Module not found: Can't resolve '@/...'` → Missing file or incorrect import path
- `Cannot read property '...' of undefined` → State or props not properly initialized
- `Unexpected token` → Syntax error in JSX or JavaScript
- `Fetch failed with status 401/403` → Authentication or authorization issues

### 2. Network Request Monitoring

**Action Steps:**
1. Open DevTools → **Network** tab
2. Reload the page (Cmd+R or Ctrl+R)
3. Examine all requests and responses:
   - Look for red/pink colored requests (failed requests)
   - Check response status codes (200 = OK, 4xx = client errors, 5xx = server errors)
   - Verify response payloads contain expected data

**API Endpoints to Monitor:**
- `GET /api/auth/me` → Verify current user session
- `GET /api/subjects` → Verify course data is loading
- `POST /api/auth/login` → Check authentication responses

**Common Network Issues:**
- **401 Unauthorized** → User session expired or invalid credentials
- **403 Forbidden** → User lacks required permissions
- **404 Not Found** → Endpoint doesn't exist or path is incorrect
- **Empty response** → Server error or database connection issue

### 3. React Component State & Props Verification

**Action Steps:**
1. Install React Developer Tools browser extension (if not already installed)
2. Open DevTools → **Components** tab (or Profiler)
3. Inspect component hierarchy:
   - Check if context providers (AuthProvider, GameProvider) are mounted
   - Verify state values in hooks (useAuth, useState, useContext)
   - Check if props are passed correctly to child components

**Common State Issues:**
- `isLoading` stuck as `true` → Async operation not completing
- `user` is `null` → Authentication context not initialized
- Empty arrays where data expected → API not returning data or not being called

### 4. Resource Loading & Dependency Verification

**Action Steps:**
1. Check `package.json` for all required dependencies:
   ```bash
   npm list @supabase/supabase-js bcryptjs
   ```
2. Verify all imports resolve correctly:
   ```bash
   npm run build
   ```
3. Check for missing environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Missing Dependencies to Check:**
- UI Components: `@/components/ui/*`
- Context Providers: `@/lib/*-context`
- Utilities: `@/lib/utils`, `@/lib/supabase`
- External packages: `@supabase/supabase-js`, `bcryptjs`

### 5. Build & Compilation Errors

**Action Steps:**
1. Run build check:
   ```bash
   npm run build
   ```
2. Look for compilation errors related to:
   - TypeScript type mismatches
   - Missing component exports
   - Incorrect file paths

**Common Build Issues:**
- `Cannot find module` → File doesn't exist or path is wrong
- `Type 'X' is not assignable to type 'Y'` → Type mismatch in component props
- `JSX element type does not have any construct or call signatures` → Component not exported properly

### 6. API Integration Debugging

**Action Steps:**
1. Test API endpoints directly using curl or Postman:
   ```bash
   curl -X GET http://localhost:3000/api/auth/me \
     -H "Cookie: session=YOUR_SESSION_TOKEN"
   ```
2. Check API response structure matches expected interface
3. Verify Supabase connection in `/lib/supabase.ts`:
   - URL is correct
   - Anon key is valid
   - Database tables exist

**API Testing Checklist:**
- [ ] Can connect to Supabase database
- [ ] Authentication endpoints return valid tokens
- [ ] Course/lesson data is queryable
- [ ] Student progress is being tracked

---

## Step-by-Step Resolution Process

### If you see a white screen:

1. **Open browser console** (DevTools → Console)
2. **Check for error messages** - note the exact error
3. **Verify missing file/component** - check if the file exists in the correct path
4. **Create missing component** - if needed, use existing component patterns as template
5. **Clear browser cache** - Ctrl+Shift+Del or Cmd+Shift+Del
6. **Reload the page** - F5 or Cmd+R
7. **Check Network tab** - verify all requests succeed (200 status)

### If you see React errors:

1. **Check component imports** - ensure all imports are correct
2. **Verify context providers** - make sure AuthProvider wraps the entire app
3. **Check state initialization** - verify useState and useContext values are set
4. **Review useEffect dependencies** - ensure dependency arrays are correct

### If API calls are failing:

1. **Check environment variables** - verify Supabase credentials are set
2. **Test API endpoint** - use curl or Postman to test directly
3. **Check network tab** - look at response status and body
4. **Verify authentication** - ensure user session is valid
5. **Check database** - verify tables and data exist in Supabase

---

## File Structure Verification Checklist

```
✅ Required UI Components:
  - components/ui/button.tsx
  - components/ui/card.tsx
  - components/ui/input.tsx (NEWLY CREATED)
  - components/ui/badge.tsx
  - components/ui/progress.tsx

✅ Context Providers:
  - lib/auth-context.tsx
  - lib/progress-context.tsx
  - lib/game-context.tsx

✅ API Routes:
  - app/api/auth/login/route.ts
  - app/api/auth/signup/route.ts
  - app/api/auth/me/route.ts
  - app/api/auth/logout/route.ts

✅ Pages:
  - app/login/page.tsx
  - app/signup/page.tsx
  - app/learn/page.tsx
  - app/teacher/page.tsx

✅ Configuration:
  - app/layout.tsx (with all providers)
  - app/globals.css (with design tokens)
  - package.json (with all dependencies)
```

---

## Common Fixes Reference

| Issue | Cause | Solution |
|-------|-------|----------|
| White screen | Missing component | Create missing component using existing pattern |
| 404 in console | Wrong import path | Check `tsconfig.json` path aliases and file location |
| `useAuth` returns undefined | AuthProvider not loaded | Verify AuthProvider wraps entire app in layout.tsx |
| Login always fails | Database connection issue | Check Supabase credentials and network connectivity |
| Blank input fields | Input component missing | Verify `/components/ui/input.tsx` exists |
| Page freezes | Infinite loop in useEffect | Check useEffect dependency array |
| `user` is always null | Session not persisting | Check browser cookies and auth/me endpoint |

---

## Testing Checklist

After fixes are applied, verify:

- [ ] Login page loads without white screen
- [ ] Input fields are visible and functional
- [ ] Login form submission works
- [ ] Authentication redirects to `/learn` on success
- [ ] Signup page displays correctly
- [ ] Navigation between pages works
- [ ] API calls return 200 status
- [ ] No console errors or warnings
- [ ] Styles load correctly (colors, fonts, layout)

---

## Performance & Optimization Debugging

**Slow Page Load?**
1. Check Network tab for slow requests
2. Verify API response times
3. Check for large bundle size: `npm run build`
4. Use Lighthouse for performance audit

**High Memory Usage?**
1. Check for memory leaks in useEffect hooks
2. Verify cleanup functions in context providers
3. Check for unnecessary re-renders in React DevTools Profiler

---

## Getting Help

If issues persist:

1. **Check the full error log** - copy entire error message
2. **Reproduce the issue** - follow exact steps to see error
3. **Check recent changes** - review what was modified
4. **Test in incognito mode** - rules out browser cache issues
5. **Try different browser** - rules out browser-specific issues

**Debug Log Location:** `/user_read_only_context/text_attachments/v0_debug_logs-*.txt`
