import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { message } = await req.json()
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    // Fetch ALL platform data in parallel
    const [
      // Users
      { data: recentUsers },
      { count: totalUsers },
      { count: totalSellers },
      { count: bannedUsers },
      { data: sellerApplicants },

      // Listings/Gigs
      { data: recentListings },
      { count: liveListings },
      { count: pendingListings },

      // Orders
      { data: recentOrders },
      { count: totalOrders },
      { count: completedOrders },
      { count: inProgressOrders },

      // Revenue
      { data: revenueData },

      // Violations & Disputes
      { data: violations },
      { data: disputes },
      { count: openDisputes },

      // Support tickets
      { data: supportTickets },
      { count: openTickets },

      // Conversations / messages
      { data: recentConversations },

      // Audit logs
      { data: auditLogs },

      // Security flags
      { data: flaggedUsers },
    ] = await Promise.all([
      // Users
      supabase.from('profiles').select('display_name, email, is_seller, is_admin, account_status, created_at').order('created_at', { ascending: false }).limit(15),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_seller', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'banned'),
      supabase.from('profiles').select('display_name, email, created_at, account_status').eq('is_seller', true).order('created_at', { ascending: false }).limit(10),

      // Listings
      supabase.from('listings').select('title, listing_status, moderation_status, created_at, profiles(display_name, email)').order('created_at', { ascending: false }).limit(15),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('listing_status', 'live'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending'),

      // Orders
      supabase.from('orders').select('id, status, amount_usd, created_at, buyer:profiles!orders_buyer_id_fkey(display_name, email), listings(title)').order('created_at', { ascending: false }).limit(15),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),

      // Revenue — sum of completed orders
      supabase.from('orders').select('amount_usd, created_at').eq('status', 'completed').order('created_at', { ascending: false }).limit(50),

      // Violations
      supabase.from('violations').select('reason, created_at, profiles(display_name, email)').order('created_at', { ascending: false }).limit(10),
      supabase.from('disputes').select('reason, status, created_at, profiles!disputes_buyer_id_fkey(display_name, email)').order('created_at', { ascending: false }).limit(10),
      supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),

      // Support tickets
      supabase.from('support_tickets').select('summary, status, created_at, profiles(display_name, email)').order('created_at', { ascending: false }).limit(10),
      supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),

      // Messages/Conversations
      supabase.from('conversations').select('created_at, profiles!conversations_buyer_id_fkey(display_name), profiles!conversations_seller_id_fkey(display_name)').order('created_at', { ascending: false }).limit(10),

      // Audit logs
      supabase.from('audit_logs').select('action, created_at, profiles(display_name, email)').order('created_at', { ascending: false }).limit(15),

      // Security-flagged users
      supabase.from('profiles').select('display_name, email, account_status, created_at').eq('account_status', 'flagged').limit(10),
    ])

    // Calculate revenue
    const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.amount_usd ?? 0), 0) ?? 0
    const platformRevenue = totalRevenue * 0.1 // 10% fee
    const last30Revenue = revenueData
      ?.filter(o => new Date(o.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      ?.reduce((sum, o) => sum + (o.amount_usd ?? 0), 0) ?? 0

    const platformContext = `
You are a powerful AI admin assistant for TasklyClean marketplace. You have FULL access to live platform data updated in real time. Be concise, insightful, and proactive — flag anything suspicious.

Today's date: ${new Date().toLocaleString()}

╔══════════════════════════════╗
║      PLATFORM OVERVIEW       ║
╚══════════════════════════════╝
👥 Total Users:        ${totalUsers ?? 0}
🏪 Total Sellers:      ${totalSellers ?? 0}
🚫 Banned Users:       ${bannedUsers ?? 0}
🔴 Flagged Users:      ${flaggedUsers?.length ?? 0}
📋 Live Listings:      ${liveListings ?? 0}
⏳ Pending Moderation: ${pendingListings ?? 0}
📦 Total Orders:       ${totalOrders ?? 0}
✅ Completed Orders:   ${completedOrders ?? 0}
🔄 In Progress:        ${inProgressOrders ?? 0}
⚖️ Open Disputes:      ${openDisputes ?? 0}
💬 Open Support Tickets: ${openTickets ?? 0}

╔══════════════════════════════╗
║        REVENUE DATA          ║
╚══════════════════════════════╝
💰 Total GMV (completed orders): $${totalRevenue.toFixed(2)}
🏦 Platform Revenue (10% fee):   $${platformRevenue.toFixed(2)}
📅 Last 30 days GMV:             $${last30Revenue.toFixed(2)}
📅 Last 30 days platform revenue: $${(last30Revenue * 0.1).toFixed(2)}

╔══════════════════════════════╗
║    RECENT SIGN-UPS (last 15) ║
╚══════════════════════════════╝
${recentUsers?.map(u => `• ${u.display_name ?? 'Unknown'} (${u.email}) — ${u.is_admin ? '🔴 Admin' : u.is_seller ? '🏪 Seller' : '🛒 Buyer'} — ${u.account_status ?? 'active'} — ${new Date(u.created_at).toLocaleString()}`).join('\n') ?? 'No data'}

╔══════════════════════════════╗
║   SELLER APPLICATIONS (last 10) ║
╚══════════════════════════════╝
${sellerApplicants?.map(u => `• ${u.display_name ?? 'Unknown'} (${u.email}) — ${u.account_status ?? 'active'} — ${new Date(u.created_at).toLocaleString()}`).join('\n') ?? 'No sellers yet'}

╔══════════════════════════════╗
║  RECENT GIGS CREATED (last 15) ║
╚══════════════════════════════╝
${recentListings?.map(l => `• "${l.title}" by ${(l.profiles as any)?.display_name ?? 'Unknown'} (${(l.profiles as any)?.email}) — ${l.listing_status} / ${l.moderation_status} — ${new Date(l.created_at).toLocaleString()}`).join('\n') ?? 'No data'}

╔══════════════════════════════╗
║   RECENT ORDERS (last 15)    ║
╚══════════════════════════════╝
${recentOrders?.map(o => `• Order #${String(o.id)?.slice(0, 8)} | "${(o.listings as any)?.title ?? 'Unknown'}" | Buyer: ${(o.buyer as any)?.display_name ?? 'Unknown'} | $${o.amount_usd ?? '?'} | ${o.status} | ${new Date(o.created_at).toLocaleString()}`).join('\n') ?? 'No data'}

╔══════════════════════════════╗
║   RECENT VIOLATIONS (last 10) ║
╚══════════════════════════════╝
${violations?.map(v => `• ${(v.profiles as any)?.display_name ?? 'Unknown'} (${(v.profiles as any)?.email}) — ${v.reason} — ${new Date(v.created_at).toLocaleString()}`).join('\n') ?? 'No violations'}

╔══════════════════════════════╗
║   RECENT DISPUTES (last 10)  ║
╚══════════════════════════════╝
${disputes?.map(d => `• ${(d.profiles as any)?.display_name ?? 'Unknown'} — ${d.status} — ${d.reason} — ${new Date(d.created_at).toLocaleString()}`).join('\n') ?? 'No disputes'}

╔══════════════════════════════╗
║  SUPPORT TICKETS (last 10)   ║
╚══════════════════════════════╝
${supportTickets?.map(t => `• [${t.status}] ${t.summary} — ${(t.profiles as any)?.display_name ?? 'Guest'} (${(t.profiles as any)?.email ?? 'unknown'}) — ${new Date(t.created_at).toLocaleString()}`).join('\n') ?? 'No tickets'}

╔══════════════════════════════╗
║  RECENT MESSAGES (last 10)   ║
╚══════════════════════════════╝
${recentConversations?.map((c: any) => `• Buyer: ${c['profiles']?.[0]?.display_name ?? 'Unknown'} ↔ Seller: ${c['profiles']?.[1]?.display_name ?? 'Unknown'} — ${new Date(c.created_at).toLocaleString()}`).join('\n') ?? 'No data'}

╔══════════════════════════════╗
║    AUDIT LOG (last 15)       ║
╚══════════════════════════════╝
${auditLogs?.map(a => `• ${(a.profiles as any)?.display_name ?? 'Unknown'} (${(a.profiles as any)?.email}) — ${a.action} — ${new Date(a.created_at).toLocaleString()}`).join('\n') ?? 'No audit logs'}

╔══════════════════════════════╗
║   FLAGGED/SUSPICIOUS USERS   ║
╚══════════════════════════════╝
${flaggedUsers && flaggedUsers.length > 0 ? flaggedUsers.map(u => `⚠️ ${u.display_name ?? 'Unknown'} (${u.email}) — ${u.account_status} — ${new Date(u.created_at).toLocaleString()}`).join('\n') : '✅ No flagged users'}

╔══════════════════════════════╗
║  PLATFORM RULES (SUMMARY)    ║
╚══════════════════════════════╝
- Fees: 10% new sellers, 5% Top Rated sellers
- Payout clearing: 14 days after order completion
- Banned activities: fraud, fake reviews, off-platform payments, hate speech, bots
- Listings require moderation approval before going live
- Disputes: admin decision is final
- Users can be warned, restricted, suspended, or permanently banned
`

    const aiResponse = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: platformContext,
      messages: [{ role: 'user', content: message }],
    })

    const textBlock = aiResponse.content.find(b => b.type === 'text')
    const text = (textBlock && 'text' in textBlock ? textBlock.text : '') ?? ''

    return NextResponse.json({ result: text })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
