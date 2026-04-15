import Link from 'next/link'

export default function StartSellingSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
          ✓
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Seller Setup Submitted
        </p>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Your seller onboarding is complete
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-slate-600">
          The onboarding UI is now in place. Later, this will connect to seller approval,
          profile storage, verification, and onboarding progress logic.
        </p>

        <div className="mb-8 rounded-3xl bg-slate-50 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            What should happen later
          </h2>

          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>• Seller profile record should be created in the database.</p>
            <p>• Selected categories and skills should be stored.</p>
            <p>• Verification and review status should be tracked.</p>
            <p>• Approved sellers should move into gig creation flow.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard/profile"
            className="rounded-2xl bg-[#3ecf68] px-6 py-3 font-medium text-white"
          >
            Edit Seller Profile
          </Link>

          <Link
            href="/dashboard/services/new"
            className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
          >
            Create First Gig
          </Link>
        </div>
      </div>
    </main>
  )
}