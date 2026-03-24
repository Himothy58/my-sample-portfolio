'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { useProgress } from '@/lib/progress-context'
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react'

interface Chapter {
  id: string
  subject_id: string
  chapter_number: number
  title: string
  description: string
  xp_reward: number
}

interface Subject {
  id: string
  name: string
  description: string
}

export default function SubjectPage() {
  const router = useRouter()
  const params = useParams()
  const subjectId = params.subjectId as string
  const { user, isLoading: authLoading } = useAuth()
  const { chapterProgress } = useProgress()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (subjectId) {
      fetchSubjectAndChapters()
    }
  }, [subjectId, authLoading, user, router])

  const fetchSubjectAndChapters = async () => {
    try {
      const [subjectRes, chaptersRes] = await Promise.all([
        fetch(`/api/subjects/${subjectId}`),
        fetch(`/api/chapters?subject_id=${subjectId}`),
      ])

      if (subjectRes.ok) {
        const subjectData = await subjectRes.json()
        setSubject(subjectData.subject)
      }

      if (chaptersRes.ok) {
        const chaptersData = await chaptersRes.json()
        setChapters(chaptersData.chapters)
      }
    } catch (error) {
      console.error('Failed to fetch subject data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Subject not found</h2>
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
          <h1 className="text-3xl font-bold text-gray-900">{subject.name}</h1>
          <p className="text-gray-600 mt-2">{subject.description}</p>
        </div>
      </div>

      {/* Chapters */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {chapters.length > 0 ? (
            chapters.map((chapter) => {
              const progress = chapterProgress.get(chapter.id) || 0
              const isCompleted = progress === 100

              return (
                <Card
                  key={chapter.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/learn/chapter/${chapter.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          Chapter {chapter.chapter_number}: {chapter.title}
                        </h3>
                        {isCompleted && <CheckCircle className="w-6 h-6 text-green-600" />}
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{chapter.description}</p>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span className="text-gray-700">Progress</span>
                            <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <span>+{chapter.xp_reward} XP available</span>
                        </div>
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
              <p className="text-gray-600">No chapters available for this subject yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
