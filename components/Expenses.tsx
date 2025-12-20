
import React, { useState } from 'react';
import { Expense } from '../types';
import { FORMAT_CURRENCY, FORMAT_DATE } from '../constants';
import { Wallet, Plus, Trash2 } from 'lucide-react';

interface ExpensesProps {
  expenses: Expense[];
  onAdd: (expense: Expense) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, onAdd }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('مواد اولیه');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      amount: parseInt(amount),
      category,
      timestamp: new Date().toISOString()
    };

    onAdd(newExpense);
    setTitle('');
    setAmount('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-3xl border shadow-sm sticky top-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 p-2 rounded-xl text-red-600">
              <Plus size={24} />
            </div>
            <h3 className="text-xl font-bold">ثبت هزینه جدید</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">عنوان هزینه</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً: آرد گندم"
                className="w-full bg-slate-50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">مبلغ (تومان)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500,000"
                className="w-full bg-slate-50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">دسته‌بندی</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="مواد اولیه">مواد اولیه</option>
                <option value="قبوض و اجاره">قبوض و اجاره</option>
                <option value="حقوق پرسنل">حقوق پرسنل</option>
                <option value="سایر">سایر</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors mt-2"
            >
              افزودن به لیست
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">تاریخچه هزینه‌ها</h2>
        {expenses.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border text-center text-slate-400">
            <Wallet size={48} strokeWidth={1} className="mx-auto mb-4" />
            <p>هنوز هزینه‌ای ثبت نشده است</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700">عنوان</th>
                  <th className="px-6 py-4 font-bold text-slate-700">دسته‌بندی</th>
                  <th className="px-6 py-4 font-bold text-slate-700">تاریخ</th>
                  <th className="px-6 py-4 font-bold text-slate-700">مبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{expense.title}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{expense.category}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{FORMAT_DATE(expense.timestamp)}</td>
                    <td className="px-6 py-4 text-red-600 font-bold">{FORMAT_CURRENCY(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
