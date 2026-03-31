import Link from 'next/link'

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams
  const message = params?.message
    ? decodeURIComponent(params.message)
    : 'Something went wrong.'

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-2xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-red-600">
          Auth Error
        </p>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          We could not complete that action
        </h1>

        <p className="mb-8 text-slate-600">{message}</p>

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
            Go to Signup
          </Link>
        </div>
      </div>
    </main>
  )
}