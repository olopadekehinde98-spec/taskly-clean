type Props = {
  params: Promise<{ id: string }>
}

export default async function ReviewSubmittedPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
          ✓
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Review Submitted
        </p>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Your review for {id} has been submitted
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-slate-600">
          Reviews help strengthen seller trust, improve ranking quality, and guide future buyers.
        </p>

        <div className="mb-8 rounded-3xl bg-slate-50 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            What reviews should affect later
          </h2>

          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>• Seller public rating</p>
            <p>• Service review count</p>
            <p>• Ranking score and trust signals</p>
            <p>• Buyer confidence and conversion performance</p>
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
            href="/services"
            className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
          >
            Explore More Services
          </a>
        </div>
      </div>
    </main>
  )
}