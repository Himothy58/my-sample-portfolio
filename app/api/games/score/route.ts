import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return Response.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { lesson_id, game_type, score, max_score, attempts, time_taken } = await request.json()

    if (!lesson_id || !game_type || typeof score !== 'number') {
      return Response.json({ message: 'Invalid request data' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get lesson to calculate XP
    const { data: lesson } = await supabase
      .from('lessons')
      .select('xp_reward')
      .eq('id', lesson_id)
      .single()

    if (!lesson) {
      return Response.json({ message: 'Lesson not found' }, { status: 404 })
    }

    // Calculate XP earned based on score percentage
    const percentage = (score / (max_score || 100)) * 100
    const xpEarned = Math.round((percentage / 100) * lesson.xp_reward)

    // Check if score already exists
    const { data: existing } = await supabase
      .from('mini_game_scores')
      .select('id, score')
      .eq('user_id', authToken)
      .eq('lesson_id', lesson_id)
      .eq('game_type', game_type)
      .single()

    let gameScore
    if (existing) {
      // Update only if new score is better
      const newScore = Math.max(existing.score, score)
      const { data: updated } = await supabase
        .from('mini_game_scores')
        .update({
          score: newScore,
          max_score: max_score || 100,
          attempts: (attempts || 1),
          time_taken: time_taken || 0,
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', authToken)
        .eq('lesson_id', lesson_id)
        .eq('game_type', game_type)
        .select()
        .single()

      gameScore = updated
    } else {
      // Create new game score
      const { data: newScore } = await supabase
        .from('mini_game_scores')
        .insert([
          {
            user_id: authToken,
            lesson_id,
            game_type,
            score,
            max_score: max_score || 100,
            attempts: attempts || 1,
            time_taken: time_taken || 0,
            completed_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      gameScore = newScore
    }

    // Mark lesson as completed with this score
    const { data: existingCompletion } = await supabase
      .from('lesson_completions')
      .select('id')
      .eq('user_id', authToken)
      .eq('lesson_id', lesson_id)
      .single()

    if (!existingCompletion) {
      await supabase.from('lesson_completions').insert([
        {
          user_id: authToken,
          lesson_id,
          score: percentage,
          xp_earned: xpEarned,
          completed_at: new Date().toISOString(),
          attempts: 1,
        },
      ])

      // Update student profile XP
      const { data: student } = await supabase
        .from('student_profiles')
        .select('total_xp, level')
        .eq('user_id', authToken)
        .single()

      if (student) {
        const newXP = student.total_xp + xpEarned
        const newLevel = Math.floor(newXP / 1000) + 1

        await supabase
          .from('student_profiles')
          .update({ total_xp: newXP, level: newLevel, updated_at: new Date().toISOString() })
          .eq('user_id', authToken)
      }
    }

    return Response.json(
      {
        gameScore,
        xpEarned,
        message: 'Score recorded successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Game score error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return Response.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lesson_id')

    const supabase = await createClient()

    if (lessonId) {
      const { data: scores } = await supabase
        .from('mini_game_scores')
        .select('*')
        .eq('user_id', authToken)
        .eq('lesson_id', lessonId)
        .order('completed_at', { ascending: false })

      return Response.json({ scores: scores || [] }, { status: 200 })
    }

    // Get all game scores for user
    const { data: scores } = await supabase
      .from('mini_game_scores')
      .select('*')
      .eq('user_id', authToken)
      .order('completed_at', { ascending: false })

    return Response.json({ scores: scores || [] }, { status: 200 })
  } catch (error) {
    console.error('Get game scores error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
