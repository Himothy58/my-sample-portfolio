'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { exportToCSV } from '@/lib/export-utils'
import { Users, TrendingUp, Zap, Target, BarChart3, LogOut, Download, FileJson } from 'lucide-react'

interface StudentStat {
  id: string
  name: string
  email: string
  level: number
  totalXP: number
  streak: number
  accuracy: number
  lessonsCompleted: number
  gamesPlayed: number
  lastLogin: string
}

interface AnalyticsSummary {
  totalStudents: number
  avgAccuracy: number
  avgProgress: number
  totalXP: number
}

export default function TeacherDashboard() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [students, setStudents] = useState<StudentStat[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<Record<string, number>>({})
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'activity'>('overview')

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'teacher') {
        router.push('/login')
        return
      }
      fetchAnalytics()
    }
  }, [isLoading, user, router])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/teacher/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.summary)
        setStudents(data.students)
        setWeeklyActivity(data.weeklyActivity)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleExportCSV = async () => {
    const success = await exportToCSV('csv')
    if (success) {
      alert('Report exported successfully!')
    } else {
      alert('Export failed. Please try again.')
    }
  }

  const handleExportJSON = async () => {
    const success = await exportToCSV('json')
    if (success) {
      alert('Report exported successfully!')
    } else {
      alert('Export failed. Please try again.')
    }
  }

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-sm text-gray-600">Track student progress and engagement</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-2">
              <Download size={18} />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON} className="flex items-center gap-2">
              <FileJson size={18} />
              Export JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalStudents || 0}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Accuracy</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.avgAccuracy || 0}%</p>
              </div>
              <Target className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.avgProgress || 0}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total XP Earned</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{(analytics?.totalXP || 0).toLocaleString()}</p>
              </div>
              <Zap className="w-10 h-10 text-yellow-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'students' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
            >
              Students ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'activity' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
            >
              Weekly Activity
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-4">Learning Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Student Engagement</p>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: '75%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">75% of students active this week</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Course Completion</p>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600" style={{ width: '45%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">45% of students completed at least one course</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Student Leaderboard</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4">Student Name</th>
                        <th className="text-left py-3 px-4">Level</th>
                        <th className="text-left py-3 px-4">Total XP</th>
                        <th className="text-left py-3 px-4">Accuracy</th>
                        <th className="text-left py-3 px-4">Lessons Done</th>
                        <th className="text-left py-3 px-4">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-600">{student.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">{student.level}</td>
                          <td className="py-3 px-4 font-semibold">{student.totalXP}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-1 rounded text-white text-xs font-semibold ${
                                student.accuracy >= 80 ? 'bg-green-600' : student.accuracy >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                            >
                              {student.accuracy}%
                            </span>
                          </td>
                          <td className="py-3 px-4">{student.lessonsCompleted}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(student.lastLogin).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Weekly Activity Chart</h3>
                <div className="flex items-end justify-around h-48 gap-2 bg-gray-50 p-6 rounded-lg">
                  {Object.entries(weeklyActivity).map(([day, count]) => (
                    <div key={day} className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className="w-full bg-blue-600 rounded-t"
                        style={{
                          height: `${Math.max(30, Math.min(200, count * 10))}px`,
                          minHeight: '10px',
                        }}
                        title={`${count} completions`}
                      ></div>
                      <span className="text-xs text-gray-600 font-medium">{day.slice(0, 3)}</span>
                      <span className="text-xs font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
