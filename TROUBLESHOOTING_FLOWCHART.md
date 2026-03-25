# Login Flow Troubleshooting Flowchart

## Quick Decision Tree

```
Does login page load?
├─ NO → Module Error
│  ├─ "Can't resolve '@/components/ui/input'"
│  │  └─ FIX: rm -rf .next && npm install && npm run dev
│  │
│  ├─ Other module errors
│  │  └─ FIX: Check imports match actual files
│  │
│  └─ Build errors
│     └─ FIX: Check console for specific error message
│
└─ YES → Continue to next step


Can you enter credentials and submit?
├─ NO → Form submission failing
│  ├─ Check console for JavaScript errors
│  ├─ Verify form validation logic
│  └─ Check API route exists at /api/auth/login
│
└─ YES → Continue to next step


Does login API succeed?
├─ NO → API Error
│  ├─ Check POST /api/auth/login response
│  │  ├─ Status 400? → Validation error
│  │  ├─ Status 401? → Credentials invalid
│  │  └─ Status 500? → Server error
│  │
│  └─ Check /app/api/auth/login/route.ts implementation
│
└─ YES (200) → Continue to next step


Does response have Set-Cookie header?
├─ NO → Cookie Not Setting
│  ├─ FIX: Check API route sets cookie
│  ├─ FIX: Verify HTTP-only cookie enabled
│  └─ FIX: Check cookie attributes (domain, path)
│
└─ YES → Continue to next step


Does browser store auth_token cookie?
├─ NO → Cookie Rejected
│  ├─ Check DevTools → Application → Cookies
│  ├─ Verify cookie domain matches
│  ├─ Verify cookie path is /
│  └─ FIX: Check cookie attributes in API response
│
└─ YES → Continue to next step


Does page redirect to /learn?
├─ NO → No Redirect
│  ├─ Check console for redirect [v0] logs
│  ├─ Check for JavaScript errors
│  ├─ Verify router.push() called
│  └─ FIX: Check login() method has setTimeout
│
└─ YES → Continue to next step


Does /learn page stay visible?
├─ NO → Immediate Redirect Back
│  │
│  └─ Check: Does /api/auth/me request have Cookie header?
│     │
│     ├─ NO → Cookie Not Sent
│     │  ├─ FIX: Check refreshUser() has credentials: 'include'
│     │  ├─ FIX: Check /api/auth/me reads Cookie from request
│     │  └─ FIX: Verify fetch method is GET with credentials
│     │
│     └─ YES → Cookie Sent
│        │
│        └─ Check: Does /api/auth/me return user data?
│           │
│           ├─ NO (401 response)
│           │  ├─ Token validation failing
│           │  ├─ Check API route validates cookie
│           │  ├─ Check token hasn't expired
│           │  └─ FIX: Verify bcryptjs version and config
│           │
│           └─ YES (200 response)
│              │
│              └─ Check: Is /learn useEffect dependencies correct?
│                 │
│                 ├─ Includes 'router'? 
│                 │  └─ REMOVE IT - causes infinite loops
│                 │
│                 ├─ Includes 'getAllProgress'?
│                 │  └─ REMOVE IT - causes infinite loops
│                 │
│                 └─ Only [isLoading, user]?
│                    └─ Should work - verify console logs
│
└─ YES → SUCCESS! ✓


Does user stay logged in after page refresh?
├─ NO → Session Not Persisting
│  ├─ Check: Is auth_token cookie still present?
│  │  ├─ NO → Cookie expiration too short
│  │  └─ YES → Continue checking
│  │
│  └─ Check: Is refreshUser() called on app mount?
│     ├─ Check AuthProvider useEffect
│     ├─ Check credentials: 'include' on refreshUser fetch
│     └─ Check API returns valid user data
│
└─ YES → SUCCESS! ✓
```

---

## Detailed Debugging Scenarios

### Scenario 1: Module Not Found Error

**Symptom**:
```
Module not found: Can't resolve '@/components/ui/input'
```

**Diagnosis**:
1. File `components/ui/input.tsx` exists but build can't find it
2. Likely build cache issue

**Fix Steps**:
```bash
# Step 1: Clear build cache
rm -rf .next

# Step 2: Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Step 3: Restart dev server
npm run dev

# Step 4: Verify login page loads
# Go to http://localhost:3000/login
```

---

### Scenario 2: Login Form Submits But Gets API Error

**Symptom**:
```
Console shows error: Login failed
Or: 401 Unauthorized
Or: User not found
```

**Diagnosis**:
1. Server rejected the credentials
2. Could be: user doesn't exist, password wrong, API error

**Debug Steps**:
1. Open DevTools → Network tab
2. Clear network log
3. Submit login form
4. Click on POST /api/auth/login request
5. Check response body for error message

**Fix**:
- If "User not found" → Create test user in database
- If "Password incorrect" → Verify password hash
- If "Server error" → Check API route implementation

---

### Scenario 3: Login Succeeds But Immediately Redirects Back

**Symptom**:
```
- Login succeeds (see [v0] logs)
- Redirects to /learn
- /learn page briefly shows
- Immediately redirects back to /login
```

**Diagnosis**:
1. Authentication state lost between pages
2. Likely: cookie not being sent or not being validated

**Debug Flowchart**:

```
Check: Is auth_token cookie in browser?
├─ NO → Cookie not set by login API
│  └─ FIX: Check Set-Cookie header in login response
│
└─ YES → Cookie exists
   │
   └─ Check: Is cookie sent to /api/auth/me?
      │
      ├─ NO → Browser not sending cookie
      │  └─ FIX: Add credentials: 'include' to fetch in refreshUser()
      │
      └─ YES → Cookie sent
         │
         └─ Check: Does API return 200?
            │
            ├─ NO (401) → Token validation failed
            │  └─ FIX: Check /api/auth/me token validation logic
            │
            └─ YES (200) → API returns user data
               │
               └─ Check: Is /learn useEffect dependencies correct?
                  │
                  ├─ Has extra dependencies? 
                  │  └─ FIX: Remove router, getAllProgress
                  │
                  └─ Only [isLoading, user]?
                     └─ Should work - debug further
```

---

### Scenario 4: /learn Page Loads But Shows "Loading" Forever

**Symptom**:
```
/learn page displays but nothing loads
"Loading..." text visible
No course data displayed
```

**Diagnosis**:
1. /api/auth/me not returning user data
2. API calls failing
3. Network request hanging

**Debug Steps**:

```javascript
// Check console for [v0] logs
// Should see: [v0] Checking authentication...
// Should see: [v0] Auth valid, user: {...}

// If seeing: [v0] Auth invalid
// Problem: Token validation failed

// If no logs appear
// Problem: refreshUser() not called
```

**Network Check**:
1. DevTools → Network tab
2. Look for GET /api/auth/me
   - Status should be 200
   - Response should have user data
3. Look for GET /api/subjects
   - Should start loading after auth confirms
   - Status should be 200

---

### Scenario 5: Can Login and Access /learn But Loses Login After Refresh

**Symptom**:
```
✓ Can login successfully
✓ /learn page shows
✗ Page refresh → redirects to /login
✗ Logged-out state after F5
```

**Diagnosis**:
1. Session not persisting
2. Either: cookie expires too fast, or not sent on refresh

**Fix Steps**:

1. **Check cookie expiration**:
   - DevTools → Application → Cookies
   - Find auth_token
   - Check "Expires" date
   - Should be far in future

2. **Check refresh logic**:
   ```typescript
   // In lib/auth-context.tsx useEffect
   const refreshUser = async () => {
     const response = await fetch('/api/auth/me', {
       credentials: 'include',  // ← MUST be here
       cache: 'no-store',       // ← MUST be here
     })
   ```

3. **Verify API returns user on page load**:
   - Open DevTools → Console
   - Refresh page (F5)
   - Should see [v0] logs:
     ```
     [v0] Checking authentication...
     [v0] Auth valid, user: {...}
     ```

---

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `Module not found: @/components/ui/input` | Build cache stale | `rm -rf .next && npm run dev` |
| `POST /api/auth/login 401` | Invalid credentials | Create test user with correct password |
| `POST /api/auth/login 500` | Server error | Check API implementation for exceptions |
| `/api/auth/me 401` | No cookie or invalid token | Verify Set-Cookie in login response |
| `/api/auth/me 500` | Server error in validation | Check token validation in API |
| User redirects to /login from /learn | Cookie not sent to /api/auth/me | Add `credentials: 'include'` to fetch |
| Infinite re-renders / slow page | useEffect bad dependencies | Remove router, getAllProgress from deps |
| Page refresh loses login | Cookie expires too fast | Check cookie expiration date |

---

## Verification Commands

### Check File Exists
```bash
ls -la components/ui/input.tsx
# Should show file size > 0
```

### Verify Dependencies Installed
```bash
npm ls | grep -E "clsx|tailwind-merge|bcryptjs"
# Should show version numbers
```

### Check Console for Logs
```javascript
// In DevTools Console, search for:
[v0]

// You should see multiple entries showing auth flow
```

### Monitor Network Requests
```
DevTools → Network tab
1. Clear log
2. Perform login
3. Should see:
   - POST /api/auth/login (200)
   - GET /api/auth/me (200)
   - GET /api/subjects (200)
```

### Verify Cookies
```
DevTools → Application → Cookies
Click your domain
Look for: auth_token
- Value: should be long string
- Expires: should be future date
- HttpOnly: should be ✓
- Secure: should be ✓ (if HTTPS)
```

---

## Still Stuck?

If you've followed all steps and still have issues:

1. **Gather Evidence**:
   - Screenshot of console errors
   - Screenshot of Network tab
   - Screenshot of cookies
   - Console log output (copy/paste [v0] lines)

2. **Check Critical Sections**:
   - `/app/api/auth/login/route.ts` - Creates session
   - `/app/api/auth/me/route.ts` - Validates session
   - `lib/auth-context.tsx` - Manages auth state
   - `app/learn/page.tsx` - Checks auth before loading

3. **Review Logs**:
   - Browser console [v0] logs show exact state
   - Network tab shows HTTP requests/responses
   - Check for any visible error messages

4. **Nuclear Option**:
   ```bash
   # Complete clean rebuild
   rm -rf .next node_modules
   npm install
   npm run dev
   
   # Then test login flow from scratch
   ```

