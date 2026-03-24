import { createClient } from '@/lib/supabase'

export async function GET(request: Request, { params }: { params: { chapterId: string } }) {
  try {
    const supabase = await createClient()

    const { data: chapter, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', params.chapterId)
      .single()

    if (error || !chapter) {
      return Response.json({ message: 'Chapter not found' }, { status: 404 })
    }

    return Response.json({ chapter }, { status: 200 })
  } catch (error) {
    console.error('Chapter fetch error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
