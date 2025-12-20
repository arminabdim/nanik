
import React, { useState } from 'react';
import { Discount } from '../types';
import { FORMAT_CURRENCY } from '../constants';
import { Plus, Trash2, Percent, Edit2, Check, X } from 'lucide-react';

interface DiscountsProps {
  discounts: Discount[];
  setDiscounts: React.Dispatch<React.SetStateAction<Discount[]>>;
}

const Discounts: React.FC<DiscountsProps> = ({ discounts, setDiscounts }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTemp, setEditTemp] = useState<Discount | null>(null);

  const handleAdd = () => {
    if (!name || !value) return;
    const newDiscount: Discount = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      value: parseInt(value),
      type
    };
    setDiscounts([...discounts, newDiscount]);
    setName('');
    setValue('');
  };

  const startEdit = (d: Discount) => {
    setEditingId(d.id);
    setEditTemp({ ...d });
  };

  const saveEdit = () => {
    if (editTemp) {
      setDiscounts(prev => prev.map(d => d.id === editingId ? editTemp : d));
      setEditingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-right">
      <div className="bg-white p-6 rounded-3xl border shadow-sm h-fit">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Percent size={20} className="text-orange-500" />
          تعریف تخفیف جدید
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 block mb-1">نام تخفیف</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-xl px-4 py-3 bg-slate-50"/>
          </div>
          <div>
            <label className="text-sm text-slate-600 block mb-1">نوع تخفیف</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full border rounded-xl px-4 py-3 bg-slate-50">
              <option value="percent">درصدی (%)</option>
              <option value="fixed">مبلغ ثابت (تومان)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600 block mb-1">مقدار</label>
            <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full border rounded-xl px-4 py-3 bg-slate-50"/>
          </div>
          <button onClick={handleAdd} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">افزودن تخفیف</button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4">عنوان تخفیف</th>
                <th className="p-4">نوع</th>
                <th className="p-4">مقدار</th>
                <th className="p-4">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {discounts.map(d => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    {editingId === d.id ? (
                      <input value={editTemp?.name} onChange={e => setEditTemp(t => t ? {...t, name: e.target.value} : null)} className="border rounded px-2 py-1 text-sm outline-none focus:border-orange-500 w-full"/>
                    ) : <span className="font-bold">{d.name}</span>}
                  </td>
                  <td className="p-4 text-sm">{d.type === 'percent' ? 'درصدی' : 'مبلغ ثابت'}</td>
                  <td className="p-4 font-bold text-orange-600">
                    {editingId === d.id ? (
                      <input type="number" value={editTemp?.value} onChange={e => setEditTemp(t => t ? {...t, value: parseInt(e.target.value) || 0} : null)} className="border rounded px-2 py-1 text-sm outline-none w-24"/>
                    ) : (d.type === 'percent' ? `${d.value}%` : FORMAT_CURRENCY(d.value))}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {editingId === d.id ? (
                        <>
                          <button onClick={saveEdit} className="text-green-500 hover:bg-green-50 p-1 rounded"><Check size={18}/></button>
                          <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-50 p-1 rounded"><X size={18}/></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(d)} className="text-slate-400 hover:text-orange-500"><Edit2 size={18} /></button>
                          <button onClick={() => setDiscounts(prev => prev.filter(x => x.id !== d.id))} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Discounts;
