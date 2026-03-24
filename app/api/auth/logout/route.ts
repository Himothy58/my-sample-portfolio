import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
    return Response.json({ message: 'Logged out successfully' }, { status: 200 })
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json({ message: 'Internal server error' }, { status: 500 })
  }
}
