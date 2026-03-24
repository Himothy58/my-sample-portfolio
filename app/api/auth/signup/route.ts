import { createClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json()

    // Validate input
    if (!email || !password || !name || !role) {
      return Response.json({ message: 'Missing required fields' }, { status: 400 })
    }

    if (role !== 'student' && role !== 'teacher') {
      return Response.json({ message: 'Invalid role' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ message: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return Response.json({ message: 'Email already registered' }, { status: 409 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{ email, password_hash, name, role }])
      .select()
      .single()

    if (userError) {
      return Response.json({ message: 'Failed to create user' }, { status: 500 })
    }

    // Create student profile if student
    let studentProfile = null
    if (role === 'student') {
      const { data: profile } = await supabase
        .from('student_profiles')
        .insert([{ user_id: newUser.id }])
        .select()
        .single()

      studentProfile = profile
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('auth_token', newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return Response.json({ user: newUser, studentProfile }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
