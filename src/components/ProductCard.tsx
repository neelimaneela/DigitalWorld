import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '../types';
import { useStore } from '../store/StoreContext';
import Rating from './Rating';
import { formatIDR, toIDR } from '../utils/currency';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const inWishlist = isInWishlist(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const outOfStock = product.stock === 0;

  return (
    <div className="group relative card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discount > 0 && (
          <span className="badge bg-error-500 text-white">-{discount}%</span>
        )}
        {product.tags.includes('new') && (
          <span className="badge bg-primary-600 text-white">New</span>
        )}
        {product.tags.includes('bestseller') && (
          <span className="badge bg-accent-500 text-white">Best Seller</span>
        )}
        {product.tags.includes('flash') && (
          <span className="badge bg-warning-500 text-slate-900">Flash</span>
        )}
      </div>

      <button
        onClick={() => toggleWishlist(product)}
        className={`absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
          inWishlist
            ? 'bg-error-500 text-white shadow-md'
            : 'bg-white/80 dark:bg-slate-900/80 text-slate-500 hover:text-error-500 backdrop-blur opacity-0 group-hover:opacity-100'
        }`}
        aria-label="Toggle wishlist"
      >
        <Heart className={`h-4.5 w-4.5 ${inWishlist ? 'fill-white' : ''}`} />
      </button>

      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${outOfStock ? 'grayscale opacity-60' : ''}`}
          />
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-lg bg-slate-900/80 px-3 py-1.5 text-sm font-semibold text-white">Out of Stock</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-gradient-to-t from-slate-900/70 to-transparent p-3 transition-transform duration-300 group-hover:translate-y-0">
            <span className="flex items-center gap-1.5 text-xs font-medium text-white">
              <Eye className="h-4 w-4" /> Quick View
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-0.5">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 hover:text-primary-600 dark:hover:text-primary-400 transition">{product.name}</h3>
        </Link>
        <div className="mt-1.5">
          <Rating rating={product.rating} count={product.reviewCount} showCount />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900 dark:text-white">{formatIDR(toIDR(product.price))}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-slate-400 line-through">{formatIDR(toIDR(product.originalPrice))}</span>
          )}
        </div>
        <p className={`mt-1.5 text-xs font-medium ${product.stock > 10 ? 'text-success-600 dark:text-success-400' : product.stock > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-error-500'}`}>
          {outOfStock ? 'Out of stock' : product.stock <= 10 ? `Only ${product.stock} left` : 'In stock'}
        </p>
        <button
          onClick={() => addToCart(product)}
          disabled={outOfStock}
          className="btn-primary mt-3 w-full text-sm"
        >
          <ShoppingCart className="h-4 w-4" /> Add to Cart
        </button>
      </div>
    </div>
  );
}
