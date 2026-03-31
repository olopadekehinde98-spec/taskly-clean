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
  const response_rate_raw = String(formData.get('response_rate') || '').trim()
  const member_since = String(formData.get('member_since') || '').trim()

  const response_rate = Number(response_rate_raw.replace('%', '')) || 0

  const { error } = await supabase
    .from('profiles')
    .update({
      role: 'buyer',
      is_seller: true,
      display_name,
      username,
      professional_title,
      bio,
      skills,
      languages,
      response_time,
      response_rate,
      member_since,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

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