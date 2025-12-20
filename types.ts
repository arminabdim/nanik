
export type IngredientUnit = 'کیلوگرم' | 'گرم' | 'عدد' | 'کیسه/گونی' | 'مثقال' | 'لیتر';

export interface Ingredient {
  name: string;
  unitPrice: number; 
  quantity: number;
  unit: IngredientUnit;
}

export interface Product {
  id: string;
  name: string;
  unitPrice: number;
  costPrice: number;
  ingredients: Ingredient[];
  barcode: string;
}

export interface Voucher {
  code: string;
  amount: number;
  isUsed: boolean;
  issuedAt: string;
  expiresAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalPurchases: number;
  createdAt: string;
  vouchers: Voucher[];
}

export interface CartItem extends Product {
  quantity: number;
  returnedQuantity?: number; // Track how many of this item were returned
}

export interface Sale {
  id: string;
  items: CartItem[];
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  totalProductionCost: number;
  totalProfit: number;
  timestamp: string;
  customerName?: string;
  customerId?: string;
  isReturned?: boolean; // Fully returned
  returnTimestamp?: string;
  appliedVoucher?: Voucher; // برای نمایش اطلاعات بن در فاکتور
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  timestamp: string;
}

export interface AppSettings {
  shopName: string;
  shopAddress?: string;
  shopPhone?: string;
  password?: string;
  isPasswordEnabled: boolean;
  voucherThreshold: number; 
  voucherAmount: number; 
  voucherValidityDays: number;
}

export interface Discount {
  id: string;
  name: string;
  type: 'percent' | 'fixed';
  value: number;
}
