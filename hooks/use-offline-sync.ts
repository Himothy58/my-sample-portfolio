/**
 * Custom React hook for offline-first functionality
 * Manages sync status, auto-sync, and offline detection
 */

import { useState, useEffect, useCallback } from "react"
import { offlineStorage } from "@/lib/offline-storage"

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  pendingItems: number
  lastSync: string
  syncError: string | null
}

interface UseOfflineSyncReturn extends SyncStatus {
  manualSync: () => Promise<void>
  clearPendingQueue: () => void
  getStorageStats: () => { totalSize: string; itemCount: number; syncQueueSize: number; lastSync: string }
}

/**
 * Hook for managing offline sync functionality
 */
export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingItems, setPendingItems] = useState(0)
  const [lastSync, setLastSync] = useState("Never")
  const [syncError, setSyncError] = useState<string | null>(null)

  // Initialize online status
  useEffect(() => {
    if (typeof window === "undefined" || !offlineStorage) return

    setIsOnline(offlineStorage.isOnline())
    const queue = offlineStorage.getSyncQueue()
    setPendingItems(queue.length)

    const metadata = offlineStorage.getMetadata()
    if (metadata) {
      setLastSync(new Date(metadata.lastSyncDate).toLocaleString())
    }
  }, [])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncError(null)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Manual sync function
  const manualSync = useCallback(async () => {
    if (!offlineStorage || !isOnline) {
      setSyncError("Device is offline")
      return
    }

    try {
      setIsSyncing(true)
      setSyncError(null)

      const result = await offlineStorage.synchronizeWithServer((synced, total) => {
        console.log(`[v0] Synced ${synced}/${total} items`)
      })

      if (result.success) {
        const queue = offlineStorage.getSyncQueue()
        setPendingItems(queue.length)

        const metadata = offlineStorage.getMetadata()
        if (metadata) {
          setLastSync(new Date(metadata.lastSyncDate).toLocaleString())
        }

        console.log(`[v0] Sync complete: ${result.syncedItems} items synced`)
      } else {
        setSyncError("Sync failed. Will retry when online.")
      }
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Sync error occurred")
      console.log("[v0] Sync error:", error)
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline])

  // Auto-sync when coming online
  useEffect(() => {
    if (!offlineStorage) return

    if (isOnline && pendingItems > 0) {
      const autoSyncTimer = setTimeout(() => {
        manualSync()
      }, 1000)

      return () => clearTimeout(autoSyncTimer)
    }
  }, [isOnline, pendingItems, manualSync])

  // Start auto-sync on mount
  useEffect(() => {
    if (!offlineStorage) return

    offlineStorage.startAutoSync(manualSync)

    return () => {
      offlineStorage.stopAutoSync()
    }
  }, [manualSync])

  const clearPendingQueue = useCallback(() => {
    if (offlineStorage) {
      offlineStorage.clearSyncQueue()
      setPendingItems(0)
    }
  }, [])

  const getStorageStats = useCallback(() => {
    if (!offlineStorage) {
      return { totalSize: "0 MB", itemCount: 0, syncQueueSize: 0, lastSync: "Never" }
    }
    return offlineStorage.getStorageStats()
  }, [])

  return {
    isOnline,
    isSyncing,
    pendingItems,
    lastSync,
    syncError,
    manualSync,
    clearPendingQueue,
    getStorageStats,
  }
}

/**
 * Hook for saving player progress with offline support
 */
export function useSaveProgress() {
  const { isOnline } = useOfflineSync()

  const saveProgress = useCallback(
    (progressData: {
      playerId: string
      name: string
      level: number
      xp: number
      streak: number
      totalBadges: number
    }) => {
      if (!offlineStorage) return

      const progress = {
        ...progressData,
        lastSyncDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      }

      offlineStorage.savePlayerProgress(progress)
      console.log("[v0] Progress saved locally", { online: isOnline })
    },
    [isOnline],
  )

  const getProgress = useCallback(() => {
    if (!offlineStorage) return null
    return offlineStorage.getPlayerProgress()
  }, [])

  return { saveProgress, getProgress }
}

/**
 * Hook for managing chapter state with offline support
 */
export function useSaveChapter() {
  const saveChapterState = useCallback(
    (chapterData: {
      chapterId: string
      subjectId: string
      isCompleted: boolean
      progress: number
      lessonProgress: Record<string, number>
      score: number
      completedDate?: string
    }) => {
      if (!offlineStorage) return

      offlineStorage.saveChapterState({
        ...chapterData,
        lastAccessed: new Date().toISOString(),
      })
      console.log("[v0] Chapter state saved")
    },
    [],
  )

  const getChapterState = useCallback((chapterId: string) => {
    if (!offlineStorage) return null
    return offlineStorage.getChapterState(chapterId)
  }, [])

  const getAllChapters = useCallback(() => {
    if (!offlineStorage) return []
    return offlineStorage.getAllChapters()
  }, [])

  return { saveChapterState, getChapterState, getAllChapters }
}

/**
 * Hook for managing game results with offline support
 */
export function useSaveGameResult() {
  const saveGameResult = useCallback(
    (gameData: {
      gameId: string
      chapterId: string
      gameType: "timeline" | "drag-drop" | "coding"
      score: number
      isCompleted: boolean
      attempts: number
      completedDate?: string
    }) => {
      if (!offlineStorage) return

      offlineStorage.saveGameResult(gameData)
      console.log("[v0] Game result saved")
    },
    [],
  )

  const getAllGameResults = useCallback(() => {
    if (!offlineStorage) return []
    return offlineStorage.getAllGameResults()
  }, [])

  return { saveGameResult, getAllGameResults }
}
