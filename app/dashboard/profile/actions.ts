'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function splitCommaText(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function saveSellerProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const display_name = String(formData.get('display_name') || '').trim()
  const username = String(formData.get('username') || '').trim().toLowerCase()
  const professional_title = String(formData.get('professional_title') || '').trim()
  const bio = String(formData.get('bio') || '').trim()
  const skills = splitCommaText(String(formData.get('skills') || ''))
  const languages = splitCommaText(String(formData.get('languages') || ''))
  const response_time = String(formData.get('response_time') || '').trim()
  // response_rate and member_since are read-only / system-managed, never saved from form

  // Only set member_since on first-time seller setup if not already set
  const { data: existing, error: fetchError } = await supabase.from('profiles').select('member_since, is_seller').eq('id', user.id).single()
  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is fine for new profiles
    console.error('Profile fetch failed:', fetchError.message)
  }
  const shouldSetMemberSince = !existing?.member_since

  const updateData: Record<string, unknown> = {
    is_seller: true,
    display_name,
    username,
    professional_title,
    bio,
    skills,
    languages,
    response_time,
    updated_at: new Date().toISOString(),
  }

  if (shouldSetMemberSince) {
    const now = new Date()
    updateData.member_since = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email, ...updateData }, { onConflict: 'id' })

  if (error) {
    redirect(`/error?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/start-selling')
  revalidatePath('/buyer')
  revalidatePath('/dashboard')
  revalidatePath(`/seller/${username}`)
  redirect('/dashboard/profile?success=Profile saved successfully')
}