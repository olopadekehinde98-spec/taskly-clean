import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Create a support ticket
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { summary, conversation } = await req.json()
    if (!summary) return NextResponse.json({ error: 'Summary required' }, { status: 400 })

    const { data, error } = await supabase.from('support_tickets').insert({
      user_id: user?.id ?? null,
      summary,
      conversation: conversation ?? [],
      status: 'open',
    }).select().single()

    if (error) throw error

    return NextResponse.json({ ticket: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Get tickets (admin only)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, profiles(display_name, email, avatar_url)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ tickets: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
