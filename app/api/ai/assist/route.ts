import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, context, history = [], session_id } = await req.json()
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, is_seller, is_admin')
      .eq('id', user.id)
      .single()

    const userName = profile?.display_name || user.email?.split('@')[0] || 'there'
    const role = profile?.is_admin ? 'admin' : profile?.is_seller ? 'seller' : 'buyer'

    const systemPrompt = `You are TasklyClean's smart AI assistant — friendly, concise, and helpful. You are talking to ${userName}, a ${role} on the platform.

Current page context: ${context || 'General dashboard'}

PLATFORM KNOWLEDGE:
- TasklyClean is a freelance services marketplace
- Buyers can browse, order gigs, message sellers, and leave reviews
- Sellers can create listings (gigs), receive orders, deliver work, and earn money
- Seller fees: 10% for new sellers, 5% for Top Rated sellers
- Buyer service fee: 5% added at checkout
- Payments held in escrow, released 14 days after order completion
- Buyers can open disputes if unhappy with delivery
- All listings require admin moderation before going live

${role === 'buyer' ? `BUYER HELP FOCUS:
- Help find the right service for their needs
- Explain how to place orders safely
- Guide through the dispute process
- Answer questions about payments and refunds
- Suggest what details to include when ordering` : ''}

${role === 'seller' ? `SELLER HELP FOCUS:
- Tips to write better listings that convert
- How to handle orders professionally
- How to improve response rate and ranking
- How to request reviews from buyers
- How to grow on the platform` : ''}

RULES:
- Be concise (under 120 words per reply unless a list is needed)
- Be proactive — suggest next steps
- Never make up data or policies not stated above
- If you cannot help, say so clearly and suggest contacting support`

    // Build message history for multi-turn conversation
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...(history || []),
      { role: 'user', content: message },
    ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: systemPrompt,
      messages,
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const reply = (textBlock && 'text' in textBlock ? textBlock.text : '')?.trim() ?? ''

    // Store both user message and assistant reply in ai_conversations
    const sid = session_id || crypto.randomUUID()
    const now = new Date().toISOString()

    await supabase.from('ai_conversations').insert([
      {
        user_id: user.id,
        session_id: sid,
        role: 'user',
        message,
        feature: 'assist_loop',
        metadata: { context, page_context: context },
        created_at: now,
      },
      {
        user_id: user.id,
        session_id: sid,
        role: 'assistant',
        message: reply,
        feature: 'assist_loop',
        metadata: { context },
        created_at: now,
      },
    ]).then(({ error }) => {
      if (error) console.error('ai_conversations insert failed:', error.message)
    })

    return NextResponse.json({ reply, session_id: sid })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
