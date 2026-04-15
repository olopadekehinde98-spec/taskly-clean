export const metadata = { title: 'Terms of Service — TasklyClean' }

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[#3ecf68] mb-2">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: March 31, 2026</p>
      </div>

      {[
        {
          title: '1. Acceptance of Terms',
          body: `By accessing or using TasklyClean ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. We may update these terms at any time, and continued use constitutes acceptance.`,
        },
        {
          title: '2. Platform Overview',
          body: `TasklyClean is a digital marketplace connecting buyers with freelance sellers offering services in writing, publishing, business support, design, and related fields. We facilitate transactions but are not a party to agreements between buyers and sellers.`,
        },
        {
          title: '3. Eligibility',
          body: `You must be at least 18 years old to use the Platform. By registering, you confirm that all information you provide is accurate and that you have the legal capacity to enter into contracts.`,
        },
        {
          title: '4. Seller Obligations',
          body: `Sellers must deliver services as described, communicate professionally, and honour package terms. Sellers are solely responsible for the quality and legality of their services. TasklyClean reserves the right to remove listings that violate platform policies.`,
        },
        {
          title: '5. Buyer Obligations',
          body: `Buyers must provide clear, lawful project requirements and make payments in good faith. Buyers may not attempt to circumvent the platform to transact directly with sellers off-platform.`,
        },
        {
          title: '6. Fees and Payments',
          body: `TasklyClean charges a service fee on each completed order. Sellers receive their net payout after fees are deducted. All transactions are processed in USD. Fees are subject to change with notice.`,
        },
        {
          title: '7. Disputes',
          body: `In the event of a dispute, buyers and sellers should first attempt resolution between themselves. If unresolved, either party may open a formal dispute through the Platform. Admin decisions are final and binding.`,
        },
        {
          title: '8. Prohibited Conduct',
          body: `Users may not engage in fraud, harassment, intellectual property theft, spam, or any activity that violates our Acceptable Use Policy. Violations may result in immediate account suspension or permanent ban.`,
        },
        {
          title: '9. Intellectual Property',
          body: `Sellers retain ownership of their work until delivery. Upon delivery and full payment, the buyer receives the rights as specified in the listing. TasklyClean does not claim ownership of any user-generated content.`,
        },
        {
          title: '10. Limitation of Liability',
          body: `TasklyClean is not liable for any indirect, incidental, or consequential damages arising from use of the Platform. Our maximum liability in any event is limited to the fees paid in the preceding 30 days.`,
        },
        {
          title: '11. Termination',
          body: `TasklyClean may suspend or terminate your account at any time for violations of these terms, with or without notice. You may close your account at any time by contacting support.`,
        },
        {
          title: '12. Governing Law',
          body: `These terms are governed by applicable law. Any disputes will be resolved through binding arbitration unless prohibited by law.`,
        },
      ].map(s => (
        <section key={s.title}>
          <h2 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h2>
          <p className="text-slate-600 leading-7">{s.body}</p>
        </section>
      ))}

      <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
        Questions about these terms? Contact us at <a href="mailto:legal@tasklyclean.com" className="text-[#3ecf68] hover:underline">legal@tasklyclean.com</a>
      </div>
    </main>
  )
}
