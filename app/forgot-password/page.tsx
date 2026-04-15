import Link from 'next/link'
import { forgotPassword } from '@/app/auth/actions'

export const metadata = { title: 'Forgot Password — TasklyClean' }

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const params = await searchParams
  const success = params?.success

  return (
    <main className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br [#0d2818] p-12 text-white">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg font-black backdrop-blur-sm">T</div>
          <span className="text-xl font-bold">TasklyClean</span>
        </Link>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Reset your<br />
            <span className="text-[#3ecf68]">password</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Enter your email and we'll send you a link to get back into your account.
          </p>
        </div>
        <p className="text-xs text-slate-500">© 2026 TasklyClean.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br [#3ecf68] text-sm font-black text-white">T</div>
            <span className="font-bold text-slate-900">TasklyClean</span>
          </Link>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="mb-8">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#3ecf68]">Account Recovery</p>
              <h1 className="text-3xl font-extrabold text-slate-900">Forgot password?</h1>
              <p className="mt-2 text-sm text-slate-500">We'll send a reset link to your email.</p>
            </div>

            {success ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                <p className="text-2xl mb-2">📬</p>
                <p className="font-semibold text-green-800">Reset link sent!</p>
                <p className="text-sm text-green-700 mt-1">Check your email and click the link to reset your password.</p>
              </div>
            ) : (
              <form className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#3ecf68] focus:bg-white focus:ring-2 focus:ring-[#3ecf68]/20 transition-all"
                  />
                </div>

                <button
                  formAction={forgotPassword}
                  className="w-full rounded-xl bg-gradient-to-r [#3ecf68] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3ecf68]/20 hover:from-[#3ecf68] hover:to-[#163522] transition-all"
                >
                  Send Reset Link →
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-slate-500">
              Remember your password?{' '}
              <Link href="/login" className="font-semibold text-[#3ecf68] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
