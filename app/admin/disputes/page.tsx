import { createClient } from '@/lib/supabase/server'
import { resolveDispute } from '../actions'

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  under_review: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-600',
}

export default async function AdminDisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('disputes')
    .select(`
      id, reason, status, decision, admin_note, created_at, resolved_at,
      orders ( id, amount_usd ),
      buyer:profiles!disputes_buyer_id_fkey ( display_name, email ),
      seller:profiles!disputes_seller_id_fkey ( display_name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status)
  else query = query.neq('status', 'resolved')

  const { data: disputes } = await query

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-red-600">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Disputes</h1>
        <p className="mt-1 text-sm text-slate-500">
          {disputes?.length ?? 0} dispute{(disputes?.length ?? 0) !== 1 ? 's' : ''} {status ?? 'awaiting resolution'}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Open', value: 'open' },
          { label: 'Under Review', value: 'under_review' },
          { label: 'Resolved', value: 'resolved' },
          { label: 'All', value: '' },
        ].map(tab => (
          <a
            key={tab.value}
            href={tab.value ? `/admin/disputes?status=${tab.value}` : '/admin/disputes'}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              (status ?? '') === tab.value
                ? 'bg-slate-800 text-white'
                : 'border bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {!disputes || disputes.length === 0 ? (
        <div className="rounded-3xl border bg-white p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">⚖️</div>
          <h2 className="text-xl font-bold text-slate-900">No disputes</h2>
          <p className="mt-2 text-slate-500 text-sm">No disputes match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d: any) => (
            <div key={d.id} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[d.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {d.status?.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(d.created_at).toLocaleDateString()}</span>
                    {d.orders?.amount_usd && (
                      <span className="text-xs text-slate-500">💰 ${Number(d.orders.amount_usd).toFixed(2)} order</span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 mb-2">{d.reason}</p>
                  <div className="flex gap-6 text-xs text-slate-500 flex-wrap">
                    <span>🛒 Buyer: <span className="text-slate-700">{d.buyer?.display_name ?? d.buyer?.email ?? 'Unknown'}</span></span>
                    <span>🏪 Seller: <span className="text-slate-700">{d.seller?.display_name ?? d.seller?.email ?? 'Unknown'}</span></span>
                  </div>
                  {d.decision && (
                    <div className="mt-3 rounded-xl bg-slate-50 px-4 py-2 text-sm">
                      <span className="font-medium text-slate-700">Decision: </span>
                      <span className="text-slate-600">{d.decision}</span>
                      {d.admin_note && <p className="text-slate-500 mt-1 text-xs">{d.admin_note}</p>}
                    </div>
                  )}
                </div>

                {d.status !== 'resolved' && (
                  <form action={resolveDispute} className="shrink-0 flex flex-col gap-2 min-w-[240px]">
                    <input type="hidden" name="dispute_id" value={d.id} />
                    <textarea
                      name="note"
                      placeholder="Admin note (optional)..."
                      rows={2}
                      className="w-full rounded-xl border px-3 py-2 text-xs outline-none focus:border-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        name="decision"
                        value="refund_buyer"
                        className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        Refund Buyer
                      </button>
                      <button
                        name="decision"
                        value="release_to_seller"
                        className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        Release to Seller
                      </button>
                      <button
                        name="decision"
                        value="split"
                        className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Split
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
