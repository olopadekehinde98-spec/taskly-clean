import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

export default async function SellerDeliveredPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="space-y-8">
      <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl">
          ✅
        </div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Delivery Submitted</p>
        <h1 className="mb-4 text-4xl font-bold text-slate-900">Order Delivered!</h1>
        <p className="mx-auto mb-8 max-w-md text-slate-600">
          The buyer has been notified and can now review, accept, or request a revision.
        </p>
        <div className="mx-auto mb-8 max-w-md rounded-3xl bg-slate-50 p-6 text-left">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">What happens next</h2>
          <div className="space-y-2 text-sm leading-6 text-slate-600">
            <p>The buyer reviews your delivery.</p>
            <p>They can accept it to release payment, or request a revision.</p>
            <p>If no action is taken, the order auto-completes after 3 days.</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/dashboard/orders" className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors">
            Back to Orders
          </Link>
          <Link href={`/dashboard/orders/${id}`} className="rounded-2xl border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            View Order
          </Link>
        </div>
      </div>
    </main>
  )
}
