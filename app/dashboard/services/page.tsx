import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SellerServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const params = await searchParams
  const success = params?.success

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: services } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Seller Dashboard
          </p>
          <h1 className="text-3xl font-bold text-slate-900">My Services</h1>
        </div>

        <Link
          href="/dashboard/services/new"
          className="rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white"
        >
          Create New Gig
        </Link>
      </div>

      {success && (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {!services || services.length === 0 ? (
        <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-slate-900">No gigs yet</h2>
          <p className="mb-6 text-slate-600">Create your first gig to start selling.</p>
          <Link
            href="/dashboard/services/new"
            className="rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white"
          >
            Create Gig
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service: any) => (
            <div key={service.id} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {service.category}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {service.listing_status}
                </span>
              </div>

              <h2 className="mb-3 text-lg font-semibold text-slate-900">{service.title}</h2>

              <p className="mb-4 text-sm leading-6 text-slate-600">
                {service.short_description || 'No description added yet.'}
              </p>

              <div className="flex items-center justify-between">
                <Link
                  href={`/dashboard/services/${service.slug}`}
                  className="font-medium text-blue-600"
                >
                  Edit Gig
                </Link>

                <Link
                  href={`/services/${service.slug}`}
                  className="text-sm font-medium text-slate-500"
                >
                  View Public
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}