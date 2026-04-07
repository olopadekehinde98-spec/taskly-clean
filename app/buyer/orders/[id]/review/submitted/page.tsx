type Props = {
  params: Promise<{ id: string }>
}

export default async function ReviewSubmittedPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl">
          ⭐
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Review Submitted
        </p>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Thank you for your review!
        </h1>

        <p className="mx-auto mb-8 max-w-md text-slate-600">
          Your review helps other buyers make informed decisions and rewards great sellers.
        </p>

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