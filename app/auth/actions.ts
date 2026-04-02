'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

function getRealIP(headersList: Awaited<ReturnType<typeof headers>>): string {
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    'unknown'
  )
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '').trim()

  if (!email || !password) {
    redirect('/error?message=Email and password are required')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/error?message=${encodeURIComponent(error.message)}`)
  }

  // Log login to audit_logs with IP address
  if (data.user) {
    const headersList = await headers()
    const ip = getRealIP(headersList)
    const userAgent = headersList.get('user-agent') ?? ''

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', data.user.id).single()

    await supabase.from('audit_logs').insert({
      user_id: data.user.id,
      actor_id: data.user.id,
      action_type: 'login',
      action: `LOGIN: ${email} signed in from IP ${ip}`,
      target_type: 'user',
      target_id: data.user.id,
      ip_address: ip,
      user_agent: userAgent,
      reason: 'User login',
    }).then(({ error }) => { if (error) console.error('Audit log failed:', error.message) })

    if (profile?.is_admin) {
      revalidatePath('/', 'layout')
      redirect('/admin')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/buyer')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '').trim()
  const fullName = String(formData.get('full_name') || '').trim()

  if (!email || !password) {
    redirect('/error?message=Email and password are required')
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  if (error) {
    redirect(`/error?message=${encodeURIComponent(error.message)}`)
  }

  // Auto-create profile row for new user
  if (data.user) {
    const displayName = fullName || email.split('@')[0]
    const usernameBase = displayName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'
    // Use timestamp + random to make username unique (avoids collisions)
    const uniqueSuffix = Date.now().toString(36) + Math.floor(Math.random() * 100)
    const username = usernameBase + uniqueSuffix

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      display_name: displayName,
      username,
      is_seller: false,
      is_admin: false,
    }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile creation failed:', profileError.message)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/buyer')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim()

  if (!email) {
    redirect('/error?message=Email is required')
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-callback`,
  })

  redirect('/forgot-password?success=1')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const password = String(formData.get('password') || '').trim()
  const confirmPassword = String(formData.get('confirm_password') || '').trim()

  if (!password || !confirmPassword) {
    redirect('/error?message=Both fields are required')
  }

  if (password !== confirmPassword) {
    redirect('/error?message=Passwords do not match')
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    // Redirect back to reset-password page with error message for better UX
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  // Sign out after password reset so user must log in with new password
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login?message=Password+updated+successfully+%E2%80%94+please+sign+in+with+your+new+password')
}