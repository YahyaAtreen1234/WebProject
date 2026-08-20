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

interface CategoryTile {
  name: string;
  count: number;
  image?: string;
}

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/** Shows scarcity only when it is real. A plain stock count reads like a database dump. */
function StockNote({ stock }: { stock: number }) {
  if (stock === 0) return <p className="mt-2 text-xs text-gray-400">Sold</p>;
  if (stock <= 3) return <p className="mt-2 text-xs text-amber-600">Only {stock} left</p>;
  return null;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-sm tracking-widest text-gray-400">
              {product.category?.toUpperCase()}
            </span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="text-xs font-medium uppercase tracking-widest text-gray-700">
              Sold
            </span>
          </div>
        )}
      </div>

      <div className="pt-4">
        <p className="text-xs uppercase tracking-widest text-gray-400">{product.category}</p>
        <h3 className="mt-1 text-[15px] leading-snug text-gray-900 group-hover:underline underline-offset-4">
          {product.title}
        </h3>
        <p className="mt-1 text-[15px] font-medium text-gray-900">{money(product.price)}</p>
        <StockNote stock={product.stock} />
      </div>
    </Link>
  );
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
    {
      title: 'Free worldwide shipping',
      subtitle: 'On every order',
      color: 'from-amber-200 to-amber-400',
      link: '/shop',
      buttonText: 'Browse the collection',
    },
    {
      title: 'Fifteen days to change your mind',
      subtitle: 'Return anything, for any reason',
      color: 'from-sky-200 to-cyan-400',
      link: '/shop',
      buttonText: 'Browse the collection',
    },
  ];

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      let adminSlides: Slide[] = [];
      if (heroResponse.ok) {
        const heroBanners = await heroResponse.json();
        if (Array.isArray(heroBanners)) {
          adminSlides = heroBanners.map((banner: Banner) => ({
            title: banner.title,
            subtitle: banner.subtitle || '',
            color: banner.bgColor || 'from-amber-200 to-amber-400',
            image: banner.image,
            link: banner.link || '/shop',
            buttonText: banner.buttonText || 'Shop now',
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
            subtitle: `${money(product.price)} — limited time`,
            color: 'from-rose-200 to-red-400',
            image: product.image,
            link: `/shop/${product.id}`,
            buttonText: 'View this piece',
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

  // Categories are derived from the catalogue rather than hard-coded, so the
  // homepage can never advertise a category with nothing behind it, and each
  // tile shows a real piece from that category instead of a repeated icon.
  const categories: CategoryTile[] = (() => {
    const grouped = new Map<string, CategoryTile>();

    products.forEach((product) => {
      if (!product.category) return;
      const existing = grouped.get(product.category);
      if (existing) {
        existing.count += 1;
        if (!existing.image && product.image) existing.image = product.image;
      } else {
        grouped.set(product.category, {
          name: product.category,
          count: 1,
          image: product.image,
        });
      }
    });

    return [...grouped.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  })();

  const newArrivals = products.slice(0, 8);
  const slide = promotions[promoIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — slides are managed in Admin → Banners */}
      {slide && (
        <section
          className="relative overflow-hidden bg-neutral-950 px-4 py-20 sm:px-6 sm:py-28"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="mx-auto max-w-6xl">
            <div className="relative flex min-h-[16rem] items-center">
              {promotions.length > 1 && (
                <button
                  onClick={() => goToSlide((promoIndex - 1 + promotions.length) % promotions.length)}
                  className="absolute left-0 z-10 rounded-full p-3 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Previous"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              )}

              <div
                className={`flex flex-1 flex-col items-center gap-10 px-6 transition-opacity duration-500 sm:px-14 md:flex-row md:justify-between ${
                  fading ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className="max-w-xl text-center md:text-left">
                  {slide.subtitle && (
                    <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/50">
                      {slide.subtitle}
                    </p>
                  )}
                  <h1
                    className={`bg-gradient-to-r font-display text-4xl leading-[1.1] sm:text-5xl md:text-6xl ${slide.color} bg-clip-text text-transparent`}
                  >
                    {slide.title}
                  </h1>
                  <Link
                    href={slide.link}
                    className="mt-8 inline-block border border-white/80 px-8 py-3 text-sm tracking-wide text-white transition hover:bg-white hover:text-black"
                  >
                    {slide.buttonText}
                  </Link>
                </div>

                {slide.image && (
                  <div className="h-56 w-56 shrink-0 sm:h-64 sm:w-64">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-full w-full object-contain drop-shadow-2xl"
                    />
                  </div>
                )}
              </div>

              {promotions.length > 1 && (
                <button
                  onClick={() => goToSlide((promoIndex + 1) % promotions.length)}
                  className="absolute right-0 z-10 rounded-full p-3 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Next"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              )}
            </div>

            {promotions.length > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {promotions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-px transition-all ${
                      i === promoIndex ? 'w-10 bg-white' : 'w-5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Assurances */}
      <section className="border-b border-gray-100 px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 text-center sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Shipped worldwide, free</p>
            <p className="mt-1 text-sm text-gray-500">Insured and tracked to your door</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Fifteen days to decide</p>
            <p className="mt-1 text-sm text-gray-500">Return anything, for any reason</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Every piece verified</p>
            <p className="mt-1 text-sm text-gray-500">Photographed as it will arrive</p>
          </div>
        </div>
      </section>

      {/* Featured */}
      {!loading && featuredProducts.length > 0 && (
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl text-gray-900">This month&rsquo;s selection</h2>
                <p className="mt-2 text-gray-500">Pieces we think deserve a closer look.</p>
              </div>
              <Link
                href="/shop?sort=featured"
                className="hidden shrink-0 text-sm text-gray-500 underline-offset-4 hover:text-gray-900 hover:underline sm:block"
              >
                See all
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories — derived from the catalogue */}
      {!loading && categories.length > 0 && (
        <section className="bg-neutral-50 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 font-display text-3xl text-gray-900">Browse by stone</h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/shop?search=${encodeURIComponent(category.name)}`}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-gray-900"
                >
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover opacity-70 transition-all duration-500 group-hover:scale-105 group-hover:opacity-85"
                    />
                  )}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-5">
                    <h3 className="font-display text-xl text-white">{category.name}</h3>
                    <p className="text-xs text-white/70">
                      {category.count} {category.count === 1 ? 'piece' : 'pieces'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl text-gray-900">Recently added</h2>
              <p className="mt-2 text-gray-500">The newest arrivals in the collection.</p>
            </div>
            <Link
              href="/shop"
              className="hidden shrink-0 text-sm text-gray-500 underline-offset-4 hover:text-gray-900 hover:underline sm:block"
            >
              See all
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-lg bg-gray-100" />
                  <div className="mt-4 h-3 w-1/3 rounded bg-gray-100" />
                  <div className="mt-2 h-3 w-3/4 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : newArrivals.length === 0 ? (
            <p className="py-12 text-center text-gray-500">
              Nothing here just yet — new pieces are added regularly.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/shop"
                  className="inline-block border border-gray-900 px-8 py-3 text-sm tracking-wide text-gray-900 transition hover:bg-gray-900 hover:text-white"
                >
                  View the full collection
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Promo banners — only when configured in Admin → Banners */}
      {promoBanners.length > 0 && (
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
            {promoBanners.map((banner) => (
              <Link
                key={banner.id}
                href={banner.link || '/shop'}
                className="group relative flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-lg bg-neutral-900 p-8 text-white"
              >
                {banner.image && (
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="relative">
                  <h3 className="font-display text-2xl">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="mt-1 text-sm text-white/75">{banner.subtitle}</p>
                  )}
                  <span className="mt-5 inline-block border border-white/80 px-6 py-2.5 text-sm transition group-hover:bg-white group-hover:text-black">
                    {banner.buttonText || 'Discover'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
