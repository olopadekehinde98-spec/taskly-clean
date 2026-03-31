import Link from 'next/link'

export default function OrderConfirmationPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
          ✓
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Order Submitted
        </p>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Your order has been placed
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-slate-600">
          The order flow UI is now in place. Later, this page will connect to real payment,
          order storage, and seller delivery workflows.
        </p>

        <div className="mb-8 rounded-3xl bg-slate-50 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            What happens next
          </h2>

          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>• Buyer requirements will be saved to the database.</p>
            <p>• Seller will receive the order in the dashboard.</p>
            <p>• Messaging and delivery flow will be attached later.</p>
            <p>• Payment status will be tracked once the gateway is connected.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/buyer/orders"
            className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
          >
            View Buyer Orders
          </Link>

          <Link
            href="/services"
            className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
          >
            Back to Services
          </Link>
        </div>
      </div>
    </main>
  )
}