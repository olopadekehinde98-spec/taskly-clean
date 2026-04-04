import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileImageUpload from '@/components/ProfileImageUpload'
import { saveBuyerProfile } from './actions'

export default async function BuyerSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const params = await searchParams
  const success = params?.success

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, bio, avatar_url, phone, full_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name || user.email?.split('@')[0] || ''
  const username = profile?.username || ''
  const bio = profile?.bio || ''
  const avatarUrl = profile?.avatar_url || null
  const phone = (profile as any)?.phone || ''

  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Buyer Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
      </div>

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <section className="space-y-8">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900">Profile Information</h2>
            <form action={saveBuyerProfile} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[160px_1fr]">
                <ProfileImageUpload
                  currentLetter={displayName ? displayName.charAt(0).toUpperCase() : 'B'}
                  currentAvatarUrl={avatarUrl}
                />
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Display Name</label>
                    <input
                      name="display_name"
                      type="text"
                      defaultValue={displayName}
                      className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
                    <input
                      name="username"
                      type="text"
                      defaultValue={username}
                      className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={user.email ?? ''}
                      disabled
                      className="w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none text-slate-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-slate-400">Email cannot be changed here.</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
                    <input
                      name="phone"
                      type="text"
                      defaultValue={phone}
                      placeholder="+1 555 000 0000"
                      className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Short Bio</label>
                <textarea
                  name="bio"
                  rows={4}
                  defaultValue={bio}
                  placeholder="Tell sellers a bit about yourself..."
                  className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <button type="submit" className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors">
                Save Profile
              </button>
            </form>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                'New message alerts',
                'Delivery submitted alerts',
                'Order completion alerts',
                'Review reminders',
              ].map(label => (
                <label key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm font-medium text-slate-800">{label}</span>
                  <input type="checkbox" defaultChecked className="h-5 w-5 accent-blue-600" />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Payment Preferences</h2>
            <p className="text-sm text-slate-500 leading-6">Payment method management will be available when billing is connected. Orders are currently processed manually.</p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Account Tips</h2>
            <div className="space-y-3 text-sm leading-7 text-slate-600">
              <p>Keep your contact details accurate for smooth order communication.</p>
              <p>Turn on important alerts so you do not miss deliveries or messages.</p>
              <p>A clear buyer profile helps sellers communicate faster.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
