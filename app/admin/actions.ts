'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/buyer')
  return { supabase, adminId: user.id }
}

export async function updateUserStatus(formData: FormData) {
  const { supabase, adminId } = await requireAdmin()
  const userId = String(formData.get('user_id') || '')
  const action = String(formData.get('action') || '')
  const reason = String(formData.get('reason') || 'Admin action')

  const statusMap: Record<string, string> = {
    activate: 'active',
    restrict: 'restricted',
    suspend: 'suspended',
    ban: 'banned',
    restore: 'active',
  }

  const newStatus = statusMap[action]
  if (!newStatus || !userId) return

  await supabase.from('profiles').update({ account_status: newStatus }).eq('id', userId)

  // Log audit action
  await supabase.from('audit_logs').insert({
    actor_id: adminId,
    target_id: userId,
    action_type: action,
    reason,
    target_type: 'user',
  }).then(() => {})

  revalidatePath('/admin/users')
  revalidatePath('/admin')
}

export async function updateListingStatus(formData: FormData) {
  const { supabase, adminId } = await requireAdmin()
  const listingId = String(formData.get('listing_id') || '')
  const action = String(formData.get('action') || '')
  const reason = String(formData.get('reason') || 'Admin moderation')

  const statusMap: Record<string, { listing_status: string; visibility_status: string; moderation_status: string }> = {
    approve: { listing_status: 'live', visibility_status: 'visible', moderation_status: 'approved' },
    deny: { listing_status: 'denied', visibility_status: 'hidden', moderation_status: 'denied' },
    remove: { listing_status: 'removed', visibility_status: 'hidden', moderation_status: 'removed' },
    pause: { listing_status: 'paused', visibility_status: 'hidden', moderation_status: 'approved' },
  }

  const updates = statusMap[action]
  if (!updates || !listingId) return

  await supabase.from('listings').update(updates).eq('id', listingId)

  await supabase.from('audit_logs').insert({
    actor_id: adminId,
    target_id: listingId,
    action_type: action,
    reason,
    target_type: 'listing',
  }).then(() => {})

  revalidatePath('/admin/services')
  revalidatePath('/admin/moderation')
}

export async function resolveDispute(formData: FormData) {
  const { supabase, adminId } = await requireAdmin()
  const disputeId = String(formData.get('dispute_id') || '')
  const decision = String(formData.get('decision') || '')
  const note = String(formData.get('note') || '')

  if (!disputeId || !decision) return

  await supabase.from('disputes').update({
    status: 'resolved',
    decision,
    admin_note: note,
    resolved_at: new Date().toISOString(),
    resolved_by: adminId,
  }).eq('id', disputeId)

  await supabase.from('audit_logs').insert({
    actor_id: adminId,
    target_id: disputeId,
    action_type: 'resolve_dispute',
    reason: `Decision: ${decision}. ${note}`,
    target_type: 'dispute',
  }).then(() => {})

  revalidatePath('/admin/disputes')
}
