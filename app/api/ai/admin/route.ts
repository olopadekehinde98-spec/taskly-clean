'use server'
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

    // Fetch live platform data to give the AI full context
    const [
      { data: recentUsers },
      { data: recentListings },
      { data: recentOrders },
      { data: violations },
      { data: disputes },
      { count: totalUsers },
      { count: totalSellers },
      { count: openDisputes },
      { count: pendingListings },
    ] = await Promise.all([
      supabase.from('profiles').select('display_name, email, is_seller, is_admin, account_status, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('listings').select('title, listing_status, moderation_status, created_at, profiles(display_name, email)').order('created_at', { ascending: false }).limit(10),
      supabase.from('orders').select('id, status, created_at, buyer:profiles!orders_buyer_id_fkey(display_name), listings(title)').order('created_at', { ascending: false }).limit(10),
      supabase.from('violations').select('reason, created_at, profiles(display_name, email)').order('created_at', { ascending: false }).limit(10),
      supabase.from('disputes').select('reason, status, created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_seller', true),
      supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
    ])

    const platformContext = `
You are an AI admin assistant for TasklyClean marketplace. You have full access to live platform data. Be concise and helpful.

=== PLATFORM SUMMARY ===
- Total users: ${totalUsers ?? 0}
- Total sellers: ${totalSellers ?? 0}
- Open disputes: ${openDisputes ?? 0}
- Listings pending review: ${pendingListings ?? 0}

=== RECENT SIGN-UPS (last 10) ===
${recentUsers?.map(u => `- ${u.display_name ?? 'Unknown'} (${u.email}) — ${u.is_admin ? 'Admin' : u.is_seller ? 'Seller' : 'Buyer'} — status: ${u.account_status ?? 'active'} — joined: ${new Date(u.created_at).toLocaleString()}`).join('\n') ?? 'No data'}

=== RECENT LISTINGS/GIGS CREATED (last 10) ===
${recentListings?.map(l => `- "${l.title}" by ${(l.profiles as any)?.display_name ?? 'Unknown'} (${(l.profiles as any)?.email}) — status: ${l.listing_status}, moderation: ${l.moderation_status} — created: ${new Date(l.created_at).toLocaleString()}`).join('\n') ?? 'No data'}

=== RECENT ORDERS (last 10) ===
${recentOrders?.map(o => `- Order #${o.id?.slice(0, 8)} for "${(o.listings as any)?.title ?? 'Unknown gig'}" by ${(o.buyer as any)?.display_name ?? 'Unknown'} — status: ${o.status} — ${new Date(o.created_at).toLocaleString()}`).join('\n') ?? 'No data'}

=== RECENT VIOLATIONS (last 10) ===
${violations?.map(v => `- ${(v.profiles as any)?.display_name ?? 'Unknown'} (${(v.profiles as any)?.email}) — reason: ${v.reason} — ${new Date(v.created_at).toLocaleString()}`).join('\n') ?? 'No violations'}

=== RECENT DISPUTES (last 10) ===
${disputes?.map(d => `- Status: ${d.status} — Reason: ${d.reason} — ${new Date(d.created_at).toLocaleString()}`).join('\n') ?? 'No disputes'}
`

    const aiResponse = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
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
