'use client'

import { useEffect } from 'react'

export default function GigViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    // Fire and forget — track the view once on page load
    fetch('/api/listings/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, event_type: 'view' }),
    }).catch(() => {})
  }, [listingId])

  return null
}
