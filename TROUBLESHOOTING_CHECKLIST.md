# EduQuest - Quick Troubleshooting Checklist

## 🚨 White Screen / Blank Page

### Immediate Actions
- [ ] Open browser DevTools (F12)
- [ ] Check **Console** tab for errors
- [ ] Look for red text or error messages
- [ ] Note the exact error message (e.g., "Module not found")

### Module Import Errors
If you see: `Module not found: Can't resolve '@/...'`

- [ ] Verify file exists at the path mentioned
- [ ] Check file name spelling (case-sensitive on Linux/Mac)
- [ ] Verify `tsconfig.json` path aliases are correct
- [ ] Check file is exported from its module

**Example:** 
- Error: `Can't resolve '@/components/ui/input'`
- Action: Create `/components/ui/input.tsx` if missing

### Rendering Errors
If you see component errors:

- [ ] Check component syntax is valid (closing tags, parentheses)
- [ ] Verify all imported dependencies are installed
- [ ] Check for missing `export` statements
- [ ] Verify component returns valid JSX

---

## 🔴 Console Errors

### Cannot resolve module
```
Module not found: Can't resolve '@/...'
```
**Fix:** Create the missing file or correct the import path

### Cannot read property of undefined
```
Cannot read property 'X' of undefined
```
**Causes:**
- State not initialized
- Props not passed to component
- API response missing expected field

**Fix:**
1. Check initial state values
2. Add null checks: `user?.name ?? 'Guest'`
3. Verify API response structure

### JSX element type error
```
JSX element type does not have any construct signatures
```
**Fix:**
- Verify component is exported: `export { Component }`
- Check import statement is correct
- Ensure component is a function, not just a type

### Key prop warnings
```
Each child in a list should have a unique "key" prop
```
**Fix:**
- Add `key` prop to elements in `.map()`:
```jsx
{items.map((item) => <div key={item.id}>{item.name}</div>)}
```

---

## 🌐 Network Issues

### 401 Unauthorized
**Cause:** Session expired or invalid authentication
**Fix:**
1. Clear browser cookies
2. Log out and log back in
3. Check auth token validity

### 404 Not Found
**Cause:** API endpoint doesn't exist
**Fix:**
1. Verify API route file exists
2. Check route path matches import
3. Verify HTTP method (GET/POST/etc.)

### Empty response / No data
**Cause:** API returns null or empty array
**Fix:**
1. Check database has data
2. Verify query filters aren't too restrictive
3. Check API response formatting

### CORS errors
**Cause:** Cross-origin request blocked
**Fix:**
- Should not occur in same-origin requests
- Check API response headers if calling external API

---

## 🎨 Styling Issues

### Styles not applying
**Causes:**
- CSS file not imported
- Tailwind classes not recognized
- CSS class name typo
- Specificity conflict

**Fix:**
1. Verify `globals.css` is imported in layout
2. Check Tailwind CSS is configured
3. Run `npm run build` to check for errors
4. Check class names are valid Tailwind classes

### Colors look wrong
**Cause:** Design tokens not set correctly
**Fix:**
1. Check `globals.css` has color variables
2. Verify token names in components match CSS
3. Check dark/light mode variables if applicable

### Layout broken on mobile
**Cause:** Responsive classes missing
**Fix:**
1. Add Tailwind responsive prefixes: `md:`, `lg:`
2. Test with browser DevTools device mode
3. Check flex/grid classes for mobile

---

## 🔐 Authentication Issues

### Can't log in
**Checklist:**
- [ ] Check credentials are correct
- [ ] Verify email exists in database
- [ ] Check password is hashed correctly
- [ ] Verify API endpoint returns token
- [ ] Check token is stored in cookie

### Session expires immediately
**Checklist:**
- [ ] Check cookie settings (httpOnly, secure, sameSite)
- [ ] Verify session expiry time
- [ ] Check `api/auth/me` endpoint works
- [ ] Verify AuthProvider calls refreshUser on mount

### Can't access protected pages
**Checklist:**
- [ ] Verify AuthProvider wraps entire app
- [ ] Check useAuth hook is available
- [ ] Verify redirect logic in page components
- [ ] Check user role matches page requirements

---

## 📊 Data Loading Issues

### Courses/chapters not showing
**Checklist:**
- [ ] Check API endpoint works (test in Postman)
- [ ] Verify database has data (check Supabase)
- [ ] Check response is being parsed correctly
- [ ] Verify loading state is managed correctly

### Progress not updating
**Checklist:**
- [ ] Check progress API endpoint
- [ ] Verify student ID is correct
- [ ] Check database update query
- [ ] Verify progress context is used correctly

### XP/scores not calculated
**Checklist:**
- [ ] Check game scoring API
- [ ] Verify XP calculation formula
- [ ] Check student profile updates
- [ ] Verify game completion is recorded

---

## 🏗️ Build & Deployment

### Build fails
```bash
npm run build
```
**Common Issues:**
- [ ] TypeScript errors: Check type definitions
- [ ] Missing files: Create required components
- [ ] Syntax errors: Check for typos in code
- [ ] Missing dependencies: Run `npm install`

### App works locally, fails in production
- [ ] Check environment variables are set
- [ ] Verify API endpoints are correct
- [ ] Check CORS settings if needed
- [ ] Verify database connection string

### Slow performance
- [ ] Check bundle size: `npm run build`
- [ ] Use React DevTools Profiler
- [ ] Check for unnecessary re-renders
- [ ] Verify images are optimized

---

## ✅ Pre-Deployment Checklist

- [ ] `npm run build` completes without errors
- [ ] No console errors in browser
- [ ] All pages load and render correctly
- [ ] Authentication flow works (signup → login → dashboard)
- [ ] Can view courses and lessons
- [ ] Can complete lessons and games
- [ ] Progress saves correctly
- [ ] Teacher dashboard loads and shows data
- [ ] Export functionality works
- [ ] Mobile responsive on small screens
- [ ] All environment variables configured
- [ ] Database is accessible and populated

---

## 🆘 Advanced Debugging

### Enable verbose logging
Add to components:
```typescript
console.log("[v0] Debug message:", variable)
```

### Check React component tree
1. Open DevTools → Components tab
2. Expand component hierarchy
3. Check props and state values

### Monitor network requests
1. DevTools → Network tab
2. Reload page
3. Check request/response for each API call

### Performance profiling
1. DevTools → Performance tab
2. Start recording, interact with app
3. Check flame chart for slow operations

### Database debugging
1. Login to Supabase console
2. Check table row counts
3. Verify data structure matches schema
4. Check for constraint violations

---

## 📞 Still Need Help?

1. **Identify exact error** - What message appears?
2. **Reproduce the issue** - What steps cause it?
3. **Check all logs** - Browser console, network, server
4. **Review recent changes** - What was modified?
5. **Try in incognito** - Rules out cache issues
6. **Try different browser** - Rules out browser issues

**Debug Resources:**
- Browser DevTools Console for errors
- Network tab for API debugging
- React DevTools for component state
- Supabase dashboard for database issues
- `npm run build` for compilation errors

---

## 🎯 Most Common Issues & Quick Fixes

| Issue | Cause | 30-Second Fix |
|-------|-------|--------|
| Blank white screen | Missing component | Check console for "Module not found" error and create missing file |
| Can't log in | Invalid credentials | Verify email/password in database, check bcrypt hashing |
| Page stuck loading | Infinite loop in effect | Check useEffect dependency array, add return cleanup function |
| Inputs not visible | Missing Input component | Create `/components/ui/input.tsx` |
| Data not loading | API error | Check Network tab, verify endpoint path and method |
| Styles wrong | CSS not applied | Check import in layout, verify class names are valid |
| Sessions expire fast | Token issue | Check cookie settings, verify refresh interval |
| Database empty | No seed data | Run seed script or insert data via Supabase console |

---

**Last Updated:** 2024
**Status:** Active - These troubleshooting steps work with the current codebase
