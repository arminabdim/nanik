
import React, { useState } from 'react';
import { Plus, Trash2, Scale, RefreshCcw, Calculator } from 'lucide-react';
import { FORMAT_CURRENCY, INGREDIENT_UNITS } from '../constants';

interface ProductionItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  unit: string;
}

const ProductionCalculator: React.FC = () => {
  const [items, setItems] = useState<ProductionItem[]>([]);
  const [finalYield, setFinalYield] = useState<number>(1);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), name: '', unitPrice: 0, quantity: 0, unit: 'کیلوگرم' }]);
  };

  const updateItem = (id: string, field: keyof ProductionItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const totalCost = items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
  const costPerYield = finalYield > 0 ? totalCost / finalYield : 0;

  return (
    <div className="space-y-8 text-right pb-10">
      <div>
        <h2 className="text-3xl font-black text-slate-800">آنالیز و محاسبه قیمت پخت</h2>
        <p className="text-slate-500 font-bold">محاسبه دقیق بهای تمام شده بر اساس متریال مصرفی</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
             <h3 className="font-black text-xl flex items-center gap-2"><Scale className="text-orange-500"/> لیست مواد اولیه مصرفی</h3>
             <button onClick={addItem} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2"><Plus size={16}/> افزودن ردیف</button>
          </div>

          <div className="space-y-3">
             {items.length === 0 ? (
               <div className="p-20 text-center text-slate-300 border-2 border-dashed rounded-3xl">
                  <Calculator size={48} className="mx-auto mb-3 opacity-10"/>
                  <p className="font-bold">موادی به لیست اضافه نشده است</p>
               </div>
             ) : (
               items.map(item => (
                 <div key={item.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border transition-all hover:border-orange-200">
                    <input 
                      placeholder="نام ماده (مثلاً آرد)" 
                      value={item.name} 
                      onChange={e => updateItem(item.id, 'name', e.target.value)}
                      className="bg-white border p-3 rounded-xl font-bold outline-none"
                    />
                    <div className="flex gap-2">
                       <input 
                         type="number" 
                         placeholder="مقدار" 
                         value={item.quantity || ''} 
                         onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                         className="flex-1 bg-white border p-3 rounded-xl font-mono font-bold outline-none text-center"
                       />
                       <select 
                         value={item.unit} 
                         onChange={e => updateItem(item.id, 'unit', e.target.value)}
                         className="bg-white border p-3 rounded-xl font-black text-[10px] outline-none"
                       >
                         {INGREDIENT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                       </select>
                    </div>
                    <div className="relative">
                       <input 
                         type="number" 
                         placeholder="قیمت واحد" 
                         value={item.unitPrice || ''} 
                         onChange={e => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                         className="w-full bg-white border p-3 rounded-xl font-mono font-bold outline-none text-left"
                         dir="ltr"
                       />
                    </div>
                    <div className="flex items-center justify-between px-2">
                       <span className="font-mono text-xs font-black text-slate-400">{FORMAT_CURRENCY(item.unitPrice * item.quantity).replace(' تومان','')}</span>
                       <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-10 rounded-[4rem] shadow-2xl space-y-8 h-fit lg:sticky lg:top-8">
           <div className="space-y-4">
              <h4 className="text-slate-400 font-black text-xs uppercase tracking-widest">محاسبه نهایی پخت</h4>
              <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                 <p className="text-[10px] font-bold text-slate-500 mb-2">تعداد محصول نهایی (خروجی پخت):</p>
                 <input 
                   type="number" 
                   value={finalYield} 
                   onChange={e => setFinalYield(Math.max(1, parseInt(e.target.value) || 1))}
                   className="w-full bg-slate-900 border-2 border-slate-700 p-4 rounded-xl text-center font-mono font-black text-2xl text-orange-500 outline-none"
                 />
              </div>
           </div>

           <div className="space-y-6 pt-6 border-t border-slate-800">
              <div className="flex justify-between items-center">
                 <span className="text-xs text-slate-400 font-black">کل هزینه مواد:</span>
                 <span className="font-mono font-black">{FORMAT_CURRENCY(totalCost)}</span>
              </div>
              <div className="flex flex-col gap-2">
                 <span className="text-xs text-orange-400 font-black">قیمت تمام شده هر واحد:</span>
                 <span className="text-4xl font-black font-mono">{FORMAT_CURRENCY(Math.round(costPerYield))}</span>
              </div>
           </div>

           <button onClick={() => {setItems([]); setFinalYield(1);}} className="w-full bg-slate-800 text-slate-400 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:text-white transition-all">
              <RefreshCcw size={14}/> شروع مجدد آنالیز
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionCalculator;
