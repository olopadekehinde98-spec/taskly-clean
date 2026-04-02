import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// IP intelligence check using IPQualityScore (if key available) or ip-api.com fallback
async function checkIP(ip: string) {
  // Try IPQualityScore first if API key is configured
  const ipqsKey = process.env.IPQS_API_KEY
  if (ipqsKey) {
    try {
      const res = await fetch(`https://ipqualityscore.com/api/json/ip/${ipqsKey}/${ip}?strictness=1&allow_public_access_points=true&fast=false`, {
        next: { revalidate: 3600 }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success !== false) {
          // Normalize IPQS response to our standard format
          return {
            source: 'ipqs',
            country: data.country_code,
            isp: data.ISP,
            org: data.organization,
            proxy: data.proxy === true,
            vpn: data.vpn === true,
            tor: data.tor === true,
            hosting: data.host === true || data.active_vpn === true,
            residential_vpn: data.proxy === true && data.connection_type === 'Residential',
            fraud_score: data.fraud_score ?? 0,
            query: ip,
            status: 'success',
          }
        }
      }
    } catch { /* fall through to ip-api.com */ }
  }

  // Fallback to ip-api.com (free, no key needed)
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,org,proxy,vpn,hosting,tor,query`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) return null
    const data = await res.json()
    return { ...data, source: 'ip-api', fraud_score: 0 }
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
      ipData?.hosting === true ||
      ipData?.residential_vpn === true ||
      (ipData?.fraud_score ?? 0) >= 75

    const threatType = ipData?.tor
      ? 'TOR'
      : ipData?.residential_vpn
      ? 'Residential VPN'
      : ipData?.vpn
      ? 'VPN'
      : ipData?.proxy
      ? 'Proxy'
      : ipData?.hosting
      ? 'Hosting/RDP'
      : (ipData?.fraud_score ?? 0) >= 75
      ? `High Fraud Score (${ipData?.fraud_score})`
      : null

    // Detect suspicious user agents (bots, scrapers, headless browsers)
    const suspiciousUA =
      /bot|crawl|spider|scraper|headless|phantom|selenium|puppeteer|playwright/i.test(userAgent)

    const isSuspicious = isThreat || suspiciousUA

    // Log to audit_logs if suspicious
    if (isSuspicious && user) {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        actor_id: user.id,
        target_id: user.id,
        target_type: 'user',
        action_type: 'security_flag',
        ip_address: ip,
        action: `SECURITY_FLAG: ${threatType ?? (suspiciousUA ? 'Suspicious User Agent' : 'Unknown')} detected from IP ${ip} (${ipData?.country ?? 'Unknown'})${ipData?.fraud_score ? ` fraud_score=${ipData.fraud_score}` : ''} via ${ipData?.source ?? 'ip-api'}`,
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
      fraudScore: ipData?.fraud_score ?? 0,
      detectionSource: ipData?.source ?? 'unknown',
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
