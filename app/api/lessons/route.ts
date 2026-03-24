import { createClient } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chapterId = searchParams.get('chapter_id')

    const supabase = await createClient()

    if (chapterId) {
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('lesson_number', { ascending: true })

      if (error) {
        return Response.json({ message: 'Failed to fetch lessons' }, { status: 500 })
      }

      return Response.json({ lessons }, { status: 200 })
    }

    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return Response.json({ message: 'Failed to fetch lessons' }, { status: 500 })
    }

    return Response.json({ lessons }, { status: 200 })
  } catch (error) {
    console.error('Lessons fetch error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
