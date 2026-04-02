'use client'

import { useState } from 'react'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  href?: string
}

function getTypeClasses(type: string) {
  if (type === 'Delivery Submitted') return 'bg-blue-50 text-blue-700'
  if (type === 'New Message') return 'bg-indigo-50 text-indigo-700'
  if (type === 'Order Completed') return 'bg-emerald-50 text-emerald-700'
  if (type === 'order') return 'bg-indigo-50 text-indigo-700'
  if (type === 'message') return 'bg-blue-50 text-blue-700'
  if (type === 'dispute') return 'bg-orange-50 text-orange-700'
  if (type === 'system') return 'bg-slate-50 text-slate-700'
  return 'bg-amber-50 text-amber-700'
}

export default function BuyerNotificationsClient({ notifications: initialNotifications }: { notifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [loading, setLoading] = useState<string | null>(null)

  async function markAsRead(id: string) {
    if (loading) return
    setLoading(id)
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: id }),
      })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } finally {
      setLoading(null)
    }
  }

  async function markAllRead() {
    if (loading) return
    setLoading('all')
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true }),
      })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } finally {
      setLoading(null)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Recent Notifications</h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={loading === 'all'}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {loading === 'all' ? 'Marking...' : `Mark all read (${unreadCount})`}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-3xl mb-3">🔔</p>
          <p className="text-slate-500">No notifications yet. We'll let you know when something happens!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(item => (
            <div
              key={item.id}
              onClick={() => !item.read && markAsRead(item.id)}
              className={`block rounded-2xl border p-5 transition cursor-pointer hover:shadow-sm ${
                item.read ? 'bg-slate-50 border-slate-100' : 'bg-blue-50/40 border-blue-100'
              } ${loading === item.id ? 'opacity-60' : ''}`}
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getTypeClasses(item.type)}`}>
                  {item.type}
                </span>
                <span className="text-sm text-slate-500">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{item.message}</p>

              {!item.read && (
                <div className="mt-4 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  Unread — click to mark as read
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
