import Link from 'next/link'

export default function SellerIndexPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">Sellers</h1>
        <p className="mb-8 text-slate-600">
          Browse featured sellers on TasklyClean.
        </p>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-slate-900">
            Taskly Studio
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            Top Seller in publishing, Amazon support, and digital service delivery.
          </p>

          <Link
            href="/seller/tasklystudio"
            className="font-medium text-blue-600"
          >
            View seller profile
          </Link>
        </div>
      </div>
    </main>
  )
}