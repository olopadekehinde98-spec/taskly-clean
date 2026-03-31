import Link from 'next/link'
import { login } from '@/app/auth/actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams
  const message = params?.message

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Welcome Back
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-3 text-sm text-slate-600">
            Access your buyer or seller account.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {message}
          </div>
        )}

        <form className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-2xl border px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full rounded-2xl border px-4 py-3 outline-none"
            />
          </div>

          <button
            formAction={login}
            className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Need an account?{' '}
          <Link href="/signup" className="font-medium text-blue-600">
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}