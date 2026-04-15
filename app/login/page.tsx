import Link from 'next/link'
import { login } from '@/app/auth/actions'

export const metadata = { title: 'Sign In — Taskly' }

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
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0d2818] p-12 text-white">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3ecf68] text-lg font-black text-[#0d2818]">T</div>
          <span className="text-xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>Taskly</span>
        </Link>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#3ecf68] mb-4 flex items-center gap-2">
            <span className="block w-5 h-0.5 bg-[#3ecf68]" />Welcome Back
          </p>
          <h2 className="text-4xl font-bold leading-tight mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Back to<br />
            <em className="not-italic text-[#3ecf68]">your marketplace</em>
          </h2>
          <p className="text-white/50 text-lg leading-relaxed mb-8">
            Access your orders, messages, and services — all in one place.
          </p>

          <div className="space-y-4">
            {[
              { icon: '🛒', text: 'Track all your orders in real time' },
              { icon: '💬', text: 'Message sellers and get updates fast' },
              { icon: '⭐', text: 'Leave reviews and build your reputation' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 text-white/55">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/25">
          © 2026 Taskly. Trusted marketplace for digital services.
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
                <span className="block w-4 h-0.5 bg-[#3ecf68]" />Welcome Back
              </p>
              <h1 className="text-3xl font-bold text-[#0d2818]" style={{ fontFamily: 'Fraunces, serif' }}>Sign in</h1>
              <p className="mt-2 text-sm text-[#7a9a86]">Enter your credentials to continue.</p>
            </div>

            {message && (
              <div className="mb-5 rounded-2xl border border-[#dae8df] bg-[#edfbf2] px-4 py-3 text-sm text-[#28a84e]">
                {message}
              </div>
            )}

            <form className="space-y-5">
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-[#0d2818]">Password</label>
                  <Link href="/forgot-password" className="text-xs font-medium text-[#3ecf68] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#dae8df] bg-[#fdfaf4] px-4 py-3 text-sm outline-none focus:border-[#3ecf68] focus:bg-white focus:ring-2 focus:ring-[#3ecf68]/20 transition-all"
                />
              </div>

              <button
                formAction={login}
                className="w-full rounded-xl bg-[#0d2818] px-5 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#163522] transition-all"
              >
                Sign In →
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#7a9a86]">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-[#3ecf68] hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
