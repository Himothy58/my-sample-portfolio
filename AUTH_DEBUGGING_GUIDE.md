# Authentication Debugging Guide

## Quick Diagnostics

### 1. Browser Console Debugging

Add these snippets to diagnose the redirect loop:

#### Check Auth State in Real-time
```javascript
// Open DevTools Console and run:
// Watch auth state changes
setInterval(() => {
  console.clear()
  console.log('[AUTH DEBUG]', {
    currentPage: window.location.pathname,
    timestamp: new Date().toLocaleTimeString(),
  })
}, 1000)
```

#### Verify Cookie Presence
```javascript
// In console, check if auth token is present
document.cookie.split(';').forEach(cookie => {
  if (cookie.includes('auth_token')) {
    console.log('[AUTH] Found auth_token cookie')
  }
})

// Check all cookies
console.log('[COOKIES]', document.cookie)
```

#### Test Auth API Directly
```javascript
// Test if /api/auth/me works
fetch('/api/auth/me')
  .then(r => r.json())
  .then(data => console.log('[AUTH/ME]', data))
  .catch(e => console.error('[AUTH/ME ERROR]', e))
```

### 2. Network Tab Analysis

#### Expected Network Flow for Signup:

```
1. POST /api/auth/signup
   ├─ Request: { email, password, name, role }
   ├─ Response: { user: {...}, studentProfile: {...} }
   └─ Response Headers: Set-Cookie: auth_token=<uuid>; HttpOnly; Path=/; ...

2. GET /api/auth/me (triggered by /learn page mounting)
   ├─ Request Headers: Cookie: auth_token=<uuid>
   ├─ Response: { user: {...}, studentProfile: {...} }
   └─ Status: 200 OK

3. GET /api/subjects (to load courses)
   ├─ Request Headers: Cookie: auth_token=<uuid>
   ├─ Response: { subjects: [...] }
   └─ Status: 200 OK
```

#### To View in DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by XHR or Fetch
4. Try signup
5. Look for these requests in order
6. Click each one to see headers and response

### 3. React Developer Tools Debugging

#### Install React DevTools Extension
- Chrome: [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)
- Firefox: [React DevTools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

#### Inspect Auth State
1. Open React DevTools (Components tab)
2. Navigate component tree to `AuthProvider`
3. Check props:
   ```
   user: { id, email, name, role } or null
   isLoading: true | false
   isAuthenticated: true | false
   ```

#### Inspect Learn Page State
1. Find `LearnPage` component
2. Check state:
   ```
   subjects: [...]
   isLoading: true | false
   ```

### 4. Specific Test Cases

#### Test 1: Signup Flow
```javascript
// In console, simulate signup flow:
const testSignup = async () => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Test123456',
      name: 'Test User',
      role: 'student'
    })
  })
  const data = await response.json()
  console.log('[SIGNUP RESPONSE]', data)
  console.log('[SIGNUP STATUS]', response.status)
  console.log('[SIGNUP HEADERS]', response.headers)
}

testSignup()
```

#### Test 2: Auth Check
```javascript
// Check if authentication is working:
const testAuth = async () => {
  const response = await fetch('/api/auth/me')
  const data = await response.json()
  console.log('[AUTH CHECK]', {
    status: response.status,
    user: data.user ? `Logged in as ${data.user.email}` : 'Not logged in',
    hasToken: !!document.cookie.match(/auth_token/),
    data: data
  })
}

testAuth()
```

#### Test 3: Cookie Verification
```javascript
// Detailed cookie check:
const checkCookie = () => {
  const cookies = {}
  document.cookie.split(';').forEach(c => {
    const [key, value] = c.trim().split('=')
    cookies[key] = value
  })
  
  console.log('[COOKIE ANALYSIS]', {
    allCookies: cookies,
    hasAuthToken: 'auth_token' in cookies,
    authTokenValue: cookies.auth_token ? 'Present' : 'Missing'
  })
}

checkCookie()
```

### 5. Common Issues & Fixes

#### Issue: "Invalid email or password" on Signup
**Cause**: Database error or validation failure
```javascript
// Check signup error in console
// Look for: "Email already registered" or database error
```
**Fix**: 
- Verify email format is valid
- Check if email is already registered
- Ensure password is 6+ characters
- Check database connection in server logs

#### Issue: Redirect Loop (Signup → Learn → Login)
**Cause**: Auth state not persisting or cookie not being recognized
**Debug Steps**:
1. Check Network tab - does signup return 201?
2. Check Set-Cookie header is present
3. Check /api/auth/me returns user data after signup
4. Check React DevTools - is user state set in AuthProvider?
5. Add console.log to learn page to see isLoading/user values

#### Issue: Cookie Not Persisting
**Cause**: Browser settings, sameSite policy, or development mode issues
**Debug**:
```javascript
// Check if cookies are enabled
console.log('[COOKIES ENABLED]', navigator.cookieEnabled)

// Check current domain
console.log('[CURRENT DOMAIN]', window.location.hostname)

// List all cookies
console.log('[ALL COOKIES]', document.cookie)
```

**Fix**:
- Ensure cookies are enabled in browser
- Check cookie domain matches current domain
- In development, use sameSite='Lax' (set in API)
- In production, use sameSite='Strict'

### 6. Server-Side Debugging

#### Enable Detailed Logging in API Routes

Add to `/app/api/auth/signup/route.ts`:
```typescript
// Add at start of POST handler:
console.log('[v0] Signup request:', {
  email: request.body.email,
  timestamp: new Date().toISOString(),
})

// Add before setting cookie:
console.log('[v0] Setting auth cookie:', {
  userId: newUser.id,
  httpOnly: true,
  timestamp: new Date().toISOString(),
})

// Add before response:
console.log('[v0] Signup response:', {
  status: 201,
  userId: newUser.id,
  userRole: newUser.role,
})
```

#### Monitor Auth Checks
Add to `/app/api/auth/me/route.ts`:
```typescript
console.log('[v0] Auth check:', {
  hasToken: !!authToken,
  tokenValue: authToken ? 'present' : 'missing',
  timestamp: new Date().toISOString(),
})
```

### 7. Browser DevTools Tips

#### Preserve Console During Navigation
1. Open DevTools
2. Click Settings (gear icon)
3. Check: "Preserve log"
4. Now logs won't clear on navigation

#### Break on Network Error
1. Network tab
2. Filter by "XHR"
3. Right-click → Log XMLHttpRequest
4. Makes it easier to spot failed requests

#### Slow Down Network to Simulate Delays
1. Network tab
2. Throttle dropdown (top left)
3. Select "Slow 3G" or custom throttle
4. Helps identify race conditions

## Example Debug Session

```javascript
// Copy-paste this entire block into console:

console.clear()
console.log('=== EduQuest Auth Debug Session ===')

// Step 1: Check current state
console.log('1. Current Page:', window.location.pathname)
console.log('2. Has Auth Cookie:', document.cookie.includes('auth_token'))

// Step 2: Test auth API
fetch('/api/auth/me')
  .then(r => r.json())
  .then(data => {
    console.log('3. Auth Status:', data.user ? 'Authenticated' : 'Not authenticated')
    console.log('   User:', data.user?.email || 'N/A')
    console.log('   Role:', data.user?.role || 'N/A')
  })
  .catch(e => console.error('   Error:', e))

// Step 3: Test subjects API
fetch('/api/subjects')
  .then(r => {
    console.log('4. Subjects API Status:', r.status)
    return r.json()
  })
  .then(data => {
    console.log('   Subjects found:', data.subjects?.length || 0)
  })
  .catch(e => console.error('   Error:', e))

console.log('=== Debug Complete ===')
```

## When to Seek Help

If you see these in the debug output, post them in the issue:

❌ **Critical Issues**:
- `/api/auth/me` returns 401 (cookie not being sent)
- `/api/auth/signup` returns 500 (server error)
- Cookie is present but `/api/auth/me` says "Not authenticated"
- Continuous redirects between /login and /learn

✅ **Normal Flow**:
- `/api/auth/signup` returns 201
- Response includes `Set-Cookie: auth_token`
- `/api/auth/me` returns user data
- `/learn` page loads with courses
- No console errors

## Performance Metrics

Good auth performance:
- Signup API: < 500ms
- Auth check (/api/auth/me): < 200ms
- Total auth flow: < 1 second
- No duplicate requests

Monitor with:
```javascript
// Add to page:
performance.mark('auth-start')
// ... auth happens ...
performance.mark('auth-end')
performance.measure('auth', 'auth-start', 'auth-end')
console.log(performance.getEntriesByName('auth')[0].duration + 'ms')
```
