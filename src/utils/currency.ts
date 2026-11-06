export const USD_TO_IDR = 17000;

export function toIDR(amountUSD: number): number {
  return Math.round(amountUSD * USD_TO_IDR);
}

export function formatIDR(amountIDR: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(amountIDR));
}

export const FIXED_SHIPPING_IDR = 52000;
