import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag, Calendar, MapPin } from 'lucide-react';
import { formatIDR, toIDR } from '../utils/currency';

interface StoredOrder {
  id: string;
  date: string;
  items: { product: { id: string; name: string; images: string[]; price: number }; quantity: number }[];
  total: number;
  currency?: 'IDR';
  shipping: { name: string; address: string; city: string; state: string; province?: string; district?: string; village?: string; zip: string; country?: string };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
    try {
      setOrders(JSON.parse(localStorage.getItem('dw_orders') || '[]'));
    } catch {
      setOrders([]);
    }
  }, []);

  const displayAmount = (order: StoredOrder, amount: number) => formatIDR(order.currency === 'IDR' ? amount : toIDR(amount));

  if (orders.length === 0) {
    return (
      <div className="container-x py-16">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
            <Package className="h-12 w-12 text-slate-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">No orders yet</h1>
          <p className="mt-2 text-slate-500 max-w-md">When you place an order, it will appear here so you can track it anytime.</p>
          <Link to="/products" className="btn-primary mt-6 group">
            <ShoppingBag className="h-5 w-5" /> Start Shopping
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
        <span className="text-slate-800 dark:text-slate-200 font-medium">My Orders</span>
      </nav>

      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl mb-6">My Orders ({orders.length})</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-slate-900 dark:text-white">{order.id}</span>
                  <span className="badge bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-400">Confirmed</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {order.shipping.city}, {order.shipping.province || order.shipping.state}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Total</p>
                <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{displayAmount(order, order.total)}</p>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <Link to={`/product/${item.product.id}`}>
                    <img src={item.product.images[0]} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.id}`} className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate hover:text-primary-600 transition">{item.product.name}</Link>
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{displayAmount(order, item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
