import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ShoppingBag, ChevronRight, Tag } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { useState } from 'react';
import { FIXED_SHIPPING_IDR, formatIDR, toIDR } from '../utils/currency';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useStore();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const subtotalIDR = cart.reduce((sum, item) => sum + toIDR(item.product.price) * item.quantity, 0);
  const discount = promoApplied ? Math.round(subtotalIDR * 0.2) : 0;
  const shipping = cart.length === 0 ? 0 : FIXED_SHIPPING_IDR;
  const finalTotal = subtotalIDR - discount + shipping;

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'WELCOME20') {
      setPromoApplied(true);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container-x py-16">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
            <ShoppingCart className="h-12 w-12 text-slate-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Your cart is empty</h1>
          <p className="mt-2 text-slate-500 max-w-md">Looks like you haven't added anything yet. Start shopping and find something you love!</p>
          <Link to="/products" className="btn-primary mt-6 group">
            <ShoppingBag className="h-5 w-5" /> Start Shopping
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
        <span className="text-slate-800 dark:text-slate-200 font-medium">Shopping Cart</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Shopping Cart</h1>
        <button onClick={clearCart} className="text-sm text-error-500 hover:text-error-600 font-medium flex items-center gap-1.5">
          <Trash2 className="h-4 w-4" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => {
            const itemDiscount = item.product.originalPrice - item.product.price;
            return (
              <div key={item.product.id} className="card p-4 flex gap-4">
                <Link to={`/product/${item.product.id}`} className="shrink-0">
                  <img src={item.product.images[0]} alt={item.product.name} className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{item.product.brand}</p>
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate hover:text-primary-600 transition">{item.product.name}</h3>
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">{item.product.category}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-slate-400 hover:text-error-500 transition shrink-0 p-1" aria-label="Remove item">
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-end justify-between flex-wrap gap-2">
                    <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold text-slate-800 dark:text-slate-100">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">{formatIDR(toIDR(item.product.price) * item.quantity)}</p>
                      {itemDiscount > 0 && (
                        <p className="text-xs text-slate-400 line-through">{formatIDR(toIDR(item.product.originalPrice) * item.quantity)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-32">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</h2>

            {/* Promo code */}
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Promo Code</label>
              {promoApplied ? (
                <div className="flex items-center justify-between rounded-xl bg-success-50 dark:bg-success-950/50 px-3 py-2.5 text-sm text-success-700 dark:text-success-400">
                  <span className="flex items-center gap-1.5"><Tag className="h-4 w-4" /> WELCOME20 applied</span>
                  <button onClick={() => { setPromoApplied(false); setPromoCode(''); }} className="text-error-500 hover:text-error-600 text-xs font-medium">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="input-field !py-2 text-sm flex-1"
                  />
                  <button onClick={applyPromo} className="btn-outline !py-2 text-sm shrink-0">Apply</button>
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1.5">Try code "WELCOME20" for 20% off</p>
            </div>

            <div className="space-y-2.5 text-sm border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{formatIDR(subtotalIDR)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-success-600 dark:text-success-400">
                  <span>Discount (20%)</span>
                  <span>-{formatIDR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Shipping</span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{formatIDR(shipping)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
              <span className="font-semibold text-slate-800 dark:text-slate-100">Total</span>
              <span className="font-display text-2xl font-bold text-slate-900 dark:text-white">{formatIDR(finalTotal)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { discount } })}
              className="btn-primary w-full mt-5 group"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Link to="/products" className="btn-ghost w-full mt-2 text-sm">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
