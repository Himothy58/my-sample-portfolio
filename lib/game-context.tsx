'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface GameScore {
  id: string
  user_id: string
  lesson_id: string
  game_type: string
  score: number
  max_score: number
  attempts: number
  time_taken: number | null
  completed_at: string
  created_at: string
}

interface GameContextType {
  currentGameScore: GameScore | null
  allGameScores: GameScore[]
  isLoadingScores: boolean
  submitGameScore: (
    lessonId: string,
    gameType: string,
    score: number,
    maxScore: number,
    attempts: number,
    timeTaken: number
  ) => Promise<GameScore | null>
  fetchGameScores: (lessonId?: string) => Promise<void>
  getLessonGameScores: (lessonId: string) => GameScore[]
  getBestScore: (lessonId: string, gameType: string) => number | null
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentGameScore, setCurrentGameScore] = useState<GameScore | null>(null)
  const [allGameScores, setAllGameScores] = useState<GameScore[]>([])
  const [isLoadingScores, setIsLoadingScores] = useState(false)

  const submitGameScore = useCallback(
    async (
      lessonId: string,
      gameType: string,
      score: number,
      maxScore: number,
      attempts: number,
      timeTaken: number
    ) => {
      try {
        const response = await fetch('/api/games/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: lessonId,
            game_type: gameType,
            score,
            max_score: maxScore,
            attempts,
            time_taken: timeTaken,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setCurrentGameScore(data.gameScore)
          setAllGameScores((prev) => {
            // Update existing score or add new one
            const existing = prev.findIndex(
              (s) => s.lesson_id === lessonId && s.game_type === gameType
            )
            if (existing >= 0) {
              const updated = [...prev]
              updated[existing] = data.gameScore
              return updated
            }
            return [...prev, data.gameScore]
          })
          return data.gameScore
        }
      } catch (error) {
        console.error('Failed to submit game score:', error)
      }
      return null
    },
    []
  )

  const fetchGameScores = useCallback(async (lessonId?: string) => {
    setIsLoadingScores(true)
    try {
      const url = lessonId ? `/api/games/score?lesson_id=${lessonId}` : '/api/games/score'
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        setAllGameScores(data.scores)
      }
    } catch (error) {
      console.error('Failed to fetch game scores:', error)
    } finally {
      setIsLoadingScores(false)
    }
  }, [])

  const getLessonGameScores = useCallback(
    (lessonId: string) => {
      return allGameScores.filter((score) => score.lesson_id === lessonId)
    },
    [allGameScores]
  )

  const getBestScore = useCallback(
    (lessonId: string, gameType: string) => {
      const score = allGameScores.find((s) => s.lesson_id === lessonId && s.game_type === gameType)
      return score ? score.score : null
    },
    [allGameScores]
  )

  return (
    <GameContext.Provider
      value={{
        currentGameScore,
        allGameScores,
        isLoadingScores,
        submitGameScore,
        fetchGameScores,
        getLessonGameScores,
        getBestScore,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
