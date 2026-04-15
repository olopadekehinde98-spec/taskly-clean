import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#0d2818] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3ecf68] text-lg font-bold text-[#0d2818]">
                T
              </div>
              <div className="leading-tight">
                <span className="block text-xl font-bold text-white" style={{ fontFamily: 'Fraunces, serif' }}>Taskly</span>
                <span className="block text-[11px] uppercase tracking-[0.18em] text-white/35">
                  Marketplace
                </span>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-6 text-white/45">
              A trusted marketplace connecting buyers with top-rated freelancers. Quality work, secure payments, fast delivery.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white/80 uppercase tracking-wider">Marketplace</h3>
            <ul className="space-y-2 text-sm text-white/45">
              <li><Link href="/services" className="hover:text-[#3ecf68] transition-colors">Browse Services</Link></li>
              <li><Link href="/categories" className="hover:text-[#3ecf68] transition-colors">Categories</Link></li>
              <li><Link href="/start-selling" className="hover:text-[#3ecf68] transition-colors">Become a Seller</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white/80 uppercase tracking-wider">Support</h3>
            <ul className="space-y-2 text-sm text-white/45">
              <li><Link href="/help" className="hover:text-[#3ecf68] transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-[#3ecf68] transition-colors">Contact Support</Link></li>
              <li><Link href="/refund" className="hover:text-[#3ecf68] transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-white/80 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm text-white/45">
              <li><Link href="/terms" className="hover:text-[#3ecf68] transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[#3ecf68] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/acceptable-use" className="hover:text-[#3ecf68] transition-colors">Acceptable Use</Link></li>
              <li><Link href="/payment-terms" className="hover:text-[#3ecf68] transition-colors">Payment Terms</Link></li>
              <li><Link href="/cookies" className="hover:text-[#3ecf68] transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <span>© 2026 Taskly. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-white/60 transition-colors">Cookies</Link>
            <Link href="/help" className="hover:text-white/60 transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
