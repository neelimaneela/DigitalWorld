import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Smartphone, Laptop, Headphones, Watch, Camera, Plug,
  Truck, ShieldCheck, RotateCcw, HeadsetIcon, Sparkles, TrendingUp,
} from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import FlashSaleTimer from '../components/FlashSaleTimer';
import { products, getProductsByTag } from '../data/products';
import { categories } from '../data/categories';
import { useStore } from '../store/StoreContext';
import { getProductById } from '../data/products';

const categoryIcons: Record<string, typeof Smartphone> = {
  Mobiles: Smartphone, Laptops: Laptop, Headphones: Headphones,
  'Smart Watches': Watch, Cameras: Camera, Accessories: Plug,
};

export default function HomePage() {
  const { recentlyViewed } = useStore();
  const deals = getProductsByTag('deal').slice(0, 4);
  const flashSale = getProductsByTag('flash');
  const newArrivals = getProductsByTag('new').slice(0, 4);
  const bestSellers = getProductsByTag('bestseller').slice(0, 4);
  const featured = getProductsByTag('featured').slice(0, 4);
  const recentProducts = recentlyViewed.map(getProductById).filter(Boolean).slice(0, 4);

  return (
    <div className="space-y-14 pb-8">
      {/* Hero */}
      <section className="container-x pt-6">
        <HeroCarousel />
      </section>

      {/* Trust badges */}
      <section className="container-x">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: 'Flat Shipping', desc: 'Rp52.000 per order' },
            { icon: RotateCcw, title: '30-Day Returns', desc: 'Hassle-free returns' },
            { icon: ShieldCheck, title: '2-Year Warranty', desc: 'On all products' },
            { icon: HeadsetIcon, title: '24/7 Support', desc: 'Always here to help' },
          ].map((badge, i) => (
            <div key={i} className="card flex items-center gap-3 p-4 hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                <badge.icon className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{badge.title}</p>
                <p className="text-xs text-slate-500">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-x">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Shop by Category</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Find exactly what you're looking for</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.name] || Plug;
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group card flex flex-col items-center gap-3 p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 text-primary-600 dark:text-primary-400 group-hover:from-primary-500 group-hover:to-primary-700 group-hover:text-white transition-all duration-300">
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{cat.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.description.split(' ').slice(0, 3).join(' ')}...</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Today's Deals */}
      <section className="container-x">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-error-500/10 text-error-500">
              <Zap className="h-5 w-5 fill-error-500" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Today's Deals</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Save big while stocks last</p>
            </div>
          </div>
          <Link to="/products?tag=deal" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            See All Deals <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {deals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Flash Sale */}
      {flashSale.length > 0 && (
        <section className="container-x">
          <div className="rounded-3xl bg-gradient-to-br from-accent-500/5 via-accent-500/10 to-primary-500/5 dark:from-accent-500/10 dark:via-accent-500/5 dark:to-primary-500/10 p-6 border border-accent-200 dark:border-accent-900/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <FlashSaleTimer />
              <Link to="/products?tag=flash" className="text-sm font-medium text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flashSale.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container-x">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Featured Products</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Handpicked just for you</p>
            </div>
          </div>
          <Link to="/products" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Promo banner */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 via-primary-800 to-slate-900 p-8 sm:p-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent-400/20 blur-3xl" />
          <div className="absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-primary-400/20 blur-3xl" />
          <div className="relative z-10 max-w-xl">
            <span className="badge bg-white/15 text-white backdrop-blur px-3 py-1">Limited Time</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl text-balance">
              Get 20% off your first order
            </h2>
            <p className="mt-2 text-white/80">Use code <span className="font-mono font-bold text-accent-300">WELCOME20</span> at checkout. Valid for new customers only.</p>
            <Link to="/products" className="btn-accent mt-5 group">
              Shop Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-x">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-500/10 text-success-600 dark:text-success-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">New Arrivals</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">The latest tech in town</p>
            </div>
          </div>
          <Link to="/products?tag=new" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container-x">
        <div className="flex items-end justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Best Sellers</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Most loved by our customers</p>
            </div>
          </div>
          <Link to="/products?tag=bestseller" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Recently Viewed */}
      {recentProducts.length > 0 && (
        <section className="container-x">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Recently Viewed</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProducts.map((p) => p && <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
