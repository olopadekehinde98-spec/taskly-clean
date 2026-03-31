import Link from 'next/link'

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const params = await searchParams
  const email = params?.email || 'your email'

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-2xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-600">
          ✉
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Confirm Your Account
        </p>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Check your email
        </h1>

        <p className="mx-auto mb-6 max-w-xl text-slate-600">
          We sent a confirmation link to <span className="font-medium text-slate-900">{email}</span>.
          Open your inbox and click the link to activate your account.
        </p>

        <div className="mb-8 rounded-3xl bg-slate-50 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            If you do not see the email
          </h2>

          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>• Check spam, junk, or promotions.</p>
            <p>• Wait a minute and refresh your inbox.</p>
            <p>• Make sure you entered the correct email address.</p>
            <p>• Do not keep clicking signup repeatedly.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
          >
            Go to Login
          </Link>

          <Link
            href="/signup"
            className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
          >
            Back to Signup
          </Link>
        </div>
      </div>
    </main>
  )
}