type Props = {
  params: Promise<{ id: string }>
}

export default async function SellerDeliveredPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="space-y-8">
      <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
          ✓
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Delivery Submitted
        </p>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Order {id} has been delivered
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-slate-600">
          The buyer can now review the delivery, message the seller, and mark the order as complete.
        </p>

        <div className="mx-auto mb-8 max-w-2xl rounded-3xl bg-slate-50 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            What happens next
          </h2>

          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>• Buyer reviews the submitted delivery.</p>
            <p>• Buyer can approve and complete the order.</p>
            <p>• Revision requests can be added later in the workflow.</p>
            <p>• Completion will update seller analytics and performance metrics.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/dashboard/orders"
            className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
          >
            Back to Seller Orders
          </a>

          <a
            href={`/dashboard/orders/${id}`}
            className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
          >
            View Order
          </a>
        </div>
      </div>
    </main>
  )
}