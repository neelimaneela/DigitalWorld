import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, CreditCard, Truck, MapPin, Mail, Phone, Check, Lock, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { FIXED_SHIPPING_IDR, formatIDR, toIDR } from '../utils/currency';

interface Region { id: string; name: string }

const REGION_API = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export default function CheckoutPage() {
  const { cart, clearCart, user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);
  const [provinceId, setProvinceId] = useState('');
  const [cityId, setCityId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [regionError, setRegionError] = useState('');
  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '', phone: '', address: '', province: '', city: '',
    district: '', village: '', zip: '', country: 'Indonesia',
    cardNumber: '', cardName: '', expiry: '', cvv: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const subtotalIDR = cart.reduce((sum, item) => sum + toIDR(item.product.price) * item.quantity, 0);
  const discountIDR = Math.max(0, Math.min(subtotalIDR, (location.state as { discount?: number } | null)?.discount ?? 0));
  const shippingCost = cart.length > 0 ? FIXED_SHIPPING_IDR : 0;
  const finalTotal = subtotalIDR - discountIDR + shippingCost;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${REGION_API}/provinces.json`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Unable to load provinces'); return response.json(); })
      .then((data: Region[]) => setProvinces(data))
      .catch(() => { if (!controller.signal.aborted) setRegionError('Data provinsi tidak dapat dimuat. Periksa koneksi lalu muat ulang halaman.'); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!provinceId) { setCities([]); return; }
    const controller = new AbortController();
    fetch(`${REGION_API}/regencies/${provinceId}.json`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Unable to load cities'); return response.json(); })
      .then((data: Region[]) => setCities(data))
      .catch(() => { if (!controller.signal.aborted) setRegionError('Data kabupaten/kota tidak dapat dimuat.'); });
    return () => controller.abort();
  }, [provinceId]);

  useEffect(() => {
    if (!cityId) { setDistricts([]); return; }
    const controller = new AbortController();
    fetch(`${REGION_API}/districts/${cityId}.json`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Unable to load districts'); return response.json(); })
      .then((data: Region[]) => setDistricts(data))
      .catch(() => { if (!controller.signal.aborted) setRegionError('Data kecamatan tidak dapat dimuat.'); });
    return () => controller.abort();
  }, [cityId]);

  useEffect(() => {
    if (!districtId) { setVillages([]); return; }
    const controller = new AbortController();
    fetch(`${REGION_API}/villages/${districtId}.json`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Unable to load villages'); return response.json(); })
      .then((data: Region[]) => setVillages(data))
      .catch(() => { if (!controller.signal.aborted) setRegionError('Data kelurahan/desa tidak dapat dimuat.'); });
    return () => controller.abort();
  }, [districtId]);

  const update = (field: string, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: '' }));
  };

  const validateStep = (currentStep: number) => {
    const nextErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!form.firstName.trim()) nextErrors.firstName = 'Wajib diisi';
      if (!form.lastName.trim()) nextErrors.lastName = 'Wajib diisi';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Email tidak valid';
      const phone = form.phone.replace(/[\s()-]/g, '');
      if (!/^(?:\+62|62|0)8[1-9][0-9]{6,11}$/.test(phone)) nextErrors.phone = 'Gunakan nomor ponsel Indonesia, contoh 081234567890';
      if (!form.address.trim()) nextErrors.address = 'Wajib diisi';
      if (!form.province) nextErrors.province = 'Pilih provinsi';
      if (!form.city) nextErrors.city = 'Pilih kabupaten/kota';
      if (!form.district) nextErrors.district = 'Pilih kecamatan';
      if (!form.village) nextErrors.village = 'Pilih kelurahan/desa';
      if (!/^\d{5}$/.test(form.zip)) nextErrors.zip = 'Kode pos harus terdiri dari 5 digit';
    }
    if (currentStep === 3) {
      if (form.cardNumber.replace(/\s/g, '').length < 16) nextErrors.cardNumber = 'Nomor kartu tidak valid';
      if (!form.cardName.trim()) nextErrors.cardName = 'Wajib diisi';
      if (!/^\d{2}\/\d{2}$/.test(form.expiry)) nextErrors.expiry = 'Gunakan format MM/YY';
      if (!/^\d{3,4}$/.test(form.cvv)) nextErrors.cvv = 'CVV tidak valid';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validateStep(3)) return;
    const orderId = 'DW' + Date.now().toString().slice(-8);
    const orderData = {
      id: orderId,
      date: new Date().toISOString(),
      currency: 'IDR',
      items: cart.map((item) => ({
        ...item,
        product: { ...item.product, price: toIDR(item.product.price), originalPrice: toIDR(item.product.originalPrice) },
      })),
      subtotal: subtotalIDR,
      discount: discountIDR,
      shippingCost,
      total: finalTotal,
      shipping: {
        name: `${form.firstName} ${form.lastName}`, phone: form.phone, email: form.email,
        address: form.address, village: form.village, district: form.district,
        city: form.city, province: form.province, state: form.province,
        zip: form.zip, country: 'Indonesia',
      },
    };
    const existing = JSON.parse(localStorage.getItem('dw_orders') || '[]');
    localStorage.setItem('dw_orders', JSON.stringify([orderData, ...existing]));
    clearCart();
    navigate('/order-confirmation', { state: { order: orderData } });
  };

  if (cart.length === 0) {
    return <div className="container-x py-16"><div className="flex flex-col items-center justify-center text-center py-20">
      <ShoppingBag className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Your cart is empty</h1>
      <p className="mt-2 text-slate-500">Add some products before checking out.</p>
      <Link to="/products" className="btn-primary mt-6">Browse Products</Link>
    </div></div>;
  }

  const steps = ['Shipping', 'Delivery', 'Payment'];
  const selectClass = 'input-field cursor-pointer';
  const fieldClass = (field: string) => `input-field ${errors[field] ? 'border-error-500' : ''}`;

  return (
    <div className="container-x py-6">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-5">
        <Link to="/" className="hover:text-primary-600">Home</Link><ChevronRight className="h-3.5 w-3.5" />
        <Link to="/cart" className="hover:text-primary-600">Cart</Link><ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-medium">Checkout</span>
      </nav>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl mb-6">Checkout</h1>
      <div className="flex items-center justify-center mb-8">
        {steps.map((label, index) => <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${step > index + 1 ? 'bg-success-500 text-white' : step === index + 1 ? 'bg-primary-600 text-white ring-4 ring-primary-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
              {step > index + 1 ? <Check className="h-4.5 w-4.5" /> : index + 1}
            </div><span className="mt-1.5 text-xs font-medium">{label}</span>
          </div>
          {index < steps.length - 1 && <div className="h-0.5 w-12 sm:w-24 mx-2 mt-[-20px] bg-slate-200 dark:bg-slate-700" />}
        </div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 1 && <div className="card p-6 animate-fade-in">
            <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary-600" /> Shipping Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium block mb-1.5">Nama Depan</label><input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className={fieldClass('firstName')} placeholder="Nama depan" />{errors.firstName && <p className="mt-1 text-xs text-error-500">{errors.firstName}</p>}</div>
              <div><label className="text-sm font-medium block mb-1.5">Nama Belakang</label><input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className={fieldClass('lastName')} placeholder="Nama belakang" />{errors.lastName && <p className="mt-1 text-xs text-error-500">{errors.lastName}</p>}</div>
              <div><label className="text-sm font-medium block mb-1.5">Email</label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" /><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={`${fieldClass('email')} pl-11`} placeholder="nama@email.com" /></div>{errors.email && <p className="mt-1 text-xs text-error-500">{errors.email}</p>}</div>
              <div><label className="text-sm font-medium block mb-1.5">Nomor WhatsApp / Telepon</label><div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" /><input value={form.phone} onChange={(e) => update('phone', e.target.value)} className={`${fieldClass('phone')} pl-11`} placeholder="081234567890" inputMode="tel" /></div>{errors.phone && <p className="mt-1 text-xs text-error-500">{errors.phone}</p>}</div>
              <div className="sm:col-span-2"><label className="text-sm font-medium block mb-1.5">Alamat Jalan, Nomor Rumah, RT/RW, Patokan</label><input value={form.address} onChange={(e) => update('address', e.target.value)} className={fieldClass('address')} placeholder="Nama jalan, nomor rumah, RT/RW, dan detail alamat" />{errors.address && <p className="mt-1 text-xs text-error-500">{errors.address}</p>}</div>
              <div><label className="text-sm font-medium block mb-1.5">Provinsi</label><select value={provinceId} onChange={(e) => { const selected = provinces.find((item) => item.id === e.target.value); setProvinceId(e.target.value); setCityId(''); setDistrictId(''); setForm((p) => ({ ...p, province: selected?.name || '', city: '', district: '', village: '' })); setCities([]); setDistricts([]); setVillages([]); setRegionError(''); }} className={selectClass}><option value="">Pilih provinsi</option>{provinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errors.province && <p className="mt-1 text-xs text-error-500">{errors.province}</p>}</div>
              <div><label className="text-sm font-medium block mb-1.5">Kabupaten / Kota</label><select value={cityId} disabled={!provinceId || cities.length === 0} onChange={(e) => { const selected = cities.find((item) => item.id === e.target.value); setCityId(e.target.value); setDistrictId(''); setForm((p) => ({ ...p, city: selected?.name || '', district: '', village: '' })); setDistricts([]); setVillages([]); }} className={selectClass}><option value="">Pilih kabupaten/kota</option>{cities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errors.city && <p className="mt-1 text-xs text-error-500">{errors.city}</p>}</div>
              <div><label className="text-sm font-medium block mb-1.5">Kecamatan</label><select value={districtId} disabled={!cityId || districts.length === 0} onChange={(e) => { const selected = districts.find((item) => item.id === e.target.value); setDistrictId(e.target.value); setForm((p) => ({ ...p, district: selected?.name || '', village: '' })); setVillages([]); }} className={selectClass}><option value="">Pilih kecamatan</option>{districts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errors.district && <p className="mt-1 text-xs text-error-500">{errors.district}</p>}</div>
              <div><label className="text-sm font-medium block mb-1.5">Kelurahan / Desa</label><select value={form.village} disabled={!districtId || villages.length === 0} onChange={(e) => update('village', e.target.value)} className={selectClass}><option value="">Pilih kelurahan/desa</option>{villages.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select>{errors.village && <p className="mt-1 text-xs text-error-500">{errors.village}</p>}</div>
              <div><label className="text-sm font-medium block mb-1.5">Kode Pos</label><input value={form.zip} onChange={(e) => update('zip', e.target.value.replace(/\D/g, '').slice(0, 5))} className={fieldClass('zip')} placeholder="Contoh: 90111" inputMode="numeric" maxLength={5} />{errors.zip && <p className="mt-1 text-xs text-error-500">{errors.zip}</p>}</div>
              <div><label className="text-sm font-medium block mb-1.5">Negara</label><input value="Indonesia" readOnly className="input-field bg-slate-100 dark:bg-slate-800" /></div>
            </div>
            {regionError && <p role="alert" className="mt-3 text-sm text-error-500">{regionError}</p>}
            <button onClick={() => { if (validateStep(1)) setStep(2); }} className="btn-primary w-full mt-6">Lanjut ke Pengiriman</button>
          </div>}

          {step === 2 && <div className="card p-6 animate-fade-in">
            <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Truck className="h-5 w-5 text-primary-600" /> Metode Pengiriman</h2>
            <div className="rounded-xl border-2 border-primary-500 bg-primary-50 dark:bg-primary-950/30 p-4">
              <p className="font-semibold text-slate-800 dark:text-slate-100">Pengiriman Reguler</p>
              <p className="text-sm text-slate-500">Biaya tetap untuk setiap pesanan</p>
              <p className="mt-2 font-bold text-slate-900 dark:text-white">{formatIDR(FIXED_SHIPPING_IDR)}</p>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => setStep(1)} className="btn-outline flex-1">Kembali</button><button onClick={() => setStep(3)} className="btn-primary flex-1">Lanjut ke Pembayaran</button></div>
          </div>}

          {step === 3 && <div className="card p-6 animate-fade-in">
            <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary-600" /> Payment Details</h2>
            <div className="rounded-xl bg-primary-50 dark:bg-primary-950/30 p-3 mb-4 flex items-center gap-2 text-sm text-primary-700 dark:text-primary-400"><Lock className="h-4 w-4 shrink-0" /> This is a demo checkout. No real payment will be processed.</div>
            <div className="space-y-4">
              <div><label className="text-sm font-medium block mb-1.5">Card Number</label><input value={form.cardNumber} onChange={(e) => update('cardNumber', e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19))} className={fieldClass('cardNumber')} placeholder="4242 4242 4242 4242" inputMode="numeric" />{errors.cardNumber && <p className="mt-1 text-xs text-error-500">{errors.cardNumber}</p>}</div>
              <div><label className="text-sm font-medium block mb-1.5">Name on Card</label><input value={form.cardName} onChange={(e) => update('cardName', e.target.value)} className={fieldClass('cardName')} placeholder="Nama pada kartu" />{errors.cardName && <p className="mt-1 text-xs text-error-500">{errors.cardName}</p>}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium block mb-1.5">Expiry Date</label><input value={form.expiry} onChange={(e) => { let value = e.target.value.replace(/\D/g, ''); if (value.length >= 3) value = value.slice(0, 2) + '/' + value.slice(2, 4); update('expiry', value); }} className={fieldClass('expiry')} placeholder="MM/YY" maxLength={5} />{errors.expiry && <p className="mt-1 text-xs text-error-500">{errors.expiry}</p>}</div>
                <div><label className="text-sm font-medium block mb-1.5">CVV</label><input value={form.cvv} onChange={(e) => update('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))} className={fieldClass('cvv')} placeholder="123" inputMode="numeric" />{errors.cvv && <p className="mt-1 text-xs text-error-500">{errors.cvv}</p>}</div>
              </div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => setStep(2)} className="btn-outline flex-1">Kembali</button><button onClick={handlePlaceOrder} className="btn-accent flex-1"><Check className="h-5 w-5" /> Place Order — {formatIDR(finalTotal)}</button></div>
          </div>}
        </div>

        <div className="lg:col-span-1"><div className="card p-5 sticky top-32">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Order Summary</h2>
          <div className="space-y-2.5 max-h-64 overflow-y-auto no-scrollbar mb-3">
            {cart.map((item) => <div key={item.product.id} className="flex items-center gap-3">
              <div className="relative shrink-0"><img src={item.product.images[0]} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover" /><span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white px-1">{item.quantity}</span></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{item.product.name}</p><p className="text-xs text-slate-500">{formatIDR(toIDR(item.product.price))} × {item.quantity}</p></div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatIDR(toIDR(item.product.price) * item.quantity)}</span>
            </div>)}
          </div>
          <div className="space-y-2 text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Subtotal</span><span>{formatIDR(subtotalIDR)}</span></div>
            {discountIDR > 0 && <div className="flex justify-between text-success-600"><span>Diskon</span><span>-{formatIDR(discountIDR)}</span></div>}
            <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Ongkos kirim</span><span>{formatIDR(shippingCost)}</span></div>
          </div>
          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-3"><span className="font-semibold text-slate-800 dark:text-slate-100">Total</span><span className="font-display text-xl font-bold text-slate-900 dark:text-white">{formatIDR(finalTotal)}</span></div>
        </div></div>
      </div>
    </div>
  );
}
