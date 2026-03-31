type Props = {
  params: Promise<{ id: string }>
}

export default async function SellerDisputeNoticePage({ params }: Props) {
  const { id } = await params

  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-red-600">
          Seller Dispute Notice
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Dispute Notice</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-8">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <p className="mb-2 text-sm text-slate-500">Order ID</p>
            <h2 className="mb-4 text-2xl font-bold text-slate-900">{id}</h2>

            <div className="rounded-2xl bg-slate-50 p-6">
              <p className="mb-2 text-sm font-medium text-slate-900">
                Buyer Dispute Reason
              </p>
              <p className="mb-4 text-lg font-semibold text-slate-900">
                Delivery does not match requirements
              </p>

              <p className="mb-2 text-sm font-medium text-slate-900">
                Buyer Dispute Details
              </p>
              <p className="text-sm leading-7 text-slate-700">
                The submitted delivery does not fully match the requested formatting outcome and the issue was not resolved through normal delivery review.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Seller Response
            </h2>

            <form className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Response to Dispute
                </label>
                <textarea
                  rows={7}
                  placeholder="Respond clearly to the dispute and explain your position."
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
                >
                  Save Response
                </button>

                <a
                  href={`/dashboard/orders/${id}`}
                  className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
                >
                  Back to Order
                </a>
              </div>
            </form>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Dispute Rule
            </h2>

            <p className="text-sm leading-7 text-slate-600">
              Sellers should respond clearly, stay factual, and provide any relevant explanation or evidence tied directly to the order.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Admin Review Note
            </h2>

            <p className="text-sm leading-7 text-slate-600">
              Serious order disputes should later move into admin review so the platform can make a final resolution decision.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}