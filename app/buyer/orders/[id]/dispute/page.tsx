type Props = {
  params: Promise<{ id: string }>
}

export default async function BuyerDisputePage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-red-600">
            Buyer Dispute Request
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Open Dispute</h1>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm text-slate-500">Order ID</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{id}</h2>
          </div>

          <form className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Dispute Reason
              </label>
              <select className="w-full rounded-2xl border px-4 py-3 outline-none">
                <option>Delivery does not match requirements</option>
                <option>Seller not responding</option>
                <option>Serious quality issue</option>
                <option>Missing files / incomplete delivery</option>
                <option>Other serious issue</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Dispute Details
              </label>
              <textarea
                rows={8}
                placeholder="Explain clearly what happened, what was expected, and why the issue could not be solved through normal revision or messaging."
                className="w-full rounded-2xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Evidence / Reference Note
              </label>
              <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-500">
                Evidence upload UI will be connected later with backend storage.
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href={`/buyer/orders/${id}/dispute/submitted`}
                className="rounded-2xl bg-red-600 px-6 py-3 font-medium text-white"
              >
                Submit Dispute
              </a>

              <a
                href={`/buyer/orders/${id}/delivered`}
                className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
              >
                Back
              </a>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}