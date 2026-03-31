type Props = {
  params: Promise<{ id: string }>
}

export default async function BuyerReviewPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Buyer Review
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Leave a Review</h1>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm text-slate-500">Order ID</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{id}</h2>
          </div>

          <form className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">
                Overall Rating
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-amber-50 text-xl text-amber-500"
                >
                  ★
                </button>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-amber-50 text-xl text-amber-500"
                >
                  ★
                </button>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-amber-50 text-xl text-amber-500"
                >
                  ★
                </button>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-amber-50 text-xl text-amber-500"
                >
                  ★
                </button>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-amber-50 text-xl text-amber-500"
                >
                  ★
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Interactive star logic will be connected later.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Communication
                </label>
                <select className="w-full rounded-2xl border bg-white px-4 py-3 outline-none">
                  <option>5 - Excellent</option>
                  <option>4 - Good</option>
                  <option>3 - Average</option>
                  <option>2 - Poor</option>
                  <option>1 - Bad</option>
                </select>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Service Quality
                </label>
                <select className="w-full rounded-2xl border bg-white px-4 py-3 outline-none">
                  <option>5 - Excellent</option>
                  <option>4 - Good</option>
                  <option>3 - Average</option>
                  <option>2 - Poor</option>
                  <option>1 - Bad</option>
                </select>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Delivery Time
                </label>
                <select className="w-full rounded-2xl border bg-white px-4 py-3 outline-none">
                  <option>5 - Excellent</option>
                  <option>4 - Good</option>
                  <option>3 - Average</option>
                  <option>2 - Poor</option>
                  <option>1 - Bad</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Written Review
              </label>
              <textarea
                rows={7}
                placeholder="Write a short review about your experience with the seller and the final delivery."
                className="w-full rounded-2xl border px-4 py-3 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href={`/buyer/orders/${id}/review/submitted`}
                className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
              >
                Submit Review
              </a>

              <a
                href={`/buyer/orders/${id}/completed`}
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