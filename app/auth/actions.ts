'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  // Log login to audit_logs
  if (data.user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', data.user.id).single()

    await supabase.from('audit_logs').insert({
      user_id: data.user.id,
      action: `LOGIN: ${email} signed in`,
    })

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
    const usernameBase = displayName.toLowerCase().replace(/[^a-z0-9]/g, '')
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      display_name: displayName,
      username: usernameBase + Math.floor(Math.random() * 1000),
      is_seller: false,
      is_admin: false,
    }, { onConflict: 'id' })
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
    redirect(`/error?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Password updated — please sign in')
}