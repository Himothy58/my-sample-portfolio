import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return Response.json({ message: 'Failed to fetch subjects' }, { status: 500 })
    }

    return Response.json({ subjects }, { status: 200 })
  } catch (error) {
    console.error('Subjects fetch error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
