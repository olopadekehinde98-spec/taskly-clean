'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveBuyerProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const display_name = String(formData.get('display_name') || '').trim()
  const username = String(formData.get('username') || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
  const bio = String(formData.get('bio') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const avatar_url = String(formData.get('avatar_url') || '').trim() || undefined

  const updates: Record<string, any> = { display_name, bio, updated_at: new Date().toISOString() }
  if (username) updates.username = username
  if (phone) updates.phone = phone
  if (avatar_url) updates.avatar_url = avatar_url

  await supabase.from('profiles').update(updates).eq('id', user.id)

  redirect('/buyer/settings?success=Profile saved successfully')
}
