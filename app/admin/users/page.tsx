import { createClient } from '@/lib/supabase/server'
import { updateUserStatus, flagUser, unflagUser } from '../actions'

function statusBadge(status: string | null) {
  const s = status ?? 'active'
  if (s === 'active') return 'bg-emerald-100 text-emerald-700'
  if (s === 'restricted') return 'bg-amber-100 text-amber-700'
  if (s === 'suspended') return 'bg-orange-100 text-orange-700'
  if (s === 'banned') return 'bg-red-100 text-red-700'
  if (s === 'flagged') return 'bg-yellow-100 text-yellow-700'
  return 'bg-slate-100 text-slate-600'
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>
}) {
  const { q, role } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, email, display_name, username, is_seller, is_admin, account_status, created_at, trust_tier')
    .order('created_at', { ascending: false })
    .limit(100)

  if (q) query = query.ilike('email', `%${q}%`)
  if (role === 'seller') query = query.eq('is_seller', true)
  if (role === 'admin') query = query.eq('is_admin', true)
  if (role === 'buyer') query = query.eq('is_seller', false).eq('is_admin', false)

  const { data: users } = await query

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-red-600">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email..."
          className="rounded-xl border px-4 py-2 text-sm outline-none focus:border-blue-500 w-64"
        />
        <select name="role" defaultValue={role ?? ''} className="rounded-xl border px-4 py-2 text-sm outline-none">
          <option value="">All roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
        <button type="submit" className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">Filter</button>
      </form>

      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <p className="text-sm text-slate-500">{users?.length ?? 0} users found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!users || users.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No users found</td></tr>
              ) : users.map((u: any) => (
                <tr key={u.id} className="border-t hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{u.display_name ?? 'No name'}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                    {u.username && <p className="text-xs text-blue-500">@{u.username}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.is_admin ? 'bg-red-100 text-red-700' : u.is_seller ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.is_admin ? 'Admin' : u.is_seller ? 'Seller' : 'Buyer'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadge(u.account_status)}`}>
                      {u.account_status ?? 'active'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {(!u.account_status || u.account_status === 'active') && !u.is_admin && (
                        <>
                          <form action={updateUserStatus}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <input type="hidden" name="action" value="restrict" />
                            <input type="hidden" name="reason" value="Admin restriction" />
                            <button type="submit" className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-700 hover:bg-amber-100">Restrict</button>
                          </form>
                          <form action={updateUserStatus}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <input type="hidden" name="action" value="suspend" />
                            <input type="hidden" name="reason" value="Admin suspension" />
                            <button type="submit" className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-1 text-xs text-orange-700 hover:bg-orange-100">Suspend</button>
                          </form>
                          <form action={updateUserStatus}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <input type="hidden" name="action" value="ban" />
                            <input type="hidden" name="reason" value="Admin ban" />
                            <button type="submit" className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100">Ban</button>
                          </form>
                          <form action={flagUser}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <input type="hidden" name="reason" value="Manually flagged by admin" />
                            <button type="submit" className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs text-yellow-700 hover:bg-yellow-100">Flag</button>
                          </form>
                        </>
                      )}
                      {u.account_status === 'flagged' && !u.is_admin && (
                        <>
                          <form action={unflagUser}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <input type="hidden" name="reason" value="Manually unflagged by admin" />
                            <button type="submit" className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-100">Unflag</button>
                          </form>
                          <form action={updateUserStatus}>
                            <input type="hidden" name="user_id" value={u.id} />
                            <input type="hidden" name="action" value="ban" />
                            <input type="hidden" name="reason" value="Admin ban of flagged user" />
                            <button type="submit" className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100">Ban</button>
                          </form>
                        </>
                      )}
                      {u.account_status && u.account_status !== 'active' && u.account_status !== 'flagged' && (
                        <form action={updateUserStatus}>
                          <input type="hidden" name="user_id" value={u.id} />
                          <input type="hidden" name="action" value="restore" />
                          <input type="hidden" name="reason" value="Admin restore" />
                          <button type="submit" className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-100">Restore</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
