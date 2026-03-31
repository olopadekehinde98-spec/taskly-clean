export const metadata = { title: 'Refund Policy — TasklyClean' }

export default function RefundPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-blue-600 mb-2">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900">Refund Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: March 31, 2026</p>
      </div>

      <p className="text-slate-600 leading-7">
        At TasklyClean, we want every transaction to be fair. This policy outlines when and how refunds are issued.
      </p>

      {[
        {
          title: 'Automatic Refund Scenarios',
          body: `A full refund is automatically issued if: (1) a seller cancels an order before starting work, (2) a seller fails to deliver within the agreed timeframe, or (3) the delivered work is completely unrelated to the requirements stated in the order.`,
        },
        {
          title: 'Partial Refunds',
          body: `Partial refunds may be granted if some work was completed but the delivery was materially incomplete or significantly below the described quality. The amount is determined on a case-by-case basis through our dispute process.`,
        },
        {
          title: 'Non-Refundable Scenarios',
          body: `Refunds are generally not issued for: (1) buyer change of mind after delivery, (2) orders completed satisfactorily as described, (3) dissatisfaction with the seller's style when requirements were vague, or (4) delays caused by the buyer's own failure to provide necessary materials.`,
        },
        {
          title: 'How to Request a Refund',
          body: `To request a refund, open a dispute through your order page within 7 days of delivery. Our support team reviews the case and may request evidence from both parties. Decisions are typically made within 3–5 business days.`,
        },
        {
          title: 'Refund Processing',
          body: `Approved refunds are credited back to your original payment method. Processing time depends on your payment provider but typically takes 5–10 business days. Credit card refunds may take longer depending on your bank.`,
        },
        {
          title: 'Seller Disputes',
          body: `Sellers who believe a refund decision was made in error may appeal within 48 hours of the decision. Appeals are reviewed by a senior admin. The outcome of an appeal is final.`,
        },
        {
          title: 'Platform Fees',
          body: `In cases of full buyer refunds, the platform fee is also refunded. In cases of partial refunds, platform fees are proportionally refunded.`,
        },
      ].map(s => (
        <section key={s.title}>
          <h2 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h2>
          <p className="text-slate-600 leading-7">{s.body}</p>
        </section>
      ))}

      <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
        Refund questions? Contact <a href="mailto:support@tasklyclean.com" className="text-blue-600 hover:underline">support@tasklyclean.com</a>
      </div>
    </main>
  )
}
