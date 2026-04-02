import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { saveSellerProfile } from '@/app/dashboard/profile/actions'

export const metadata = { title: 'Become a Seller — TasklyClean' }

export default async function StartSellingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white py-16 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-400">Become a Seller</p>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Turn your skills into<br />
            <span className="text-cyan-300">real income</span>
          </h1>
          <p className="mt-4 text-slate-300 text-lg">
            Set up your seller profile and start earning on TasklyClean today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            {['Free to join', 'No monthly fees', 'Get paid in 14 days', 'AI listing tools included'].map(b => (
              <span key={b} className="flex items-center gap-1.5">
                <span className="text-cyan-400">✓</span> {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 xl:grid-cols-[1fr_300px]">

          {/* Main form */}
          <section className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Your Seller Profile</h2>
            <form action={saveSellerProfile} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Display Name / Brand</label>
                  <input name="display_name" type="text" placeholder="e.g. Taskly Studio"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Username</label>
                  <div className="flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <span className="flex items-center px-3 text-sm text-slate-400 bg-slate-100 border-r border-slate-200">@</span>
                    <input name="username" type="text" placeholder="tasklystudio"
                      className="flex-1 bg-transparent px-3 py-3 text-sm outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Professional Title</label>
                <input name="professional_title" type="text"
                  placeholder="e.g. Publishing & Amazon Business Expert"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Skills <span className="text-slate-400 font-normal">(comma separated)</span></label>
                <input name="skills" type="text"
                  placeholder="Kindle Formatting, Amazon Appeal Writing, Proofreading, Banner Design"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Professional Bio</label>
                <textarea name="bio" rows={5}
                  placeholder="Tell buyers who you are, what you specialise in, and why they should work with you. Be specific and professional."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Languages <span className="text-slate-400 font-normal">(comma separated)</span></label>
                  <input name="languages" type="text" placeholder="English, French"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Avg Response Time</label>
                  <input name="response_time" type="text" placeholder="Under 1 hour"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>
              </div>
              <p className="text-xs text-slate-400">Response rate and member date are set automatically by the platform.</p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all">
                  Launch Seller Profile →
                </button>
                <a href="/" className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </a>
              </div>
            </form>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-3xl border bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-md">
              <h3 className="font-bold text-lg mb-3">Seller Levels</h3>
              <div className="space-y-2 text-sm">
                {[
                  { level: 'New Seller', fee: '10% fee', orders: '0 orders' },
                  { level: 'Level 1', fee: '8% fee', orders: '10+ orders' },
                  { level: 'Level 2', fee: '6% fee', orders: '50+ orders' },
                  { level: 'Top Rated', fee: '5% fee', orders: '100+ orders' },
                ].map(l => (
                  <div key={l.level} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                    <span className="font-medium">{l.level}</span>
                    <span className="text-blue-200 text-xs">{l.fee}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Tips for Success</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  'Choose a specific niche — don\'t try to do everything',
                  'Write a bio that speaks directly to your buyer\'s needs',
                  'Use the AI quality checker on every listing',
                  'Respond to messages within 1 hour to build trust',
                  'Deliver on time — it\'s your #1 ranking factor',
                ].map(tip => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border bg-emerald-50 border-emerald-200 p-5 text-sm text-emerald-800">
              <p className="font-bold mb-1">💡 Pro Tip</p>
              <p>Sellers who complete their profile 100% get 3× more views in their first week.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
