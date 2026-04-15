import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BuyerSupportClient from './BuyerSupportClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'My Support Tickets — TasklyClean' }

export default async function BuyerSupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('id, ticket_number, summary, status, conversation, admin_replies, thread, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#3ecf68]">Support</p>
        <h1 className="text-3xl font-bold text-slate-900">My Support Tickets</h1>
        <p className="mt-1 text-sm text-slate-500">
          View your support tickets and continue the conversation with our team.
        </p>
      </div>

      <BuyerSupportClient tickets={tickets ?? []} />
    </div>
  )
}
