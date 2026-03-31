import { createGig } from '../actions'

export default function NewServicePage() {
  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Seller Dashboard
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Create New Gig</h1>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <form action={createGig} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Gig Title
              </label>
              <input
                name="title"
                type="text"
                placeholder="I will format your Kindle ebook professionally"
                className="w-full rounded-2xl border px-4 py-3 outline-none"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                >
                  <option>Publishing</option>
                  <option>Business</option>
                  <option>Writing</option>
                  <option>Design</option>
                  <option>Web & Tech</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tags
                </label>
                <input
                  name="tags"
                  type="text"
                  placeholder="Kindle Formatting, KDP, Ebook Layout"
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Short Description
              </label>
              <textarea
                name="short_description"
                rows={5}
                placeholder="Describe what you offer, who it is for, and what makes the result valuable."
                className="w-full rounded-2xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">Pricing Packages</h2>

              <div className="grid gap-6 xl:grid-cols-3">
                <div className="rounded-3xl border bg-slate-50 p-5">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Basic</h3>
                  <div className="space-y-4">
                    <input name="basic_title" type="text" placeholder="Basic package title" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                    <input name="basic_price" type="text" placeholder="$30" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                    <select name="basic_delivery" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none">
                      <option>1 day</option>
                      <option>2 days</option>
                      <option>3 days</option>
                      <option>5 days</option>
                    </select>
                    <textarea name="basic_includes" rows={4} placeholder="What is included in Basic?" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                  </div>
                </div>

                <div className="rounded-3xl border bg-slate-50 p-5">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Standard</h3>
                  <div className="space-y-4">
                    <input name="standard_title" type="text" placeholder="Standard package title" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                    <input name="standard_price" type="text" placeholder="$50" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                    <select name="standard_delivery" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none">
                      <option>2 days</option>
                      <option>3 days</option>
                      <option>5 days</option>
                      <option>7 days</option>
                    </select>
                    <textarea name="standard_includes" rows={4} placeholder="What is included in Standard?" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                  </div>
                </div>

                <div className="rounded-3xl border bg-slate-50 p-5">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Premium</h3>
                  <div className="space-y-4">
                    <input name="premium_title" type="text" placeholder="Premium package title" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                    <input name="premium_price" type="text" placeholder="$80" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                    <select name="premium_delivery" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none">
                      <option>3 days</option>
                      <option>5 days</option>
                      <option>7 days</option>
                      <option>10 days</option>
                    </select>
                    <textarea name="premium_includes" rows={4} placeholder="What is included in Premium?" className="w-full rounded-2xl border bg-white px-4 py-3 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white">
              Save Gig
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Real Save Enabled</h2>
            <p className="text-sm leading-7 text-slate-600">
              This form now saves the listing and all three packages to Supabase.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}