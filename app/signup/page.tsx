import Link from 'next/link'
import { signup } from '@/app/auth/actions'

export const metadata = { title: 'Create Account — TasklyClean' }

export default function SignupPage() {
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
            Join thousands of<br />
            <span className="text-cyan-300">buyers & sellers</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            Find top-quality services or earn by offering your skills on TasklyClean.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '💼', label: '1,200+', desc: 'Services' },
              { icon: '⭐', label: '4.9/5', desc: 'Avg Rating' },
              { icon: '👥', label: '3,000+', desc: 'Buyers' },
              { icon: '🔒', label: '100%', desc: 'Secure' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-lg font-bold">{s.label}</p>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          © 2026 TasklyClean. Free to join. No subscription required.
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
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">Free Forever</p>
              <h1 className="text-3xl font-extrabold text-slate-900">Create account</h1>
              <p className="mt-2 text-sm text-slate-500">Start buying or selling in minutes.</p>
            </div>

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
                  placeholder="Choose a strong password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <button
                formAction={signup}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Create Free Account →
              </button>
            </form>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-800 mb-2">Want to sell your services?</p>
              <Link href="/start-selling" className="text-xs font-semibold text-blue-600 hover:underline">
                Apply as a seller → complete full onboarding
              </Link>
            </div>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>

            <p className="mt-4 text-center text-xs text-slate-400">
              By joining you agree to our{' '}
              <Link href="/terms" className="underline hover:text-slate-600">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
