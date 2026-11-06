import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Home as HomeIcon, ArrowRight, Copy } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { formatIDR, toIDR } from '../utils/currency';

interface OrderData {
  id: string;
  date: string;
  items: { product: { id: string; name: string; images: string[]; price: number }; quantity: number }[];
  total: number;
  subtotal?: number;
  discount?: number;
  shippingCost?: number;
  currency?: 'IDR';
  shipping: { name: string; address: string; city: string; state: string; province?: string; district?: string; village?: string; zip: string; country?: string; phone?: string };
}

export default function OrderConfirmationPage() {
  const location = useLocation();
  const { showToast } = useStore();
  const order = (location.state as { order: OrderData } | null)?.order;

  if (!order) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">No order found</h1>
        <p className="mt-2 text-slate-500">It looks like you haven't placed an order yet.</p>
        <Link to="/products" className="btn-primary mt-6">Start Shopping</Link>
      </div>
    );
  }

  const displayAmount = (amount: number) => formatIDR(order.currency === 'IDR' ? amount : toIDR(amount));

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    showToast('Order ID copied', 'success');
  };

  const orderDate = new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const estimatedDelivery = new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="container-x py-10">
      <div className="max-w-2xl mx-auto">
        {/* Success banner */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-100 dark:bg-success-950 mb-5 animate-scale-in">
            <CheckCircle2 className="h-10 w-10 text-success-600 dark:text-success-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Order Confirmed!</h1>
          <p className="mt-2 text-slate-500">Thank you for your purchase. Your order is being processed.</p>
        </div>

        {/* Order info */}
        <div className="card p-6 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Order Number</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{order.id}</p>
                <button onClick={copyOrderId} className="text-slate-400 hover:text-primary-600 transition" aria-label="Copy order ID">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-semibold">Order Date</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-1">{orderDate}</p>
            </div>
          </div>
        </div>

        {/* Order status tracker */}
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Order Status</h2>
          <div className="flex items-center justify-between">
            {[
              { icon: CheckCircle2, label: 'Confirmed', active: true },
              { icon: Package, label: 'Processing', active: false },
              { icon: Truck, label: 'Shipped', active: false },
              { icon: HomeIcon, label: 'Delivered', active: false },
            ].map((step, i) => (
              <div key={i} className="flex flex-1 flex-col items-center relative">
                {i > 0 && <div className="absolute left-0 top-5 right-1/2 h-0.5 bg-slate-200 dark:bg-slate-700" />}
                <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${step.active ? 'bg-success-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={`mt-1.5 text-xs font-medium ${step.active ? 'text-success-600 dark:text-success-400' : 'text-slate-400'}`}>{step.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500 text-center">Estimated delivery: <span className="font-semibold text-slate-700 dark:text-slate-300">{estimatedDelivery}</span></p>
        </div>

        {/* Order items */}
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Items ({order.items.length})</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3">
                <img src={item.product.images[0]} alt={item.product.name} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.id}`} className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate hover:text-primary-600 transition">{item.product.name}</Link>
                  <p className="text-xs text-slate-500" >Qty: {item.quantity} · {displayAmount(item.product.price)}</p>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{displayAmount(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3 text-sm">
            {order.subtotal !== undefined && <div className="flex justify-between"><span>Subtotal</span><span>{displayAmount(order.subtotal)}</span></div>}
            {(order.discount || 0) > 0 && <div className="flex justify-between text-success-600"><span>Diskon</span><span>-{displayAmount(order.discount || 0)}</span></div>}
            {order.shippingCost !== undefined && <div className="flex justify-between"><span>Ongkos kirim</span><span>{displayAmount(order.shippingCost)}</span></div>}
          </div>
          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
            <span className="font-semibold text-slate-800 dark:text-slate-100">Total Paid</span>
            <span className="font-display text-xl font-bold text-slate-900 dark:text-white">{displayAmount(order.total)}</span>
          </div>
        </div>

        {/* Shipping address */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Shipping Address</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{order.shipping.name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{order.shipping.address}</p>
          {order.shipping.phone && <p className="text-sm text-slate-600 dark:text-slate-300">Telepon: {order.shipping.phone}</p>}
          <p className="text-sm text-slate-600 dark:text-slate-300">{order.shipping.village ? order.shipping.village + ', ' : ''}{order.shipping.district ? order.shipping.district + ', ' : ''}{order.shipping.city}, {order.shipping.province || order.shipping.state} {order.shipping.zip}, {order.shipping.country || 'Indonesia'}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/products" className="btn-primary flex-1 group">
            Continue Shopping <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/orders" className="btn-outline flex-1">View My Orders</Link>
        </div>
      </div>
    </div>
  );
}
