import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, ChevronRight } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { formatIDR, toIDR } from '../utils/currency';
import { getProductById } from '../data/products';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, removeFromWishlist, addToCart } = useStore();
  const items = wishlist.map(getProductById).filter(Boolean) as NonNullable<ReturnType<typeof getProductById>>[];

  if (items.length === 0) {
    return (
      <div className="container-x py-16">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
            <Heart className="h-12 w-12 text-slate-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Your wishlist is empty</h1>
          <p className="mt-2 text-slate-500 max-w-md">Save your favorite products here so you can easily find them later.</p>
          <Link to="/products" className="btn-primary mt-6 group">
            Discover Products
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-6">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-medium">Wishlist</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          My Wishlist <span className="text-lg font-normal text-slate-400">({items.length})</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((product) => {
          const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
          return (
            <div key={product.id} className="card overflow-hidden group">
              <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                {discount > 0 && <span className="badge bg-error-500 text-white absolute top-3 left-3">-{discount}%</span>}
              </Link>
              <div className="p-4">
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{product.brand}</p>
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 hover:text-primary-600 transition">{product.name}</h3>
                </Link>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{formatIDR(toIDR(product.price))}</span>
                  {product.originalPrice > product.price && <span className="text-sm text-slate-400 line-through">{formatIDR(toIDR(product.originalPrice))}</span>}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => { addToCart(product); removeFromWishlist(product.id); }}
                    disabled={product.stock === 0}
                    className="btn-primary flex-1 text-sm !py-2"
                  >
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </button>
                  <button onClick={() => removeFromWishlist(product.id)} className="btn-outline !w-10 !h-10 !px-0 text-error-500 hover:!border-error-300" aria-label="Remove from wishlist">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
