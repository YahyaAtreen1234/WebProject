'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  image?: string;
  dealDeadline?: string;
}

interface Banner {
  id: string;
  type: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  link?: string | null;
  buttonText?: string | null;
  bgColor?: string | null;
}

interface Slide {
  title: string;
  subtitle: string;
  color: string;
  image?: string | null;
  link: string;
  buttonText: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [promoBanners, setPromoBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoIndex, setPromoIndex] = useState(0);
  const [promotions, setPromotions] = useState<Slide[]>([]);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);

  const staticPromotions: Slide[] = [
    { title: 'FREE WORLDWIDE SHIPPING', subtitle: 'On all orders', color: 'from-yellow-400 to-amber-500', link: '/shop', buttonText: 'Shop Now' },
    { title: '15 DAY MONEY BACK', subtitle: 'Guaranteed satisfaction', color: 'from-blue-400 to-cyan-500', link: '/shop', buttonText: 'Shop Now' },
    { title: 'AUTHENTIC GEMSTONES', subtitle: 'Premium quality certified', color: 'from-purple-400 to-pink-500', link: '/shop', buttonText: 'Shop Now' },
    { title: 'EXPERT SUPPORT', subtitle: '24/7 customer service', color: 'from-emerald-400 to-teal-500', link: '/support', buttonText: 'Contact Us' },
  ];

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Matches the 5s cadence of the reference site, and pauses while the visitor
  // is reading the slide they hovered.
  useEffect(() => {
    if (paused || promotions.length < 2) return;

    const timer = setInterval(() => {
      setFading(true);
      window.setTimeout(() => {
        setPromoIndex((prevIndex) => (prevIndex + 1) % promotions.length);
        setFading(false);
      }, 400);
    }, 5000);

    return () => clearInterval(timer);
  }, [promotions.length, paused]);

  const goToSlide = (next: number) => {
    setFading(true);
    window.setTimeout(() => {
      setPromoIndex(next);
      setFading(false);
    }, 400);
  };

  const fetchProducts = async () => {
    try {
      const [allResponse, featuredResponse, heroResponse, promoResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/products?featured=true'),
        fetch('/api/banners?type=hero'),
        fetch('/api/banners?type=promo'),
      ]);

      // Banners the admin created take over the carousel; the hard-coded set
      // below is only a placeholder for a site with none configured yet.
      let adminSlides: Slide[] = [];
      if (heroResponse.ok) {
        const heroBanners = await heroResponse.json();
        if (Array.isArray(heroBanners)) {
          adminSlides = heroBanners.map((banner: Banner) => ({
            title: banner.title,
            subtitle: banner.subtitle || '',
            color: banner.bgColor || 'from-yellow-400 to-amber-500',
            image: banner.image,
            link: banner.link || '/shop',
            buttonText: banner.buttonText || 'Shop Now',
          }));
        }
      }

      if (promoResponse.ok) {
        const banners = await promoResponse.json();
        if (Array.isArray(banners)) setPromoBanners(banners.slice(0, 2));
      }

      let dealSlides: Slide[] = [];
      if (allResponse.ok) {
        const allProducts = await allResponse.json();
        const list: Product[] = Array.isArray(allProducts) ? allProducts : [];
        setProducts(list);

        const now = new Date();
        dealSlides = list
          .filter((product) => product.dealDeadline && new Date(product.dealDeadline) > now)
          .slice(0, 4)
          .map((product) => ({
            title: product.title,
            subtitle: `$${product.price.toFixed(2)} — Limited Time`,
            color: 'from-rose-400 to-red-500',
            image: product.image,
            // There is no product detail route, so deep-link into the shop with
            // its search filter pre-applied — otherwise "View Product" dumps the
            // visitor on the full catalogue with no idea which item was promoted.
            link: `/shop?search=${encodeURIComponent(product.title)}`,
            buttonText: 'View Product',
          }));
      }

      const base = adminSlides.length > 0 ? adminSlides : staticPromotions;
      setPromotions([...base, ...dealSlides]);

      if (featuredResponse.ok) {
        setFeaturedProducts(await featuredResponse.json());
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setPromotions(staticPromotions);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'BERYL', icon: '💎' },
    { name: 'BROOKITE', icon: '💎' },
    { name: 'BRUCITE', icon: '💎' },
    { name: 'CALCITE', icon: '💎' },
    { name: 'CORUNDUM', icon: '💎' },
    { name: 'EPIDOTE', icon: '💎' },
    { name: 'FLUORITE', icon: '💎' },
    { name: 'GARNET', icon: '💎' },
    { name: 'GOLD', icon: '💎' },
    { name: 'PYRITE', icon: '💎' },
    { name: 'QUARTZ', icon: '💎' },
    { name: 'RHODOCHROSITE', icon: '💎' },
  ];

  const vaultProducts = products.slice(0, 5);
  const newArrivals = products.slice(5, 10);
  const allProducts = products;

  return (
    <div className="min-h-screen bg-white">
      {/* Promotional Banner Carousel — slides come from Admin → Banners */}
      {promotions.length > 0 && (
        <section
          className="bg-black py-16 px-4 sm:px-6 relative overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="max-w-7xl mx-auto">
            <div className="relative flex items-center justify-between min-h-64">
              {/* Left Arrow */}
              <button
                onClick={() => goToSlide((promoIndex - 1 + promotions.length) % promotions.length)}
                className="absolute left-0 z-10 p-3 text-white hover:bg-white/10 rounded-full transition"
                aria-label="Previous promotion"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              {/* Slide */}
              <div
                className={`flex-1 flex items-center justify-center px-12 transition-opacity duration-500 ${
                  fading ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className="text-center max-w-2xl">
                  {promotions[promoIndex]?.subtitle && (
                    <p className="text-gray-400 text-lg mb-4 uppercase tracking-widest">
                      {promotions[promoIndex].subtitle}
                    </p>
                  )}
                  <h2
                    className={`text-4xl sm:text-6xl font-black mb-8 bg-gradient-to-r ${promotions[promoIndex]?.color} bg-clip-text text-transparent uppercase tracking-tight`}
                  >
                    {promotions[promoIndex]?.title}
                  </h2>
                  <Link
                    href={promotions[promoIndex]?.link || '/shop'}
                    className="inline-block bg-white text-black font-bold px-8 py-3 rounded hover:bg-gray-200 transition"
                  >
                    {promotions[promoIndex]?.buttonText || 'Shop Now'}
                  </Link>
                </div>

                {/* Banner artwork, uploaded per-banner in the admin panel */}
                <div className="absolute right-12 h-64 w-64 hidden lg:flex items-center justify-center">
                  {promotions[promoIndex]?.image ? (
                    <img
                      src={promotions[promoIndex].image as string}
                      alt={promotions[promoIndex].title}
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  ) : (
                    <div className="text-8xl">💎</div>
                  )}
                </div>
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => goToSlide((promoIndex + 1) % promotions.length)}
                className="absolute right-0 z-10 p-3 text-white hover:bg-white/10 rounded-full transition"
                aria-label="Next promotion"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            {/* Promo Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {promotions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === promoIndex ? 'bg-white w-6' : 'bg-gray-600 w-2 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to promotion ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section - driven by the admin "Featured" checkbox */}
      {!loading && featuredProducts.length > 0 && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-center text-3xl font-bold mb-12">FEATURED PRODUCTS</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/shop?search=${encodeURIComponent(product.title)}`}>
                  <div className="bg-black rounded-2xl p-6 text-white text-center cursor-pointer hover:opacity-90 transition h-full relative">
                    <span className="absolute top-4 left-4 bg-gold-500 text-black text-xs font-bold px-2 py-1 rounded">
                      FEATURED
                    </span>
                    <div className="bg-gradient-to-b from-gray-700 to-black h-40 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">💎</span>
                      )}
                    </div>
                    <p className="font-bold mb-2 line-clamp-2 text-sm">{product.title}</p>
                    <p className="text-gray-400 mb-2 text-sm">{product.category}</p>
                    <p className="font-bold text-lg text-gold-300">${product.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-2">Stock: {product.stock}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link href="/shop?sort=featured" className="inline-block bg-black text-white font-bold px-8 py-3 rounded hover:bg-gray-800">
                VIEW ALL FEATURED
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* All Products Section - Grid View */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-12">ALL PRODUCTS</h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">Loading products...</p>
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">No products available</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {allProducts.map((product) => (
                  <Link key={product.id} href={`/shop?search=${encodeURIComponent(product.title)}`}>
                    <div className="bg-black rounded-2xl p-6 text-white text-center cursor-pointer hover:opacity-90 transition h-full">
                      <div className="bg-gradient-to-b from-gray-700 to-black h-40 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl">💎</span>
                        )}
                      </div>
                      <p className="font-bold mb-2 line-clamp-2 text-sm">{product.title}</p>
                      <p className="text-gray-400 mb-2 text-sm">{product.category}</p>
                      <p className="font-bold text-lg text-gold-300">${product.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 mt-2">Stock: {product.stock}</p>
                      <div className="flex justify-center gap-3 mt-4">
                        <button className="text-xl hover:scale-110">⟷</button>
                        <button className="text-xl hover:scale-110">♡</button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center">
                <Link href="/shop" className="inline-block bg-black text-white font-bold px-8 py-3 rounded hover:bg-gray-800">
                  VIEW MORE PRODUCTS
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-bold mb-12">FEATURED CATEGORIES</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {categories.map((cat, i) => (
              <Link key={i} href={`/gallery?search=${cat.name}`}>
                <div className="bg-black rounded-2xl p-6 text-white text-center cursor-pointer hover:opacity-80 transition">
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <p className="font-bold text-sm uppercase">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/gallery" className="inline-block bg-black text-white font-bold px-8 py-3 rounded hover:bg-gray-800">
              VIEW ALL CATEGORIES
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banners — managed in Admin → Banners (type: Promo) */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {promoBanners.length > 0
            ? promoBanners.map((banner) => (
                <Link
                  key={banner.id}
                  href={banner.link || '/shop'}
                  className="group relative rounded-2xl overflow-hidden bg-black text-white min-h-[240px] flex flex-col justify-center p-12"
                >
                  {banner.image && (
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="relative">
                    <h3 className="text-3xl font-bold mb-2">{banner.title}</h3>
                    {banner.subtitle && <p className="text-lg mb-6">{banner.subtitle}</p>}
                    <span className="inline-block bg-white text-black font-bold px-6 py-3 rounded w-fit group-hover:bg-gray-200 transition">
                      {banner.buttonText || 'Discover'}
                    </span>
                  </div>
                </Link>
              ))
            : (
              <>
                <div className="bg-black text-white rounded-2xl p-12 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold mb-2">💎 Fine Art Gems</h3>
                  <p className="text-lg mb-6">The Same Legacy. A New Brilliance.</p>
                  <Link href="/shop" className="bg-white text-black font-bold px-6 py-3 rounded w-fit hover:bg-gray-200">
                    Explore Gems
                  </Link>
                </div>
                <div className="bg-black text-white rounded-2xl p-12 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold mb-2">🔨 FAM Auctions</h3>
                  <p className="text-lg mb-6">Your Trusted Auction Partner</p>
                  <Link href="/auctions" className="bg-white text-black font-bold px-6 py-3 rounded w-fit hover:bg-gray-200">
                    Join the Auction
                  </Link>
                </div>
              </>
            )}
        </div>
      </section>
    </div>
  );
}
