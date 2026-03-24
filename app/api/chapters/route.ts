import { createClient } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subject_id')

    const supabase = await createClient()

    if (subjectId) {
      const { data: chapters, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', subjectId)
        .order('chapter_number', { ascending: true })

      if (error) {
        return Response.json({ message: 'Failed to fetch chapters' }, { status: 500 })
      }

      return Response.json({ chapters }, { status: 200 })
    }

    const { data: chapters, error } = await supabase
      .from('chapters')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return Response.json({ message: 'Failed to fetch chapters' }, { status: 500 })
    }

    return Response.json({ chapters }, { status: 200 })
  } catch (error) {
    console.error('Chapters fetch error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
