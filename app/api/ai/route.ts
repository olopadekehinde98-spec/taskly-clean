import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { feature, payload } = await req.json()
    if (!feature || !payload) return NextResponse.json({ error: "Missing feature or payload" }, { status: 400 })

    let systemPrompt = ""
    let userPrompt = ""

    if (feature === "job_post_assistant") {
      systemPrompt = `You are a professional job brief writer for TasklyClean marketplace. Turn the buyer rough notes into a structured brief. Respond ONLY with valid JSON, no markdown, no backticks: {"title":"","category":"","budget_min":0,"budget_max":0,"delivery_days":0,"description":"","requirements":[],"skills_needed":[]}`
      userPrompt = `Buyer notes: "${payload.notes}"`
    } else if (feature === "proposal_assistant") {
      systemPrompt = `You are a proposal coach for freelancers on TasklyClean. Write a compelling proposal under 200 words. Respond ONLY with valid JSON: {"proposal":"","suggested_price":0,"suggested_delivery_days":0,"key_selling_points":[]}`
      userPrompt = `Job: "${payload.job_title}". Description: "${payload.job_description}". Seller skills: "${payload.seller_skills}".`
    } else if (feature === "listing_quality_checker") {
      systemPrompt = `You are a listing quality analyst for TasklyClean. Score and give feedback. Respond ONLY with valid JSON: {"overall_score":0,"scores":{"title_clarity":0,"description_quality":0,"pricing_competitiveness":0,"niche_fit":0},"strengths":[],"improvements":[],"rewritten_title":"","rewritten_description_intro":""}`
      userPrompt = `Title: "${payload.title}". Category: "${payload.category}". Description: "${payload.description}". Price: $${payload.price}. Delivery: ${payload.delivery_days} days.`
    } else if (feature === "support_chat") {
      systemPrompt = `You are a friendly, knowledgeable support assistant for TasklyClean — a freelance services marketplace.

=== PLATFORM RULES & POLICIES ===

TERMS OF SERVICE (key points):
- Users must be 18+
- Sellers must deliver services as described and communicate professionally
- Buyers must provide clear lawful requirements and cannot bypass the platform to pay sellers directly
- TasklyClean charges a service fee: 10% for new sellers, 5% for Top Rated sellers
- Earnings are released after a 14-day clearing period after order completion
- Admin dispute decisions are final and binding
- Accounts may be suspended or banned for violations

ACCEPTABLE USE — PROHIBITED:
- Illegal activity, fraud, deception
- Plagiarised or stolen intellectual property
- Hate speech, violence, adult/obscene content
- Fake reviews or ratings
- Off-platform transactions (bypassing the marketplace)
- Multiple accounts to evade bans
- Bots or scrapers without authorisation
- Harassing other users

ORDERS & DELIVERY:
- After placing an order, seller is notified immediately
- Buyer can request revisions (number included in each package)
- If unsatisfied, buyer can open a dispute from the order page
- Admin reviews disputes and makes a final decision

PAYMENTS & REFUNDS:
- Payments held in escrow until delivery is accepted
- Full refund if order cancelled before work begins
- Refund eligibility for disputes depends on the situation
- Accepted payment methods: Visa, Mastercard, Amex, supported digital wallets

SAFETY & TRUST:
- All listings go through moderation before going live
- Users can report listings or profiles using the report button
- Trust team email: trust@tasklyclean.com
- Legal/terms questions: legal@tasklyclean.com

=== YOUR BEHAVIOUR ===
- Be friendly, concise, and clear
- Answer questions using the above platform knowledge
- If a user has a complaint, account issue, payment problem, or dispute that needs human review, tell them you will connect them to a human support agent and respond with this exact JSON at the END of your message (after your normal reply): {"escalate":true,"summary":"<brief summary of the issue>"}
- Only include the JSON if escalation is truly needed (not for simple FAQ questions)
- Never make up policies — only use what is stated above`
      userPrompt = payload.message
    } else {
      return NextResponse.json({ error: "Unknown feature" }, { status: 400 })
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    })

    const textBlock = message.content.find((b) => b.type === "text")
    const text = (textBlock && "text" in textBlock ? textBlock.text : "")?.trim() ?? ""

    if (feature === "support_chat") {
      // Robustly find escalation JSON — look for last {...} block containing "escalate":true
      let escalate = false
      let summary = ""
      let cleanText = text

      const jsonMatches = [...text.matchAll(/\{[^{}]*"escalate"\s*:\s*true[^{}]*\}/g)]
      if (jsonMatches.length > 0) {
        const lastMatch = jsonMatches[jsonMatches.length - 1]
        try {
          const parsed = JSON.parse(lastMatch[0])
          escalate = parsed.escalate === true
          summary = parsed.summary ?? ""
          cleanText = text.slice(0, lastMatch.index).trimEnd()
        } catch {
          // JSON parse failed — don't escalate, show full text
        }
      }

      // Store support chat conversation in DB (admin-viewable)
      if (user) {
        const sid = payload.session_id || crypto.randomUUID()
        supabase.from('ai_conversations').insert([
          { user_id: user.id, session_id: sid, role: 'user', message: payload.message, feature: 'support_chat', metadata: {} },
          { user_id: user.id, session_id: sid, role: 'assistant', message: cleanText, feature: 'support_chat', metadata: { escalate, summary } },
        ]).then(({ error }) => { if (error) console.error('support_chat store failed:', error.message) })
      }

      return NextResponse.json({ result: cleanText, escalate, summary })
    }

    try {
      // Strip only leading/trailing markdown code fences, not inline backticks
      const cleaned = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```$/m, "").trim()
      const parsed = JSON.parse(cleaned)
      return NextResponse.json({ result: parsed })
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw: text }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 })
  }
}
