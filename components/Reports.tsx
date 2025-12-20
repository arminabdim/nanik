
import React, { useState, useMemo } from 'react';
import { Sale } from '../types';
import { FORMAT_CURRENCY, FORMAT_DATE } from '../constants';
import { Calendar, Search, FileText, TrendingUp, Undo2 } from 'lucide-react';

interface ReportsProps {
  sales: Sale[];
}

const Reports: React.FC<ReportsProps> = ({ sales }) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const reportStats = useMemo(() => {
    const filtered = sales.filter(s => {
      const saleDate = s.timestamp.split('T')[0];
      return saleDate >= startDate && saleDate <= endDate && !s.isReturned;
    });

    const revenue = filtered.reduce((acc, s) => acc + s.totalAmount, 0);
    const productionCost = filtered.reduce((acc, s) => acc + s.totalProductionCost, 0);
    const profit = revenue - productionCost;
    const count = filtered.length;

    const returns = sales.filter(s => {
      const saleDate = s.timestamp.split('T')[0];
      return saleDate >= startDate && saleDate <= endDate && s.isReturned;
    });

    return { revenue, productionCost, profit, count, returnsCount: returns.length, returnedAmount: returns.reduce((acc, s) => acc + s.totalAmount, 0) };
  }, [sales, startDate, endDate]);

  return (
    <div className="space-y-8 text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">گزارش‌های مالی و فروش</h2>
          <p className="text-slate-500">تحلیل عملکرد در بازه‌های زمانی مختلف</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">از:</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs outline-none bg-slate-50 p-1 rounded-lg border"/>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">تا:</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs outline-none bg-slate-50 p-1 rounded-lg border"/>
          </div>
          <Calendar size={18} className="text-orange-500 mr-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-slate-500 text-sm">فروش کل (خالص)</p>
          <h3 className="text-xl font-black text-blue-600 mt-1">{FORMAT_CURRENCY(reportStats.revenue)}</h3>
          <p className="text-[10px] text-slate-400 mt-2">{reportStats.count} فاکتور موفق</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-slate-500 text-sm">سود ناخالص بازه</p>
          <h3 className="text-xl font-black text-green-600 mt-1">{FORMAT_CURRENCY(reportStats.profit)}</h3>
          <p className="text-[10px] text-slate-400 mt-2">بر اساس بهای تمام شده کالا</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-slate-500 text-sm">تعداد مرجوعی</p>
          <h3 className="text-xl font-black text-red-500 mt-1">{reportStats.returnsCount} مورد</h3>
          <p className="text-[10px] text-red-400 mt-2">مبلغ: {FORMAT_CURRENCY(reportStats.returnedAmount)}</p>
        </div>
        <div className="bg-slate-900 text-white p-6 rounded-3xl border shadow-sm">
          <p className="text-slate-400 text-sm">میانگین هر فاکتور</p>
          <h3 className="text-xl font-black text-orange-500 mt-1">
            {reportStats.count > 0 ? FORMAT_CURRENCY(Math.round(reportStats.revenue / reportStats.count)) : '۰'}
          </h3>
          <p className="text-[10px] text-slate-500 mt-2">در این بازه زمانی</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
           <FileText size={20} className="text-slate-400" />
           ریز تراکنش‌های بازه انتخابی
        </h3>
        <div className="overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4">شناسه</th>
                <th className="p-4">مشتری</th>
                <th className="p-4">زمان ثبت</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4">مبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {sales.filter(s => s.timestamp.split('T')[0] >= startDate && s.timestamp.split('T')[0] <= endDate).map(sale => (
                <tr key={sale.id} className={sale.isReturned ? 'bg-red-50/20' : ''}>
                  <td className="p-4 font-mono text-xs">#{sale.id}</td>
                  <td className="p-4">{sale.customerName}</td>
                  <td className="p-4 text-slate-400 text-xs">{FORMAT_DATE(sale.timestamp)}</td>
                  <td className="p-4">
                    {sale.isReturned ? <span className="text-red-500">مرجوعی</span> : <span className="text-green-500">موفق</span>}
                  </td>
                  <td className="p-4 font-bold">{FORMAT_CURRENCY(sale.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
