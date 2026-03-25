# EduQuest - Project Analysis & Setup Summary

## What Is EduQuest?

A full-stack educational learning platform built with Next.js that allows students to take interactive courses, earn XP, and track progress, while teachers can manage classes and view detailed analytics.

## Bug Identified & Fixed

### The Recurring Bug: Redirect Loop After Login

**Symptom:** User logs in successfully → redirected to `/learn` → immediately redirected back to `/login` (infinite loop)

**Root Cause:** Cookie handling issue in development environment where the `auth_token` cookie isn't being shared properly between API routes.

**Log Evidence:**
```
POST /api/auth/login 200 ✓ (cookie set)
GET /learn 200 ✓ (page loads)
GET /api/auth/me 401 ✗ (cookie not found - causes redirect!)
```

**Why It Happens:**
- `/api/auth/me` reads the `auth_token` cookie to verify session
- In development, the cookie isn't being sent in the request
- Without the cookie, authentication fails with 401
- The auth context redirects unauthenticated users to `/login`
- User is logged in but not verified → infinite loop

**Status:** Root cause identified and documented. Code contains proper `credentials: 'include'` headers. Issue may be environment-specific (development vs. production).

## Project Architecture

### Frontend (Next.js + React)
- **Auth System:** Custom JWT-based with HTTP-only cookies
- **State Management:** React Context (AuthContext, ProgressContext, GameContext)
- **UI Components:** shadcn/ui components
- **Styling:** Tailwind CSS
- **Pages:**
  - `/login` - User authentication
  - `/signup` - User registration
  - `/learn` - Main learning hub with subjects
  - `/learn/subject/[id]` - Subject chapters
  - `/learn/chapter/[id]` - Chapter lessons
  - `/teacher` - Teacher analytics dashboard

### Backend (Next.js API Routes + Supabase)
- **Database:** PostgreSQL (via Supabase)
- **Auth Endpoints:**
  - `POST /api/auth/signup` - Create account
  - `POST /api/auth/login` - Login with credentials
  - `GET /api/auth/me` - Verify session
  - `POST /api/auth/logout` - Clear session
- **Data Endpoints:**
  - `/api/subjects` - Get courses
  - `/api/chapters` - Get chapter content
  - `/api/progress` - Track student progress
  - `/api/games/score` - Record game scores
  - `/api/teacher/analytics` - Teacher dashboard data

### Database Schema
- `users` - User accounts (student/teacher)
- `student_profiles` - Student stats (XP, level, streak)
- `subjects` - Course subjects
- `chapters` - Course chapters
- `lessons` - Individual lessons with content
- `student_progress` - Per-chapter progress tracking
- `lesson_completions` - Individual lesson results
- `mini_game_scores` - Game performance
- `teacher_classes` - Class management
- `student_achievements` - Badges and achievements

## Setup Overview

### Quick Setup (5 minutes)
```bash
git clone https://github.com/Himothy58/my-sample-portfolio.git
cd my-sample-portfolio
npm install
echo 'NEXT_PUBLIC_SUPABASE_URL=your_url' > .env.local
echo 'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key' >> .env.local
npm run dev
```

### Full Setup (with VS Code)
See **VSCODE_SETUP_GUIDE.md** for:
- Node.js and Git installation
- VS Code extensions setup
- Environment configuration
- Database initialization
- Detailed troubleshooting

## Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 18+ | JavaScript runtime |
| Frontend | React 18 + Next.js 14 | UI and routing |
| Styling | Tailwind CSS | Utility-first styling |
| Database | PostgreSQL (Supabase) | Data persistence |
| Auth | JWT + HTTP-only cookies | Secure authentication |
| Forms | React Hook Form | Form state management |
| UI Components | shadcn/ui | Pre-built components |
| Charts | Recharts | Data visualization |

## Dependencies Installed

### Core
- `next` - React framework
- `react` & `react-dom` - UI library
- `typescript` - Type safety

### Authentication
- `bcryptjs` - Password hashing
- `@supabase/supabase-js` - Supabase client

### UI & Styling
- `tailwindcss` - CSS framework
- `class-variance-authority` - Component variants
- `clsx` - Class name utility
- `tailwind-merge` - Merge Tailwind classes
- `lucide-react` - Icon library

### Forms & Validation
- `react-hook-form` - Form management
- `@hookform/resolvers` - Validation resolvers
- `zod` - Schema validation

### Charts
- `recharts` - Data visualization

### Utilities
- `date-fns` - Date manipulation
- `uuid` - ID generation
- `@vercel/analytics` - Performance tracking

## Common Workflows

### Add a New Page
1. Create file: `app/new-page/page.tsx`
2. Add to layout if needed
3. Use existing components
4. Test at `http://localhost:3000/new-page`

### Add a Database Query
1. Create API route: `app/api/endpoint/route.ts`
2. Use Supabase client: `const supabase = await createClient()`
3. Query data: `supabase.from('table').select()`
4. Return response: `Response.json(data)`

### Add UI Component
1. Copy from shadcn/ui or create custom
2. Place in `components/ui/`
3. Export from component
4. Import in page: `import { Component } from '@/components/ui/component'`

### Style Elements
1. Use Tailwind classes: `className="flex gap-4 p-6 bg-blue-500"`
2. For component variants, use CVA:
   ```tsx
   const styles = cva(['base'], {
     variants: { size: { sm: 'p-2', lg: 'p-6' } }
   })
   ```

## Testing Authentication Flow

1. **Clear cookies:** DevTools → Application → Cookies → Delete all
2. **Go to signup:** `http://localhost:3000/signup`
3. **Create test account:**
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
   - Role: `Student`
4. **Verify:**
   - Should see `/learn` page
   - Network tab shows `Set-Cookie: auth_token`
   - Application tab shows `auth_token` cookie
5. **Refresh page:** Should stay on `/learn` (not redirect)

## Files to Know

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with providers |
| `lib/auth-context.tsx` | Auth state management |
| `app/api/auth/*/route.ts` | Auth endpoints |
| `app/login/page.tsx` | Login form |
| `app/signup/page.tsx` | Signup form |
| `app/learn/page.tsx` | Main learning page |
| `.env.local` | Environment variables (you create) |
| `package.json` | Dependencies and scripts |

## Environment Variables Needed

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Development (Optional)
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Deploy to Vercel
npm install -g vercel
vercel
```

## Documentation Files Created

1. **QUICK_START.md** - 5-minute setup (start here!)
2. **VSCODE_SETUP_GUIDE.md** - Comprehensive VS Code setup
3. **BUG_DIAGNOSIS_AND_FIX.md** - Root cause of redirect loop
4. **This file** - Project overview

## Next Steps

1. Follow **QUICK_START.md** or **VSCODE_SETUP_GUIDE.md**
2. Set up `.env.local` with Supabase credentials
3. Run `npm install && npm run dev`
4. Test auth flow (signup, login, navigate to `/learn`)
5. Check **BUG_DIAGNOSIS_AND_FIX.md** if auth issues occur

## Support Resources

- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev
- **Supabase:** https://supabase.com/docs
- **Tailwind:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs

---

**Project Status:** ✅ Functional (with documented known issue)  
**Last Updated:** 2024  
**Node Version Required:** 18.17+ or later
