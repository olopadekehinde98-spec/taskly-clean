import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { saveSellerProfile } from './actions'

export default async function SellerProfileEditPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const params = await searchParams
  const success = params?.success

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name || ''
  const username = profile?.username || ''
  const professionalTitle = profile?.professional_title || ''
  const bio = profile?.bio || ''
  const skills = Array.isArray(profile?.skills) ? profile.skills.join(', ') : ''
  const languages = Array.isArray(profile?.languages) ? profile.languages.join(', ') : ''
  const responseTime = profile?.response_time || ''
  const responseRate = profile?.response_rate?.toString?.() || ''
  const memberSince = profile?.member_since || ''

  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Seller Dashboard
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Edit Seller Profile</h1>
      </div>

      {success && (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <form action={saveSellerProfile} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-[180px_1fr]">
              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">
                  Profile Image
                </p>

                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-4xl font-bold text-white">
                  {displayName ? displayName.charAt(0).toUpperCase() : 'S'}
                </div>

                <button
                  type="button"
                  className="mt-4 rounded-2xl border px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Upload Image
                </button>

                <p className="mt-2 text-xs text-slate-500">
                  Real upload will be connected later.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Display Name
                  </label>
                  <input
                    name="display_name"
                    type="text"
                    defaultValue={displayName}
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
                    defaultValue={username}
                    className="w-full rounded-2xl border px-4 py-3 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Professional Title
                  </label>
                  <input
                    name="professional_title"
                    type="text"
                    defaultValue={professionalTitle}
                    className="w-full rounded-2xl border px-4 py-3 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Bio
              </label>
              <textarea
                name="bio"
                rows={7}
                defaultValue={bio}
                className="w-full rounded-2xl border px-4 py-3 outline-none"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Skills
                </label>
                <textarea
                  name="skills"
                  rows={5}
                  defaultValue={skills}
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Separate skills with commas.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Languages
                </label>
                <textarea
                  name="languages"
                  rows={5}
                  defaultValue={languages}
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Separate languages with commas.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Response Time
                </label>
                <input
                  name="response_time"
                  type="text"
                  defaultValue={responseTime}
                  className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Response Rate
                </label>
                <input
                  name="response_rate"
                  type="text"
                  defaultValue={responseRate}
                  className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Member Since
                </label>
                <input
                  name="member_since"
                  type="text"
                  defaultValue={memberSince}
                  className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
              >
                Save Profile
              </button>

              <Link
                href={username ? `/seller/${username}` : '#'}
                className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
              >
                Preview Public Profile
              </Link>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Profile Tips
            </h2>

            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <p>Keep your title specific and professional.</p>
              <p>Write a bio that matches the services you actually sell.</p>
              <p>List only relevant skills that strengthen buyer trust.</p>
              <p>Strong seller identity improves profile conversion and review confidence.</p>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Public Profile Rule
            </h2>

            <p className="text-sm leading-7 text-slate-600">
              Your public profile should clearly show who you help, what you do best,
              and why buyers can trust your work.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}