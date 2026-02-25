# EduQuest Offline-First Architecture

## Overview

EduQuest is designed as an offline-first educational game that prioritizes accessibility on low-bandwidth, affordable Android devices in Kenya. The system ensures learners can continue their educational journey even without internet connectivity, with automatic synchronization when online.

## Core Design Principles

### 1. **Progressive Enhancement**
- **Core Functionality**: All essential learning content and gameplay works offline
- **Enhanced Features**: Analytics, leaderboards, and social features sync when online
- **Graceful Degradation**: Missing features don't break the learning experience

### 2. **Data Minimization**
- **Small Footprint**: APK size kept under 100MB
- **Selective Caching**: Only essential educational content cached locally
- **Incremental Downloads**: Assets downloaded on-demand, not upfront
- **Compression**: Images and media compressed for low-bandwidth delivery

### 3. **Sync-First Approach**
- **Queue-Based**: All changes queued locally, synced when possible
- **Conflict-Free**: Timestamps and versioning prevent data conflicts
- **Automatic**: Background sync every 5 minutes when online
- **Manual Option**: Users can trigger sync at any time

## Technical Architecture

### Local Storage Layer

#### Storage Mechanism: LocalStorage
- **Why LocalStorage**: Simple, no setup required, persistent across sessions
- **Size Limit**: ~5-10MB per domain (sufficient for game progress)
- **Structure**: JSON-based key-value pairs
- **Future Upgrade**: IndexedDB for larger datasets

#### Data Structures

```typescript
// Player Progress
{
  playerId: string
  name: string
  level: number
  xp: number
  streak: number
  totalBadges: number
  lastSyncDate: ISO8601
  lastUpdated: ISO8601
}

// Chapter State
{
  chapterId: string
  subjectId: string
  isCompleted: boolean
  progress: number (0-100)
  lessonProgress: { lessonId: number }
  score: number
  completedDate?: ISO8601
  lastAccessed: ISO8601
}

// Game Results
{
  gameId: string
  chapterId: string
  gameType: "timeline" | "drag-drop" | "coding"
  score: number
  isCompleted: boolean
  attempts: number
  completedDate?: ISO8601
}

// Sync Queue Item
{
  id: string (unique identifier)
  action: "update-progress" | "complete-chapter" | "save-game"
  data: { ... }
  timestamp: ISO8601
  synced: boolean
  retries: number (0-3)
}
```

### Synchronization Protocol

#### Sync Cycle

```
1. Online Detection
   ├─ Window.navigator.onLine check
   └─ Periodic connectivity test

2. Queue Processing
   ├─ Get unsync'd items from queue
   ├─ Batch items (max 10 per sync)
   └─ Apply retry logic (max 3 attempts)

3. Server Sync
   ├─ POST to /api/sync
   ├─ Send batch with timestamps
   └─ Receive server confirmation

4. Cleanup
   ├─ Remove synced items
   ├─ Update sync metadata
   └─ Emit sync completion event
```

#### Sync Triggers

1. **Automatic**: Every 5 minutes when online
2. **Connection Recovery**: When device comes online
3. **Manual**: User-triggered via UI button
4. **Event-Based**: After completing lessons/games

#### Conflict Resolution

- **Last-Write-Wins**: Server timestamp wins on conflicts
- **Timestamp Validation**: Client timestamps verified against server time
- **Idempotent Operations**: Each sync action safe to retry
- **Version Tracking**: Metadata tracks schema version for migrations

### Offline Detection & Handling

#### Detection Methods
```typescript
// Primary method
navigator.onLine

// Fallback: Test request
fetch('/api/health', { method: 'HEAD', cache: 'no-store' })

// Events
window.addEventListener('online', ...)
window.addEventListener('offline', ...)
```

#### Graceful Degradation
- **Offline**: All UI elements work, data saved locally
- **Pending Sync**: User sees notification, continue playing
- **Sync Error**: Automatic retry, manual retry option
- **Recovery**: Auto-sync when connectivity restored

### Performance Optimization

#### Asset Management

1. **Lazy Loading**
   - Load lesson content on-demand
   - Cache after first use
   - Pre-load next lesson while playing

2. **Image Optimization**
   - WebP format for modern devices
   - Fallback JPEG for older devices
   - Resolution scaling (1x, 2x)
   - Size limits: Icons ≤10KB, Images ≤50KB

3. **Code Splitting**
   - Mini-games loaded separately
   - Subject content modular
   - Teacher dashboard optional

#### Battery & Bandwidth Optimization

| Aspect | Strategy |
|--------|----------|
| Animations | Minimal, use CSS transforms |
| Updates | Debounced (500ms intervals) |
| Sync Frequency | Every 5 minutes (configurable) |
| Compression | Gzip for API responses |
| Battery | Avoid constant polling |

### Database Schema Migration

#### Migration Strategy
```
1. Schema Versioning
   - Track in metadata.version
   - Increment on breaking changes

2. Migration Helpers
   - Automatic schema updates
   - Data transformation on-device
   - Backward compatibility

3. Rollback
   - Keep previous data intact
   - Version-aware restore
```

## API Integration (Future)

### Sync Endpoint

```http
POST /api/sync HTTP/1.1
Content-Type: application/json
Authorization: Bearer {token}

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

Response 200:
{
  "success": true,
  "synced": 5,
  "failed": 0,
  "serverTime": "2026-02-25T10:30:05Z"
}
```

## Usage Examples

### Saving Player Progress

```typescript
import { useSaveProgress } from '@/hooks/use-offline-sync'

function MyComponent() {
  const { saveProgress } = useSaveProgress()

  const handleLevelUp = () => {
    saveProgress({
      playerId: 'student-123',
      name: 'John Doe',
      level: 12,
      xp: 5200,
      streak: 7,
      totalBadges: 15
    })
  }

  return <button onClick={handleLevelUp}>Level Up</button>
}
```

### Checking Offline Status

```typescript
import { useOfflineSync } from '@/hooks/use-offline-sync'

function SyncStatus() {
  const { isOnline, pendingItems, manualSync } = useOfflineSync()

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Pending Items: {pendingItems}</p>
      <button onClick={manualSync}>Sync Now</button>
    </div>
  )
}
```

### Displaying Offline Indicator

```typescript
import { OfflineIndicator, OfflineStatus } from '@/components/offline-status'

// Minimal inline indicator
<OfflineIndicator />

// Detailed status card
<OfflineStatus />

// Compact badge
<OfflineStatus compact />
```

## Monitoring & Analytics

### Storage Statistics

```typescript
const stats = offlineStorage.getStorageStats()
// Returns:
{
  totalSize: "2.45 MB",
  itemCount: 245,
  syncQueueSize: 3,
  lastSync: "2026-02-25T10:30:00Z"
}
```

### Sync Queue Inspection

```typescript
const queue = offlineStorage.getSyncQueue()
// Monitor pending operations
queue.forEach(item => {
  console.log(item.action, item.synced ? 'synced' : 'pending')
})
```

## Security Considerations

### Data Protection

1. **Encryption** (Future Enhancement)
   - Encrypt sensitive data at rest
   - Use Web Crypto API for client-side encryption
   - Server-side encryption for transit

2. **Authentication**
   - Verify playerId on sync
   - Use JWT or session tokens
   - HTTPS enforcement for all API calls

3. **Data Privacy**
   - Don't store sensitive credentials locally
   - Clear cache on logout
   - GDPR-compliant data deletion

### Input Validation

```typescript
// Validate all locally saved data
const validateProgress = (data) => {
  if (data.xp < 0 || data.xp > 999999) throw new Error('Invalid XP')
  if (data.level < 1 || data.level > 100) throw new Error('Invalid level')
  return true
}
```

## Testing Strategy

### Unit Tests
```typescript
// Test offline storage
describe('OfflineStorage', () => {
  it('should save and retrieve progress', () => {
    storage.savePlayerProgress(mockProgress)
    expect(storage.getPlayerProgress()).toEqual(mockProgress)
  })

  it('should add to sync queue', () => {
    storage.savePlayerProgress(mockProgress)
    const queue = storage.getSyncQueue()
    expect(queue.length).toBe(1)
  })
})
```

### Integration Tests
```typescript
// Test sync flow
describe('Sync Flow', () => {
  it('should sync offline changes when online', async () => {
    // Save offline
    storage.savePlayerProgress(mockProgress)
    
    // Come online
    simulateOnline()
    
    // Verify sync
    await storage.synchronizeWithServer()
    expect(storage.getSyncQueue().length).toBe(0)
  })
})
```

## Deployment Considerations

### Build Optimization

1. **Code Splitting**
   ```
   - Main bundle: 150KB
   - History world: 50KB
   - Science world: 60KB
   - Computer world: 55KB
   - Teacher dashboard: 40KB
   ```

2. **Asset Optimization**
   ```
   - Images: 200KB total
   - Audio: 100KB total (optional)
   - Fonts: 50KB
   - Total APK: < 100MB
   ```

### Monitoring

1. **Storage Usage**
   - Alert when > 8MB used
   - Suggest clearing old data

2. **Sync Health**
   - Track sync success rate
   - Monitor retry counts
   - Alert on repeated failures

3. **Performance**
   - Track app startup time
   - Monitor frame rates
   - Measure battery impact

## Future Enhancements

### Phase 2
- [ ] IndexedDB for larger datasets
- [ ] Service Workers for advanced offline features
- [ ] Background Sync API for reliable sync
- [ ] Push notifications for updates

### Phase 3
- [ ] End-to-end encryption
- [ ] Peer-to-peer sync
- [ ] Offline multiplayer
- [ ] Advanced analytics

### Phase 4
- [ ] ML-based progress prediction
- [ ] Adaptive difficulty
- [ ] Personalized learning paths
- [ ] Integration with national curriculum

## Troubleshooting

### Sync Issues
- Check network connectivity
- Clear browser cache if corrupted
- Verify server API is accessible
- Check local storage quota

### Storage Issues
- Export and clear old data
- Check device storage space
- Verify localStorage is enabled
- Try alternative storage (IndexedDB)

### Performance Issues
- Disable animations on low-end devices
- Reduce image quality
- Limit concurrent operations
- Profile with DevTools

## References

- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
