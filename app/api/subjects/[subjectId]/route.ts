import { createClient } from '@/lib/supabase'

export async function GET(request: Request, { params }: { params: { subjectId: string } }) {
  try {
    const supabase = await createClient()

    const { data: subject, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', params.subjectId)
      .single()

    if (error || !subject) {
      return Response.json({ message: 'Subject not found' }, { status: 404 })
    }

    return Response.json({ subject }, { status: 200 })
  } catch (error) {
    console.error('Subject fetch error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
