import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { saveSellerProfile } from '@/app/dashboard/profile/actions'

export default async function StartSellingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Become a Seller
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            Start selling on TasklyClean
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Set up your seller profile, choose your service categories, and begin
            building your marketplace presence.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
          <section className="rounded-3xl border bg-white p-8 shadow-sm">
            <form action={saveSellerProfile} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Display Name / Brand Name
                  </label>
                  <input
                    name="display_name"
                    type="text"
                    placeholder="Taskly Studio"
                    className="w-full rounded-2xl border px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <input
                    name="username"
                    type="text"
                    placeholder="tasklystudio"
                    className="w-full rounded-2xl border px-4 py-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Professional Title
                </label>
                <input
                  name="professional_title"
                  type="text"
                  placeholder="Publishing, Business Support, and Digital Service Expert"
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Skills
                </label>
                <textarea
                  name="skills"
                  rows={4}
                  placeholder="Kindle Formatting, Amazon Appeal Writing, Proofreading, Banner Design"
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Separate your skills with commas.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Professional Bio
                </label>
                <textarea
                  name="bio"
                  rows={6}
                  placeholder="Describe who you help, what you do best, and why buyers should trust your work."
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Languages
                  </label>
                  <input
                    name="languages"
                    type="text"
                    placeholder="English"
                    className="w-full rounded-2xl border px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Response Time
                  </label>
                  <input
                    name="response_time"
                    type="text"
                    placeholder="1 hour"
                    className="w-full rounded-2xl border px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Response Rate
                  </label>
                  <input
                    name="response_rate"
                    type="text"
                    placeholder="96"
                    className="w-full rounded-2xl border px-4 py-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Member Since
                </label>
                <input
                  name="member_since"
                  type="text"
                  placeholder="March 2026"
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="submit"
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
                >
                  Submit Seller Setup
                </button>

                <a
                  href="/signup"
                  className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
                >
                  Back
                </a>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Seller Onboarding Tips
              </h2>

              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>Choose categories that match the services you can actually deliver well.</p>
                <p>Write a focused bio instead of trying to sound broad or generic.</p>
                <p>Relevant skills improve profile trust and future ranking quality.</p>
                <p>Strong onboarding makes later gig creation easier and cleaner.</p>
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Seller Growth Rule
              </h2>

              <p className="text-sm leading-7 text-slate-600">
                New sellers should start with a clean, specific setup. Quality positioning early
                leads to better ranking, better conversion, and better growth later.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}