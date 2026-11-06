import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, Search, ChevronRight, PackageSearch } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { formatIDR, toIDR } from '../utils/currency';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const categoryParam = searchParams.get('category') || '';
  const tagParam = searchParams.get('tag') || '';
  const searchParam = searchParams.get('search') || '';

  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  const allBrands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), []);

  const categoryInfo = categories.find((c) => c.slug === categoryParam);
  const tagLabels: Record<string, string> = { deal: "Today's Deals", new: 'New Arrivals', bestseller: 'Best Sellers', flash: 'Flash Sale', featured: 'Featured' };
  const pageTitle = searchParam
    ? `Search: "${searchParam}"`
    : tagParam ? tagLabels[tagParam] || 'Products'
    : categoryInfo ? categoryInfo.name
    : 'All Products';

  const filtered = useMemo(() => {
    let result = [...products];

    if (categoryParam) result = result.filter((p) => p.category === categoryParam);
    if (tagParam) result = result.filter((p) => p.tags.includes(tagParam as typeof p.tags[number]));
    if (searchParam) {
      const q = searchParam.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (selectedBrands.length > 0) result = result.filter((p) => selectedBrands.includes(p.brand));
    result = result.filter((p) => toIDR(p.price) >= priceRange[0] && toIDR(p.price) <= priceRange[1]);
    if (minRating > 0) result = result.filter((p) => p.rating >= minRating);
    if (inStockOnly) result = result.filter((p) => p.stock > 0);

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => (b.tags.includes('new') ? 1 : 0) - (a.tags.includes('new') ? 1 : 0)); break;
      case 'discount': result.sort((a, b) => {
        const da = (a.originalPrice - a.price) / a.originalPrice;
        const db = (b.originalPrice - b.price) / b.originalPrice;
        return db - da;
      }); break;
    }
    return result;
  }, [categoryParam, tagParam, searchParam, selectedBrands, priceRange, minRating, inStockOnly, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 50000000]);
    setMinRating(0);
    setInStockOnly(false);
    setSearchParams({});
  };

  const activeFilterCount = selectedBrands.length + (minRating > 0 ? 1 : 0) + (inStockOnly ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 50000000 ? 1 : 0);

  useEffect(() => { setShowFilters(false); }, [searchParams]);

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-3">Categories</h4>
        <div className="space-y-1.5">
          <button
            onClick={() => setSearchParams({})}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${!categoryParam ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchParams({ category: cat.slug })}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${categoryParam === cat.slug ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-3">Price Range</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="number" min={0} max={priceRange[1]} value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="input-field !py-2 !px-3 text-sm" placeholder="Min" />
            <span className="text-slate-400">—</span>
            <input type="number" min={priceRange[0]} max={50000000} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="input-field !py-2 !px-3 text-sm" placeholder="Max" />
          </div>
          <input type="range" min={0} max={50000000} step={500000} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full accent-primary-600" />
          <p className="text-xs text-slate-500">{formatIDR(priceRange[0])} — {formatIDR(priceRange[1])}</p>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-3">Brands</h4>
        <div className="space-y-2">
          {allBrands.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500/30" />
              <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-3">Minimum Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 0].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${minRating === r ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {r === 0 ? 'All Ratings' : `${r}★ & above`}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500/30" />
          <span className="text-sm text-slate-600 dark:text-slate-300">In stock only</span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="btn-outline w-full text-sm">
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="container-x py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-medium">{pageTitle}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="card p-5 sticky top-32">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline">Clear</button>
              )}
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{pageTitle}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{filtered.length} {filtered.length === 1 ? 'product' : 'products'} found</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFilters(true)} className="btn-outline lg:hidden text-sm !py-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field !w-auto !py-2 text-sm cursor-pointer">
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <PackageSearch className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">No products found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">Try adjusting your filters or search terms to find what you're looking for.</p>
              <button onClick={clearFilters} className="btn-primary mt-5">Clear Filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-950 shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="btn-ghost !p-2"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5"><FilterContent /></div>
            <div className="sticky bottom-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 p-4">
              <button onClick={() => setShowFilters(false)} className="btn-primary w-full">Show {filtered.length} Results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
