'use client';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category?: string;
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="group cursor-pointer">
          <div className="card-gradient overflow-hidden rounded-2xl h-full">
            {/* Image Container with Hover Effects */}
            <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-sapphire-900/50 to-amethyst-900/50 mb-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-50">
                  💎
                </div>
              )}

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-midnight-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <button className="w-full btn-primary text-sm">Add to Cart</button>
              </div>

              {/* Category Badge */}
              {product.category && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-sapphire-500 to-amethyst-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {product.category}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sapphire-300 transition-colors line-clamp-2">
                {product.title}
              </h3>

              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold bg-gradient-to-r from-gold-300 to-rose-300 bg-clip-text text-transparent">
                  ${product.price.toFixed(2)}
                </p>
                <div className="text-2xl group-hover:scale-125 transition-transform">⭐</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
