
import React, { useState } from 'react';
import { Customer } from '../types';
import { FORMAT_CURRENCY, FORMAT_DATE } from '../constants';
import { Edit2, Trash2, Search, Award, CheckCircle2, Phone, Calendar } from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  onUpdate: (c: Customer) => void;
  onDelete: (id: string) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, onUpdate, onDelete }) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempCustomer, setTempCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter(c => c.name.includes(search) || c.phone.includes(search));

  const startEdit = (c: Customer) => {
    setEditingId(c.id);
    setTempCustomer({ ...c });
  };

  const handleSave = () => {
    if (tempCustomer) {
      onUpdate(tempCustomer);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-8 text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">وفاداری و مدیریت مشتریان</h2>
          <p className="text-slate-500 font-bold">پایش خریدها و بن‌های تخفیف صادر شده</p>
        </div>
        <div className="relative w-full md:w-96">
          <input 
            placeholder="جستجوی نام یا شماره..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full border-2 border-slate-100 rounded-[2rem] pr-12 pl-6 py-4 bg-white outline-none focus:border-orange-500 transition-all font-bold"
          />
          <Search className="absolute right-4 top-4.5 text-slate-300" size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full p-20 bg-white rounded-[3rem] border text-center text-slate-300">
            <Search size={80} className="mx-auto mb-4 opacity-10" />
            <p className="font-black text-xl">مشتری با این مشخصات یافت نشد</p>
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="bg-white rounded-[2.5rem] border-2 border-slate-50 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
                  <UserCheck size={32} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(c)} className="p-2 text-slate-300 hover:text-blue-500 bg-slate-50 rounded-xl"><Edit2 size={16}/></button>
                  <button onClick={() => onDelete(c.id)} className="p-2 text-slate-300 hover:text-red-500 bg-slate-50 rounded-xl"><Trash2 size={16}/></button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-black text-slate-800">{c.name}</h4>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-1 font-mono" dir="ltr">
                    <Phone size={12}/> <span>{c.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مجموع خرید</p>
                    <p className="text-lg font-black text-blue-600">{FORMAT_CURRENCY(c.totalPurchases)}</p>
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] font-black text-slate-400">عضویت</p>
                     <p className="text-[10px] font-bold">{FORMAT_DATE(c.createdAt).split(' ')[0]}</p>
                  </div>
                </div>

                {/* Voucher Status */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 mb-2">بن‌های وفاداری ({c.vouchers.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {c.vouchers.length === 0 ? (
                      <p className="text-[10px] text-slate-300 italic">هنوز بن تخفیفی صادر نشده</p>
                    ) : (
                      c.vouchers.map((v, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black ${v.isUsed ? 'bg-slate-50 border-slate-100 text-slate-300' : 'bg-orange-50 border-orange-100 text-orange-600 shadow-sm animate-pulse'}`}>
                          <Award size={14}/>
                          <span>{v.code}</span>
                          {v.isUsed && <CheckCircle2 size={12}/>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Form Modal Overlay */}
              {editingId === c.id && tempCustomer && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 p-6 flex flex-col justify-center animate-in fade-in zoom-in-95">
                  <h5 className="font-black mb-4">ویرایش اطلاعات مشتری</h5>
                  <div className="space-y-3">
                    <input value={tempCustomer.name} onChange={e => setTempCustomer({...tempCustomer, name: e.target.value})} className="w-full border-2 rounded-xl p-3 font-bold" placeholder="نام مشتری"/>
                    <input value={tempCustomer.phone} onChange={e => setTempCustomer({...tempCustomer, phone: e.target.value})} className="w-full border-2 rounded-xl p-3 font-bold font-mono" placeholder="شماره تماس"/>
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black">ذخیره</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 border-2 py-3 rounded-xl font-black">لغو</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import { UserCheck } from 'lucide-react';

export default Customers;
