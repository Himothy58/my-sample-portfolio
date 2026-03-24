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

    // Get all chapter progress for user
    const { data: chapters, error: chaptersError } = await supabase
      .from('student_progress')
      .select('*')
      .eq('user_id', authToken)

    if (chaptersError) {
      return Response.json({ message: 'Failed to fetch progress' }, { status: 500 })
    }

    // Get all lesson completions for user
    const { data: lessons, error: lessonsError } = await supabase
      .from('lesson_completions')
      .select('*')
      .eq('user_id', authToken)

    if (lessonsError) {
      return Response.json({ message: 'Failed to fetch completions' }, { status: 500 })
    }

    return Response.json({ chapters, lessons }, { status: 200 })
  } catch (error) {
    console.error('Progress fetch error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
