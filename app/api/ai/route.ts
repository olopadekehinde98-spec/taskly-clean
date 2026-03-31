import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
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
      systemPrompt = `You are a helpful support agent for TasklyClean, a freelancing marketplace. Help users with orders, payments, disputes, accounts, and how to use the platform. Be concise, friendly, and clear. Max 3 short paragraphs. If serious issue say: contact our human support team.`
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

    if (feature === "support_chat") return NextResponse.json({ result: text })

    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
      return NextResponse.json({ result: parsed })
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON", raw: text }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 })
  }
}
