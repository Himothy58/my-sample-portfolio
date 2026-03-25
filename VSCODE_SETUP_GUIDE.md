# EduQuest - Complete VS Code Setup Guide

## Prerequisites

Before starting, ensure you have installed:
- **Node.js** (v18+ recommended): https://nodejs.org
- **Git**: https://git-scm.com
- **Visual Studio Code**: https://code.visualstudio.com

Verify installation:
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
git --version     # Should be v2.30+
```

## Step 1: Clone and Open the Project

### Option A: Using Git
```bash
# Clone the repository
git clone https://github.com/Himothy58/my-sample-portfolio.git

# Navigate to the project
cd my-sample-portfolio

# Open in VS Code
code .
```

### Option B: Manual Download
1. Download the project as ZIP from GitHub
2. Extract the ZIP file
3. Open the folder in VS Code: `File → Open Folder`

## Step 2: Install Dependencies

In VS Code terminal (`Ctrl + ~` or `View → Terminal`):

```bash
# Install all dependencies
npm install

# If you have issues, try clearing cache first:
npm cache clean --force
npm install
```

**Expected output:** Should show all packages installed without errors.

## Step 3: Environment Configuration

### Create `.env.local` file

1. Create a new file in the project root: `.env.local`
2. Add the following environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Development settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### How to get Supabase credentials:
1. Go to https://supabase.com
2. Create a project or use existing
3. Go to Settings → API
4. Copy `Project URL` and `anon public key`
5. Paste into `.env.local`

**Important:** Never commit `.env.local` to git. It's already in `.gitignore`.

## Step 4: Configure VS Code Extensions

### Recommended Extensions

Press `Ctrl+Shift+X` to open Extensions, then install:

**Essential:**
- **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets)
- **Prettier - Code formatter** (esbenp.prettier-vscode)
- **ESLint** (dbaeumer.vscode-eslint)
- **TypeScript Vue Plugin** (Vue.volar)

**Highly Recommended:**
- **Next.js** (pagebuild.next.js)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **Thunder Client** or **REST Client** (for testing APIs)
- **Git Graph** (mhutchie.git-graph)

### VS Code Settings

1. Open Settings: `Ctrl+,`
2. Search for "format on save"
3. Enable "Editor: Format On Save"
4. This will auto-format code with Prettier

Or manually add to `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Step 5: Database Setup

### Initialize Database

Run the migration scripts:

```bash
# Check if scripts exist
ls scripts/

# If migrations exist, apply them manually through Supabase dashboard:
# 1. Go to Supabase dashboard
# 2. SQL Editor
# 3. Copy contents of scripts/01-create-schema.sql
# 4. Execute in SQL editor
# 5. Repeat for scripts/02-seed-data.sql
```

Or use the Supabase CLI:
```bash
# Install Supabase CLI
npm install -g supabase

# Link project
supabase link --project-ref your_project_ref

# Run migrations
supabase migration up
```

## Step 6: Start Development Server

```bash
# Start the development server
npm run dev

# Output should show:
# ▲ Next.js 14.x.x
# - Local: http://localhost:3000
# - Environments: .env.local
```

Open your browser and go to: **http://localhost:3000**

## Step 7: Verify Installation

### Checklist
- [ ] Project opens without errors in terminal
- [ ] `http://localhost:3000` loads without error
- [ ] Can navigate to `/login` and `/signup`
- [ ] Pages display correctly (no white screens)
- [ ] DevTools shows no red errors in Console

### Test Authentication

1. Go to `http://localhost:3000/signup`
2. Create an account:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
   - Role: `Student`
3. Should redirect to `/learn` page (if database is set up)
4. Open DevTools (`F12`) and check:
   - **Network tab:** POST /api/auth/signup should return 200
   - **Application tab:** Cookies → `auth_token` should exist
   - **Console tab:** No red errors

## Step 8: Project Structure

```
my-sample-portfolio/
├── app/
│   ├── api/                 # API routes
│   │   └── auth/            # Authentication endpoints
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   ├── learn/               # Main learning hub
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Home page
├── components/
│   └── ui/                  # UI components (Button, Card, Input, etc.)
├── lib/
│   ├── auth-context.tsx     # Auth state management
│   ├── progress-context.tsx # Progress tracking
│   ├── game-context.tsx     # Game state management
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # Utility functions
├── public/                  # Static assets
├── scripts/                 # Database migrations
├── .env.local              # Environment variables (create this)
├── .gitignore              # Files to ignore in git
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind CSS config
└── next.config.ts          # Next.js config
```

## Troubleshooting

### Issue: "Cannot find module @/components/ui/input"

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Use different port
npm run dev -- -p 3001

# Or kill the process using port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -i :3000
kill -9 <PID>
```

### Issue: Styles not applying (Tailwind CSS)

**Solution:**
```bash
# Rebuild Tailwind cache
npm run build

# If still issues, check globals.css exists:
cat app/globals.css

# Should contain @import 'tailwindcss';
```

### Issue: Database errors

**Solution:**
1. Verify `.env.local` has correct Supabase URL and keys
2. Check Supabase project is active (not paused)
3. Verify database migrations were applied:
   - Go to Supabase Dashboard → SQL Editor
   - Check that tables exist: `SELECT * FROM users;`

### Issue: Auth always redirects to login

**Solution:**
1. Check browser console for errors (`F12`)
2. Check Network tab for failed requests
3. Verify cookies exist in Application tab
4. Check `.env.local` variables are set
5. See `BUG_DIAGNOSIS_AND_FIX.md` for detailed troubleshooting

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code with Prettier
npm run format

# Type check
npm run type-check

# Run tests (if configured)
npm test
```

## Git Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to remote
git push origin main

# Create new branch
git checkout -b feature/feature-name

# Switch branches
git checkout feature-name

# Merge branch
git merge feature-name
```

## Performance Tips

1. **Use VS Code search shortcuts:**
   - `Ctrl+F` - Find in file
   - `Ctrl+Shift+F` - Find across files
   - `Ctrl+H` - Find and replace

2. **Format code on save** - Keeps code clean automatically

3. **Use Emmet abbreviations:**
   ```
   div.container>h1{Title}+p{Content}
   
   Expands to:
   <div class="container">
     <h1>Title</h1>
     <p>Content</p>
   </div>
   ```

4. **Install ES7+ snippets** for quick React component generation:
   - Type `rfc` + Tab = React Functional Component
   - Type `usestate` + Tab = useState hook

## Need Help?

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Supabase:** https://supabase.com/docs
- **VS Code Tips:** https://code.visualstudio.com/docs/getstarted/tips-and-tricks

## Summary

You're now ready to develop! The project is configured with:
- Next.js 14 (App Router)
- React 18+ with TypeScript
- Tailwind CSS for styling
- Supabase for backend
- Authentication system
- Progress tracking
- Mini-games system

Happy coding! 🚀
