import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Minus, Plus, Star, ChevronRight, Check, Truck,
  RotateCcw, ShieldCheck, ZoomIn, Share2, ChevronLeft,
} from 'lucide-react';
import { getProductById, products } from '../data/products';
import { useStore } from '../store/StoreContext';
import Rating from '../components/Rating';
import ProductCard from '../components/ProductCard';
import { formatIDR, toIDR } from '../utils/currency';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = id ? getProductById(id) : undefined;

  const { addToCart, toggleWishlist, isInWishlist, addRecentlyViewed, showToast } = useStore();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const [selectedColor, setSelectedColor] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
      setActiveImage(0);
      setQuantity(1);
      setActiveTab('description');
      setSelectedColor(0);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Product not found</h1>
        <p className="mt-2 text-slate-500">The product you're looking for doesn't exist.</p>
        <Link to="/products" className="btn-primary mt-6">Browse Products</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const outOfStock = product.stock === 0;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleZoomMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard', 'success');
      }
    } catch { /* ignore */ }
  };

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : product.rating;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
    pct: product.reviews.length > 0 ? (product.reviews.filter((r) => r.rating === star).length / product.reviews.length) * 100 : 0,
  }));

  return (
    <div className="container-x py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6 overflow-hidden">
        <Link to="/" className="hover:text-primary-600 shrink-0">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link to={`/products?category=${product.category}`} className="hover:text-primary-600 capitalize shrink-0">{product.category}</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-x-visible no-scrollbar">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`shrink-0 h-20 w-20 rounded-xl overflow-hidden border-2 transition ${activeImage === i ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
              >
                <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main image with zoom */}
          <div className="flex-1">
            <div
              ref={imgRef}
              onMouseMove={handleZoomMove}
              onMouseEnter={() => setZoom((z) => ({ ...z, active: true }))}
              onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-zoom-in group"
            >
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-200"
                style={zoom.active ? { transform: `scale(2)`, transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {discount > 0 && <span className="badge bg-error-500 text-white">-{discount}% OFF</span>}
                {product.tags.includes('new') && <span className="badge bg-primary-600 text-white">New</span>}
                {product.tags.includes('bestseller') && <span className="badge bg-accent-500 text-white">Best Seller</span>}
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition">
                <ZoomIn className="h-3.5 w-3.5" /> Hover to zoom
              </div>
            </div>
          </div>
        </div>

        {/* Product info */}
        <div>
          <p className="text-sm font-medium text-primary-600 dark:text-primary-400">{product.brand}</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-balance">{product.name}</h1>

          <div className="mt-3 flex items-center gap-4">
            <Rating rating={avgRating} size="md" showCount count={product.reviewCount} />
            <span className={`text-sm font-medium ${outOfStock ? 'text-error-500' : product.stock <= 10 ? 'text-warning-600 dark:text-warning-400' : 'text-success-600 dark:text-success-400'}`}>
              {outOfStock ? 'Out of stock' : product.stock <= 10 ? `Only ${product.stock} left!` : 'In stock'}
            </span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatIDR(toIDR(product.price))}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-slate-400 line-through">{formatIDR(toIDR(product.originalPrice))}</span>
                <span className="badge bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-400">
                  Save {formatIDR(toIDR(product.originalPrice) - toIDR(product.price))}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">Flat shipping: Rp52.000. No additional automatic tax.</p>

          <p className="mt-5 text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Color: <span className="font-normal text-slate-500">{product.colors[selectedColor]}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition ${selectedColor === i ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="flex h-11 w-11 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold text-slate-800 dark:text-slate-100">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))} disabled={outOfStock} className="flex h-11 w-11 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={() => addToCart(product, quantity)} disabled={outOfStock} className="btn-primary flex-1 h-11">
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </button>
            <button onClick={() => toggleWishlist(product)} className={`btn-outline h-11 !w-11 !px-0 ${inWishlist ? 'text-error-500 border-error-300 dark:border-error-800' : ''}`}>
              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-error-500' : ''}`} />
            </button>
            <button onClick={handleShare} className="btn-outline h-11 !w-11 !px-0">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          <button onClick={handleBuyNow} disabled={outOfStock} className="btn-accent w-full mt-3 h-11">
            Buy Now
          </button>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, text: 'Flat Shipping' },
              { icon: RotateCcw, text: '30-Day Returns' },
              { icon: ShieldCheck, text: '2-Year Warranty' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                <item.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {([
            { key: 'description', label: 'Description' },
            { key: 'specs', label: 'Specifications' },
            { key: 'reviews', label: `Reviews (${product.reviews.length})` },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${activeTab === tab.key ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="animate-fade-in max-w-3xl">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
              <h4 className="mt-6 mb-3 font-semibold text-slate-800 dark:text-slate-100">Key Features</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4.5 w-4.5 text-success-500 mt-0.5 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="animate-fade-in max-w-2xl">
              <table className="w-full">
                <tbody>
                  {product.specs.map((spec, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/40' : ''}>
                      <td className="py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 w-1/3">{spec.label}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rating summary */}
              <div className="lg:col-span-1">
                <div className="card p-6 text-center">
                  <p className="text-4xl font-bold text-slate-900 dark:text-white">{avgRating.toFixed(1)}</p>
                  <div className="mt-2 flex justify-center">
                    <Rating rating={avgRating} size="lg" />
                  </div>
                  <p className="mt-1.5 text-sm text-slate-500">{product.reviews.length} reviews</p>
                </div>
                <div className="mt-4 space-y-2">
                  {ratingDistribution.map((r) => (
                    <div key={r.star} className="flex items-center gap-2 text-sm">
                      <span className="flex items-center gap-0.5 w-12 text-slate-500">
                        {r.star} <Star className="h-3 w-3 fill-accent-400 text-accent-400" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-accent-400 rounded-full transition-all" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs text-slate-400">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review list */}
              <div className="lg:col-span-2 space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-bold uppercase">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{review.author}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Rating rating={review.rating} />
                            {review.verified && (
                              <span className="flex items-center gap-0.5 text-xs text-success-600 dark:text-success-400">
                                <Check className="h-3 w-3" /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{review.date}</span>
                    </div>
                    <h5 className="mt-3 font-semibold text-sm text-slate-800 dark:text-slate-100">{review.title}</h5>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
