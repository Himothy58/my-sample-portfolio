'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { useProgress } from '@/lib/progress-context'
import { ArrowLeft, BookOpen, CheckCircle, PlayCircle } from 'lucide-react'

interface Lesson {
  id: string
  chapter_id: string
  lesson_number: number
  title: string
  lesson_type: 'story' | 'interactive' | 'quiz' | 'mini-game'
  xp_reward: number
  game_type?: string
  content?: any
}

interface Chapter {
  id: string
  chapter_number: number
  title: string
  description: string
  xp_reward: number
}

export default function ChapterPage() {
  const router = useRouter()
  const params = useParams()
  const chapterId = params.chapterId as string
  const { user, isLoading: authLoading } = useAuth()
  const { lessonCompletions } = useProgress()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (chapterId) {
      fetchChapterAndLessons()
    }
  }, [chapterId, authLoading, user, router])

  const fetchChapterAndLessons = async () => {
    try {
      const [chapterRes, lessonsRes] = await Promise.all([
        fetch(`/api/chapters/${chapterId}`),
        fetch(`/api/lessons?chapter_id=${chapterId}`),
      ])

      if (chapterRes.ok) {
        const chapterData = await chapterRes.json()
        setChapter(chapterData.chapter)
      }

      if (lessonsRes.ok) {
        const lessonsData = await lessonsRes.json()
        setLessons(lessonsData.lessons)
      }
    } catch (error) {
      console.error('Failed to fetch chapter data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'story':
        return BookOpen
      case 'quiz':
        return CheckCircle
      case 'mini-game':
        return PlayCircle
      default:
        return BookOpen
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'story':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'quiz':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'mini-game':
        return 'bg-green-50 text-green-700 border-green-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Chapter not found</h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Chapter {chapter.chapter_number}: {chapter.title}
          </h1>
          <p className="text-gray-600 mt-2">{chapter.description}</p>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-orange-600 font-semibold">+{chapter.xp_reward} XP available</span>
            <span className="text-sm text-gray-600">{lessons.length} lessons</span>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {lessons.length > 0 ? (
            lessons.map((lesson) => {
              const isCompleted = lessonCompletions.has(lesson.id)
              const Icon = getIcon(lesson.lesson_type)

              return (
                <Card
                  key={lesson.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/learn/lesson/${lesson.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-lg ${getTypeColor(
                            lesson.lesson_type
                          )}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{lesson.title}</h3>
                          <p className="text-xs text-gray-600 capitalize">
                            {lesson.lesson_type} • +{lesson.xp_reward} XP
                          </p>
                        </div>
                        {isCompleted && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
                      </div>
                    </div>

                    <Button className="ml-4 bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                      {isCompleted ? 'Review' : 'Start'}
                    </Button>
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No lessons available for this chapter yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
