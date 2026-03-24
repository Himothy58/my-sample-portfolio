# EduQuest - Production-Ready Educational Platform

## Overview

EduQuest is a fully functional educational platform that transforms static prototypes into a dynamic, database-driven application. It features comprehensive student learning paths, real-time progress tracking, mini-games with scoring, and a powerful teacher analytics dashboard.

## Key Features Implemented

### 1. Authentication System
- **User Registration & Login** - Sign up as student or teacher with secure password hashing (bcrypt)
- **Session Management** - HTTP-only cookies for secure session handling
- **Role-Based Access** - Separate routes and interfaces for students and teachers
- **Protected Routes** - Automatic redirection for unauthenticated users

**Routes:**
- `/signup` - User registration
- `/login` - User login
- `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`

### 2. Student Learning Platform
- **Subject Selection** - Choose from 3 subjects (History Quest, Science Explorer, Digital Pioneer)
- **Chapter Navigation** - Browse chapters within each subject with progress tracking
- **Lesson System** - Interactive lessons with multiple types (story, interactive, quiz, mini-game)
- **Real-Time Progress** - Track completion percentage for each chapter
- **XP & Leveling** - Earn XP from lessons and games, auto-calculate levels

**Routes:**
- `/learn` - Main learning hub with subject list
- `/learn/subject/[id]` - Subject detail with chapters
- `/learn/chapter/[id]` - Chapter detail with lessons
- `/learn/lesson/[id]` - Individual lesson player

### 3. Progress Tracking System
- **Chapter Progress** - Track percentage completion per chapter
- **Lesson Completions** - Record scores and attempts for each lesson
- **XP Management** - Automatic XP calculation and student level updates
- **Completion History** - Timestamp tracking for analytics

**APIs:**
- `GET/PUT /api/progress/chapters/[id]` - Chapter progress
- `GET/POST /api/progress/lessons` - Lesson completions
- `GET /api/progress` - All user progress

### 4. Mini-Games Integration
- **Quiz Games** - Interactive quizzes with immediate feedback
- **Drag-Drop Games** - Category sorting games with visual feedback
- **Scoring System** - Calculate scores, attempts, and time tracking
- **XP Rewards** - Automatic XP earning based on game performance

**Features:**
- Quiz games with explanation feedback
- Drag-and-drop categorization games
- Attempt tracking and best score records
- Time tracking for performance analysis

**APIs:**
- `POST/GET /api/games/score` - Record and retrieve game scores

### 5. Teacher Analytics Dashboard
- **Student Overview** - Total students, average accuracy, progress, total XP
- **Student Leaderboard** - Ranked view of all students with detailed metrics
- **Weekly Activity Chart** - Visualize lesson completion patterns
- **Real-Time Analytics** - Data computed from actual student activities

**Features:**
- Summary cards with key metrics
- Sortable student table
- Weekly activity visualization
- Multiple tabs for overview, students, and activity

**Route:** `/teacher` (Teacher-only access)

### 6. Export Functionality
- **CSV Export** - Download student data in CSV format
- **JSON Export** - Export detailed reports as JSON
- **Structured Data** - Includes summary statistics and individual student details

**API:** `GET /api/teacher/export?format=csv|json`

## Database Schema

### Core Tables
- **users** - User accounts with role (student/teacher)
- **student_profiles** - Student-specific data (level, XP, streak, badges)
- **subjects** - Educational subjects
- **chapters** - Chapters within subjects
- **lessons** - Individual lessons with type and content

### Tracking Tables
- **student_progress** - Chapter completion tracking
- **lesson_completions** - Lesson attempt records and scores
- **mini_game_scores** - Game-specific scores and statistics
- **student_achievements** - Badges and accomplishments

### Organization Tables
- **teacher_classes** - Classes created by teachers
- **class_students** - Student enrollment in classes

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user info
- `POST /api/auth/logout` - User logout

### Content
- `GET /api/subjects` - All subjects
- `GET /api/subjects/[id]` - Single subject
- `GET /api/chapters?subject_id=[id]` - Chapters for subject
- `GET /api/chapters/[id]` - Single chapter
- `GET /api/lessons?chapter_id=[id]` - Lessons for chapter
- `GET /api/lessons/[id]` - Single lesson with chapter

### Progress & Scoring
- `GET /api/progress` - All user progress
- `GET/PUT /api/progress/chapters/[id]` - Chapter progress
- `GET /api/progress/lessons/[id]` - Lesson completion
- `POST /api/progress/lessons` - Complete lesson
- `POST/GET /api/games/score` - Game scoring

### Teacher Tools
- `GET /api/teacher/analytics` - Dashboard analytics
- `GET /api/teacher/export` - Export student data

## Technology Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom JWT with bcrypt hashing
- **UI Components**: Shadcn/ui, Radix UI
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Environment variables configured

### Installation

1. Clone repository
2. Install dependencies: `npm install` or `pnpm install`
3. Configure environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Run development server: `npm run dev`
5. Access at `http://localhost:3000`

### Database Setup
The database schema is created through migrations:
1. `scripts/01-create-schema.sql` - Creates all tables and indexes
2. `scripts/02-seed-data.sql` - Populates initial content

## Context Providers

The app uses three main context providers:
- **AuthProvider** - Manages user authentication and session
- **ProgressProvider** - Manages learning progress state
- **GameProvider** - Manages game scores and achievements

## Student Journey

1. **Sign Up** → Create account as student
2. **Learn Hub** → Browse available subjects
3. **Select Subject** → View all chapters
4. **Choose Chapter** → Access lessons
5. **Complete Lessons** → Earn XP and progress
6. **Play Games** → Additional scoring and XP
7. **Track Progress** → View level, XP, and achievements

## Teacher Journey

1. **Sign Up** → Create account as teacher
2. **Access Dashboard** → `/teacher` route
3. **View Analytics** → See all students and metrics
4. **Review Students** → Leaderboard and details
5. **Check Activity** → Weekly completion patterns
6. **Export Data** → Download CSV or JSON reports

## Key Implementation Details

### Security
- Passwords hashed with bcrypt (10 salt rounds)
- HTTP-only session cookies
- Role-based access control
- Protected API routes with auth checks

### Performance
- Efficient database queries with indexes
- Progress caching in context
- Optimized pagination for large datasets
- Lazy loading for lesson content

### Scalability
- Database indexes on frequently queried columns
- API rate limiting ready
- Modular context-based state management
- Extensible lesson and game systems

## Future Enhancements

- Real-time leaderboards
- Achievement badges system
- Peer comparison analytics
- Offline sync capabilities
- Advanced reporting filters
- Parent/guardian accounts
- Mobile app version
- Multiplayer mini-games

## Support

For issues or questions, refer to:
- Database schema: `FEATURE_SPECIFICATIONS.md`
- API documentation: Each route file includes detailed comments
- Component usage: Check component files for props and examples

---

**Status**: Production-Ready
**Last Updated**: 2026-03-24
**Version**: 1.0.0
