# EduQuest Setup Checklist

Use this checklist to ensure everything is properly configured.

## Pre-Installation

- [ ] Node.js installed (v18+): `node --version`
- [ ] npm installed (v9+): `npm --version`
- [ ] Git installed: `git --version`
- [ ] Visual Studio Code installed
- [ ] Supabase account created (https://supabase.com)

## Project Setup

- [ ] Project cloned: `git clone https://github.com/Himothy58/my-sample-portfolio.git`
- [ ] Project folder opened in VS Code
- [ ] Terminal open in VS Code (`Ctrl + ~`)
- [ ] Dependencies installed: `npm install` (no errors)

## Environment Configuration

- [ ] `.env.local` file created in project root
- [ ] Supabase URL added to `.env.local`
- [ ] Supabase anon key added to `.env.local`
- [ ] `.env.local` is in `.gitignore` (don't commit!)

## VS Code Configuration

### Extensions Installed
- [ ] ES7+ React/Redux/React-Native snippets
- [ ] Prettier - Code formatter
- [ ] ESLint
- [ ] Next.js extension
- [ ] Tailwind CSS IntelliSense

### VS Code Settings
- [ ] Format on Save enabled
- [ ] Default formatter set to Prettier
- [ ] ESLint linting enabled

## Database Setup

- [ ] Supabase project created and linked
- [ ] Database migrations applied (tables created)
- [ ] Initial seed data loaded (optional)
- [ ] Can connect to Supabase: `npm run build` (no errors)

## Development Server

- [ ] Development server starts: `npm run dev`
- [ ] No errors in terminal
- [ ] http://localhost:3000 loads successfully
- [ ] No white blank screens

## Authentication Testing

- [ ] Visit http://localhost:3000/signup
- [ ] Create test account with:
  - Email: test@example.com
  - Password: password123
  - Name: Test User
  - Role: Student
- [ ] Account created successfully
- [ ] Redirected to `/learn` page
- [ ] Can see "Available Courses" on `/learn`
- [ ] DevTools Network tab shows:
  - [ ] POST /api/auth/signup returns 200
  - [ ] GET /api/auth/me returns 200
  - [ ] Response header has Set-Cookie
- [ ] DevTools Application tab shows:
  - [ ] Cookie "auth_token" exists
  - [ ] Cookie value is a UUID
  - [ ] Cookie is HttpOnly (in dev)
- [ ] Refresh page: Still on `/learn` (not redirected)
- [ ] Click logout: Redirected to `/login`

## Code Quality

- [ ] No red errors in VS Code
- [ ] No console errors (`F12` → Console tab)
- [ ] ESLint checks pass: `npm run lint`
- [ ] Code is formatted: `npm run format`

## File Structure Verification

- [ ] `/app/` folder exists with pages
- [ ] `/components/` folder exists
- [ ] `/lib/` folder exists with contexts
- [ ] `/public/` folder exists
- [ ] `package.json` exists
- [ ] `tailwind.config.ts` exists
- [ ] `next.config.ts` exists

## API Routes Verification

Verify these API routes exist and work:

- [ ] `GET /api/auth/me` - Returns 200 when authenticated
- [ ] `POST /api/auth/login` - Can login
- [ ] `POST /api/auth/signup` - Can signup
- [ ] `POST /api/auth/logout` - Can logout
- [ ] `GET /api/subjects` - Returns course list

## Pages Verification

Verify these pages load:

- [ ] `http://localhost:3000` - Home page
- [ ] `http://localhost:3000/login` - Login page (with form)
- [ ] `http://localhost:3000/signup` - Signup page (with form)
- [ ] `http://localhost:3000/learn` - Learn hub (after login)

## Console & Network Diagnostics

- [ ] DevTools Console: No red error messages
- [ ] DevTools Network: All requests have status 200 or 201
- [ ] DevTools Network: API responses are valid JSON
- [ ] DevTools Application: Cookies are correctly set
- [ ] DevTools Application: No storage errors

## If Issues Occur

- [ ] Cleared `.next` folder: `rm -rf .next`
- [ ] Reinstalled dependencies: `npm install`
- [ ] Restarted dev server: `npm run dev`
- [ ] Cleared browser cookies (DevTools → Application)
- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Verified `.env.local` variables are correct
- [ ] Checked Supabase project is running (not paused)

## Troubleshooting Steps Completed

- [ ] Read `BUG_DIAGNOSIS_AND_FIX.md` if auth issues persist
- [ ] Read `VSCODE_SETUP_GUIDE.md` for detailed troubleshooting
- [ ] Checked browser console for specific error messages
- [ ] Verified environment variables are properly formatted

## Ready for Development

- [ ] All checks above passed ✓
- [ ] Can navigate between pages without errors
- [ ] Authentication flow works completely
- [ ] Development server stable (no crashes)
- [ ] Ready to start coding!

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Install packages | `npm install` |
| Build for production | `npm run build` |
| Check code quality | `npm run lint` |
| Format code | `npm run format` |
| Check types | `npm run type-check` |

## Helpful Links

- **Project Overview:** `PROJECT_ANALYSIS_SUMMARY.md`
- **Quick Start:** `QUICK_START.md`
- **Detailed Setup:** `VSCODE_SETUP_GUIDE.md`
- **Bug Info:** `BUG_DIAGNOSIS_AND_FIX.md`
- **GitHub:** https://github.com/Himothy58/my-sample-portfolio

---

**✓ When all items are checked, you're ready to develop!**
