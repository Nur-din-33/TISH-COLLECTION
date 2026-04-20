import Link from 'next/link';

// ✏️  CHANGE YOUR COMPANY CONTACT DETAILS HERE
const COMPANY = {
  name:      'TISH COLLECTION',
  tagline:   "Kenya's trusted dropshipping platform.",
  email:     'info@tishcollection.co.ke',
  phone:     '+254 757 879 451',
  whatsapp:  '254757879451',         // numbers only, no + or spaces
  address:   'Nairobi, Kenya',
  hours:     'Mon–Sat, 8am–6pm EAT',
  facebook:  'https://facebook.com/tishcollection',
  instagram: 'https://instagram.com/tishcollection',
  twitter:   'https://twitter.com/tishcollection',
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-2xl font-bold text-red-500">TISH</span>
              <span className="text-2xl font-bold text-green-400">COLLECTION</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{COMPANY.tagline}</p>
            {/* Social links */}
            <div className="flex gap-3 mt-4">
              <a href={COMPANY.facebook} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold transition-colors">f</a>
              <a href={COMPANY.instagram} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 hover:bg-pink-600 rounded-full flex items-center justify-center text-xs font-bold transition-colors">ig</a>
              <a href={COMPANY.twitter} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 hover:bg-sky-500 rounded-full flex items-center justify-center text-xs font-bold transition-colors">x</a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/products?category=fashion"     className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link href="/products?category=home-garden" className="hover:text-white transition-colors">Home & Garden</Link></li>
              <li><Link href="/products?category=beauty"      className="hover:text-white transition-colors">Beauty & Health</Link></li>
              <li><Link href="/products?featured=true"        className="hover:text-white transition-colors">🔥 Featured Deals</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login"    className="hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link href="/orders"   className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link href="/cart"     className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link href="/forgot-password" className="hover:text-white transition-colors">Forgot Password</Link></li>
            </ul>
          </div>

          {/* Contact — EDIT COMPANY OBJECT ABOVE TO CHANGE THESE */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Contact Us</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors">
                  <span className="text-green-400">📱</span>
                  <span>WhatsApp: {COMPANY.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <span>📧</span>
                  <span>{COMPANY.email}</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <span>📍</span>
                <span>{COMPANY.address}</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <span>🕐</span>
                <span>{COMPANY.hours}</span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Secure Payments via</p>
              <div className="flex items-center gap-2">
                <span className="bg-green-700 text-white text-xs font-bold px-2 py-1 rounded">M-PESA</span>
                <span className="bg-blue-700 text-white text-xs font-bold px-2 py-1 rounded">VISA</span>
                <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">CASH</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved. Built in 🇰🇪 Kenya.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
