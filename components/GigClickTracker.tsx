'use client'

export default function GigClickTracker({ listingId, href }: { listingId: string; href: string }) {
  function handleClick() {
    fetch('/api/listings/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, event_type: 'click' }),
    }).catch(() => {})
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="mb-3 block w-full rounded-2xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700 transition-colors"
    >
      Order Now
    </a>
  )
}
