import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

const ISSUE_TYPE_LABELS: Record<string, string> = {
  not_as_described: 'Delivery does not match requirements',
  seller_not_responding: 'Seller not responding',
  quality_issue: 'Serious quality issue',
  missing_files: 'Missing files / incomplete delivery',
  other: 'Other serious issue',
}

type Props = { params: Promise<{ id: string }> }

export default async function SellerDisputeNoticePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, order_status,
      buyer:profiles!orders_buyer_id_fkey ( display_name, email ),
      listings ( title )
    `)
    .eq('id', id)
    .eq('seller_id', user.id)
    .single()

  if (!order) notFound()

  // Fetch dispute if one exists
  const { data: dispute } = await supabase
    .from('disputes')
    .select('issue_type, description, requested_outcome, status, created_at, opened_by')
    .eq('order_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const buyer = (order as any).buyer
  const listing = (order as any).listings

  return (
    <main className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/orders/${id}`} className="text-slate-400 hover:text-slate-600">←</Link>
        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-[0.2em] text-red-600">Dispute Notice</p>
          <h1 className="text-2xl font-bold text-slate-900">{listing?.title ?? 'Order Dispute'}</h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          {dispute ? (
            <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 capitalize">{dispute.status}</span>
                <span className="text-xs text-slate-500">
                  Opened {new Date(dispute.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Dispute Reason</p>
                  <p className="font-semibold text-slate-900">
                    {ISSUE_TYPE_LABELS[dispute.issue_type] ?? dispute.issue_type}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Details</p>
                  <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">{dispute.description}</p>
                </div>

                {dispute.requested_outcome && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Requested Outcome</p>
                    <p className="text-sm text-slate-700">{dispute.requested_outcome}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Opened By</p>
                  <p className="text-sm text-slate-700">
                    {dispute.opened_by === user.id ? 'You' : buyer?.display_name ?? buyer?.email ?? 'Buyer'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <p className="text-slate-500">No active dispute on this order.</p>
              <Link href={`/dashboard/orders/${id}`} className="mt-4 inline-block text-sm text-blue-600 hover:underline">
                ← Back to Order
              </Link>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-slate-900">Dispute Status</h2>
            <p className="text-sm leading-6 text-slate-600">
              Our team reviews all disputes and will reach out via email. Continue checking your notifications for updates.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-slate-900">Need Help?</h2>
            <p className="text-sm text-slate-600 mb-3">Contact support if you have additional evidence or questions.</p>
            <Link href="/buyer/support" className="block w-full rounded-xl border px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Contact Support
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}
