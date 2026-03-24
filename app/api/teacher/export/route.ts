import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return Response.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    const supabase = await createClient()

    // Verify user is a teacher
    const { data: user } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', authToken)
      .single()

    if (!user || user.role !== 'teacher') {
      return Response.json({ message: 'Not authorized' }, { status: 403 })
    }

    // Get all students
    const { data: students } = await supabase.from('users').select('id, name, email').eq('role', 'student')

    // Get student profiles
    const { data: profiles } = await supabase
      .from('student_profiles')
      .select('user_id, level, total_xp, streak, last_login_date')

    // Get progress data
    const { data: progressData } = await supabase.from('student_progress').select('*')

    // Get completions
    const { data: completions } = await supabase.from('lesson_completions').select('*')

    // Build student stats
    const studentStats = (students || []).map((student) => {
      const profile = profiles?.find((p) => p.user_id === student.id)
      const studentCompletions = (completions || []).filter((c) => c.user_id === student.id)

      const accuracy =
        studentCompletions.length > 0
          ? Math.round(
              studentCompletions.reduce((sum, c) => sum + (c.score || 0), 0) / studentCompletions.length
            )
          : 0

      return {
        name: student.name,
        email: student.email,
        level: profile?.level || 1,
        totalXP: profile?.total_xp || 0,
        streak: profile?.streak || 0,
        accuracy,
        lessonsCompleted: studentCompletions.length,
        lastLogin: profile?.last_login_date || 'N/A',
      }
    })

    if (format === 'csv') {
      return exportCSV(studentStats, user.name)
    } else if (format === 'json') {
      return exportJSON(studentStats, user.name)
    }

    return Response.json({ message: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}

function exportCSV(data: any[], teacherName: string) {
  const headers = ['Student Name', 'Email', 'Level', 'Total XP', 'Streak', 'Accuracy (%)', 'Lessons Completed', 'Last Login']
  const rows = data.map((student) => [
    student.name,
    student.email,
    student.level,
    student.totalXP,
    student.streak,
    student.accuracy,
    student.lessonsCompleted,
    student.lastLogin,
  ])

  const csv = [
    `EduQuest Analytics Report - ${teacherName}`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="eduquest-report-${Date.now()}.csv"`,
    },
  })
}

function exportJSON(data: any[], teacherName: string) {
  const report = {
    title: 'EduQuest Analytics Report',
    teacher: teacherName,
    generatedAt: new Date().toISOString(),
    totalStudents: data.length,
    statistics: {
      averageLevel: Math.round(data.reduce((sum, s) => sum + s.level, 0) / data.length),
      averageXP: Math.round(data.reduce((sum, s) => sum + s.totalXP, 0) / data.length),
      averageAccuracy: Math.round(data.reduce((sum, s) => sum + s.accuracy, 0) / data.length),
      totalLessonsCompleted: data.reduce((sum, s) => sum + s.lessonsCompleted, 0),
    },
    students: data,
  }

  return new Response(JSON.stringify(report, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="eduquest-report-${Date.now()}.json"`,
    },
  })
}
