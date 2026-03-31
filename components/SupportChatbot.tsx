"use client"
import { useState, useRef, useEffect } from "react"

interface Message { role: "user" | "assistant"; text: string }

export default function SupportChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: "Hi! 👋 I am the TasklyClean support assistant. How can I help you today?" }])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setMessages(prev => [...prev, { role: "user", text }])
    setInput("")
    setLoading(true)
    try {
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feature: "support_chat", payload: { message: text } }) })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", text: data.result ?? "Sorry, something went wrong." }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }])
    } finally { setLoading(false) }
  }

  return (
    <>
      <button onClick={() => setOpen(o => !o)} className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700">
        {open ? "✕" : "💬"}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl border bg-white shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "70vh" }}>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">
            <p className="text-sm font-semibold">TasklyClean Support</p>
            <p className="text-xs text-blue-100">AI-powered • Instant replies</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white border text-slate-800 shadow-sm"}`}>{m.text}</div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-white border rounded-2xl px-4 py-3 shadow-sm text-slate-400 text-sm">Typing...</div></div>}
            <div ref={bottomRef} />
          </div>
          <div className="border-t bg-white p-3 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask a question..." className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:border-blue-400" disabled={loading} />
            <button onClick={send} disabled={!input.trim() || loading} className="rounded-xl bg-blue-600 px-3 py-2 text-white text-sm disabled:opacity-50">Send</button>
          </div>
        </div>
      )}
    </>
  )
}
