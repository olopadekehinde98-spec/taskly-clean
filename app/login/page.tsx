import Link from 'next/link'
import { login } from '@/app/auth/actions'

export const metadata = { title: 'Sign In — TasklyClean' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams
  const message = params?.message

  return (
    <main className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-12 text-white">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg font-black backdrop-blur-sm">T</div>
          <span className="text-xl font-bold">TasklyClean</span>
        </Link>

        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Welcome back to<br />
            <span className="text-cyan-300">your marketplace</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Access your orders, messages, and services — all in one place.
          </p>

          <div className="space-y-4">
            {[
              { icon: '🛒', text: 'Track all your orders in real time' },
              { icon: '💬', text: 'Message sellers and get updates fast' },
              { icon: '⭐', text: 'Leave reviews and build your reputation' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 text-slate-300">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          © 2026 TasklyClean. Trusted marketplace for digital services.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white">T</div>
            <span className="font-bold text-slate-900">TasklyClean</span>
          </Link>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="mb-8">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">Welcome Back</p>
              <h1 className="text-3xl font-extrabold text-slate-900">Sign in</h1>
              <p className="mt-2 text-sm text-slate-500">Enter your credentials to continue.</p>
            </div>

            {message && (
              <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {message}
              </div>
            )}

            <form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <button
                formAction={login}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Sign In →
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
