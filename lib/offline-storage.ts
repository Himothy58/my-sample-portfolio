/**
 * EduQuest Offline-First Storage System
 * Manages local data persistence, sync protocols, and bandwidth optimization
 */

interface PlayerProgress {
  playerId: string
  name: string
  level: number
  xp: number
  streak: number
  totalBadges: number
  lastSyncDate: string
  lastUpdated: string
}

interface ChapterState {
  chapterId: string
  subjectId: string
  isCompleted: boolean
  progress: number
  lessonProgress: Record<string, number>
  score: number
  completedDate?: string
  lastAccessed: string
}

interface GameState {
  gameId: string
  chapterId: string
  gameType: "timeline" | "drag-drop" | "coding"
  score: number
  isCompleted: boolean
  attempts: number
  completedDate?: string
}

interface SyncQueue {
  id: string
  action: "update-progress" | "complete-chapter" | "save-game"
  data: Record<string, unknown>
  timestamp: string
  synced: boolean
  retries: number
}

interface StorageMetadata {
  version: number
  lastSyncDate: string
  totalDataSize: number
  cacheVersion: string
}

/**
 * OfflineStorage - Handles all local data persistence and synchronization
 */
export class OfflineStorage {
  private readonly DB_NAME = "EduQuest"
  private readonly SYNC_QUEUE_KEY = "sync_queue"
  private readonly METADATA_KEY = "metadata"
  private readonly PLAYER_KEY = "player_progress"
  private readonly CHAPTERS_KEY = "chapters"
  private readonly GAMES_KEY = "games"
  private readonly VERSION = 1
  private readonly MAX_SYNC_RETRIES = 3
  private readonly SYNC_INTERVAL = 300000 // 5 minutes
  private syncIntervalId: NodeJS.Timeout | null = null

  constructor() {
    this.initializeStorage()
  }

  /**
   * Initialize storage with metadata and default structure
   */
  private initializeStorage(): void {
    if (typeof window === "undefined") return

    try {
      const metadata = this.getMetadata()
      if (!metadata) {
        this.setMetadata({
          version: this.VERSION,
          lastSyncDate: new Date().toISOString(),
          totalDataSize: 0,
          cacheVersion: "1.0",
        })
      }
    } catch (error) {
      console.log("[v0] Storage initialization failed:", error)
    }
  }

  /**
   * Get metadata about storage
   */
  private getMetadata(): StorageMetadata | null {
    try {
      const data = localStorage.getItem(this.METADATA_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.log("[v0] Error reading metadata:", error)
      return null
    }
  }

  /**
   * Set metadata
   */
  private setMetadata(metadata: StorageMetadata): void {
    try {
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata))
    } catch (error) {
      console.log("[v0] Error writing metadata:", error)
    }
  }

  /**
   * Save player progress locally
   */
  savePlayerProgress(progress: PlayerProgress): void {
    try {
      const currentProgress = this.getPlayerProgress()
      const updatedProgress: PlayerProgress = {
        ...currentProgress,
        ...progress,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(this.PLAYER_KEY, JSON.stringify(updatedProgress))
      this.addToSyncQueue("update-progress", { playerProgress: updatedProgress })
    } catch (error) {
      console.log("[v0] Error saving player progress:", error)
    }
  }

  /**
   * Get player progress from local storage
   */
  getPlayerProgress(): PlayerProgress {
    try {
      const data = localStorage.getItem(this.PLAYER_KEY)
      return data
        ? JSON.parse(data)
        : {
            playerId: "local-" + Date.now(),
            name: "Student",
            level: 1,
            xp: 0,
            streak: 0,
            totalBadges: 0,
            lastSyncDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          }
    } catch (error) {
      console.log("[v0] Error reading player progress:", error)
      return {
        playerId: "local-" + Date.now(),
        name: "Student",
        level: 1,
        xp: 0,
        streak: 0,
        totalBadges: 0,
        lastSyncDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      }
    }
  }

  /**
   * Save chapter completion state
   */
  saveChapterState(state: ChapterState): void {
    try {
      const chapters = this.getAllChapters()
      const index = chapters.findIndex((c) => c.chapterId === state.chapterId)

      if (index !== -1) {
        chapters[index] = { ...state, lastAccessed: new Date().toISOString() }
      } else {
        chapters.push({ ...state, lastAccessed: new Date().toISOString() })
      }

      localStorage.setItem(this.CHAPTERS_KEY, JSON.stringify(chapters))
      this.addToSyncQueue("complete-chapter", { chapterState: state })
    } catch (error) {
      console.log("[v0] Error saving chapter state:", error)
    }
  }

  /**
   * Get all saved chapters
   */
  getAllChapters(): ChapterState[] {
    try {
      const data = localStorage.getItem(this.CHAPTERS_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.log("[v0] Error reading chapters:", error)
      return []
    }
  }

  /**
   * Get specific chapter state
   */
  getChapterState(chapterId: string): ChapterState | null {
    const chapters = this.getAllChapters()
    return chapters.find((c) => c.chapterId === chapterId) || null
  }

  /**
   * Save game result
   */
  saveGameResult(gameState: GameState): void {
    try {
      const games = this.getAllGameResults()
      const index = games.findIndex((g) => g.gameId === gameState.gameId)

      if (index !== -1) {
        games[index] = gameState
      } else {
        games.push(gameState)
      }

      localStorage.setItem(this.GAMES_KEY, JSON.stringify(games))
      this.addToSyncQueue("save-game", { gameState })
    } catch (error) {
      console.log("[v0] Error saving game result:", error)
    }
  }

  /**
   * Get all game results
   */
  getAllGameResults(): GameState[] {
    try {
      const data = localStorage.getItem(this.GAMES_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.log("[v0] Error reading game results:", error)
      return []
    }
  }

  /**
   * Add action to sync queue for later synchronization
   */
  private addToSyncQueue(action: SyncQueue["action"], data: Record<string, unknown>): void {
    try {
      const queue = this.getSyncQueue()
      const syncItem: SyncQueue = {
        id: `sync-${Date.now()}-${Math.random()}`,
        action,
        data,
        timestamp: new Date().toISOString(),
        synced: false,
        retries: 0,
      }
      queue.push(syncItem)
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue))
    } catch (error) {
      console.log("[v0] Error adding to sync queue:", error)
    }
  }

  /**
   * Get current sync queue
   */
  getSyncQueue(): SyncQueue[] {
    try {
      const data = localStorage.getItem(this.SYNC_QUEUE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.log("[v0] Error reading sync queue:", error)
      return []
    }
  }

  /**
   * Clear sync queue (after successful sync)
   */
  clearSyncQueue(): void {
    try {
      localStorage.removeItem(this.SYNC_QUEUE_KEY)
      const metadata = this.getMetadata()
      if (metadata) {
        metadata.lastSyncDate = new Date().toISOString()
        this.setMetadata(metadata)
      }
    } catch (error) {
      console.log("[v0] Error clearing sync queue:", error)
    }
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    if (typeof window === "undefined") return false
    return navigator.onLine
  }

  /**
   * Start periodic sync when online
   */
  startAutoSync(onSyncCallback?: () => Promise<void>): void {
    if (this.syncIntervalId) return

    this.syncIntervalId = setInterval(async () => {
      if (this.isOnline() && onSyncCallback) {
        try {
          await onSyncCallback()
        } catch (error) {
          console.log("[v0] Auto sync error:", error)
        }
      }
    }, this.SYNC_INTERVAL)
  }

  /**
   * Stop periodic sync
   */
  stopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId)
      this.syncIntervalId = null
    }
  }

  /**
   * Simulate synchronization with server
   * In production, this would make actual API calls
   */
  async synchronizeWithServer(
    onProgress?: (synced: number, total: number) => void,
  ): Promise<{ success: boolean; syncedItems: number; failedItems: number }> {
    if (!this.isOnline()) {
      console.log("[v0] Device offline, skipping sync")
      return { success: false, syncedItems: 0, failedItems: 0 }
    }

    try {
      const queue = this.getSyncQueue()
      if (queue.length === 0) {
        console.log("[v0] No items to sync")
        return { success: true, syncedItems: 0, failedItems: 0 }
      }

      let syncedItems = 0
      let failedItems = 0

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i]
        if (item.synced) continue

        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 100))

          // In production, this would be:
          // const response = await fetch('/api/sync', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(item)
          // })

          console.log("[v0] Synced:", item.action)
          item.synced = true
          syncedItems++
        } catch (error) {
          item.retries++
          if (item.retries >= this.MAX_SYNC_RETRIES) {
            console.log("[v0] Max retries exceeded for:", item.id)
            failedItems++
          }
        }

        if (onProgress) {
          onProgress(syncedItems + failedItems, queue.length)
        }
      }

      // Remove synced items from queue
      const remainingQueue = queue.filter((item) => !item.synced)
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(remainingQueue))

      // Update metadata
      const metadata = this.getMetadata()
      if (metadata) {
        metadata.lastSyncDate = new Date().toISOString()
        this.setMetadata(metadata)
      }

      return { success: true, syncedItems, failedItems }
    } catch (error) {
      console.log("[v0] Synchronization error:", error)
      return { success: false, syncedItems: 0, failedItems: 0 }
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): {
    totalSize: string
    itemCount: number
    syncQueueSize: number
    lastSync: string
  } {
    try {
      let totalSize = 0
      const keys = Object.keys(localStorage)

      for (const key of keys) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += value.length + key.length
        }
      }

      const sizeInMB = (totalSize / 1024 / 1024).toFixed(2)
      const metadata = this.getMetadata()
      const queue = this.getSyncQueue()

      return {
        totalSize: `${sizeInMB} MB`,
        itemCount: keys.length,
        syncQueueSize: queue.length,
        lastSync: metadata?.lastSyncDate || "Never",
      }
    } catch (error) {
      console.log("[v0] Error getting storage stats:", error)
      return {
        totalSize: "Unknown",
        itemCount: 0,
        syncQueueSize: 0,
        lastSync: "Never",
      }
    }
  }

  /**
   * Clear all local data (careful!)
   */
  clearAllData(): void {
    try {
      localStorage.removeItem(this.PLAYER_KEY)
      localStorage.removeItem(this.CHAPTERS_KEY)
      localStorage.removeItem(this.GAMES_KEY)
      localStorage.removeItem(this.SYNC_QUEUE_KEY)
      console.log("[v0] All local data cleared")
    } catch (error) {
      console.log("[v0] Error clearing data:", error)
    }
  }
}

// Export singleton instance
export const offlineStorage = typeof window !== "undefined" ? new OfflineStorage() : null
