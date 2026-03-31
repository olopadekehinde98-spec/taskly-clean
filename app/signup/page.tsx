import Link from 'next/link'
import { signup } from '@/app/auth/actions'

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Join TasklyClean
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-3 text-sm text-slate-600">
            Start buying services or build your seller profile.
          </p>
        </div>

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
              placeholder="Create a password"
              className="w-full rounded-2xl border px-4 py-3 outline-none"
            />
          </div>

          <button
            formAction={signup}
            className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-center">
          <p className="mb-3 text-sm text-slate-600">
            Want to start selling with a dedicated onboarding flow?
          </p>

          <Link
            href="/start-selling"
            className="font-medium text-blue-600"
          >
            Start seller onboarding
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}