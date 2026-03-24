import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: Request, { params }: { params: { chapterId: string } }) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return Response.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get or create chapter progress
    let { data: progress, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('user_id', authToken)
      .eq('chapter_id', params.chapterId)
      .single()

    if (error && error.code === 'PGRST116') {
      // No progress found, create new entry
      const { data: newProgress, error: insertError } = await supabase
        .from('student_progress')
        .insert([{ user_id: authToken, chapter_id: params.chapterId, progress_percent: 0 }])
        .select()
        .single()

      if (insertError) {
        return Response.json({ message: 'Failed to create progress' }, { status: 500 })
      }

      return Response.json({ progress: newProgress }, { status: 200 })
    }

    if (error) {
      return Response.json({ message: 'Failed to fetch progress' }, { status: 500 })
    }

    return Response.json({ progress }, { status: 200 })
  } catch (error) {
    console.error('Chapter progress error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { chapterId: string } }) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return Response.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { progress_percent } = await request.json()

    if (typeof progress_percent !== 'number' || progress_percent < 0 || progress_percent > 100) {
      return Response.json({ message: 'Invalid progress value' }, { status: 400 })
    }

    const supabase = await createClient()

    // Update chapter progress
    const { data: progress, error } = await supabase
      .from('student_progress')
      .update({
        progress_percent,
        last_accessed: new Date().toISOString(),
        completed_at: progress_percent === 100 ? new Date().toISOString() : null,
      })
      .eq('user_id', authToken)
      .eq('chapter_id', params.chapterId)
      .select()
      .single()

    if (error) {
      return Response.json({ message: 'Failed to update progress' }, { status: 500 })
    }

    return Response.json({ progress }, { status: 200 })
  } catch (error) {
    console.error('Update progress error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
