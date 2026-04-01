import { createClient } from '@/lib/supabase/server'
import AdminNotificationsClient from '@/components/AdminNotificationsClient'

export const metadata = { title: 'Notifications — Admin' }

export default async function AdminNotificationsPage() {
  const supabase = await createClient()

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: newUsers },
    { data: newOrders },
    { data: newViolations },
    { data: newDisputes },
    { data: newTickets },
    { data: newListings },
    { data: securityEvents },
  ] = await Promise.all([
    supabase.from('profiles').select('id, display_name, email, is_seller, created_at').gte('created_at', since).order('created_at', { ascending: false }),
    supabase.from('orders').select('id, status, created_at, buyer:profiles!orders_buyer_id_fkey(display_name, email), listings(title)').gte('created_at', since).order('created_at', { ascending: false }),
    supabase.from('violations').select('reason, created_at, profiles(display_name, email)').gte('created_at', since).order('created_at', { ascending: false }),
    supabase.from('disputes').select('reason, status, created_at, profiles!disputes_buyer_id_fkey(display_name, email)').gte('created_at', since).order('created_at', { ascending: false }),
    supabase.from('support_tickets').select('summary, status, created_at, profiles(display_name, email)').gte('created_at', since).order('created_at', { ascending: false }),
    supabase.from('listings').select('title, moderation_status, created_at, profiles(display_name, email)').gte('created_at', since).order('created_at', { ascending: false }),
    supabase.from('audit_logs').select('action, created_at, profiles(display_name, email)').ilike('action', 'SECURITY_FLAG%').gte('created_at', since).order('created_at', { ascending: false }),
  ])

  // Build unified event feed
  const events: { type: string; icon: string; title: string; detail: string; time: string; severity: 'info' | 'warning' | 'danger' }[] = []

  newUsers?.forEach(u => events.push({
    type: 'New User',
    icon: '👤',
    title: `${u.display_name ?? 'Unknown'} signed up`,
    detail: `${u.email} — ${u.is_seller ? 'Seller' : 'Buyer'}`,
    time: u.created_at,
    severity: 'info',
  }))

  newOrders?.forEach(o => events.push({
    type: 'New Order',
    icon: '📦',
    title: `New order placed`,
    detail: `"${(o.listings as any)?.title ?? 'Unknown gig'}" by ${(o.buyer as any)?.display_name ?? 'Unknown'} — ${o.status}`,
    time: o.created_at,
    severity: 'info',
  }))

  newListings?.forEach(l => events.push({
    type: 'New Gig',
    icon: '🎯',
    title: `New gig submitted for review`,
    detail: `"${l.title}" by ${(l.profiles as any)?.display_name ?? 'Unknown'} — ${l.moderation_status}`,
    time: l.created_at,
    severity: l.moderation_status === 'pending' ? 'warning' : 'info',
  }))

  newViolations?.forEach(v => events.push({
    type: 'Violation',
    icon: '🚨',
    title: `Rule violation reported`,
    detail: `${(v.profiles as any)?.display_name ?? 'Unknown'} (${(v.profiles as any)?.email}) — ${v.reason}`,
    time: v.created_at,
    severity: 'danger',
  }))

  newDisputes?.forEach(d => events.push({
    type: 'Dispute',
    icon: '⚖️',
    title: `Dispute opened`,
    detail: `${(d.profiles as any)?.display_name ?? 'Unknown'} — ${d.reason} — ${d.status}`,
    time: d.created_at,
    severity: 'danger',
  }))

  newTickets?.forEach(t => events.push({
    type: 'Support Ticket',
    icon: '💬',
    title: `Support ticket created`,
    detail: `${(t.profiles as any)?.display_name ?? 'Guest'}: ${t.summary}`,
    time: t.created_at,
    severity: 'warning',
  }))

  securityEvents?.forEach(s => events.push({
    type: 'Security Threat',
    icon: '🛡️',
    title: `Security threat detected`,
    detail: `${(s.profiles as any)?.display_name ?? 'Unknown'} (${(s.profiles as any)?.email ?? ''}) — ${s.action}`,
    time: s.created_at,
    severity: 'danger',
  }))

  // Sort all by time desc
  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-red-600">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="mt-1 text-sm text-slate-500">All platform activity from the last 7 days — AI summarised.</p>
      </div>

      <AdminNotificationsClient events={events} />
    </div>
  )
}
