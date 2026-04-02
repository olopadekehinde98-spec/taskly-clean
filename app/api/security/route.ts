import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Extract free geo/threat data from Cloudflare or Vercel edge headers (no API key needed)
function getEdgeGeoData(req: NextRequest) {
  return {
    country: req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || null,
    city: req.headers.get('cf-ipcity') || req.headers.get('x-vercel-ip-city') || null,
    region: req.headers.get('x-vercel-ip-country-region') || null,
    // Cloudflare threat score: 0–100, higher = more suspicious
    cfThreatScore: parseInt(req.headers.get('cf-threat-score') ?? '0', 10),
    // Cloudflare bot management score: lower = more likely a bot
    cfBotScore: req.headers.get('cf-bot-management-score')
      ? parseInt(req.headers.get('cf-bot-management-score')!, 10)
      : null,
  }
}

// IP intelligence check — IPQualityScore (if configured) or ip-api.com fallback
async function checkIP(ip: string) {
  const ipqsKey = process.env.IPQS_API_KEY
  if (ipqsKey) {
    try {
      const res = await fetch(
        `https://ipqualityscore.com/api/json/ip/${ipqsKey}/${ip}?strictness=1&allow_public_access_points=true&fast=false`,
        { next: { revalidate: 3600 } }
      )
      if (res.ok) {
        const data = await res.json()
        if (data.success !== false) {
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
          }
        }
      }
    } catch { /* fall through */ }
  }

  // Free fallback
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,org,proxy,vpn,hosting,tor,query`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return { ...data, source: 'ip-api', fraud_score: 0 }
  } catch {
    return null
  }
}

function getRealIP(req: NextRequest): string {
  // Cloudflare always gives the real IP in cf-connecting-ip
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const ip = getRealIP(req)
    const userAgent = req.headers.get('user-agent') ?? ''
    await req.json().catch(() => ({}))

    // Free edge intelligence from Cloudflare/Vercel (no key needed)
    const edgeGeo = getEdgeGeoData(req)

    // Deeper IP check via API
    const ipData = await checkIP(ip)

    const cfThreatSuspicious = edgeGeo.cfThreatScore >= 10
    const cfBotSuspicious = edgeGeo.cfBotScore !== null && edgeGeo.cfBotScore < 30

    const isThreat =
      ipData?.proxy === true ||
      ipData?.vpn === true ||
      ipData?.tor === true ||
      ipData?.hosting === true ||
      ipData?.residential_vpn === true ||
      (ipData?.fraud_score ?? 0) >= 75 ||
      cfThreatSuspicious

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
      : cfThreatSuspicious
      ? `Cloudflare Threat (score ${edgeGeo.cfThreatScore})`
      : (ipData?.fraud_score ?? 0) >= 75
      ? `High Fraud Score (${ipData?.fraud_score})`
      : null

    const suspiciousUA =
      /bot|crawl|spider|scraper|headless|phantom|selenium|puppeteer|playwright/i.test(userAgent)

    const isSuspicious = isThreat || suspiciousUA || cfBotSuspicious

    const country = ipData?.country ?? edgeGeo.country ?? 'Unknown'
    const city = edgeGeo.city ?? 'Unknown'

    if (isSuspicious && user) {
      const label = threatType ?? (suspiciousUA ? 'Suspicious UA' : cfBotSuspicious ? 'Bot Traffic' : 'Unknown')
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        actor_id: user.id,
        target_id: user.id,
        target_type: 'user',
        action_type: 'security_flag',
        ip_address: ip,
        action: `SECURITY_FLAG: ${label} from IP ${ip} (${country}${city !== 'Unknown' ? ', ' + city : ''})${ipData?.fraud_score ? ` fraud=${ipData.fraud_score}` : ''}${edgeGeo.cfThreatScore > 0 ? ` cf_threat=${edgeGeo.cfThreatScore}` : ''} via ${ipData?.source ?? 'edge'}`,
      }).then(({ error }) => { if (error) console.error('Security audit log failed:', error.message) })

      await supabase.from('profiles').update({ account_status: 'flagged' })
        .eq('id', user.id).eq('account_status', 'active')
    }

    return NextResponse.json({
      ip,
      country,
      city,
      isp: ipData?.isp ?? 'Unknown',
      isThreat,
      threatType,
      suspiciousUA,
      isSuspicious,
      fraudScore: ipData?.fraud_score ?? 0,
      cfThreatScore: edgeGeo.cfThreatScore,
      cfBotScore: edgeGeo.cfBotScore,
      detectionSource: ipData?.source ?? 'edge-only',
      details: ipData,
      edge: edgeGeo,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Admin endpoint — flagged users + IP logs
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!adminProfile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const [{ data: flaggedUsers }, { data: securityLogs }] = await Promise.all([
      supabase.from('profiles')
        .select('id, display_name, email, account_status, created_at')
        .eq('account_status', 'flagged')
        .order('created_at', { ascending: false }),
      supabase.from('audit_logs')
        .select('action, created_at, ip_address, profiles(display_name, email)')
        .ilike('action', 'SECURITY_FLAG%')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    return NextResponse.json({ flaggedUsers, securityLogs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
