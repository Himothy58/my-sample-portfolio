import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: Request, { params }: { params: { lessonId: string } }) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return Response.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get lesson completion if exists
    const { data: completion, error } = await supabase
      .from('lesson_completions')
      .select('*')
      .eq('user_id', authToken)
      .eq('lesson_id', params.lessonId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return Response.json({ message: 'Failed to fetch completion' }, { status: 500 })
    }

    return Response.json({ completion: completion || null }, { status: 200 })
  } catch (error) {
    console.error('Lesson completion error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
