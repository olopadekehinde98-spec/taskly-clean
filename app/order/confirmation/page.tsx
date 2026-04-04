import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ order_id?: string }>
}

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { order_id } = await searchParams
  const supabase = await createClient()

  let order: any = null
  if (order_id) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('orders')
        .select(`
          id, subtotal_amount, order_status, due_at, created_at,
          listings(title, slug),
          seller:profiles!orders_seller_id_fkey(display_name),
          listing_packages(tier, name, delivery_days)
        `)
        .eq('id', order_id)
        .eq('buyer_id', user.id)
        .single()
      order = data
    }
  }

  const pkg = order?.listing_packages
  const listing = order?.listings

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">
          ✅
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Order Confirmed</p>
        <h1 className="mb-4 text-4xl font-bold text-slate-900">Your order has been placed!</h1>

        {order ? (
          <div className="mx-auto mb-6 w-fit rounded-2xl border border-emerald-200 bg-emerald-50 px-8 py-5 text-center">
            <p className="text-3xl font-bold text-emerald-700">${Number(order.subtotal_amount).toFixed(2)}</p>
            <p className="mt-1 text-sm text-emerald-600">held in secure escrow</p>
            {listing && (
              <p className="mt-2 text-sm font-semibold text-slate-700 max-w-xs">"{listing.title}"</p>
            )}
            {pkg && (
              <p className="mt-1 text-xs text-slate-500 capitalize">{pkg.tier} package · {pkg.delivery_days}-day delivery</p>
            )}
            {order.due_at && (
              <p className="mt-1 text-xs text-slate-500">Expected by: {new Date(order.due_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            )}
          </div>
        ) : (
          <p className="mx-auto mb-8 max-w-2xl text-slate-600">
            Your payment is held in escrow and will be released to the seller once you accept the delivery.
          </p>
        )}

        <div className="mb-8 rounded-3xl bg-slate-50 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">What happens next</h2>
          <div className="space-y-2 text-sm leading-7 text-slate-600">
            <p>✉️ The seller has been notified and will begin work shortly.</p>
            <p>🔒 Your payment is held securely in escrow until you accept the delivery.</p>
            <p>📦 You can track order progress in your Buyer Dashboard.</p>
            <p>💬 Message the seller anytime from your order page if you have questions.</p>
            <p>⚖️ If there are any issues, you can open a dispute from your order page.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {order ? (
            <Link href={`/buyer/orders/${order.id}`} className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors">
              Track This Order →
            </Link>
          ) : (
            <Link href="/buyer/orders" className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors">
              View My Orders
            </Link>
          )}
          <Link href="/services" className="rounded-2xl border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Browse More Services
          </Link>
        </div>
      </div>
    </main>
  )
}
