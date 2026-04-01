import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// IP intelligence check using ip-api.com (free, no key needed)
async function checkIP(ip: string) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,org,proxy,vpn,hosting,tor,query`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function getRealIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    '127.0.0.1'
  )
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const ip = getRealIP(req)
    const userAgent = req.headers.get('user-agent') ?? ''
    const { action } = await req.json().catch(() => ({ action: 'login' }))

    // Check IP reputation
    const ipData = await checkIP(ip)

    const isThreat =
      ipData?.proxy === true ||
      ipData?.vpn === true ||
      ipData?.tor === true ||
      ipData?.hosting === true

    const threatType = ipData?.tor
      ? 'TOR'
      : ipData?.vpn
      ? 'VPN'
      : ipData?.proxy
      ? 'Proxy'
      : ipData?.hosting
      ? 'Hosting/RDP'
      : null

    // Detect suspicious user agents (bots, scrapers, headless browsers)
    const suspiciousUA =
      /bot|crawl|spider|scraper|headless|phantom|selenium|puppeteer|playwright/i.test(userAgent)

    const isSuspicious = isThreat || suspiciousUA

    // Log to audit_logs if suspicious
    if (isSuspicious && user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: `SECURITY_FLAG: ${threatType ?? (suspiciousUA ? 'Suspicious User Agent' : 'Unknown')} detected from IP ${ip} (${ipData?.country ?? 'Unknown'})`,
      }).select()

      // Flag the user profile
      await supabase.from('profiles').update({
        account_status: 'flagged',
      }).eq('id', user.id).eq('account_status', 'active') // only flag if currently active, don't override banned
    }

    return NextResponse.json({
      ip,
      country: ipData?.country ?? 'Unknown',
      isp: ipData?.isp ?? 'Unknown',
      isThreat,
      threatType,
      suspiciousUA,
      isSuspicious,
      details: ipData,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Admin endpoint to get all flagged users
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!adminProfile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: flaggedUsers } = await supabase
      .from('profiles')
      .select('id, display_name, email, account_status, created_at')
      .eq('account_status', 'flagged')
      .order('created_at', { ascending: false })

    const { data: securityLogs } = await supabase
      .from('audit_logs')
      .select('action, created_at, profiles(display_name, email)')
      .ilike('action', 'SECURITY_FLAG%')
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ flaggedUsers, securityLogs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
