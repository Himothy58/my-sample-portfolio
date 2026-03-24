import { createClient } from '@/lib/supabase'

export async function GET(request: Request, { params }: { params: { lessonId: string } }) {
  try {
    const supabase = await createClient()

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', params.lessonId)
      .single()

    if (error || !lesson) {
      return Response.json({ message: 'Lesson not found' }, { status: 404 })
    }

    // Also fetch the chapter for context
    const { data: chapter } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', lesson.chapter_id)
      .single()

    return Response.json({ lesson, chapter }, { status: 200 })
  } catch (error) {
    console.error('Lesson fetch error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
