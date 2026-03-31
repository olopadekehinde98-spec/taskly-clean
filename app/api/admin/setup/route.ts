import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One-time admin setup endpoint. Only accessible with a secret token.
// Usage: POST /api/admin/setup with body { token: "SETUP_ADMIN", email: "user@example.com" }
export async function POST(req: NextRequest) {
  const { token, email } = await req.json()

  if (token !== 'SETUP_ADMIN_TASKLY_2026') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Use service role key if available, else anon (may fail due to RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, serviceRoleKey ?? anonKey, {
    auth: { persistSession: false },
  })

  // Find user by email in auth.users via profiles table
  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  if (findError) return NextResponse.json({ error: findError.message }, { status: 500 })
  if (!profile) return NextResponse.json({ error: `No profile found for ${email}` }, { status: 404 })

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', profile.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ success: true, message: `is_admin=true set for ${email}` })
}
