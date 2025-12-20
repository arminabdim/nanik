
import React, { useState, useRef } from 'react';
import { AppSettings, Product, Sale, Expense, Customer, Discount } from '../types';
import { Shield, Save, Key, Store, Award, Database, Download, Upload, RefreshCw, Info, User } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  discounts: Discount[];
  onImport: (data: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, products, sales, expenses, customers, discounts, onImport }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate(localSettings);
    alert('تنظیمات نانوایی نانیک با موفقیت ذخیره شد.');
  };

  // ایجاد فایل دیتابیس جامع نانیک (NDB)
  const exportDatabase = () => {
    const data = {
      products,
      sales,
      expenses,
      customers,
      discounts,
      settings: localSettings,
      meta: {
        appName: "Nanik Bakery System",
        version: "3.5",
        exportDate: new Date().toISOString()
      }
    };
    
    // کدگذاری دیتابیس برای جلوگیری از دستکاری دستی
    const jsonStr = JSON.stringify(data);
    const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));
    
    const blob = new Blob([encodedData], { type: 'application/nanik-db' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    link.href = url;
    link.download = `NANIK_MASTER_DB_${date}.ndb`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // بازیابی دیتابیس از فایل
  const importDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const decodedStr = decodeURIComponent(escape(atob(content)));
        const data = JSON.parse(decodedStr);
        
        if (data.meta && data.meta.appName === "Nanik Bakery System") {
          if (window.confirm("هشدار: تمام داده‌های فعلی پاک شده و با دیتابیس جدید جایگزین می‌شوند. ادامه می‌دهید؟")) {
            onImport(data);
            alert("دیتابیس نانیک با موفقیت بازیابی شد.");
          }
        } else {
          alert("خطا: فایل انتخاب شده یک دیتابیس معتبر نانیک نمی‌باشد.");
        }
      } catch (err) {
        alert("خطا در خواندن فایل دیتابیس! فایل ممکن است آسیب دیده باشد.");
      }
    };
    reader.readAsText(file);
    // ریست کردن ورودی فایل برای انتخاب‌های بعدی
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 text-right pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">تنظیمات سیستمی</h2>
          <p className="text-slate-500 font-bold">مدیریت دیتابیس، هویت و دسترسی</p>
        </div>
        <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 border border-slate-700 shadow-xl">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-xs font-black uppercase tracking-widest">NANIK DB ENGINE ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* مدیریت دیتابیس جامع */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
            <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-lg"><Database size={24} /></div>
            <h3 className="text-xl font-black">پشتیبان‌گیری و بازیابی</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
              دیتابیس نانیک به صورت خودکار با هر تغییر همگام‌سازی می‌شود. جهت امنیت بیشتر می‌توانید کل دیتابیس را به صورت یک فایل کدگذاری شده ذخیره کنید.
            </p>
            <div className="grid grid-cols-2 gap-4">
               <button 
                 onClick={exportDatabase}
                 className="bg-white text-slate-900 p-5 rounded-[1.5rem] font-black text-xs flex flex-col items-center gap-3 hover:bg-slate-100 transition-all shadow-xl"
               >
                 <Download size={22} className="text-orange-500" /> ذخیره دیتابیس نانیک
               </button>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="bg-slate-800 border-2 border-slate-700 text-white p-5 rounded-[1.5rem] font-black text-xs flex flex-col items-center gap-3 hover:bg-slate-700 transition-all shadow-xl"
               >
                 <Upload size={22} className="text-orange-500" /> بازیابی دیتابیس
               </button>
               <input type="file" ref={fileInputRef} onChange={importDatabase} className="hidden" accept=".ndb" />
            </div>
          </div>
        </div>

        {/* Identity Info */}
        <div className="bg-white p-8 rounded-[3rem] border-4 border-slate-50 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-5 border-slate-50 text-orange-500">
            <Store size={24} />
            <h3 className="text-xl font-black text-slate-800">هویت نانوایی</h3>
          </div>
          <div className="space-y-4">
             <div>
                <label className="text-[10px] font-black text-slate-400 mb-1 block px-1">نام نانوایی</label>
                <input 
                  value={localSettings.shopName} 
                  onChange={e => setLocalSettings({...localSettings, shopName: e.target.value})}
                  className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 bg-slate-50 outline-none font-black"
                />
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-400 mb-1 block px-1">شماره تماس (جهت فاکتور)</label>
                <input 
                  value={localSettings.shopPhone || ''} 
                  onChange={e => setLocalSettings({...localSettings, shopPhone: e.target.value})}
                  placeholder="0912xxxxxxx"
                  className="w-full border-2 border-slate-100 rounded-2xl px-6 py-4 bg-slate-50 outline-none font-bold mb-3 font-mono text-left"
                  dir="ltr"
                />
             </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-orange-100 flex items-start gap-4 text-orange-800">
         <Shield className="shrink-0 mt-1" size={20} />
         <div className="space-y-1">
            <h4 className="font-black text-sm">امنیت دسترسی</h4>
            <p className="text-[11px] font-bold leading-relaxed">
              نام کاربری شما <span className="font-black underline">nanik</span> و رمز عبور شما <span className="font-black underline">1234</span> می‌باشد. این اطلاعات ثابت بوده و قابل تغییر توسط کاربر نیست.
            </p>
         </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-2xl hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] mt-10"
      >
        <Save size={32} />
        ذخیره تمامی تنظیمات
      </button>
    </div>
  );
};

export default Settings;
