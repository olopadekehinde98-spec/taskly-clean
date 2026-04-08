import { createClient } from '@/lib/supabase/server'
import AdminSupportTickets from '@/components/AdminSupportTickets'

export const metadata = { title: 'Support Tickets — Admin' }

export default async function AdminSupportPage() {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('id, ticket_number, summary, status, conversation, admin_replies, thread, created_at, updated_at, profiles(display_name, email, avatar_url)')
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-red-600">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Support Tickets</h1>
        <p className="mt-1 text-sm text-slate-500">User issues escalated from the support chatbot.</p>
      </div>
      <AdminSupportTickets tickets={tickets ?? []} />
    </div>
  )
}
