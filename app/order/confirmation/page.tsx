import Link from 'next/link'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ session_id?: string }>
}

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  let sessionInfo: { amount: number; currency: string; email: string } | null = null

  if (session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-03-25.dahlia' })
      const session = await stripe.checkout.sessions.retrieve(session_id)
      sessionInfo = {
        amount: (session.amount_total ?? 0) / 100,
        currency: (session.currency ?? 'usd').toUpperCase(),
        email: session.customer_email ?? '',
      }
    } catch { /* ignore */ }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
          ✓
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Payment Successful
        </p>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Your order has been placed
        </h1>

        {sessionInfo ? (
          <div className="mx-auto mb-6 w-fit rounded-2xl bg-emerald-50 border border-emerald-200 px-6 py-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">
              {sessionInfo.currency} ${sessionInfo.amount.toFixed(2)} paid
            </p>
            {sessionInfo.email && (
              <p className="text-sm text-emerald-600 mt-1">Receipt sent to {sessionInfo.email}</p>
            )}
          </div>
        ) : (
          <p className="mx-auto mb-8 max-w-2xl text-slate-600">
            Your payment is held in escrow and will be released to the seller once you accept the delivery.
          </p>
        )}

        <div className="mb-8 rounded-3xl bg-slate-50 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">What happens next</h2>
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>• The seller has been notified and will begin work shortly.</p>
            <p>• Your payment is held securely in escrow until you accept the delivery.</p>
            <p>• You can track your order progress in the Buyer Dashboard.</p>
            <p>• If you have any issues, use the Support Chat or open a dispute from your order page.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/buyer/orders" className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white">
            View My Orders
          </Link>
          <Link href="/services" className="rounded-2xl border px-6 py-3 font-medium text-slate-700">
            Browse More Services
          </Link>
        </div>
      </div>
    </main>
  )
}
