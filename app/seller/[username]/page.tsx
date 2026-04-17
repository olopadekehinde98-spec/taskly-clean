import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taskly-clean.vercel.app'

type Props = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: seller } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url, professional_title')
    .eq('username', username)
    .single()

  if (!seller) return { title: 'Seller not found — Taskly' }

  const name = seller.display_name || username
  const title = `${name} — Freelancer on Taskly`
  const description = seller.bio?.slice(0, 155) || `Hire ${name} on Taskly — quality freelance services.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/seller/${username}`,
      siteName: 'Taskly',
      images: seller.avatar_url ? [{ url: seller.avatar_url, width: 400, height: 400, alt: name }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: seller.avatar_url ? [seller.avatar_url] : [],
    },
  }
}

function getBadgeClasses(level: string) {
  if (level === 'Elite Seller') return 'bg-amber-50 text-amber-700'
  if (level === 'Top Seller') return 'bg-purple-50 text-purple-700'
  if (level === 'Skilled Seller') return 'bg-[#0d2818] text-[#3ecf68]'
  if (level === 'Rising Seller') return 'bg-[#edfbf2] text-[#28a84e]'
  return 'bg-slate-100 text-slate-700'
}

export default async function SellerPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: seller } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!seller) {
    notFound()
  }

  const { data: services } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', seller.id)
    .limit(6)

  const displayName = seller.display_name || seller.username || 'Seller'
  const professionalTitle =
    seller.professional_title || 'Digital Service Professional'
  const bio =
    seller.bio || 'This seller has not added a bio yet.'
  const skills = Array.isArray(seller.skills) ? seller.skills : []
  const languages = Array.isArray(seller.languages) ? seller.languages : []
  const responseTime = seller.response_time || 'N/A'
  const responseRate = seller.response_rate || 0
  const memberSince = seller.member_since || 'N/A'

  const sellerLevel = 'Top Seller'
  const rating = 4.9
  const reviews = 0
  const completedOrders = 0
  const onTimeDelivery = 94
  const completionRate = 97
  const repeatBuyers = 0
  const rankScore = 88
  const nextLevel = 'Elite Seller'

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-3xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-[#3ecf68] to-[#163522] text-3xl font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
              <p className="mt-1 text-sm text-slate-500">@{seller.username}</p>

              <span
                className={`mt-3 rounded-full px-3 py-1 text-sm font-medium ${getBadgeClasses(
                  sellerLevel
                )}`}
              >
                {sellerLevel}
              </span>
            </div>

            <div className="space-y-4 border-t pt-5 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Rating</span>
                <span>⭐ {rating}</span>
              </div>

              <div className="flex justify-between">
                <span>Reviews</span>
                <span>{reviews}</span>
              </div>

              <div className="flex justify-between">
                <span>Completed Orders</span>
                <span>{completedOrders}</span>
              </div>

              <div className="flex justify-between">
                <span>Response Time</span>
                <span>{responseTime}</span>
              </div>

              <div className="flex justify-between">
                <span>Member Since</span>
                <span>{memberSince}</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">
                Rank Score
              </p>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-600">Current Score</span>
                <span className="font-semibold text-slate-900">{rankScore}/100</span>
              </div>

              <div className="h-3 rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-gradient-to-r [#3ecf68]"
                  style={{ width: `${rankScore}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Next level target: {nextLevel}
              </p>
            </div>

            <button className="mt-6 w-full rounded-2xl bg-[#3ecf68] px-5 py-3 font-medium text-white">
              Contact Seller
            </button>
          </aside>

          <div className="space-y-8">
            <section className="rounded-3xl border bg-white p-8 shadow-sm">
              <h2 className="mb-3 text-2xl font-bold text-slate-900">{professionalTitle}</h2>
              <p className="leading-7 text-slate-700">{bio}</p>
            </section>

            <section className="rounded-3xl border bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-900">Seller Performance</h2>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Response Rate</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">{responseRate}%</h3>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">On-Time Delivery</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">{onTimeDelivery}%</h3>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Completion Rate</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">{completionRate}%</h3>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Repeat Buyers</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">{repeatBuyers}</h3>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border bg-white p-8 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-slate-900">Skills</h2>
              <div className="flex flex-wrap gap-3">
                {skills.length === 0 ? (
                  <p className="text-sm text-slate-500">No skills added yet.</p>
                ) : (
                  skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border bg-white p-8 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-slate-900">Languages</h2>
              <div className="flex flex-wrap gap-3">
                {languages.length === 0 ? (
                  <p className="text-sm text-slate-500">No languages added yet.</p>
                ) : (
                  languages.map((language: string) => (
                    <span
                      key={language}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
                    >
                      {language}
                    </span>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-xl font-bold text-slate-900">
                Services by {displayName}
              </h2>

              {!services || services.length === 0 ? (
                <p className="text-sm text-slate-500">No services published yet.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {services.map((service: any) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      className="block rounded-2xl border bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md"
                    >
                      <span className="mb-3 inline-block rounded-full bg-[#edfbf2] px-3 py-1 text-xs font-medium text-[#28a84e]">
                        {service.category}
                      </span>

                      <h3 className="mb-3 text-base font-semibold text-slate-900">
                        {service.title}
                      </h3>

                      <p className="text-sm text-slate-600">Status</p>
                      <p className="mt-1 text-lg font-bold text-[#3ecf68]">{service.listing_status}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}