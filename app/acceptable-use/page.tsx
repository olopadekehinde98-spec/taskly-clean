export const metadata = { title: 'Acceptable Use Policy — TasklyClean' }

export default function AcceptableUsePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[#3ecf68] mb-2">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900">Acceptable Use Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: March 31, 2026</p>
      </div>

      <p className="text-slate-600 leading-7">
        This Acceptable Use Policy outlines prohibited activities on the TasklyClean platform. Violations may result in warnings, account restrictions, suspension, or permanent bans.
      </p>

      {[
        {
          title: 'Prohibited Content',
          items: [
            'Services involving illegal activity, fraud, or deception',
            'Plagiarised, stolen, or unlicensed intellectual property',
            'Content that promotes violence, hate speech, or discrimination',
            'Adult, sexually explicit, or obscene material',
            'Services designed to manipulate reviews, rankings, or platform algorithms',
            'Listings that misrepresent the seller\'s skills or qualifications',
          ],
        },
        {
          title: 'Prohibited Behaviour',
          items: [
            'Circumventing the platform to transact directly with users off-platform',
            'Creating multiple accounts to evade bans or manipulate the system',
            'Harassing, threatening, or intimidating other users',
            'Submitting fake reviews or ratings',
            'Using bots, scrapers, or automated tools without authorisation',
            'Sharing account credentials with unauthorised parties',
          ],
        },
        {
          title: 'Spam and Manipulation',
          items: [
            'Posting duplicate or near-duplicate listings',
            'Keyword stuffing in titles, descriptions, or tags',
            'Sending unsolicited promotional messages to other users',
            'Artificially inflating order counts or impressions',
          ],
        },
        {
          title: 'Financial Violations',
          items: [
            'Money laundering or fraudulent payment activity',
            'Chargebacks filed in bad faith',
            'Attempting to manipulate refund or dispute processes',
            'Using stolen payment methods',
          ],
        },
      ].map(s => (
        <section key={s.title}>
          <h2 className="text-lg font-bold text-slate-900 mb-3">{s.title}</h2>
          <ul className="space-y-2">
            {s.items.map(item => (
              <li key={item} className="flex items-start gap-2 text-slate-600 leading-7">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Enforcement</h2>
        <p className="text-slate-600 leading-7">
          Violations are handled through a progressive enforcement system: first offence typically receives a warning, repeated violations may result in restrictions, and severe or repeated misconduct leads to suspension or permanent ban. All enforcement actions are logged and may be appealed within 48 hours.
        </p>
      </section>

      <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
        Report a violation at <a href="mailto:trust@tasklyclean.com" className="text-[#3ecf68] hover:underline">trust@tasklyclean.com</a>
      </div>
    </main>
  )
}
