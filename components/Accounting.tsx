
import React, { useMemo } from 'react';
import { Sale, Expense } from '../types';
import { FORMAT_CURRENCY } from '../constants';

interface AccountingProps {
  sales: Sale[];
  expenses: Expense[];
}

const Accounting: React.FC<AccountingProps> = ({ sales, expenses }) => {
  const stats = useMemo(() => {
    // Only count non-returned sales
    const validSales = sales.filter(s => !s.isReturned);
    
    const totalSalesRevenue = validSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalProductionCost = validSales.reduce((acc, s) => acc + s.totalProductionCost, 0);
    const grossProfit = totalSalesRevenue - totalProductionCost;
    
    const totalShopExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = grossProfit - totalShopExpenses;

    const returnedSalesCount = sales.filter(s => s.isReturned).length;

    return {
      totalSalesRevenue,
      totalProductionCost,
      grossProfit,
      totalShopExpenses,
      netProfit,
      validCount: validSales.length,
      returnedSalesCount
    };
  }, [sales, expenses]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">گزارش سود و زیان جامع</h2>
          <p className="text-slate-500">محاسبه دقیق دخل و خرج (با کسر مرجوعی‌ها)</p>
        </div>
        {stats.returnedSalesCount > 0 && (
          <div className="bg-red-50 text-red-600 px-4 py-1 rounded-full text-xs font-bold border border-red-100">
            {stats.returnedSalesCount} فاکتور مرجوعی
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-slate-500 text-sm">کل فروش (خالص)</p>
          <h3 className="text-2xl font-black text-blue-600 mt-1">{FORMAT_CURRENCY(stats.totalSalesRevenue)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-slate-500 text-sm">هزینه تولید محصولات</p>
          <h3 className="text-2xl font-black text-red-500 mt-1">{FORMAT_CURRENCY(stats.totalProductionCost)}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-slate-500 text-sm">سود ناخالص</p>
          <h3 className="text-2xl font-black text-green-600 mt-1">{FORMAT_CURRENCY(stats.grossProfit)}</h3>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-right">
          <div className="space-y-4 w-full">
            <h4 className="text-slate-400 text-sm uppercase tracking-widest">محاسبه نهایی سود خالص</h4>
            <div className="flex flex-col">
              <span className="text-4xl md:text-6xl font-black text-orange-500">
                {FORMAT_CURRENCY(stats.netProfit)}
              </span>
              <span className="text-slate-400 text-xs mt-2">
                سود خالص = (سود ناخالص - هزینه‌های جانبی فروشگاه)
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 min-w-[150px]">
              <p className="text-slate-500 text-[10px] mb-1">هزینه‌های جانبی</p>
              <p className="font-bold">{FORMAT_CURRENCY(stats.totalShopExpenses)}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 min-w-[150px]">
              <p className="text-slate-500 text-[10px] mb-1">فاکتورهای موفق</p>
              <p className="font-bold">{stats.validCount} مورد</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border">
        <h3 className="text-lg font-bold mb-4">جزئیات محاسبات مالی</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b text-sm">
            <span>مجموع مبلغ دریافتی (خالص):</span>
            <span className="font-bold">{FORMAT_CURRENCY(stats.totalSalesRevenue)}</span>
          </div>
          <div className="flex justify-between py-2 border-b text-sm text-red-500">
            <span>مجموع هزینه تولید محصولات فروخته شده:</span>
            <span className="font-bold">- {FORMAT_CURRENCY(stats.totalProductionCost)}</span>
          </div>
          <div className="flex justify-between py-2 border-b text-sm text-red-500">
            <span>مجموع هزینه‌های جاری فروشگاه:</span>
            <span className="font-bold">- {FORMAT_CURRENCY(stats.totalShopExpenses)}</span>
          </div>
          <div className="flex justify-between py-4 text-lg font-black bg-slate-50 px-4 rounded-xl mt-4">
            <span>سود خالص نهایی:</span>
            <span className={stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
              {FORMAT_CURRENCY(stats.netProfit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounting;
