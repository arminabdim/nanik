
import React, { useState, useMemo } from 'react';
import { Product, CartItem, Sale, Discount, Customer, Voucher } from '../types';
import { FORMAT_CURRENCY, FORMAT_DATE } from '../constants';
import { 
  Plus, Minus, ShoppingCart, Search, X, Printer, 
  CheckCircle2, RotateCcw, Package, Undo2, Download, 
  UserPlus, UserCheck, Percent, Gift, User, Edit3
} from 'lucide-react';

interface POSProps {
  products: Product[];
  discounts: Discount[];
  customers: Customer[];
  onSale: (sale: Sale) => void;
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  voucherThreshold: number;
  voucherAmount: number;
  salesHistory: Sale[];
  onUpdateSale: (s: Sale) => void;
}

const POS: React.FC<POSProps> = ({ 
  products, discounts, customers, onSale, onAddCustomer, onUpdateCustomer,
  voucherThreshold, voucherAmount, salesHistory, onUpdateSale 
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [appliedDiscountId, setAppliedDiscountId] = useState<string | null>(null);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);
  
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showReturnSearch, setShowReturnSearch] = useState(false);
  const [returnInvoiceId, setReturnInvoiceId] = useState('');

  const [showCustModal, setShowCustModal] = useState(false);
  const [isEditingCust, setIsEditingCust] = useState(false);
  const [custForm, setCustForm] = useState({ name: '', phone: '' });

  // Calculations
  const subTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0), [cart]);
  
  const appliedDiscount = discounts.find(d => d.id === appliedDiscountId);
  const discountVal = useMemo(() => {
    if (!appliedDiscount) return 0;
    return appliedDiscount.type === 'percent' 
      ? (subTotal * appliedDiscount.value) / 100 
      : appliedDiscount.value;
  }, [subTotal, appliedDiscount]);

  const voucherVal = appliedVoucherCode ? voucherAmount : 0;
  const total = Math.max(0, subTotal - discountVal - voucherVal);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const filteredCustomers = customers.filter(c => c.name.includes(customerSearch) || c.phone.includes(customerSearch));

  // Loyalty Nudge Logic
  const loyaltyMessage = useMemo(() => {
    if (!selectedCustomer) return null;
    const currentProgress = selectedCustomer.totalPurchases % voucherThreshold;
    const remaining = voucherThreshold - currentProgress;
    const nextAmount = remaining - total;
    
    if (nextAmount <= 0) {
      return `تبریک! با این خرید، یک بن هدیه ${FORMAT_CURRENCY(voucherAmount)} دریافت خواهید کرد.`;
    }
    return `فقط با ${FORMAT_CURRENCY(nextAmount)} خرید دیگر، یک بن جایزه ${FORMAT_CURRENCY(voucherAmount)} دریافت کنید.`;
  }, [selectedCustomer, total, voucherThreshold, voucherAmount]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1, returnedQuantity: 0 }];
    });
  };

  const handleSaveCustomer = () => {
    if (!custForm.name || !custForm.phone) return alert('نام و تلفن الزامی است');
    if (isEditingCust && selectedCustomerId) {
      const updated = { ...selectedCustomer!, name: custForm.name, phone: custForm.phone };
      onUpdateCustomer(updated);
    } else {
      const newCust: Customer = {
        id: Math.random().toString(36).substr(2, 9),
        name: custForm.name,
        phone: custForm.phone,
        totalPurchases: 0,
        createdAt: new Date().toISOString(),
        vouchers: []
      };
      onAddCustomer(newCust);
      setSelectedCustomerId(newCust.id);
    }
    setShowCustModal(false);
    setCustForm({ name: '', phone: '' });
  };

  const openEditCust = () => {
    if (!selectedCustomer) return;
    setCustForm({ name: selectedCustomer.name, phone: selectedCustomer.phone });
    setIsEditingCust(true);
    setShowCustModal(true);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const totalProdCost = cart.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0);
    
    // شناسایی بن اعمال شده برای ذخیره در رکورد فروش
    const usedVoucher = selectedCustomer?.vouchers.find(v => v.code === appliedVoucherCode);

    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      items: cart.map(item => ({ ...item, returnedQuantity: 0 })),
      subTotal,
      discountAmount: discountVal + voucherVal,
      totalAmount: total,
      totalProductionCost: totalProdCost,
      totalProfit: total - totalProdCost,
      timestamp: new Date().toISOString(),
      customerName: selectedCustomer?.name || 'مشتری حضوری',
      customerId: selectedCustomerId || undefined,
      appliedVoucher: usedVoucher // ذخیره اطلاعات بن در فاکتور
    };

    onSale(newSale);
    setLastSale(newSale);
    setShowInvoice(true);
    setCart([]);
    setSelectedCustomerId(null);
    setAppliedDiscountId(null);
    setAppliedVoucherCode(null);
  };

  const generatePDF = () => {
    const element = document.getElementById('nanik-pdf-template');
    if (!element) return;
    element.style.display = 'block';
    const opt = {
      margin: 10,
      filename: `Nanik_Invoice_${lastSale?.id}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save().then(() => element.style.display = 'none');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full text-right relative pb-4">
      {/* Products Area */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden no-print">
        <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-3xl border shadow-sm">
          <div className="flex items-center gap-3 flex-1 bg-slate-50 px-3 py-2 rounded-xl">
             <Search size={18} className="text-slate-300" />
             <input 
               placeholder="جستجوی مشتری (نام یا موبایل)..." 
               className="bg-transparent outline-none w-full font-bold text-sm"
               value={customerSearch}
               onChange={e => setCustomerSearch(e.target.value)}
             />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setIsEditingCust(false); setCustForm({name:'', phone:''}); setShowCustModal(true); }}
              className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-slate-200 whitespace-nowrap"
            >
              <UserPlus size={14} /> مشتری جدید
            </button>
            <button onClick={() => setShowReturnSearch(true)} className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 whitespace-nowrap">
              <RotateCcw size={14} /> مرجوعی
            </button>
          </div>
        </div>

        {customerSearch && (
          <div className="bg-white border rounded-3xl shadow-xl p-4 space-y-2 max-h-48 overflow-y-auto z-20">
            {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
              <button key={c.id} onClick={() => { setSelectedCustomerId(c.id); setCustomerSearch(''); }} className="w-full flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all">
                <span className="font-bold text-sm">{c.name} ({c.phone})</span>
                <UserCheck size={18} className="text-green-500" />
              </button>
            )) : <p className="text-center text-slate-400 text-sm py-2">مشتری یافت نشد</p>}
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 overflow-y-auto pb-6">
          {products.map(product => (
            <button key={product.id} onClick={() => addToCart(product)} className="flex flex-col justify-between p-4 md:p-5 bg-white rounded-[2rem] border-2 border-transparent shadow-sm hover:shadow-lg hover:border-orange-200 transition-all h-36 md:h-40 group">
              <p className="font-black text-slate-800 leading-tight text-sm md:text-base group-active:scale-95 transition-transform">{product.name}</p>
              <div className="flex justify-between items-end">
                <span className="text-[9px] text-slate-300 font-mono">#{product.barcode}</span>
                <p className="text-orange-600 font-black text-xs md:text-sm">{FORMAT_CURRENCY(product.unitPrice)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Actions Area */}
      <div className="w-full lg:w-[420px] flex flex-col bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden no-print min-h-[400px]">
        {/* Customer Header */}
        <div className="p-4 md:p-5 bg-slate-900 text-white">
          {selectedCustomer ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <UserCheck size={18} className="text-green-400" />
                  <span className="font-black text-sm">{selectedCustomer.name}</span>
                  <button onClick={openEditCust} className="p-1 text-slate-400 hover:text-white"><Edit3 size={14}/></button>
                </div>
                <button onClick={() => setSelectedCustomerId(null)}><X size={16}/></button>
              </div>
              {loyaltyMessage && (
                <div className="bg-orange-500/20 text-orange-300 p-2.5 rounded-xl text-[9px] font-black border border-orange-500/30">
                  {loyaltyMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <User size={18} />
              <span className="font-bold text-xs">مشتری حضوری</span>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 min-h-[150px]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-slate-400">
              <ShoppingCart size={40} strokeWidth={1.5} />
              <p className="text-[10px] font-black mt-2">سبد خرید خالی است</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-2xl border flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-black text-xs text-slate-800">{item.name}</p>
                  <p className="text-[10px] font-bold text-orange-500">{FORMAT_CURRENCY(item.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => setCart(p => p.map(i => i.id === item.id ? {...i, quantity: Math.max(0, i.quantity - 1)} : i).filter(i => i.quantity > 0))} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Minus size={14}/></button>
                   <span className="w-5 text-center font-black text-xs">{item.quantity}</span>
                   <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg text-green-500 hover:bg-green-50 transition-colors"><Plus size={14}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Discounts & Vouchers */}
        <div className="p-4 border-t bg-white space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {discounts.map(d => (
              <button 
                key={d.id} 
                onClick={() => setAppliedDiscountId(appliedDiscountId === d.id ? null : d.id)}
                className={`shrink-0 px-3 py-2 rounded-xl text-[9px] font-black transition-all flex items-center gap-1 border ${appliedDiscountId === d.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
              >
                <Percent size={11}/> {d.name}
              </button>
            ))}
          </div>

          {selectedCustomer && selectedCustomer.vouchers.filter(v => !v.isUsed).length > 0 && (
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {selectedCustomer.vouchers.filter(v => !v.isUsed).map(v => (
                  <button 
                    key={v.code} 
                    onClick={() => setAppliedVoucherCode(appliedVoucherCode === v.code ? null : v.code)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-[9px] font-black transition-all flex items-center gap-1 border ${appliedVoucherCode === v.code ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 text-green-600 border-green-100'}`}
                  >
                    <Gift size={11}/> {FORMAT_CURRENCY(v.amount)}
                  </button>
                ))}
             </div>
          )}
        </div>

        {/* Total & Checkout */}
        <div className="p-4 md:p-6 bg-white border-t space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>جمع اقلام:</span>
              <span>{FORMAT_CURRENCY(subTotal)}</span>
            </div>
            {(discountVal > 0 || voucherVal > 0) && (
              <div className="flex justify-between text-[10px] font-bold text-red-500">
                <span>تخفیف و بن:</span>
                <span>- {FORMAT_CURRENCY(discountVal + voucherVal)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1">
              <span className="font-black text-slate-700 text-sm">مبلغ نهایی:</span>
              <span className="text-xl md:text-2xl font-black text-orange-600 font-mono">{FORMAT_CURRENCY(total)}</span>
            </div>
          </div>
          <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-2xl font-black text-base md:text-lg hover:bg-slate-800 disabled:opacity-30 transition-all shadow-xl active:scale-[0.98]">
            تایید و صدور فاکتور
          </button>
        </div>
      </div>

      {/* CUSTOMER MODAL */}
      {showCustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 text-right">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
             <div className="p-5 md:p-6 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="font-black text-sm">{isEditingCust ? 'ویرایش اطلاعات مشتری' : 'ثبت مشتری جدید'}</h3>
                <button onClick={() => setShowCustModal(false)}><X size={18}/></button>
             </div>
             <div className="p-6 space-y-4">
                <div>
                   <label className="text-[10px] font-black text-slate-400 mb-1 block">نام و نام خانوادگی</label>
                   <input value={custForm.name} onChange={e => setCustForm({...custForm, name: e.target.value})} className="w-full border p-3 rounded-xl font-bold bg-slate-50 text-sm"/>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 mb-1 block">شماره موبایل</label>
                   <input value={custForm.phone} onChange={e => setCustForm({...custForm, phone: e.target.value})} className="w-full border p-3 rounded-xl font-mono font-bold bg-slate-50 text-left text-sm" dir="ltr"/>
                </div>
                <button onClick={handleSaveCustomer} className="w-full bg-orange-500 text-white py-4 rounded-xl font-black shadow-lg text-sm active:scale-95 transition-transform">ذخیره اطلاعات</button>
             </div>
          </div>
        </div>
      )}

      {/* Invoice Success Modal */}
      {showInvoice && lastSale && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[200] p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm flex flex-col shadow-2xl overflow-hidden text-right">
            <div className="p-8 text-center bg-slate-900 text-white">
              <CheckCircle2 size={50} className="mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-black">فاکتور ثبت شد</h2>
              <p className="text-slate-400 font-mono text-xs mt-1">شناسه: #{lastSale.id}</p>
            </div>
            <div className="p-6 space-y-3">
              <button onClick={generatePDF} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 text-sm">
                <Download size={20}/> دریافت فایل PDF
              </button>
              <button onClick={() => { setShowInvoice(false); setLastSale(null); }} className="w-full bg-slate-100 text-slate-900 py-3.5 rounded-2xl font-black text-sm">بستن و ادامه</button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Templates and Return search (Hidden parts) */}
      <div id="nanik-pdf-template" style={{ display: 'none', width: '130mm', padding: '10mm', background: 'white', color: 'black', fontFamily: 'Tahoma', direction: 'rtl', border: '1px solid black' }}>
        {lastSale && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ textAlign: 'center', marginBottom: '8mm' }}>
              <h1 style={{ fontSize: '22pt', margin: '0' }}>نانوایی نانیک</h1>
              <p style={{ fontSize: '10pt', margin: '3px 0' }}>فاکتور فروش سنتی</p>
              <div style={{ borderBottom: '1.5px solid black', marginTop: '3mm' }}></div>
            </div>
            <div style={{ fontSize: '10pt', marginBottom: '5mm', display: 'flex', justifyContent: 'space-between' }}>
               <span>فاکتور: #{lastSale.id}</span>
               <span>تاریخ: {FORMAT_DATE(lastSale.timestamp)}</span>
            </div>
            <p style={{ fontSize: '10pt' }}>مشتری: {lastSale.customerName}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '5mm', fontSize: '9pt' }}>
               <thead style={{ borderBottom: '1px solid black' }}>
                  <tr><th style={{ textAlign: 'right', padding: '2mm 0' }}>شرح</th><th style={{ textAlign: 'center' }}>تعداد</th><th style={{ textAlign: 'left' }}>مجموع</th></tr>
               </thead>
               <tbody>
                  {lastSale.items.map(i => (
                    <tr key={i.id} style={{ borderBottom: '0.5px solid #eee' }}>
                       <td style={{ padding: '3mm 0' }}>{i.name}</td>
                       <td style={{ textAlign: 'center' }}>{i.quantity}</td>
                       <td style={{ textAlign: 'left' }}>{FORMAT_CURRENCY(i.unitPrice * i.quantity).replace(' تومان', '')}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
            <div style={{ borderTop: '1.5px solid black', marginTop: '5mm', paddingTop: '3mm' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12pt', fontWeight: 'bold' }}>
                  <span>قابل پرداخت:</span>
                  <span>{FORMAT_CURRENCY(lastSale.totalAmount)}</span>
               </div>
               
               {/* درج اطلاعات بن تخفیف در فاکتور در صورت استفاده */}
               {lastSale.appliedVoucher && (
                 <div style={{ marginTop: '3mm', padding: '2mm', background: '#f5f5f5', border: '1px dashed #333', fontSize: '8pt' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '1mm' }}>اطلاعات بن هدیه استفاده شده:</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span>مبلغ بن: {FORMAT_CURRENCY(lastSale.appliedVoucher.amount)}</span>
                       <span>تاریخ انقضا: {FORMAT_DATE(lastSale.appliedVoucher.expiresAt).split(' ')[0]}</span>
                    </div>
                    <div>کد رهگیری بن: {lastSale.appliedVoucher.code}</div>
                 </div>
               )}

               {lastSale.discountAmount > 0 && !lastSale.appliedVoucher && <p style={{ fontSize: '8pt', textAlign: 'left' }}>تخفیف: {FORMAT_CURRENCY(lastSale.discountAmount)}</p>}
            </div>
            <p style={{ textAlign: 'center', marginTop: '10mm', fontSize: '8pt' }}>از انتخاب شما متشکریم - نانیک</p>
          </div>
        )}
      </div>

      {showReturnSearch && (
         <div className="fixed inset-0 bg-slate-900/90 z-[200] flex items-center justify-center p-4 no-print text-right">
            <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 md:p-8 shadow-2xl">
               <div className="flex justify-between mb-6 items-center">
                 <h3 className="font-black text-base">جستجوی فاکتور مرجوعی</h3>
                 <button onClick={() => setShowReturnSearch(false)} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
               </div>
               <div className="flex flex-col md:flex-row gap-2">
                 <input value={returnInvoiceId} onChange={e => setReturnInvoiceId(e.target.value)} placeholder="شماره فاکتور..." className="flex-1 bg-slate-50 p-4 rounded-xl font-bold border-2 focus:border-red-500 outline-none text-sm"/>
                 <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-sm active:scale-95 transition-transform">جستجو</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default POS;
