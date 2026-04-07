import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

export default async function BuyerDeliveredOrderPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, order_status, subtotal_amount, due_at, delivered_at,
      listings ( title, slug ),
      seller:profiles!orders_seller_id_fkey ( display_name, username ),
      listing_packages ( name, tier, delivery_days )
    `)
    .eq('id', id)
    .eq('buyer_id', user.id)
    .single()

  if (!order) notFound()
  if (order.order_status !== 'delivered') redirect(`/buyer/orders/${id}`)

  const seller = (order as any).seller
  const listing = (order as any).listings
  const pkg = (order as any).listing_packages

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center gap-3">
          <Link href={`/buyer/orders/${id}`} className="text-slate-400 hover:text-slate-600">←</Link>
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Delivery Ready</p>
            <h1 className="text-2xl font-bold text-slate-900">{listing?.title ?? 'Your Order'}</h1>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="space-y-8">
            <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6">
              <p className="font-semibold text-indigo-800 mb-1">📦 The seller has delivered your order</p>
              <p className="text-sm text-indigo-700">
                Review the delivery below. If everything looks good, accept it. If changes are needed, request a revision.
              </p>
              {order.delivered_at && (
                <p className="mt-2 text-xs text-indigo-600">
                  Delivered {new Date(order.delivered_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Order Details</h2>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Seller</p>
                  <p className="font-semibold text-slate-900">{seller?.display_name ?? 'Seller'}</p>
                  {seller?.username && <p className="text-xs text-blue-500">@{seller.username}</p>}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Package</p>
                  <p className="font-semibold text-slate-900 capitalize">{pkg?.name ?? pkg?.tier ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Amount</p>
                  <p className="font-semibold text-slate-900">${Number(order.subtotal_amount ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Due By</p>
                  <p className="font-semibold text-slate-900">{order.due_at ? new Date(order.due_at).toLocaleDateString() : '—'}</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Your Actions</h2>
              <div className="space-y-3">
                <Link
                  href={`/buyer/orders/${id}/completed`}
                  className="block w-full rounded-2xl bg-emerald-600 px-5 py-3 text-center font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  ✓ Accept Delivery
                </Link>
                <Link
                  href={`/buyer/orders/${id}/revision`}
                  className="block w-full rounded-2xl border px-5 py-3 text-center font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Request Revision
                </Link>
                <Link
                  href={`/buyer/orders/${id}/dispute`}
                  className="block w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-center font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  Open Dispute
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <p className="text-xs font-medium text-slate-700 mb-2">💡 Tips</p>
              <p className="text-xs text-slate-500 leading-5">
                Use <strong>Accept</strong> if the work meets your requirements — this releases payment to the seller.
                Use <strong>Revision</strong> for normal corrections. Use <strong>Dispute</strong> only for serious unresolvable issues.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
