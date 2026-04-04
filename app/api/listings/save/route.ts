import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listing_id } = await req.json()
  if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 })

  const { error } = await supabase.from('saved_listings').insert({ user_id: user.id, listing_id }).select().single()
  if (error && error.code !== '23505') return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ saved: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listing_id } = await req.json()
  await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', listing_id)
  return NextResponse.json({ saved: false })
}
