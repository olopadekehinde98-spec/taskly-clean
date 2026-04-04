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

    const { message, history: clientHistory = [], session_id } = await req.json()
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
      supabase.from('orders').select('id, order_status, subtotal_amount, created_at, buyer:profiles!orders_buyer_id_fkey(display_name, email), listings(title)').order('created_at', { ascending: false }).limit(15),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'completed'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'active'),

      // Revenue — sum of completed orders
      supabase.from('orders').select('subtotal_amount, seller_net_amount, created_at').eq('order_status', 'completed').order('created_at', { ascending: false }).limit(50),

      // Violations (table may not exist — handle gracefully)
      supabase.from('audit_logs').select('action, action_type, created_at, profiles!audit_logs_actor_id_fkey(display_name, email)').in('action_type', ['ban', 'flag', 'suspend', 'restrict']).order('created_at', { ascending: false }).limit(10),
      supabase.from('disputes').select('description, status, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),

      // Support tickets
      supabase.from('support_tickets').select('summary, status, created_at, profiles(display_name, email)').order('created_at', { ascending: false }).limit(10),
      supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),

      // Messages/Conversations
      supabase.from('conversations').select('created_at, a:profiles!conversations_participant_a_fkey(display_name), b:profiles!conversations_participant_b_fkey(display_name)').order('created_at', { ascending: false }).limit(10),

      // Audit logs with IP addresses
      supabase.from('audit_logs').select('action, action_type, ip_address, created_at, profiles!audit_logs_actor_id_fkey(display_name, email)').order('created_at', { ascending: false }).limit(15),

      // Security-flagged users
      supabase.from('profiles').select('display_name, email, account_status, created_at').eq('account_status', 'flagged').limit(10),
    ])

    // Calculate revenue
    const totalRevenue = revenueData?.reduce((sum, o) => sum + (Number(o.subtotal_amount) ?? 0), 0) ?? 0
    const platformRevenue = revenueData?.reduce((sum, o) => sum + (Number(o.subtotal_amount) - Number(o.seller_net_amount ?? 0)), 0) ?? 0
    const last30Revenue = revenueData
      ?.filter(o => new Date(o.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      ?.reduce((sum, o) => sum + (Number(o.subtotal_amount) ?? 0), 0) ?? 0

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
${recentOrders?.map(o => `• Order #${String(o.id)?.slice(0, 8)} | "${(o.listings as any)?.title ?? 'Unknown'}" | Buyer: ${(o.buyer as any)?.display_name ?? 'Unknown'} | $${(o as any).subtotal_amount ?? '?'} | ${(o as any).order_status} | ${new Date(o.created_at).toLocaleString()}`).join('\n') ?? 'No data'}

╔══════════════════════════════╗
║   RECENT VIOLATIONS (last 10) ║
╚══════════════════════════════╝
${violations?.map((v: any) => `• ${(v.profiles as any)?.display_name ?? 'Unknown'} (${(v.profiles as any)?.email}) — ${v.action_type} — ${new Date(v.created_at).toLocaleString()}`).join('\n') ?? 'No violations'}

╔══════════════════════════════╗
║   RECENT DISPUTES (last 10)  ║
╚══════════════════════════════╝
${disputes?.map((d: any) => `• ${d.status} — ${d.description ?? '—'} — ${new Date(d.created_at).toLocaleString()}`).join('\n') ?? 'No disputes'}

╔══════════════════════════════╗
║  SUPPORT TICKETS (last 10)   ║
╚══════════════════════════════╝
${supportTickets?.map(t => `• [${t.status}] ${t.summary} — ${(t.profiles as any)?.display_name ?? 'Guest'} (${(t.profiles as any)?.email ?? 'unknown'}) — ${new Date(t.created_at).toLocaleString()}`).join('\n') ?? 'No tickets'}

╔══════════════════════════════╗
║  RECENT MESSAGES (last 10)   ║
╚══════════════════════════════╝
${recentConversations?.map((c: any) => `• ${c.a?.display_name ?? 'Unknown'} ↔ ${c.b?.display_name ?? 'Unknown'} — ${new Date(c.created_at).toLocaleString()}`).join('\n') ?? 'No data'}

╔══════════════════════════════╗
║    AUDIT LOG (last 15)       ║
╚══════════════════════════════╝
${auditLogs?.map((a: any) => `• ${(a.profiles as any)?.display_name ?? 'Unknown'} (${(a.profiles as any)?.email}) — ${a.action} — IP: ${a.ip_address ?? 'n/a'} — ${new Date(a.created_at).toLocaleString()}`).join('\n') ?? 'No audit logs'}

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

╔══════════════════════════════╗
║   ADMIN ACTIONS YOU CAN DO   ║
╚══════════════════════════════╝
You can guide the admin to take these actions on the /admin/users page:
- BAN a user: Find the user in the users table and click the "Ban" button. Status → banned.
- RESTRICT a user: Click "Restrict" button. Status → restricted (limited access).
- SUSPEND a user: Click "Suspend" button. Status → suspended (temporary lockout).
- RESTORE a user: If banned/suspended, click "Restore" to set status → active.
- FLAG a user manually: Click "Flag" button. Status → flagged (marked suspicious).
- UNFLAG a user: If status is flagged, click "Unflag" to restore to active.

When the admin says "ban [username/email]", "flag [user]", "unflag [user]", "suspend [user]", etc.,
provide the exact action: "Go to /admin/users, find [user email], and click [ACTION]."
You can identify users from the platform data above and give precise instructions.
`

    // Build message history for multi-turn conversation
    const historyMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...(clientHistory || []),
      { role: 'user', content: message },
    ]

    const aiResponse = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: platformContext,
      messages: historyMessages,
    })

    const textBlock = aiResponse.content.find(b => b.type === 'text')
    const text = (textBlock && 'text' in textBlock ? textBlock.text : '') ?? ''

    // Persist conversation to DB
    const sid = session_id || crypto.randomUUID()
    await supabase.from('ai_conversations').insert([
      { user_id: user.id, session_id: sid, role: 'user', message, feature: 'admin_chat' },
      { user_id: user.id, session_id: sid, role: 'assistant', message: text, feature: 'admin_chat' },
    ]).then(({ error: e }) => { if (e) console.error('admin ai persist error:', e.message) })

    return NextResponse.json({ result: text, session_id: sid })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
