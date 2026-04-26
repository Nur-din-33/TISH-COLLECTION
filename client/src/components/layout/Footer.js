import Link from 'next/link';

const COMPANY = {
  name:      'TISH COLLECTION',
  tagline:   "Kenya's trusted online shopping destination.",
  email:     'info@tishcollection.co.ke',
  phone:     '+254 757 879 451',
  whatsapp:  '254757879451',
  address:   'Nairobi, Kenya',
  hours:     'Mon-Sat, 8am-6pm EAT',
  facebook:  'https://facebook.com/tishcollection',
  instagram: 'https://instagram.com/tishcollection',
  twitter:   'https://twitter.com/tishcollection',
};

export default function Footer() {
  return (
    <footer className="bg-surface-950 text-surface-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <span className="text-xl font-bold text-white">TISH</span>
              <span className="text-xl font-bold text-brand-400">COLLECTION</span>
            </div>
            <p className="text-sm text-surface-500 leading-relaxed">{COMPANY.tagline}</p>
            <div className="flex gap-3 mt-5">
              <a href={COMPANY.facebook} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-surface-800 hover:bg-brand-500 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 text-surface-400 hover:text-white">f</a>
              <a href={COMPANY.instagram} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-surface-800 hover:bg-brand-500 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 text-surface-400 hover:text-white">ig</a>
              <a href={COMPANY.twitter} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-surface-800 hover:bg-brand-500 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 text-surface-400 hover:text-white">x</a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/products?category=electronics" className="hover:text-white transition-colors duration-200">Electronics</Link></li>
              <li><Link href="/products?category=fashion"     className="hover:text-white transition-colors duration-200">Fashion</Link></li>
              <li><Link href="/products?category=home-garden" className="hover:text-white transition-colors duration-200">Home & Garden</Link></li>
              <li><Link href="/products?category=beauty"      className="hover:text-white transition-colors duration-200">Beauty & Health</Link></li>
              <li><Link href="/products?featured=true"        className="hover:text-white transition-colors duration-200">Featured Deals</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Account</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/login"    className="hover:text-white transition-colors duration-200">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors duration-200">Register</Link></li>
              <li><Link href="/orders"   className="hover:text-white transition-colors duration-200">My Orders</Link></li>
              <li><Link href="/cart"     className="hover:text-white transition-colors duration-200">Cart</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-white transition-colors duration-200">
                  <span className="text-brand-400 text-xs">WhatsApp</span>
                  <span>{COMPANY.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${COMPANY.email}`} className="hover:text-white transition-colors duration-200">
                  {COMPANY.email}
                </a>
              </li>
              <li className="text-surface-500">
                {COMPANY.address}
              </li>
              <li className="text-surface-500">
                {COMPANY.hours}
              </li>
            </ul>
            <div className="mt-5">
              <p className="text-xs text-surface-600 mb-2">Secure payments</p>
              <div className="flex items-center gap-2">
                <span className="bg-surface-800 text-surface-300 text-xs font-medium px-2.5 py-1 rounded-lg">M-PESA</span>
                <span className="bg-surface-800 text-surface-300 text-xs font-medium px-2.5 py-1 rounded-lg">VISA</span>
                <span className="bg-surface-800 text-surface-300 text-xs font-medium px-2.5 py-1 rounded-lg">CASH</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-surface-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-surface-600">
          <span>&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-surface-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-surface-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-surface-300 transition-colors">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
