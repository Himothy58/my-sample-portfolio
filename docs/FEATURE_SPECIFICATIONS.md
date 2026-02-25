# EduQuest Feature Specifications

## 1. Mini-Game Interface Specifications

### Design Principles
- **Mobile-First**: Optimized for 5-6 inch screens
- **Touch-Friendly**: Large tap targets (minimum 44x44px)
- **Low-Bandwidth**: Minimal animations, optimized assets
- **Accessible**: High contrast, readable text
- **Feedback-Rich**: Immediate visual and audio feedback

### Mini-Game Components

#### 1.1 Timeline Game (History)

**Purpose**: Arrange historical events in chronological order

**Mechanics**:
- Events displayed as draggable cards
- Two zones: Available Events (bottom) and Timeline (main area)
- Users drag events to timeline in correct order
- Real-time validation and feedback

**Controls**:
- Drag: Move events between areas
- Tap: Toggle event selection
- Swipe: Scroll event list
- Submit: Complete challenge

**Feedback Mechanisms**:
- Visual: Cards highlight on selection, change color on correct placement
- Audio: Success chime (optional), error buzz
- Textual: Event descriptions, hints on hover
- Progress: Bar showing completion percentage

**Game Flow**:
```
Start Screen
  ↓
Event Briefing
  ↓
Game Interface (drag events)
  ↓
Submission
  ↓
Scoring & Feedback
  ↓
Completion & XP Award
```

**Scoring**:
- 0-60%: "Keep trying!" - Bronze tier
- 60-79%: "Good effort!" - Silver tier
- 80-99%: "Excellent!" - Gold tier
- 100%: "Perfect!" - Platinum tier

**Technical Details**:
- Drag implementation: React state + mouse/touch events
- Validation: Compare userOrder with sortedEvents
- Time limit: Optional (default 2 minutes)
- Difficulty: Scales with number of events (3-6)

#### 1.2 Drag-Drop Game (Science)

**Purpose**: Categorize organs/items into body systems/categories

**Mechanics**:
- Items (e.g., organs) shown as draggable cards
- Drop zones (e.g., body systems) at bottom
- Users drag items to correct categories
- Multiple items per category possible

**Visual Hierarchy**:
```
┌─────────────────────────┐
│  Game Title & Score     │
├─────────────────────────┤
│                         │
│  Draggable Items Grid   │
│                         │
├─────────────────────────┤
│ [Category 1] [Cat 2]... │  Drop Zones
└─────────────────────────┘
```

**Drop Zone Design**:
- Color-coded by category (uses theme colors)
- Shows number of items placed
- Highlights on drag-over
- Snap animation on drop

**Item Design**:
- Icon + label
- Description on long-press
- Smooth animations
- Glow effect when selected

**Scoring System**:
- Correct: +10 points
- Wrong placement: -5 points (can retry)
- Time bonus: Completion time affects multiplier
- Maximum possible score: 100

**Difficulty Levels**:
- Easy (5 items, 3 categories)
- Medium (8 items, 4 categories)
- Hard (12 items, 5 categories)

#### 1.3 Coding Puzzle (Computer Literacy)

**Purpose**: Arrange code blocks to create a working program

**Mechanics**:
- Code blocks as draggable cards with logic
- Drop zone for correct sequence
- Visual code representation
- Expected output shown

**Code Block Structure**:
```
┌──────────────────────────┐
│  print('Hello, World!')   │  ← Code block
│  [Display a message]      │  ← Description
└──────────────────────────┘
```

**Puzzle Elements**:
- Input operations (get user data)
- Processing (calculations, transformations)
- Output (display results)
- Correct sequence required

**Feedback**:
- Syntax highlighting
- Output preview
- Error messages for incorrect sequences
- Hints showing block purpose

**Difficulty Progression**:
1. **Beginner**: 3 blocks, simple sequence
2. **Intermediate**: 4-5 blocks, with loops/conditionals
3. **Advanced**: 6+ blocks, complex logic

**Success Criteria**:
- Correct order
- Matching expected output
- All blocks used

### Mini-Game UI Components

#### Loading Screen
```
┌────────────────────────┐
│   Game Loading...      │
│   ████████░░ 75%       │
│                        │
│  Initializing assets   │
└────────────────────────┘
```

#### Game Completion Screen
```
┌────────────────────────┐
│  Challenge Complete!   │
│                        │
│      ⭐ 85/100         │
│                        │
│  [Continue Learning]   │
│  [Retry Challenge]     │
└────────────────────────┘
```

#### Hint System
- First attempt: Free hint
- After 3 wrong attempts: Offer hint
- Hint cost: 5 XP (optional)
- Show/hide with button toggle

### Accessibility Features

**For All Users**:
- High contrast mode support
- Text scaling up to 200%
- Keyboard controls (Tab, Enter)
- Screen reader support (ARIA labels)

**Mobile Optimizations**:
- Touch target size: ≥44px
- Pinch-to-zoom disabled (set viewport)
- Portrait orientation only
- No rapid vibrations

**Performance**:
- Smooth 60fps animations
- < 1s load time
- Optimized for 2GB RAM devices
- Battery efficient (no constant polling)

---

## 2. Teacher/Parent Dashboard Specifications

### Dashboard Architecture

#### 2.1 Overview Tab

**Key Metrics Cards**:
```
┌──────────────┬──────────────┐
│ Total        │ Average      │
│ Students: 25 │ Accuracy: 82%│
├──────────────┼──────────────┤
│ Average      │ Total XP     │
│ Progress:78% │ Earned:45.2K │
└──────────────┴──────────────┘
```

**Charts**:

1. **Weekly Activity Chart**
   - X-axis: Days (Mon-Sun)
   - Y-axis: Students active / XP earned
   - Type: Dual bar chart
   - Trend: Shows engagement patterns

2. **Subject Engagement**
   - Shows % completion per subject
   - Horizontal progress bars
   - Color-coded by subject
   - Real-time updates

3. **Accuracy Distribution**
   - Pie chart showing accuracy ranges
   - Ranges: 90-100%, 80-89%, 70-79%, <70%
   - Hover shows count
   - Visual: Color gradients

**Data Display**:
- Refreshes every 5 minutes
- Filters available: Date range, class, subject
- Export button: CSV, PDF formats
- Manual refresh: "Update Now" button

#### 2.2 Student List Tab

**Student Card Layout**:
```
┌─────────────────────────────┐
│ Amina Kipchoge     [Lvl 18] │
│ amina@school.ke            │
│                             │
│ Progress: [████████░░] 85%  │
│ Chapters: 9/24              │
│                             │
│ [2450 XP] [12 Streak] [22 Badges] │
│ ⚠️ Last active: 2 hours ago │
└─────────────────────────────┘
```

**Sorting Options**:
- By Name (A-Z)
- By Progress (High to Low)
- By XP (Most to Least)
- By Accuracy (Best to Worst)
- By Last Active (Most Recent)

**Filter Options**:
- Status: Active, Inactive (>3 days), At-Risk (<60%)
- Subject: History, Science, Computer Literacy
- Progress Range: 0-25%, 25-50%, 50-75%, 75-100%

**Alerts System**:
```
⚠️ Inactive: No activity for 3+ days
🔴 At Risk: Accuracy below 60%
📉 Declining: Progress dropped >10%
✨ Excellence: Accuracy >90%
```

#### 2.3 Student Detail View

**Header Section**:
- Student name, email, avatar
- Current level, total XP
- Accuracy rate, time spent

**Subject Progress Cards**:
```
┌─────────────────────┐
│ History Quest      │
│ [██████████░░] 85% │
│ 5/6 chapters       │
│ Last: 2 hours ago  │
└─────────────────────┘
```

**Performance Metrics**:
- Accuracy trend (last 7 days)
- Time spent per lesson
- Completion rate
- Strongest/weakest topics

**Activity Timeline**:
- Last login
- Chapters completed
- Games played
- Streak information

**Insights Panel**:
- Automated recommendations
- Strengths identified
- Areas for improvement
- Suggested next steps

#### 2.4 Analytics Tab (Advanced)

**Trend Analysis**:
- Overall class progress
- Subject popularity
- Time-of-day engagement
- Feature adoption rates

**Performance Breakdown**:
- By subject
- By difficulty level
- By game type
- By time spent

**Predictive Insights**:
- At-risk identification
- Engagement forecast
- Completion prediction
- Learning velocity

### Data Visualization Components

#### Chart Specifications

**Bar Chart (Weekly Activity)**
- Responsive width adjustment
- Tooltip on hover with values
- Color: Primary for active, Accent for XP
- Y-axis: Dynamic scaling
- Grid lines: Subtle, dashed

**Pie Chart (Accuracy Distribution)**
- Responsive to container size
- Legend below chart
- Colors: Primary, Accent, Destructive
- Hover: Show percentage
- Click: Filter students by range

**Progress Bars**
- Color: Green (>80%), Yellow (60-80%), Red (<60%)
- Animated fill from 0% to target
- Show value: Right-aligned percentage
- Label: Left-aligned, bold

### Export Functionality

**CSV Format**:
```csv
Student Name,Email,Level,XP,Accuracy,Progress,Streak,Badges
Amina Kipchoge,amina@school.ke,18,5200,92%,85%,12,22
David Kariuki,david@school.ke,15,4100,78%,70%,8,15
```

**PDF Report**:
- Header: School name, date, period
- Summary: Key metrics
- Charts: Embedded visuals
- Student list: Detailed table
- Footer: Timestamp, exported by

### Teacher Controls

**Action Buttons**:
1. **Refresh Data**: Manual update from server
2. **Export**: Choose format (CSV/PDF)
3. **Message**: Send encouragement to students
4. **Archive**: Mark students as alumni
5. **Reset**: Clear progress (with confirmation)

**Batch Operations**:
- Select multiple students
- Bulk export
- Bulk message
- Bulk archive

### Performance Considerations

**Data Loading**:
- Initial load: Top 5 students, summary data
- Lazy load: Full student list on scroll
- Pagination: 10 students per page
- Cache: 5-minute refresh interval

**Display Optimization**:
- Charts render only when visible
- Table virtualization for long lists
- Debounced search (300ms)
- Responsive design (desktop, tablet)

### Security & Privacy

**Access Control**:
- Teachers see only their own class
- Admins see all classes
- Parents see only their child
- Data encrypted in transit

**Data Privacy**:
- No sensitive data in exports
- PII protected with masking
- Audit logs for access
- GDPR-compliant deletion

---

## 3. Resource Optimization

### APK Size Targets

| Component | Size | Notes |
|-----------|------|-------|
| Base App | 150KB | Core game loop |
| History Content | 50KB | Chapter data, lessons |
| Science Content | 60KB | Experiments, diagrams |
| Computer Content | 55KB | Programming tutorials |
| Images | 200KB | Compressed PNG/WebP |
| Teacher Dashboard | 40KB | Code-split |
| **Total** | **≤100MB** | With space for data |

### Image Optimization

**Format Strategy**:
- WebP for modern devices (70% smaller)
- JPEG fallback for older devices
- PNG for icons/graphics
- SVG for logos (scalable)

**Resolution Strategy**:
- 1x: 150px icons, 300px images
- 2x: 300px icons, 600px images
- Auto-select based on device DPI

**Compression**:
- Target: <50KB per image
- Format: Lossy WebP (80% quality)
- Tool: ImageOptim or similar

### Code Optimization

**Bundling**:
- Main: ~150KB (minified + gzipped)
- Subject modules: Lazy loaded
- Dashboard: Code-split
- Mini-games: Separate bundles

**JavaScript Optimization**:
- Tree-shaking: Remove unused code
- Minification: Reduce by 40%
- Compression: Gzip all assets
- Module splitting: Load on-demand

---

## 4. Performance Benchmarks

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| App Load Time | <2s | - |
| Game Start | <1s | - |
| Sync Time | <3s | - |
| Frame Rate | 60fps | - |
| Memory (idle) | <50MB | - |
| Battery (1h) | <15% | - |

### Testing Checklist

- [ ] Load time on 3G
- [ ] Memory on 2GB device
- [ ] Battery drain over 1 hour
- [ ] Sync performance offline→online
- [ ] Frame rate in mini-games
- [ ] Touch responsiveness
- [ ] Storage quota warning

---

## 5. Monitoring & Logging

### Client-Side Logging

```typescript
// Example logs
[v0] Mini-game started: timeline-game-h3-4
[v0] Game completed: timeline-game-h3-4, score: 85
[v0] Sync started, queue size: 3
[v0] Sync complete: 3 items synced
[v0] Storage: 2.45MB used, 25 items
```

### Analytics Events

1. **Game Events**
   - game_started
   - game_completed
   - game_failed
   - hint_used

2. **Learning Events**
   - lesson_started
   - lesson_completed
   - quiz_answered
   - chapter_completed

3. **Sync Events**
   - sync_started
   - sync_completed
   - sync_failed
   - offline_detected

4. **App Events**
   - app_opened
   - app_closed
   - storage_full
   - error_occurred

---

## References & Standards

- WCAG 2.1 AA for accessibility
- Material Design 3 for mobile UI
- CBC Kenya curriculum standards
- Performance benchmarks per Android devices
