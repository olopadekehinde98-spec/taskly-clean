export const metadata = { title: 'Payment Terms — TasklyClean' }

export default function PaymentTermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[#3ecf68] mb-2">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900">Payment Terms</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: March 31, 2026</p>
      </div>

      {[
        {
          title: '1. Currency and Processing',
          body: 'All transactions on TasklyClean are processed in US Dollars (USD). Payments are securely handled through our integrated payment processor. We do not store credit card information on our servers.',
        },
        {
          title: '2. Buyer Payments',
          body: 'When placing an order, the full amount is charged immediately and held in escrow until the order is completed and accepted. Accepted payment methods include major credit/debit cards and supported digital wallets.',
        },
        {
          title: '3. Seller Payouts',
          body: 'Seller earnings become available for withdrawal after a 14-day clearing period following order completion. This period allows for disputes and quality reviews. Sellers can withdraw to their linked bank account or supported payout method.',
        },
        {
          title: '4. Buyer Service Fee',
          body: 'Buyers are charged a 5% service fee on top of the gig price at checkout. This fee is added to the order total and is non-refundable except in cases where the order was never started. The buyer fee covers platform maintenance, payment processing, escrow protection, and customer support.',
        },
        {
          title: '5. Seller Platform Fee',
          body: 'TasklyClean charges sellers a platform fee on each completed transaction. The current fee structure is: 10% for New sellers, 8% for Level 1 sellers, 6% for Level 2 sellers, and 5% for Top Rated sellers. Fees are deducted from the seller\'s earnings before payout.',
        },
        {
          title: '6. Tips and Bonuses',
          body: 'Buyers may leave optional tips for sellers after order completion. Tips are not subject to platform fees and are paid out in full to the seller during the next payout cycle.',
        },
        {
          title: '7. Escrow Protection',
          body: 'All buyer payments are held in escrow throughout the order lifecycle. Funds are only released to the seller after the buyer accepts the delivery or the auto-accept period (3 days) expires without a dispute.',
        },
        {
          title: '8. Refunds and Cancellations',
          body: 'Refund eligibility is governed by our Refund Policy. Cancelled orders before work begins receive a full refund. Disputes are resolved through our admin review process.',
        },
        {
          title: '9. Tax Responsibilities',
          body: 'Sellers are responsible for reporting and paying any applicable taxes on their earnings. TasklyClean may provide earnings reports for tax purposes but does not offer tax advice. Consult a tax professional for your specific situation.',
        },
        {
          title: '10. Chargebacks',
          body: 'Fraudulent chargebacks are a violation of our Terms of Service. Buyers who file chargebacks in bad faith may have their accounts suspended and be liable for chargeback fees.',
        },
      ].map(s => (
        <section key={s.title}>
          <h2 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h2>
          <p className="text-slate-600 leading-7">{s.body}</p>
        </section>
      ))}

      <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
        Payment questions? Contact <a href="mailto:billing@tasklyclean.com" className="text-[#3ecf68] hover:underline">billing@tasklyclean.com</a>
      </div>
    </main>
  )
}
