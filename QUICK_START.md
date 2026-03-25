# EduQuest - Quick Start (5 Minutes)

## 1. Clone & Open
```bash
git clone https://github.com/Himothy58/my-sample-portfolio.git
cd my-sample-portfolio
code .
```

## 2. Install Dependencies
```bash
npm install
```

## 3. Create `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 4. Start Development
```bash
npm run dev
```

Then open: **http://localhost:3000**

## 5. Test Login
1. Go to `/signup`
2. Create account
3. Should redirect to `/learn`

## Common Issues

| Issue | Fix |
|-------|-----|
| Module not found error | `rm -rf .next && npm install` |
| Port 3000 in use | `npm run dev -- -p 3001` |
| Auth redirects to login | Check `.env.local` variables |
| Database errors | Verify Supabase URL and keys |
| Styles not showing | `npm run build` |

## File Structure
- `/app` - Pages and API routes
- `/components` - React components
- `/lib` - Utilities and contexts
- `/public` - Static files
- `.env.local` - Environment variables (you create this)

## Quick Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check code quality
npm run format       # Format with Prettier
```

For detailed setup, see: **VSCODE_SETUP_GUIDE.md**  
For bug details, see: **BUG_DIAGNOSIS_AND_FIX.md**
