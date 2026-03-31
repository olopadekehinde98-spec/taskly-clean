export default function BuyerSettingsPage() {
  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Buyer Dashboard
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <section className="space-y-8">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Profile Information
            </h2>

            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[160px_1fr]">
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-700">
                    Profile Image
                  </p>

                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-200 text-3xl font-bold text-slate-700">
                    B
                  </div>

                  <button
                    type="button"
                    className="mt-4 rounded-2xl border px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    Upload Image
                  </button>

                  <p className="mt-2 text-xs text-slate-500">
                    Real upload will be connected later.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="w-full rounded-2xl border px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full rounded-2xl border px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="john@example.com"
                      className="w-full rounded-2xl border px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      defaultValue="+1 555 123 4567"
                      className="w-full rounded-2xl border px-4 py-3 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Short Bio
                </label>
                <textarea
                  rows={5}
                  defaultValue="Buyer account for publishing, editing, and business support services."
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
              >
                Save Profile
              </button>
            </form>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Notification Preferences
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="text-sm font-medium text-slate-800">
                  New message alerts
                </span>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </label>

              <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="text-sm font-medium text-slate-800">
                  Delivery submitted alerts
                </span>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </label>

              <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="text-sm font-medium text-slate-800">
                  Order completion alerts
                </span>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </label>

              <label className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="text-sm font-medium text-slate-800">
                  Review reminders
                </span>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Payment Preferences
            </h2>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="mb-2 text-sm font-medium text-slate-900">
                  Preferred Payment Method
                </p>
                <select className="w-full rounded-2xl border bg-white px-4 py-3 outline-none">
                  <option>Card</option>
                  <option>Bank Transfer</option>
                  <option>Wallet</option>
                </select>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="mb-2 text-sm font-medium text-slate-900">
                  Billing Note
                </p>
                <p className="text-sm leading-7 text-slate-600">
                  Real billing and payment settings will be connected later with backend and payment gateway integration.
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Account Tips
            </h2>

            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <p>Keep your contact details accurate for smooth order communication.</p>
              <p>Turn on important alerts so you do not miss deliveries or messages.</p>
              <p>A clear buyer profile helps sellers communicate faster and better.</p>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Settings Rule
            </h2>

            <p className="text-sm leading-7 text-slate-600">
              Buyer settings should control profile clarity, notification flow, and payment preference defaults.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}