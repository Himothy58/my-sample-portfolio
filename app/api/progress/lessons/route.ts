import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return Response.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { lesson_id, score, xp_earned } = await request.json()

    if (!lesson_id || typeof score !== 'number' || typeof xp_earned !== 'number') {
      return Response.json({ message: 'Invalid request data' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if already completed
    const { data: existing } = await supabase
      .from('lesson_completions')
      .select('id, attempts')
      .eq('user_id', authToken)
      .eq('lesson_id', lesson_id)
      .single()

    if (existing) {
      // Update existing completion with new attempt
      const { data: completion, error } = await supabase
        .from('lesson_completions')
        .update({
          score: Math.max(existing.score || 0, score),
          xp_earned: xp_earned,
          attempts: existing.attempts + 1,
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', authToken)
        .eq('lesson_id', lesson_id)
        .select()
        .single()

      if (error) {
        return Response.json({ message: 'Failed to update completion' }, { status: 500 })
      }

      return Response.json({ completion }, { status: 200 })
    }

    // Create new completion
    const { data: completion, error } = await supabase
      .from('lesson_completions')
      .insert([
        {
          user_id: authToken,
          lesson_id,
          score,
          xp_earned,
          completed_at: new Date().toISOString(),
          attempts: 1,
        },
      ])
      .select()
      .single()

    if (error) {
      return Response.json({ message: 'Failed to create completion' }, { status: 500 })
    }

    // Update student XP
    const { data: student } = await supabase
      .from('student_profiles')
      .select('total_xp, level')
      .eq('user_id', authToken)
      .single()

    if (student) {
      const newXP = student.total_xp + xp_earned
      const newLevel = Math.floor(newXP / 1000) + 1

      await supabase
        .from('student_profiles')
        .update({ total_xp: newXP, level: newLevel })
        .eq('user_id', authToken)
    }

    return Response.json({ completion }, { status: 201 })
  } catch (error) {
    console.error('Lesson completion error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
