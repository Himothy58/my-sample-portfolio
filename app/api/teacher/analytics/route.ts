import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return Response.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const supabase = await createClient()

    // Verify user is a teacher
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', authToken)
      .single()

    if (!user || user.role !== 'teacher') {
      return Response.json({ message: 'Not authorized' }, { status: 403 })
    }

    // Get all students (for now, we'll get all students in the system)
    // In a real app, you'd filter by classes the teacher teaches
    const { data: students } = await supabase.from('users').select('id, name, email, created_at').eq('role', 'student')

    // Get student profiles with stats
    const { data: profiles } = await supabase
      .from('student_profiles')
      .select('user_id, level, total_xp, streak, last_login_date')

    // Get all progress data
    const { data: progressData } = await supabase.from('student_progress').select('*')

    // Get all lesson completions
    const { data: completions } = await supabase.from('lesson_completions').select('*')

    // Get all mini-game scores
    const { data: gameScores } = await supabase.from('mini_game_scores').select('*')

    // Calculate analytics
    const totalStudents = students?.length || 0
    const avgAccuracy = calculateAvgAccuracy(completions)
    const avgProgress = calculateAvgProgress(progressData)
    const totalXP = calculateTotalXP(profiles)

    // Get weekly activity
    const weeklyActivity = calculateWeeklyActivity(completions)

    // Build student stats
    const studentStats = (students || []).map((student) => {
      const profile = profiles?.find((p) => p.user_id === student.id)
      const studentCompletions = (completions || []).filter((c) => c.user_id === student.id)
      const studentScores = (gameScores || []).filter((s) => s.user_id === student.id)

      const accuracy =
        studentCompletions.length > 0
          ? Math.round(
              studentCompletions.reduce((sum, c) => sum + (c.score || 0), 0) / studentCompletions.length
            )
          : 0

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        level: profile?.level || 1,
        totalXP: profile?.total_xp || 0,
        streak: profile?.streak || 0,
        accuracy,
        lessonsCompleted: studentCompletions.length,
        gamesPlayed: studentScores.length,
        lastLogin: profile?.last_login_date || student.created_at,
      }
    })

    return Response.json(
      {
        summary: {
          totalStudents,
          avgAccuracy,
          avgProgress,
          totalXP,
        },
        weeklyActivity,
        students: studentStats,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Analytics error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}

function calculateAvgAccuracy(completions: any[] | null): number {
  if (!completions || completions.length === 0) return 0
  const total = completions.reduce((sum, c) => sum + (c.score || 0), 0)
  return Math.round(total / completions.length)
}

function calculateAvgProgress(progressData: any[] | null): number {
  if (!progressData || progressData.length === 0) return 0
  const total = progressData.reduce((sum, p) => sum + p.progress_percent, 0)
  return Math.round(total / progressData.length)
}

function calculateTotalXP(profiles: any[] | null): number {
  if (!profiles) return 0
  return profiles.reduce((sum, p) => sum + (p.total_xp || 0), 0)
}

function calculateWeeklyActivity(completions: any[] | null): Record<string, number> {
  const activity: Record<string, number> = {}

  if (!completions) return activity

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  days.forEach((day) => {
    activity[day] = 0
  })

  completions.forEach((completion) => {
    const date = new Date(completion.completed_at)
    const dayIndex = date.getDay()
    const day = days[(dayIndex + 6) % 7] // Adjust for Monday start
    activity[day] = (activity[day] || 0) + 1
  })

  return activity
}
