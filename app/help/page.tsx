import Link from 'next/link'

export const metadata = { title: 'Help Center — TasklyClean' }

const FAQS = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" in the top navigation. Enter your email and a password. You\'ll receive a confirmation email — click the link to activate your account.',
      },
      {
        q: 'How do I place an order?',
        a: 'Browse or search for a service, select a package (Basic, Standard, or Premium), and click "Order Now". You\'ll be taken through a secure checkout flow.',
      },
      {
        q: 'Is TasklyClean free to use as a buyer?',
        a: 'Yes — creating a buyer account and browsing services is completely free. You only pay when you place an order.',
      },
    ],
  },
  {
    category: 'For Sellers',
    items: [
      {
        q: 'How do I become a seller?',
        a: 'Go to "Become a Seller" from the navigation menu. Complete your seller profile and create your first listing. Listings go through a brief moderation review before going live.',
      },
      {
        q: 'When do I get paid?',
        a: 'Earnings are released after a 14-day clearing period following order completion. You can then withdraw to your linked payout method.',
      },
      {
        q: 'What are the platform fees?',
        a: 'Fees range from 5% to 10% depending on your seller level. New sellers pay 10%; Top Rated sellers pay 5%. See our Payment Terms for the full breakdown.',
      },
      {
        q: 'How does the AI listing quality checker work?',
        a: 'When creating a listing, click "Check with AI" in the listing creator. Our AI analyses your title, description, pricing, and niche fit, then gives you a score and suggestions you can apply with one click.',
      },
    ],
  },
  {
    category: 'Orders & Delivery',
    items: [
      {
        q: 'What happens after I place an order?',
        a: 'The seller is notified immediately. They\'ll begin work and deliver through the platform. You\'ll be notified when delivery is ready for review.',
      },
      {
        q: 'Can I request a revision?',
        a: 'Yes. Each package includes a set number of revisions. You can request a revision from your order page if the delivery doesn\'t meet the agreed requirements.',
      },
      {
        q: 'What if I\'m not satisfied with the work?',
        a: 'First try requesting a revision. If the issue can\'t be resolved, you can open a dispute from your order page. Our admin team will review both sides and make a decision.',
      },
    ],
  },
  {
    category: 'Payments & Refunds',
    items: [
      {
        q: 'Is my payment secure?',
        a: 'Yes. All payments are processed through our secure payment processor. Your card details are never stored on our servers. Funds are held in escrow until you accept the delivery.',
      },
      {
        q: 'How do refunds work?',
        a: 'If an order is cancelled before work begins, you receive a full refund. For disputes, refund eligibility depends on the situation. See our Refund Policy for full details.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept major credit and debit cards (Visa, Mastercard, Amex) and supported digital wallets.',
      },
    ],
  },
  {
    category: 'Trust & Safety',
    items: [
      {
        q: 'How does TasklyClean protect me from fraud?',
        a: 'All listings go through moderation review. Payments are held in escrow. Users who violate our Acceptable Use Policy are warned, restricted, or banned.',
      },
      {
        q: 'How do I report a user or listing?',
        a: 'Use the report button on any listing or user profile, or contact our trust team at trust@tasklyclean.com.',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 space-y-12">
      {/* Hero */}
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-[#3ecf68] mb-2">Help Center</p>
        <h1 className="text-4xl font-bold text-slate-900">How can we help?</h1>
        <p className="mt-3 text-slate-500 text-lg">Find answers to common questions about TasklyClean.</p>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'For Buyers', icon: '🛒', desc: 'Placing and managing orders', href: '#orders--delivery' },
          { label: 'For Sellers', icon: '🏪', desc: 'Creating listings and getting paid', href: '#for-sellers' },
          { label: 'Payments', icon: '💳', desc: 'Billing, fees, and refunds', href: '#payments--refunds' },
          { label: 'Safety', icon: '🛡️', desc: 'Trust, disputes, and reports', href: '#trust--safety' },
        ].map(card => (
          <a key={card.label} href={card.href} className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-3xl">{card.icon}</span>
            <p className="mt-2 font-semibold text-slate-900">{card.label}</p>
            <p className="text-sm text-slate-500">{card.desc}</p>
          </a>
        ))}
      </div>

      {/* FAQs */}
      {FAQS.map(section => (
        <section key={section.category} id={section.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{section.category}</h2>
          <div className="space-y-4">
            {section.items.map(item => (
              <div key={item.q} className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="font-semibold text-slate-900 mb-2">{item.q}</p>
                <p className="text-slate-600 leading-7 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Contact */}
      <section id="contact" className="rounded-3xl bg-slate-900 text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
        <p className="text-slate-400 mb-6">Our support team is available Monday–Friday, 9am–6pm UTC.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="mailto:support@tasklyclean.com" className="rounded-xl bg-[#3ecf68] px-6 py-3 font-medium hover:bg-[#28a84e] transition-colors">
            Email Support
          </a>
          <a href="mailto:trust@tasklyclean.com" className="rounded-xl border border-slate-600 px-6 py-3 font-medium text-slate-300 hover:bg-slate-800 transition-colors">
            Report a Violation
          </a>
        </div>
      </section>

      {/* Legal links */}
      <div className="flex flex-wrap gap-4 justify-center text-sm text-slate-400">
        {[
          ['Terms of Service', '/terms'],
          ['Privacy Policy', '/privacy'],
          ['Refund Policy', '/refund'],
          ['Acceptable Use', '/acceptable-use'],
          ['Payment Terms', '/payment-terms'],
          ['Cookie Policy', '/cookies'],
        ].map(([label, href]) => (
          <Link key={href} href={href} className="hover:text-slate-600 transition-colors">{label}</Link>
        ))}
      </div>
    </main>
  )
}
