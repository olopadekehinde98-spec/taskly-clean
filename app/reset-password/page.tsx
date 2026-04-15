import Link from 'next/link'
import { resetPassword } from '@/app/auth/actions'

export const metadata = { title: 'Reset Password — TasklyClean' }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const errorMsg = params?.error
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
            Choose a new<br />
            <span className="text-[#3ecf68]">password</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            Pick a strong password to keep your account secure.
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
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#3ecf68]">Almost Done</p>
              <h1 className="text-3xl font-extrabold text-slate-900">New password</h1>
              <p className="mt-2 text-sm text-slate-500">Enter your new password below.</p>
            </div>

            {errorMsg && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <form className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">New Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Choose a strong password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#3ecf68] focus:bg-white focus:ring-2 focus:ring-[#3ecf68]/20 transition-all"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm Password</label>
                <input
                  name="confirm_password"
                  type="password"
                  required
                  placeholder="Repeat your password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#3ecf68] focus:bg-white focus:ring-2 focus:ring-[#3ecf68]/20 transition-all"
                />
              </div>

              <button
                formAction={resetPassword}
                className="w-full rounded-xl bg-gradient-to-r [#3ecf68] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3ecf68]/20 hover:from-[#3ecf68] hover:to-[#163522] transition-all"
              >
                Update Password →
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
