import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  pending_requirements: { label: 'Awaiting Requirements', classes: 'bg-amber-50 text-amber-700' },
  active:               { label: 'In Progress',           classes: 'bg-blue-50 text-blue-700' },
  delivered:            { label: 'Delivered — Review Pending', classes: 'bg-indigo-50 text-indigo-700' },
  revision_requested:   { label: 'Revision Requested',    classes: 'bg-orange-50 text-orange-700' },
  completed:            { label: 'Completed',             classes: 'bg-emerald-50 text-emerald-700' },
  cancelled:            { label: 'Cancelled',             classes: 'bg-slate-100 text-slate-600' },
  disputed:             { label: 'Disputed',              classes: 'bg-red-50 text-red-700' },
}

type Props = { params: Promise<{ id: string }> }

export default async function BuyerOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, order_status, subtotal_amount, requirements_text,
      due_at, created_at, delivered_at, completed_at,
      seller:profiles!orders_seller_id_fkey ( id, display_name, email, username, avatar_url ),
      listings ( id, title, slug ),
      listing_packages ( name, tier, delivery_days, price_usd )
    `)
    .eq('id', id)
    .eq('buyer_id', user.id)
    .single()

  if (!order) notFound()

  const statusInfo = STATUS_LABELS[order.order_status] ?? { label: order.order_status, classes: 'bg-slate-100 text-slate-600' }
  const seller = (order as any).seller
  const listing = (order as any).listings
  const pkg = (order as any).listing_packages

  return (
    <main className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/buyer/orders" className="text-slate-400 hover:text-slate-600">←</Link>
        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Order Details</p>
          <h1 className="text-2xl font-bold text-slate-900 font-mono">{order.id.slice(0, 8).toUpperCase()}</h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          {/* Main order info */}
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{listing?.title ?? 'Service'}</h2>
                {listing?.slug && (
                  <Link href={`/services/${listing.slug}`} className="text-xs text-blue-600 hover:underline">View listing ↗</Link>
                )}
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusInfo.classes}`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Seller</p>
                <p className="font-semibold text-slate-900">{seller?.display_name ?? seller?.email ?? 'Unknown'}</p>
                {seller?.username && <p className="text-xs text-blue-500">@{seller.username}</p>}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Package</p>
                <p className="font-semibold text-slate-900 capitalize">{pkg?.name ?? pkg?.tier ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Amount Paid</p>
                <p className="font-semibold text-slate-900">${Number(order.subtotal_amount ?? 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Due Date</p>
                <p className="font-semibold text-slate-900">
                  {order.due_at ? new Date(order.due_at).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Your requirements */}
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Your Requirements</h2>
            {order.requirements_text ? (
              <p className="leading-7 text-slate-700 whitespace-pre-wrap">{order.requirements_text}</p>
            ) : (
              <div>
                <p className="text-slate-400 italic mb-4">No requirements submitted yet.</p>
                {order.order_status === 'pending_requirements' && (
                  <Link href={`/order/${listing?.slug ?? id}`} className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                    Submit Requirements →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Actions based on status */}
          {order.order_status === 'delivered' && (
            <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2">📦 Delivery Ready</h2>
              <p className="text-sm text-slate-600 mb-4">The seller has delivered your order. Please review and accept or request a revision.</p>
              <div className="flex gap-3 flex-wrap">
                <Link href={`/buyer/orders/${id}/completed`} className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
                  ✓ Accept Delivery
                </Link>
                <Link href={`/buyer/orders/${id}/revision`} className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                  Request Revision
                </Link>
              </div>
            </div>
          )}

          {order.order_status === 'completed' && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
              <p className="font-semibold text-emerald-800">✅ Order completed</p>
              {order.completed_at && (
                <p className="text-sm text-emerald-700 mt-1">Completed {new Date(order.completed_at).toLocaleDateString()}</p>
              )}
              <div className="mt-4">
                <Link href={`/buyer/orders/${id}/review`} className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                  Leave a Review
                </Link>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          {/* Order summary */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID</span>
                <span className="font-mono text-xs text-slate-700">{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <span className="font-semibold text-slate-900">${Number(order.subtotal_amount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Placed</span>
                <span className="text-slate-700">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Order Placed</p>
                  <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${['active','delivered','completed'].includes(order.order_status) ? 'bg-blue-500' : 'bg-slate-200'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">In Progress</p>
                  <p className="text-xs text-slate-400">Seller working</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${['delivered','completed'].includes(order.order_status) ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">Delivered</p>
                  <p className="text-xs text-slate-400">{order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : 'Pending'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${order.order_status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">Completed</p>
                  <p className="text-xs text-slate-400">{order.completed_at ? new Date(order.completed_at).toLocaleDateString() : 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/buyer/messages" className="block w-full rounded-xl border px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                💬 Message Seller
              </Link>
              {!['completed', 'cancelled', 'disputed'].includes(order.order_status) && (
                <Link href={`/buyer/orders/${id}/dispute`} className="block w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-100 transition-colors">
                  ⚠️ Open Dispute
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
