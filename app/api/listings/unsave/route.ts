import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const listing_id = formData.get('listing_id') as string | null
  if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 })

  await supabase
    .from('saved_listings')
    .delete()
    .eq('user_id', user.id)
    .eq('listing_id', listing_id)

  // Redirect back to saved page after removal
  return Response.redirect(new URL('/buyer/saved', req.url), 303)
}
