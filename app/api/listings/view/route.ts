import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { listing_id, event_type = 'view' } = await req.json()
    if (!listing_id) return NextResponse.json({ ok: false })

    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('listing_views').insert({
      listing_id,
      viewer_id: user?.id ?? null,
      event_type,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
