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

    // Get user by ID
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('id', authToken)
      .single()

    if (error || !user) {
      return Response.json({ message: 'User not found' }, { status: 404 })
    }

    // Get student profile if student
    let studentProfile = null
    if (user.role === 'student') {
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      studentProfile = profile
    }

    return Response.json({ user, studentProfile }, { status: 200 })
  } catch (error) {
    console.error('Auth check error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
