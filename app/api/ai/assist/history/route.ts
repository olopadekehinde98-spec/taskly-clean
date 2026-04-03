import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ messages: [] })

    const sessionId = req.nextUrl.searchParams.get('session_id')
    if (!sessionId) return NextResponse.json({ messages: [] })

    const { data: rows } = await supabase
      .from('ai_conversations')
      .select('role, message, created_at')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .eq('feature', 'assist_loop')
      .order('created_at', { ascending: true })
      .limit(40)

    const messages = (rows ?? []).map(r => ({
      role: r.role as 'user' | 'assistant',
      content: r.message,
    }))

    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json({ messages: [] })
  }
}
