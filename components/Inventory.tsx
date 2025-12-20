
import React, { useState } from 'react';
import { Product, Ingredient } from '../types';
import { FORMAT_CURRENCY, INGREDIENT_UNITS } from '../constants';
import { Edit2, Plus, Trash2, Package, Barcode, AlertCircle } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onUpdate: (product: Product) => void;
  onAdd: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onUpdate, onAdd, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempProduct, setTempProduct] = useState<Product | null>(null);

  const handleStartAdd = () => {
    const nextBarcode = products.length > 0 
      ? Math.max(...products.map(p => parseInt(p.barcode) || 1000)) + 1 
      : 1001;
    
    setTempProduct({ id: '', name: '', unitPrice: 0, costPrice: 0, ingredients: [], barcode: nextBarcode.toString() });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!tempProduct?.name) return;
    const finalProduct = { ...tempProduct, id: editingId || Math.random().toString(36).substr(2, 9) };
    editingId ? onUpdate(finalProduct) : onAdd(finalProduct);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800">انبار و کالاها</h2>
        <button onClick={handleStartAdd} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-2">
          <Plus size={20}/> کالا جدید
        </button>
      </div>

      {showForm && tempProduct && (
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-2xl space-y-6 animate-in zoom-in-95">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 mb-2 block">نام محصول</label>
              <input value={tempProduct.name} onChange={e => setTempProduct({...tempProduct, name: e.target.value})} className="w-full border-2 p-4 rounded-xl font-black text-lg outline-none focus:border-orange-500"/>
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 mb-2 block">بارکد (خودکار)</label>
              <input value={tempProduct.barcode} readOnly className="w-full bg-slate-100 border-2 p-4 rounded-xl font-mono font-bold cursor-not-allowed"/>
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 mb-2 block">قیمت فروش (تومان)</label>
              <input type="number" value={tempProduct.unitPrice} onChange={e => setTempProduct({...tempProduct, unitPrice: parseInt(e.target.value) || 0})} className="w-full border-2 p-4 rounded-xl font-mono font-black text-orange-600"/>
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 mb-2 block">هزینه تولید (تومان)</label>
              <input type="number" value={tempProduct.costPrice} onChange={e => setTempProduct({...tempProduct, costPrice: parseInt(e.target.value) || 0})} className="w-full border-2 p-4 rounded-xl font-mono font-bold text-slate-400"/>
            </div>
          </div>
          <div className="flex gap-4 justify-end">
            <button onClick={() => setShowForm(false)} className="px-8 py-4 font-black text-slate-400">لغو</button>
            <button onClick={handleSave} className="bg-slate-900 text-white px-12 py-4 rounded-xl font-black">ذخیره کالا</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b">
            <tr className="text-xs font-black text-slate-400">
              <th className="p-5">کالا</th>
              <th className="p-5">بارکد</th>
              <th className="p-5">قیمت فروش</th>
              <th className="p-5 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y font-bold">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-5">{p.name}</td>
                <td className="p-5 font-mono text-slate-400">{p.barcode}</td>
                <td className="p-5 text-orange-600">{FORMAT_CURRENCY(p.unitPrice)}</td>
                <td className="p-5">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => {setTempProduct(p); setEditingId(p.id); setShowForm(true);}} className="p-2 text-slate-300 hover:text-blue-500"><Edit2 size={18}/></button>
                    <button onClick={() => onDelete(p.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
