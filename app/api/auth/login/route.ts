import { createClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ message: 'Email and password required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return Response.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return Response.json({ message: 'Invalid email or password' }, { status: 401 })
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

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('auth_token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user

    return Response.json({ user: userWithoutPassword, studentProfile }, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
