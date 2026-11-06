import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Heart, Search, Menu, X, Sun, Moon, User, LogOut, Zap, ChevronDown, Home, LayoutGrid, Info, Mail, Package,
} from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { useTheme } from '../store/ThemeContext';
import { searchProducts } from '../data/products';
import { categories } from '../data/categories';
import type { Product } from '../types';
import { formatIDR, toIDR } from '../utils/currency';

export default function Navbar() {
  const { cartCount, wishlist, user, logout } = useStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShowSearch(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 1) {
      setSearchResults(searchProducts(searchQuery).slice(0, 6));
      setShowSearch(true);
    } else {
      setShowSearch(false);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'All Products', icon: LayoutGrid },
    { to: '/about', label: 'About', icon: Info },
    { to: '/contact', label: 'Contact', icon: Mail },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="bg-slate-900 text-slate-300 text-xs hidden md:block">
        <div className="container-x flex items-center justify-between py-2">
          <p className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-accent-400" />
            Flat shipping Rp52.000 — Shop now!
          </p>
          <div className="flex items-center gap-4">
            <Link to="/orders" className="hover:text-white transition">Track Order</Link>
            <span className="text-slate-600">|</span>
            <Link to="/contact" className="hover:text-white transition">Help</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm border-b border-slate-200 dark:border-slate-800' : 'bg-white dark:bg-slate-950'}`}>
        <div className="container-x">
          <div className="flex h-16 items-center gap-3">
            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-600/30">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-extrabold text-slate-900 dark:text-white hidden sm:block">Digital<span className="text-primary-600 dark:text-primary-400">World</span></span>
            </Link>

            {/* Search bar */}
            <div ref={searchRef} className="relative flex-1 max-w-xl hidden md:block">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowSearch(true)}
                    placeholder="Search for products, brands, categories..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
                  />
                </div>
              </form>

              {/* Search dropdown */}
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden animate-scale-in z-50">
                  <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Suggestions</p>
                  {searchResults.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                    >
                      <img src={p.images[0]} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.brand} · {formatIDR(toIDR(p.price))}</p>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearch}
                    className="w-full px-4 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-800"
                  >
                    See all results for "{searchQuery}"
                  </button>
                </div>
              )}
              {showSearch && searchQuery.trim() && searchResults.length === 0 && (
                <div className="absolute top-full mt-2 w-full rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 p-6 text-center text-sm text-slate-500 animate-scale-in z-50">
                  No products found for "{searchQuery}"
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button onClick={toggleTheme} className="btn-ghost h-10 w-10 !p-0" aria-label="Toggle theme">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              <Link to="/wishlist" className="btn-ghost h-10 w-10 !p-0 relative" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white">{wishlist.length}</span>
                )}
              </Link>

              <Link to="/cart" className="btn-ghost h-10 w-10 !p-0 relative" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white animate-scale-in">{cartCount}</span>
                )}
              </Link>

              {/* User menu */}
              <div ref={userMenuRef} className="relative">
                {user ? (
                  <>
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="btn-ghost h-10 px-2 gap-1.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold uppercase">
                        {user.name.charAt(0)}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 hidden lg:block" />
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 py-2 animate-scale-in">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                          <Package className="h-4 w-4" /> My Orders
                        </Link>
                        <button onClick={logout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-error-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link to="/login" className="btn-primary h-10 px-4 text-sm hidden sm:flex">
                    <User className="h-4 w-4" /> Login
                  </Link>
                )}
              </div>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="btn-ghost h-10 w-10 !p-0 md:hidden" aria-label="Menu">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Nav links row */}
          <nav className="hidden md:flex items-center gap-1 h-12 border-t border-slate-100 dark:border-slate-800">
            <Link to="/" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Home</Link>

            {/* Categories dropdown */}
            <div className="relative" onMouseEnter={() => setShowCategoriesDropdown(true)} onMouseLeave={() => setShowCategoriesDropdown(false)}>
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                Categories <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showCategoriesDropdown && (
                <div className="absolute top-full left-0 pt-1 w-64 rounded-xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 py-2 animate-scale-in">
                  {categories.map((cat) => (
                    <Link key={cat.id} to={`/products?category=${cat.slug}`} className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                        <span className="text-sm font-bold">{cat.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{cat.name}</p>
                        <p className="text-xs text-slate-500">{cat.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/products?tag=deal" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 transition">
              <Zap className="h-3.5 w-3.5" /> Today's Deals
            </Link>
            <Link to="/products?tag=new" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition">New Arrivals</Link>
            <Link to="/products?tag=bestseller" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Best Sellers</Link>
            <Link to="/about" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition">About</Link>
            <Link to="/contact" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition">Contact</Link>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 animate-fade-in">
            <div className="container-x py-4 space-y-1">
              <form onSubmit={handleSearch} className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-primary-500"
                />
              </form>
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                  <link.icon className="h-4.5 w-4.5 text-slate-400" /> {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase">Categories</p>
                {categories.map((cat) => (
                  <Link key={cat.id} to={`/products?category=${cat.slug}`} className="block px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition rounded-lg">
                    {cat.name}
                  </Link>
                ))}
              </div>
              {!user && (
                <Link to="/login" className="btn-primary w-full mt-3">
                  <User className="h-4 w-4" /> Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
