'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface ChapterProgress {
  id: string
  user_id: string
  chapter_id: string
  progress_percent: number
  completed_at: string | null
  last_accessed: string
}

export interface LessonCompletion {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string
  score: number | null
  xp_earned: number
  attempts: number
}

interface ProgressContextType {
  chapterProgress: Map<string, ChapterProgress>
  lessonCompletions: Map<string, LessonCompletion>
  isLoading: boolean
  fetchChapterProgress: (chapterId: string) => Promise<ChapterProgress>
  fetchLessonCompletion: (lessonId: string) => Promise<LessonCompletion | null>
  updateChapterProgress: (chapterId: string, progressPercent: number) => Promise<void>
  completeLession: (lessonId: string, score: number, xpEarned: number) => Promise<void>
  getAllProgress: () => Promise<void>
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [chapterProgress, setChapterProgress] = useState<Map<string, ChapterProgress>>(new Map())
  const [lessonCompletions, setLessonCompletions] = useState<Map<string, LessonCompletion>>(new Map())
  const [isLoading, setIsLoading] = useState(false)

  const fetchChapterProgress = useCallback(async (chapterId: string) => {
    try {
      const response = await fetch(`/api/progress/chapters/${chapterId}`)
      if (response.ok) {
        const data = await response.json()
        setChapterProgress((prev) => new Map(prev).set(chapterId, data.progress))
        return data.progress
      }
    } catch (error) {
      console.error('Failed to fetch chapter progress:', error)
    }
    return null
  }, [])

  const fetchLessonCompletion = useCallback(async (lessonId: string) => {
    try {
      const response = await fetch(`/api/progress/lessons/${lessonId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.completion) {
          setLessonCompletions((prev) => new Map(prev).set(lessonId, data.completion))
          return data.completion
        }
      }
    } catch (error) {
      console.error('Failed to fetch lesson completion:', error)
    }
    return null
  }, [])

  const updateChapterProgress = useCallback(async (chapterId: string, progressPercent: number) => {
    try {
      const response = await fetch(`/api/progress/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress_percent: progressPercent }),
      })

      if (response.ok) {
        const data = await response.json()
        setChapterProgress((prev) => new Map(prev).set(chapterId, data.progress))
      }
    } catch (error) {
      console.error('Failed to update chapter progress:', error)
    }
  }, [])

  const completeLession = useCallback(async (lessonId: string, score: number, xpEarned: number) => {
    try {
      const response = await fetch('/api/progress/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_id: lessonId, score, xp_earned: xpEarned }),
      })

      if (response.ok) {
        const data = await response.json()
        setLessonCompletions((prev) => new Map(prev).set(lessonId, data.completion))
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error)
    }
  }, [])

  const getAllProgress = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/progress')
      if (response.ok) {
        const data = await response.json()
        const chaptersMap = new Map(data.chapters.map((c: ChapterProgress) => [c.chapter_id, c]))
        const lessonsMap = new Map(data.lessons.map((l: LessonCompletion) => [l.lesson_id, l]))
        setChapterProgress(chaptersMap)
        setLessonCompletions(lessonsMap)
      }
    } catch (error) {
      console.error('Failed to fetch all progress:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <ProgressContext.Provider
      value={{
        chapterProgress,
        lessonCompletions,
        isLoading,
        fetchChapterProgress,
        fetchLessonCompletion,
        updateChapterProgress,
        completeLession,
        getAllProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}
