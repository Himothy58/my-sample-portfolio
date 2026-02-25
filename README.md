# EduQuest - Mobile-First Educational Game for Kenya

A comprehensive, offline-first educational game platform designed for Kenyan secondary school learners, aligning with the Competency-Based Curriculum (CBC) while prioritizing accessibility on affordable Android devices.

## Overview

EduQuest transforms learning into an engaging adventure where students progress through three interconnected worlds covering:
- **History Quest**: Kenya's heritage, independence movements, and modern development
- **Science Explorer**: Living organisms, human body systems, ecosystems, and matter/energy
- **Digital Pioneer**: Computer basics, internet safety, digital communication, and programming

## Key Features

### Student Experience
- **Story-Driven Learning**: Narrative-based progression through CBC-aligned content
- **Gamification**: XP points, badges, streaks, and achievement systems
- **Interactive Mini-Games**:
  - Timeline ordering (History)
  - Drag-and-drop categorization (Science)
  - Coding puzzles (Computer Literacy)
- **Offline-First**: Complete offline functionality with automatic sync when online
- **Mobile-Optimized**: Responsive design for 5-6 inch screens

### Teacher/Parent Features
- **Comprehensive Dashboard**: Track individual and class-wide progress
- **Real-Time Analytics**: Weekly activity charts, accuracy distribution, engagement metrics
- **Student Insights**: Personalized performance analysis and recommendations
- **Data Export**: Export progress reports in CSV and PDF formats
- **Performance Tracking**: Monitor subject mastery, completion rates, and time spent

### Technical Features
- **Lightweight**: <100MB APK with intelligent code splitting
- **Low-Bandwidth**: Optimized for 2G/3G connections
- **Offline Storage**: LocalStorage-based with conflict-free sync
- **Battery Efficient**: Minimal animations, smart background management
- **Progressive Enhancement**: Core features offline, enhanced features online

## Project Structure

```
EduQuest/
├── app/
│   ├── page.tsx                 # Main app shell
│   ├── layout.tsx              # Root layout with theme
│   └── globals.css             # Theme and custom styles
│
├── components/
│   ├── subject-world.tsx       # Subject progression UI
│   ├── chapter-lesson.tsx      # Lesson content and progression
│   ├── teacher-dashboard.tsx   # Teacher/parent analytics
│   ├── offline-status.tsx      # Offline indicator & sync controls
│   ├── mini-games/
│   │   ├── timeline-game.tsx   # History timeline ordering
│   │   ├── drag-drop-game.tsx  # Science categorization
│   │   └── coding-puzzle.tsx   # Programming challenges
│   └── ui/                     # shadcn/ui components
│
├── hooks/
│   └── use-offline-sync.ts     # Offline functionality hooks
│
├── lib/
│   ├── offline-storage.ts      # Offline storage manager
│   └── utils.ts                # Utility functions
│
├── docs/
│   ├── OFFLINE_FIRST_ARCHITECTURE.md  # Offline system design
│   ├── FEATURE_SPECIFICATIONS.md      # Detailed feature specs
│   └── RESOURCE_OPTIMIZATION_GUIDE.md # Performance optimization
│
└── public/                      # Static assets
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern browser (Chrome, Firefox, Safari)

### Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

### Build for Production

```bash
# Create optimized build
npm run build

# Test production build locally
npm run start

# Check bundle size
npm run analyze
```

## Architecture Highlights

### Offline-First System

**Storage Layers**:
1. **LocalStorage**: Player progress, chapter states, game results
2. **Sync Queue**: Tracks changes while offline
3. **Auto-Sync**: Background sync every 5 minutes when online

**Data Flow**:
```
User Action
    ↓
Save Locally (LocalStorage)
    ↓
Add to Sync Queue
    ↓
(Online?) → Sync with Server
    ↓
Remove from Queue
    ↓
Update Metadata
```

### Mini-Game Architecture

**Timeline Game** (History):
- Drag-and-drop interface for chronological ordering
- Real-time feedback and scoring
- 2-minute time limit with countdown

**Drag-Drop Game** (Science):
- Category-based sorting with visual feedback
- Multiple items per category support
- Difficulty scaling (Easy/Medium/Hard)

**Coding Puzzle** (Computer):
- Visual block-based programming
- Sequence ordering with validation
- Output preview and error messages

### Teacher Dashboard

**Three Main Views**:
1. **Overview**: Key metrics, charts, and subject engagement
2. **Student List**: Sortable, filterable student cards with quick stats
3. **Student Detail**: In-depth performance analysis and insights

**Analytics**:
- Weekly activity trends
- Accuracy distribution
- Subject-wise progress
- Time-spent analytics
- At-risk student identification

## Data Structures

### Player Progress
```typescript
{
  playerId: string
  name: string
  level: number (1-100)
  xp: number
  streak: number
  totalBadges: number
  lastSyncDate: ISO8601
  lastUpdated: ISO8601
}
```

### Chapter State
```typescript
{
  chapterId: string
  subjectId: "history" | "science" | "computer"
  isCompleted: boolean
  progress: number (0-100)
  lessonProgress: { lessonId: number }
  score: number
  completedDate?: ISO8601
  lastAccessed: ISO8601
}
```

### Game Results
```typescript
{
  gameId: string
  chapterId: string
  gameType: "timeline" | "drag-drop" | "coding"
  score: number
  isCompleted: boolean
  attempts: number
  completedDate?: ISO8601
}
```

## API Integration (Future)

### Sync Endpoint
```http
POST /api/sync
Content-Type: application/json

{
  "playerId": "student-123",
  "items": [
    {
      "id": "sync-123",
      "action": "update-progress",
      "data": { ... },
      "timestamp": "2026-02-25T10:30:00Z"
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "synced": 5,
  "failed": 0,
  "serverTime": "2026-02-25T10:30:05Z"
}
```

## Usage Examples

### Accessing Offline Storage

```typescript
import { offlineStorage } from '@/lib/offline-storage'

// Save player progress
offlineStorage.savePlayerProgress({
  playerId: 'student-123',
  name: 'John Doe',
  level: 12,
  xp: 5200,
  streak: 7,
  totalBadges: 15
})

// Get progress
const progress = offlineStorage.getPlayerProgress()

// Manual sync
await offlineStorage.synchronizeWithServer()

// Check storage stats
const stats = offlineStorage.getStorageStats()
console.log(stats)
```

### Using Offline Sync Hook

```typescript
import { useOfflineSync } from '@/hooks/use-offline-sync'

function MyComponent() {
  const { isOnline, pendingItems, manualSync } = useOfflineSync()

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Pending: {pendingItems} items</p>
      <button onClick={manualSync}>Sync Now</button>
    </div>
  )
}
```

### Display Offline Status

```typescript
import { OfflineStatus, OfflineIndicator } from '@/components/offline-status'

// Detailed status card
<OfflineStatus />

// Compact inline badge
<OfflineStatus compact />

// Floating indicator
<OfflineIndicator />
```

## Performance Targets

| Metric | Target |
|--------|--------|
| APK Size | < 100 MB |
| Load Time | < 2 seconds |
| Mini-Game Start | < 1 second |
| Sync Time | < 3 seconds |
| Frame Rate | 60 FPS |
| Memory (idle) | < 50 MB |
| Battery (1h) | < 15% drain |

## Resource Optimization

### Image Strategy
- WebP format for modern devices (70% smaller)
- JPEG fallback for compatibility
- Compressed to < 50KB per image
- Resolution scaling for device DPI

### Code Optimization
- Main bundle: ~150KB (minified + gzipped)
- Lazy-loaded subject modules: ~50KB each
- Code splitting for mini-games
- Tree-shaking to remove unused code

### Storage Management
- LocalStorage: ~10MB safe limit
- Auto-cleanup of data older than 30 days
- Storage quota warnings at 80% usage
- Sync queue: < 1MB typical

## Curriculum Alignment

### History Quest
- Early Settlements (Bantu & Cushitic peoples)
- Trade Routes (Swahili coast, Indian Ocean trade)
- Colonial Period (British rule, railway, economy)
- Independence (Mau Mau, Jomo Kenyatta, Uhuru)
- Modern Kenya (Post-independence development)

### Science Explorer
- Living Things (Cell structure, life processes)
- Human Body (Digestive, respiratory, circulatory systems)
- Plants & Animals (Photosynthesis, food chains, ecosystems)
- Matter & Energy (States of matter, energy forms, reactions)

### Digital Pioneer
- Computer Basics (Hardware, software, I/O devices)
- Internet Safety (Online safety, privacy, digital footprint)
- Digital Communication (Email, social media, etiquette)
- Basic Programming (Algorithms, visual coding, logic)

## Accessibility Features

- High contrast mode support
- Text scaling up to 200%
- Keyboard navigation (Tab, Enter)
- Screen reader support (ARIA labels)
- Touch target size: minimum 44×44px
- Color-coded without relying on color alone

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Check test coverage
npm run test:coverage

# Performance testing
npm run test:performance
```

## Deployment

### To Vercel
```bash
npm run deploy
```

### Build Docker Image
```bash
docker build -t eduquest .
docker run -p 3000:3000 eduquest
```

## Documentation

- [Offline-First Architecture](./docs/OFFLINE_FIRST_ARCHITECTURE.md)
- [Feature Specifications](./docs/FEATURE_SPECIFICATIONS.md)
- [Resource Optimization Guide](./docs/RESOURCE_OPTIMIZATION_GUIDE.md)

## Roadmap

### Phase 1 (Current)
- Core gameplay mechanics
- Offline-first foundation
- Teacher dashboard MVP

### Phase 2 (Q3 2026)
- Service Workers for advanced offline
- Student-to-student leaderboards
- Advanced analytics
- Parental controls

### Phase 3 (Q4 2026)
- Machine learning for adaptive difficulty
- Voice-based lessons
- Offline video support
- Multi-language support

### Phase 4 (2027)
- Integration with national education systems
- Offline multiplayer
- Extended reality (AR) experiments
- Advanced assessment tools

## Performance Monitoring

### Key Metrics
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTL** (Time to Interactive): < 3.8s

### Monitoring Tools
- Lighthouse audits
- Web Vitals monitoring
- Real user monitoring (RUM)
- Bundle size analysis

## Security

- HTTPS enforcement for all API calls
- JWT-based authentication (future)
- End-to-end encryption (future phase)
- GDPR-compliant data deletion
- Input validation and sanitization

## License

MIT License - See LICENSE.md for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub or contact the development team.

## Team

Built with passion for education in Kenya 🇰🇪

---

## Quick Links

- [Live Demo](https://eduquest.vercel.app)
- [API Documentation](./docs/API.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

---

**EduQuest**: Learning Through Adventure
Making quality education accessible to every Kenyan learner, regardless of connectivity or device capability.
