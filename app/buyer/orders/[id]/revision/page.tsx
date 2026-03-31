type Props = {
  params: Promise<{ id: string }>
}

export default async function BuyerRevisionPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Buyer Revision Request
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Request Revision</h1>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm text-slate-500">Order ID</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{id}</h2>
          </div>

          <form className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Revision Title
              </label>
              <input
                type="text"
                placeholder="What needs to be changed?"
                className="w-full rounded-2xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Revision Details
              </label>
              <textarea
                rows={7}
                placeholder="Clearly explain what should be revised and what part of the delivery does not yet match your request."
                className="w-full rounded-2xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Reference Note
              </label>
              <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-500">
                File/image attachment for revision comments will be connected later.
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href={`/buyer/orders/${id}/revision/submitted`}
                className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
              >
                Submit Revision Request
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