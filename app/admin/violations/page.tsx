import { createClient } from '@/lib/supabase/server'
import { updateUserStatus } from '../actions'

const RISK_STYLES: Record<string, string> = {
  banned: 'bg-red-100 text-red-700 border-red-200',
  suspended: 'bg-orange-100 text-orange-700 border-orange-200',
  restricted: 'bg-amber-100 text-amber-700 border-amber-200',
}

const RISK_LABEL: Record<string, string> = {
  banned: '🔴 High — Banned',
  suspended: '🟠 Medium — Suspended',
  restricted: '🟡 Low — Restricted',
}

export default async function AdminViolationsPage() {
  const supabase = await createClient()

  // Fetch users who have been actioned (restricted/suspended/banned)
  const { data: violators } = await supabase
    .from('profiles')
    .select('id, display_name, email, username, account_status, is_seller, created_at')
    .in('account_status', ['restricted', 'suspended', 'banned'])
    .order('created_at', { ascending: false })

  // Fetch recent audit log actions on users
  const { data: auditLog } = await supabase
    .from('audit_logs')
    .select('id, actor_id, target_id, action_type, reason, target_type, created_at')
    .eq('target_type', 'user')
    .order('created_at', { ascending: false })
    .limit(50)

  // Build a map of violation history per user
  const historyMap: Record<string, any[]> = {}
  if (auditLog) {
    for (const log of auditLog) {
      if (!historyMap[log.target_id]) historyMap[log.target_id] = []
      historyMap[log.target_id].push(log)
    }
  }

  const bannedCount = violators?.filter(v => v.account_status === 'banned').length ?? 0
  const suspendedCount = violators?.filter(v => v.account_status === 'suspended').length ?? 0
  const restrictedCount = violators?.filter(v => v.account_status === 'restricted').length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-red-600">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Rule Violators</h1>
        <p className="mt-1 text-sm text-slate-500">Users who have been flagged, restricted, suspended, or banned from the platform.</p>
      </div>

      {/* Risk summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">🔴 Banned</p>
          <p className="text-3xl font-bold text-red-800 mt-1">{bannedCount}</p>
        </div>
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-sm font-medium text-orange-700">🟠 Suspended</p>
          <p className="text-3xl font-bold text-orange-800 mt-1">{suspendedCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-700">🟡 Restricted</p>
          <p className="text-3xl font-bold text-amber-800 mt-1">{restrictedCount}</p>
        </div>
      </div>

      {!violators || violators.length === 0 ? (
        <div className="rounded-3xl border bg-white p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-xl font-bold text-slate-900">No rule violators</h2>
          <p className="mt-2 text-slate-500 text-sm">All users are in good standing.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {violators.map((u: any) => {
            const history = historyMap[u.id] ?? []
            return (
              <div key={u.id} className={`rounded-3xl border p-6 bg-white shadow-sm ${RISK_STYLES[u.account_status] ?? ''}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${RISK_STYLES[u.account_status] ?? 'bg-slate-100'}`}>
                        {RISK_LABEL[u.account_status]}
                      </span>
                      <span className="text-xs text-slate-400">Joined {new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="font-semibold text-slate-900">{u.display_name ?? 'No name'}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                    {u.username && <p className="text-xs text-[#3ecf68]">@{u.username}</p>}

                    {history.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-slate-500 mb-1">Action history</p>
                        <div className="space-y-1">
                          {history.slice(0, 3).map((log: any) => (
                            <div key={log.id} className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="capitalize font-medium text-slate-700">{log.action_type}</span>
                              <span>·</span>
                              <span>{log.reason}</span>
                              <span>·</span>
                              <span>{new Date(log.created_at).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <p className="text-xs font-medium text-slate-500">Admin actions</p>
                    <div className="flex gap-2 flex-wrap">
                      {u.account_status !== 'banned' && (
                        <form action={updateUserStatus}>
                          <input type="hidden" name="user_id" value={u.id} />
                          <input type="hidden" name="action" value="ban" />
                          <input type="hidden" name="reason" value="Platform ban after violation review" />
                          <button className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">Ban</button>
                        </form>
                      )}
                      {u.account_status !== 'suspended' && u.account_status !== 'banned' && (
                        <form action={updateUserStatus}>
                          <input type="hidden" name="user_id" value={u.id} />
                          <input type="hidden" name="action" value="suspend" />
                          <input type="hidden" name="reason" value="Suspended after violation review" />
                          <button className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100">Suspend</button>
                        </form>
                      )}
                      <form action={updateUserStatus}>
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="action" value="restore" />
                        <input type="hidden" name="reason" value="Restored after violation review" />
                        <button className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">Restore</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
