'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useProgress } from '@/lib/progress-context'
import { LogOut, BookOpen, Trophy, Zap } from 'lucide-react'

interface Subject {
  id: string
  name: string
  description: string
  color: string
  total_chapters: number
}

interface ChapterProgress {
  chapter_id: string
  progress_percent: number
}

export default function LearnPage() {
  const router = useRouter()
  const { user, studentProfile, isLoading, logout } = useAuth()
  const { getAllProgress } = useProgress()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapterProgress, setChapterProgress] = useState<Map<string, number>>(new Map())
  const [loadingSubjects, setLoadingSubjects] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch subjects and student progress only when user is confirmed
      if (user) {
        fetchSubjects()
        getAllProgress()
      }
    }
  }, [isLoading, user])

  const fetchSubjects = async () => {
    try {
      const [subjectsRes, progressRes] = await Promise.all([
        fetch('/api/subjects'),
        fetch('/api/progress'),
      ])

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json()
        setSubjects(subjectsData.subjects)
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json()
        const progressMap = new Map<string, number>()
        progressData.chapters.forEach((chapter: ChapterProgress) => {
          progressMap.set(chapter.chapter_id, chapter.progress_percent)
        })
        setChapterProgress(progressMap)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoadingSubjects(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading || loadingSubjects) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">EduQuest</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            {studentProfile && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Level {studentProfile.level}</div>
                <div className="text-lg font-semibold text-orange-600">{studentProfile.total_xp} XP</div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">Available Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.length > 0 ? (
            subjects.map((subject) => {
              const chapters = subject.total_chapters || 0
              const completedChapters = Array.from(chapterProgress.values()).filter((p) => p === 100).length

              return (
                <div
                  key={subject.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
                  onClick={() => router.push(`/learn/subject/${subject.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{subject.name}</h3>
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{subject.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{chapters} chapters</span>
                      <span>•</span>
                      <span>{completedChapters} completed</span>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span className="text-gray-700">Overall Progress</span>
                        <span className="font-semibold text-gray-900">
                          {chapters > 0 ? Math.round((completedChapters / chapters) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${chapters > 0 ? (completedChapters / chapters) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                      Continue Learning
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">{loadingSubjects ? 'Loading courses...' : 'No courses available'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
