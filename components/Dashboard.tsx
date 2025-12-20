
import React, { useState, useEffect, useMemo } from 'react';
import { Sale, Expense, Product } from '../types';
import { FORMAT_CURRENCY } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, DollarSign, Package, Lightbulb } from 'lucide-react';
import { getBusinessInsights } from '../services/geminiService';

interface DashboardProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ sales, expenses, products }) => {
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Filter valid sales for stats
  const validSales = useMemo(() => sales.filter(s => !s.isReturned), [sales]);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const advice = await getBusinessInsights(validSales, expenses, products);
      setInsights(advice);
      setLoadingInsights(false);
    };
    if (validSales.length > 0) fetchInsights();
  }, [validSales.length, expenses.length, products.length]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const dailySales = validSales.filter(s => s.timestamp.startsWith(today));
    
    const dailyRevenue = dailySales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalProfit = validSales.reduce((acc, s) => acc + s.totalProfit, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalProfit - totalExpenses;

    return {
      dailyRevenue,
      dailyCount: dailySales.length,
      totalRevenue: validSales.reduce((acc, s) => acc + s.totalAmount, 0),
      netProfit,
    };
  }, [validSales, expenses]);

  // Chart data Preparation
  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date: new Intl.DateTimeFormat('fa-IR', { weekday: 'narrow' }).format(new Date(date)),
      revenue: validSales.filter(s => s.timestamp.startsWith(date)).reduce((acc, s) => acc + s.totalAmount, 0),
    }));
  }, [validSales]);

  return (
    <div className="space-y-8 pb-10 text-right">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">داشبورد مدیریتی</h2>
        <p className="text-slate-500 mt-2">خلاصه وضعیت مالی نانوایی نانیک</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
              <DollarSign size={24} />
            </div>
            <span className="text-xs text-green-500 font-bold bg-green-50 px-2 py-1 rounded-lg">امروز</span>
          </div>
          <p className="text-slate-500 text-sm">فروش امروز</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{FORMAT_CURRENCY(stats.dailyRevenue)}</h3>
          <p className="text-xs text-slate-400 mt-2">{stats.dailyCount} تراکنش ثبت شده</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded-lg">کل</span>
          </div>
          <p className="text-slate-500 text-sm">سود خالص (تخمینی)</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{FORMAT_CURRENCY(stats.netProfit)}</h3>
          <p className="text-xs text-slate-400 mt-2">با احتساب هزینه‌های جاری</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-slate-100 p-2 rounded-xl text-slate-600">
              <Package size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm">محصولات تعریف شده</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{products.length} کالا</h3>
          <p className="text-xs text-slate-400 mt-2">قابل تولید و فروش</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
          <div className="bg-orange-500 p-3 rounded-2xl">
            <Lightbulb size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">مشاور هوشمند نانیک</h3>
            <div className="text-slate-300 text-sm leading-relaxed">
              {loadingInsights ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-200"></div>
                  <span>در حال بررسی داده‌ها...</span>
                </div>
              ) : (
                insights || "داده‌ای برای تحلیل وجود ندارد. فروش اول را ثبت کنید!"
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">فروش ۷ روز گذشته (خالص)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis axisLine={false} tickLine={false} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
                formatter={(value) => FORMAT_CURRENCY(value as number)}
              />
              <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
