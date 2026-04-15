import Link from 'next/link'
import { signup } from '@/app/auth/actions'

export const metadata = { title: 'Create Account — Taskly' }

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return (
    <main className="min-h-screen flex">

      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0d2818] p-12 text-white">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3ecf68] text-lg font-black text-[#0d2818]">T</div>
          <span className="text-xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>Taskly</span>
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#3ecf68] mb-4 flex items-center gap-2">
            <span className="block w-5 h-0.5 bg-[#3ecf68]" />Free to Join
          </p>
          <h2 className="text-4xl font-bold leading-tight mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Join thousands of<br />
            <em className="not-italic text-[#3ecf68]">buyers & sellers</em>
          </h2>
          <p className="text-white/50 text-lg leading-relaxed mb-8">
            Find top-quality services or earn by offering your skills on Taskly.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '💼', label: '1,200+', desc: 'Services' },
              { icon: '⭐', label: '4.9/5', desc: 'Avg Rating' },
              { icon: '👥', label: '3,000+', desc: 'Buyers' },
              { icon: '🔒', label: '100%', desc: 'Secure' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl bg-white/6 border border-white/10 p-4">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-lg font-bold text-white">{s.label}</p>
                <p className="text-xs text-white/40">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/25">
          © 2026 Taskly. Free to join. No subscription required.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 bg-[#fdfaf4]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#3ecf68] text-sm font-black text-[#0d2818]">T</div>
            <span className="font-bold text-[#0d2818]" style={{ fontFamily: 'Fraunces, serif' }}>Taskly</span>
          </Link>

          <div className="rounded-3xl border border-[#dae8df] bg-white p-8 shadow-sm">
            <div className="mb-8">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#3ecf68] flex items-center gap-2">
                <span className="block w-4 h-0.5 bg-[#3ecf68]" />Free Forever
              </p>
              <h1 className="text-3xl font-bold text-[#0d2818]" style={{ fontFamily: 'Fraunces, serif' }}>Create account</h1>
              <p className="mt-2 text-sm text-[#7a9a86]">Start buying or selling in minutes.</p>
            </div>

            <form className="space-y-5">
              {next && <input type="hidden" name="next" value={next} />}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#0d2818]">Full Name</label>
                <input
                  name="full_name"
                  type="text"
                  required
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-[#dae8df] bg-[#fdfaf4] px-4 py-3 text-sm outline-none focus:border-[#3ecf68] focus:bg-white focus:ring-2 focus:ring-[#3ecf68]/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#0d2818]">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#dae8df] bg-[#fdfaf4] px-4 py-3 text-sm outline-none focus:border-[#3ecf68] focus:bg-white focus:ring-2 focus:ring-[#3ecf68]/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#0d2818]">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Choose a strong password"
                  className="w-full rounded-xl border border-[#dae8df] bg-[#fdfaf4] px-4 py-3 text-sm outline-none focus:border-[#3ecf68] focus:bg-white focus:ring-2 focus:ring-[#3ecf68]/20 transition-all"
                />
              </div>

              <button
                formAction={signup}
                className="w-full rounded-xl bg-[#3ecf68] px-5 py-3.5 text-sm font-bold text-[#0d2818] shadow-lg shadow-[#3ecf68]/20 hover:bg-[#52e07a] transition-all"
              >
                Create Free Account →
              </button>
            </form>

            <div className="mt-5 rounded-2xl border border-[#dae8df] bg-[#edfbf2] p-4">
              <p className="text-xs font-semibold text-[#0d2818] mb-1">Want to sell your services?</p>
              <Link href="/start-selling" className="text-xs font-semibold text-[#3ecf68] hover:underline">
                Apply as a seller → complete full onboarding
              </Link>
            </div>

            <p className="mt-5 text-center text-sm text-[#7a9a86]">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#3ecf68] hover:underline">
                Sign in
              </Link>
            </p>

            <p className="mt-4 text-center text-xs text-[#7a9a86]">
              By joining you agree to our{' '}
              <Link href="/terms" className="underline hover:text-[#4a6958]">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline hover:text-[#4a6958]">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
