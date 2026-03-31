import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-20 bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-lg font-bold text-white">
                T
              </div>
              <div className="leading-tight">
                <span className="block text-xl font-bold">TasklyClean</span>
                <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Marketplace
                </span>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              A digital marketplace for services, publishing, and online business support.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Explore</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/services" className="hover:text-white transition-colors">Browse Services</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/start-selling" className="hover:text-white transition-colors">Become a Seller</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/help" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/help#contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/acceptable-use" className="hover:text-white transition-colors">Acceptable Use</Link></li>
              <li><Link href="/payment-terms" className="hover:text-white transition-colors">Payment Terms</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span>© 2026 TasklyClean. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-slate-300 transition-colors">Cookies</Link>
            <Link href="/help" className="hover:text-slate-300 transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
