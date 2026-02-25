"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff, Wifi, RefreshCw, AlertCircle, Cloud, Database } from "lucide-react"
import { useOfflineSync } from "@/hooks/use-offline-sync"

interface OfflineStatusProps {
  compact?: boolean
}

/**
 * Component displaying offline sync status and controls
 */
export function OfflineStatus({ compact = false }: OfflineStatusProps) {
  const { isOnline, isSyncing, pendingItems, lastSync, syncError, manualSync, getStorageStats } = useOfflineSync()
  const [showDetails, setShowDetails] = useState(false)
  const [storageStats, setStorageStats] = useState({ totalSize: "0 MB", itemCount: 0, syncQueueSize: 0 })

  useEffect(() => {
    const stats = getStorageStats()
    setStorageStats(stats)
  }, [getStorageStats])

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Badge variant="secondary" className="gap-1">
            <Wifi className="w-3 h-3" />
            Online
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <WifiOff className="w-3 h-3" />
            Offline
          </Badge>
        )}

        {pendingItems > 0 && (
          <Badge variant="outline" className="gap-1">
            <Cloud className="w-3 h-3" />
            {pendingItems} pending
          </Badge>
        )}

        {isSyncing && (
          <Badge className="gap-1 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Syncing
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-600" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-600" />
                <span>Offline Mode</span>
              </>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isOnline
              ? "Your progress will sync automatically with the server."
              : "You're in offline mode. Your progress is saved locally and will sync when online."}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? "Hide" : "Show"} Details
        </Button>
      </div>

      {/* Error Alert */}
      {syncError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{syncError}</AlertDescription>
        </Alert>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold">{pendingItems}</div>
          <div className="text-xs text-muted-foreground">Pending Items</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold">{isSyncing ? "..." : "Ready"}</div>
          <div className="text-xs text-muted-foreground">Sync Status</div>
        </div>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="border-t pt-4 space-y-4">
          {/* Sync Information */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Synchronization
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Sync:</span>
                <span className="font-medium">{lastSync}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sync Interval:</span>
                <span className="font-medium">Every 5 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connection Status:</span>
                <span className="font-medium">{isOnline ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </div>

          {/* Storage Information */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Local Storage
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Size:</span>
                <span className="font-medium">{storageStats.totalSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items Stored:</span>
                <span className="font-medium">{storageStats.itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sync Queue:</span>
                <span className="font-medium">{storageStats.syncQueueSize} items</span>
              </div>
            </div>
          </div>

          {/* Sync Controls */}
          <div className="pt-2 border-t">
            <Button
              onClick={manualSync}
              disabled={isSyncing || !isOnline}
              className="w-full gap-2"
              variant={pendingItems > 0 ? "default" : "outline"}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {pendingItems > 0 ? `Sync ${pendingItems} Items` : "Sync Now"}
                </>
              )}
            </Button>

            {!isOnline && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Sync will start automatically when you're online
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tech Specs Card */}
      <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg text-xs text-muted-foreground border border-blue-200/50 dark:border-blue-800/50">
        <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Tech Stack</div>
        <ul className="space-y-1">
          <li>Storage: LocalStorage (for browsers)</li>
          <li>Sync: Queue-based background sync</li>
          <li>Size Limit: ~5-10MB per device</li>
          <li>Sync Frequency: Every 5 minutes when online</li>
        </ul>
      </div>
    </Card>
  )
}

/**
 * Minimal inline offline indicator
 */
export function OfflineIndicator() {
  const { isOnline, pendingItems, isSyncing } = useOfflineSync()

  if (isOnline && !pendingItems) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto">
      <Alert className={isSyncing ? "bg-blue-50 dark:bg-blue-900/20" : "bg-yellow-50 dark:bg-yellow-900/20"}>
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 text-red-600" />
              <span className="text-sm">
                You're offline. Your progress is saved and will sync when connected.
              </span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm">Syncing your progress...</span>
            </>
          ) : pendingItems > 0 ? (
            <>
              <Cloud className="w-4 h-4 text-yellow-600" />
              <span className="text-sm">{pendingItems} items waiting to sync</span>
            </>
          ) : null}
        </div>
      </Alert>
    </div>
  )
}
