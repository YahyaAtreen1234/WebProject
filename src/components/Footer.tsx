export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-sapphire-500/20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-800 via-midnight-900 to-midnight-900 opacity-90"></div>

      <div className="relative container-gutter py-gutter-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-gutter-lg">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sapphire-400 to-amethyst-400">
                <span className="text-white flex items-center justify-center h-full">💎</span>
              </div>
              <h3 className="text-h4 font-display text-transparent bg-gradient-to-r from-sapphire-300 to-amethyst-300 bg-clip-text">
                StonesLand
              </h3>
            </div>
            <p className="text-sm text-midnight-300">
              Premium gemstones and minerals sourced ethically from around the world.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">Shop</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/shop"
                  className="text-sm text-midnight-300 hover:text-sapphire-300 transition-colors"
                >
                  All Products
                </a>
              </li>
              <li>
                <a
                  href="/shop?category=crystals"
                  className="text-sm text-midnight-300 hover:text-sapphire-300 transition-colors"
                >
                  Crystals
                </a>
              </li>
              <li>
                <a
                  href="/shop?category=geodes"
                  className="text-sm text-midnight-300 hover:text-sapphire-300 transition-colors"
                >
                  Geodes
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">Company</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="text-sm text-midnight-300 hover:text-sapphire-300 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-sm text-midnight-300 hover:text-sapphire-300 transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-midnight-300 hover:text-sapphire-300 transition-colors"
                >
                  Shipping Info
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-bold text-white mb-4 text-lg">Follow Us</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-midnight-300 hover:text-rose-300 transition-colors flex items-center gap-2"
                >
                  📸 Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-midnight-300 hover:text-sapphire-300 transition-colors flex items-center gap-2"
                >
                  💌 Email
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-midnight-300 hover:text-gold-300 transition-colors flex items-center gap-2"
                >
                  🔔 Newsletter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-sapphire-500/20 pt-gutter">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
            <p className="text-sm text-midnight-400">
              © {currentYear} StonesLand. All rights reserved.
            </p>
            <div className="flex gap-4 justify-center text-xs text-midnight-400">
              <a href="#" className="hover:text-sapphire-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-sapphire-300 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-sapphire-300 transition-colors">Sitemap</a>
            </div>
            <p className="text-xs text-midnight-400">Ethically Sourced • Certified Quality • Worldwide Shipping</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
