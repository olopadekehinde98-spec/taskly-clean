import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Security & Threats — Admin' }

export default async function AdminSecurityPage() {
  const supabase = await createClient()

  const [
    { data: flaggedUsers },
    { data: securityLogs },
    { data: bannedUsers },
    { data: recentLogins },
  ] = await Promise.all([
    supabase.from('profiles').select('id, display_name, email, account_status, created_at').eq('account_status', 'flagged').order('created_at', { ascending: false }),
    supabase.from('audit_logs').select('action, created_at, ip_address, profiles(display_name, email)').ilike('action', 'SECURITY_FLAG%').order('created_at', { ascending: false }).limit(50),
    supabase.from('profiles').select('id, display_name, email, account_status, created_at').eq('account_status', 'banned').order('created_at', { ascending: false }),
    supabase.from('audit_logs').select('action, created_at, ip_address, profiles(display_name, email)').ilike('action', 'LOGIN%').order('created_at', { ascending: false }).limit(30),
  ])

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-red-600">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Security & Threats</h1>
        <p className="mt-1 text-sm text-slate-500">VPN, proxy, TOR, RDP detections and suspicious activity.</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Flagged Users</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{flaggedUsers?.length ?? 0}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Banned Users</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{bannedUsers?.length ?? 0}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Security Events</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{securityLogs?.length ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Flagged users */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">⚠️ Flagged Users (VPN/Proxy/TOR/RDP)</h2>
          {!flaggedUsers || flaggedUsers.length === 0 ? (
            <p className="text-center text-slate-400 py-6">✅ No flagged users</p>
          ) : (
            <div className="space-y-2">
              {flaggedUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{u.display_name ?? 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{u.email} · flagged {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1">flagged</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Security event log */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">🔴 Security Event Log</h2>
          {!securityLogs || securityLogs.length === 0 ? (
            <p className="text-center text-slate-400 py-6">No security events</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {securityLogs.map((log, i) => (
                <div key={i} className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                  <p className="text-xs font-semibold text-red-800">{log.action}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {(log.profiles as any)?.display_name ?? 'Unknown'} ({(log.profiles as any)?.email})
                    {(log as any).ip_address && <> · IP: <span className="font-mono">{(log as any).ip_address}</span></>}
                    {' '}· {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Banned users */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">🚫 Banned Users</h2>
          {!bannedUsers || bannedUsers.length === 0 ? (
            <p className="text-center text-slate-400 py-6">No banned users</p>
          ) : (
            <div className="space-y-2">
              {bannedUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{u.display_name ?? 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span className="rounded-full bg-red-100 text-red-700 text-xs font-bold px-2 py-1">banned</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent logins */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">🔑 Recent Logins</h2>
          {!recentLogins || recentLogins.length === 0 ? (
            <p className="text-center text-slate-400 py-6">No login history yet</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentLogins.map((log, i) => (
                <div key={i} className="rounded-xl bg-slate-50 border px-4 py-2.5">
                  <p className="text-xs text-slate-700">{log.action}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {(log as any).ip_address && <span className="font-mono mr-2">{(log as any).ip_address}</span>}
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">🤖 Ask the Admin AI about security</p>
        <p>Go to the <Link href="/admin" className="underline font-medium">Admin Overview</Link> and ask: <em>"Are there any suspicious users?"</em> or <em>"Show me all flagged accounts"</em></p>
      </div>
    </div>
  )
}
