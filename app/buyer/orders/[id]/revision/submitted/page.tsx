import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

export default async function RevisionSubmittedPage({ params }: Props) {
  const { id } = await params
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-2xl">
          🔄
        </div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-amber-600">Revision Requested</p>
        <h1 className="mb-4 text-3xl font-bold text-slate-900">Revision request sent!</h1>
        <p className="mb-8 text-slate-600">The seller has been notified and will address your feedback.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href={`/buyer/orders/${id}`} className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors">
            View Order →
          </Link>
          <Link href="/buyer/orders" className="rounded-2xl border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            All Orders
          </Link>
        </div>
      </div>
    </main>
  )
}
