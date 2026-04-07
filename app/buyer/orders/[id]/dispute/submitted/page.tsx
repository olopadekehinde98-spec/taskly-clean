type Props = {
  params: Promise<{ id: string }>
}

export default async function BuyerDisputeSubmittedPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl">
          ⚠️
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-red-600">
          Dispute Opened
        </p>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Your dispute has been submitted
        </h1>

        <p className="mx-auto mb-8 max-w-md text-slate-600">
          The seller has been notified and our team will review the case. You will be contacted via email with next steps.
        </p>

        <div className="mb-8 rounded-3xl bg-slate-50 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">What happens next</h2>
          <div className="space-y-2 text-sm leading-6 text-slate-600">
            <p>The seller has been notified of the dispute.</p>
            <p>Our team will review both sides and reach out within 2 business days.</p>
            <p>Keep communication in the order messages for reference.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/buyer/orders"
            className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
          >
            Back to Buyer Orders
          </a>

          <a
            href={`/buyer/orders/${id}`}
            className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
          >
            View Order
          </a>
        </div>
      </div>
    </main>
  )
}