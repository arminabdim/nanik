
import { Product, Discount } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'نان روغنی', unitPrice: 15000, costPrice: 8000, ingredients: [], barcode: '6260000001' },
  { id: '2', name: 'گرده (سنتی)', unitPrice: 12000, costPrice: 6500, ingredients: [], barcode: '6260000002' },
  { id: '3', name: 'حلوا', unitPrice: 45000, costPrice: 25000, ingredients: [], barcode: '6260000003' },
  { id: '4', name: 'فرنی', unitPrice: 20000, costPrice: 12000, ingredients: [], barcode: '6260000004' },
  { id: '5', name: 'شله زرد', unitPrice: 25000, costPrice: 15000, ingredients: [], barcode: '6260000005' },
  { id: '6', name: 'شیره انگور', unitPrice: 120000, costPrice: 85000, ingredients: [], barcode: '6260000006' }
];

export const INITIAL_DISCOUNTS: Discount[] = [
  { id: 'd1', name: 'تخفیف همکار', type: 'percent', value: 10 },
  { id: 'd2', name: 'تخفیف مناسبتی', type: 'fixed', value: 5000 },
];

export const INGREDIENT_UNITS: string[] = ['کیلوگرم', 'گرم', 'عدد', 'کیسه/گونی', 'مثقال', 'لیتر'];

export const FORMAT_CURRENCY = (amount: number) => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

export const FORMAT_DATE = (isoString: string) => {
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(isoString));
};

export const GET_JALALI_NOW = () => {
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());
};

export const GET_TIME_NOW = () => {
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date());
};
