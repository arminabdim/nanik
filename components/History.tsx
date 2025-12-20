
import React, { useState, useMemo } from 'react';
import { Sale } from '../types';
import { FORMAT_CURRENCY, FORMAT_DATE } from '../constants';
import { ShoppingBag, Search, Eye, Printer, X, User, Ban, Download, FileSpreadsheet, Calendar } from 'lucide-react';

interface HistoryProps {
  sales: Sale[];
  onReturn: (sale: Sale) => void;
  shopInfo: { name: string; address?: string; phone?: string; };
}

const History: React.FC<HistoryProps> = ({ sales, onReturn, shopInfo }) => {
  const [search, setSearch] = useState('');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) || 
    (s.customerName && s.customerName.includes(search))
  );

  const rangeFilteredSales = useMemo(() => {
    return sales.filter(s => {
      const d = s.timestamp.split('T')[0];
      return d >= startDate && d <= endDate;
    });
  }, [sales, startDate, endDate]);

  const generatePDFForHistoricalSale = () => {
    if (!viewingSale) return;
    const element = document.getElementById('history-pdf-template');
    if (!element) return;
    element.style.display = 'block';
    const opt = {
      margin: 10,
      filename: `Nanik_Invoice_${viewingSale.id}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save().then(() => element.style.display = 'none');
  };

  const exportReportRange = () => {
    if (rangeFilteredSales.length === 0) return alert('تراکنشی در این بازه یافت نشد');
    const element = document.getElementById('comprehensive-report-template');
    if (!element) return;
    element.style.display = 'block';
    const opt = {
      margin: 5,
      filename: `Nanik_Report_${startDate}_to_${endDate}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save().then(() => element.style.display = 'none');
  };

  return (
    <div className="space-y-6 text-right pb-10">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">تاریخچه تراکنش‌ها</h2>
          <p className="text-slate-500 font-bold text-sm">مدیریت کامل فاکتورها</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-3xl border shadow-sm w-full xl:w-auto">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] font-black text-slate-400">از:</span>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-slate-50 border p-2 rounded-xl text-[10px] font-bold outline-none flex-1"/>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] font-black text-slate-400">تا:</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-slate-50 border p-2 rounded-xl text-[10px] font-bold outline-none flex-1"/>
            </div>
          </div>
          <button onClick={exportReportRange} className="w-full sm:w-auto bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <FileSpreadsheet size={16}/> گزارش جامع (PDF)
          </button>
        </div>

        <div className="relative w-full xl:w-96">
          <input
            type="text"
            placeholder="جستجوی فاکتور یا مشتری..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] pr-12 pl-6 py-3.5 md:py-4 outline-none font-bold text-sm"
          />
          <Search className="absolute right-4 top-[15px] md:top-[18px] text-slate-300" size={20} />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border shadow-xl overflow-hidden no-print">
        {filteredSales.length === 0 ? (
          <div className="p-16 md:p-20 text-center text-slate-300">
            {/* Fix: Removed invalid 'md:size' prop from ShoppingBag component to resolve TypeScript error */}
            <ShoppingBag size={80} strokeWidth={1} className="mx-auto mb-4 opacity-10" />
            <p className="text-lg md:text-xl font-black">تراکنشی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[700px]">
              <thead className="bg-slate-50 border-b-2">
                <tr className="text-xs font-black text-slate-500">
                  <th className="px-6 py-5">شناسه</th>
                  <th className="px-6 py-5">مشتری</th>
                  <th className="px-6 py-5">تاریخ</th>
                  <th className="px-6 py-5">مبلغ نهایی</th>
                  <th className="px-6 py-5">وضعیت</th>
                  <th className="px-6 py-5 text-center">جزئیات</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50 font-bold text-sm">
                {filteredSales.map(sale => (
                  <tr key={sale.id} className={`hover:bg-slate-50 transition-colors ${sale.isReturned ? 'bg-red-50/40' : ''}`}>
                    <td className="px-6 py-5 font-mono text-slate-400">#{sale.id}</td>
                    <td className="px-6 py-5 text-slate-800">{sale.customerName}</td>
                    <td className="px-6 py-5 text-slate-500 text-xs">{FORMAT_DATE(sale.timestamp)}</td>
                    <td className="px-6 py-5 font-black text-slate-900">{FORMAT_CURRENCY(sale.totalAmount)}</td>
                    <td className="px-6 py-5">
                      {sale.isReturned ? (
                        <div className="text-red-500 bg-red-100 px-3 py-1 rounded-full text-[10px] w-fit font-black">مرجوعی</div>
                      ) : (
                        <div className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-[10px] w-fit font-black">موفق</div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button onClick={() => setViewingSale(sale)} className="p-2.5 text-slate-300 hover:text-blue-500 transition-all bg-slate-50 rounded-xl"><Eye size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COMPREHENSIVE REPORT TEMPLATE (HIDDEN) */}
      <div id="comprehensive-report-template" style={{ display: 'none', padding: '10mm', background: 'white', color: 'black', direction: 'rtl', fontFamily: 'Tahoma' }}>
         <div style={{ textAlign: 'center', marginBottom: '10mm' }}>
            <h1 style={{ fontSize: '20pt', margin: '0' }}>گزارش جامع تراکنش‌های {shopInfo.name}</h1>
            <p style={{ fontSize: '11pt' }}>بازه زمانی: {startDate} الی {endDate}</p>
         </div>
         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
            <thead>
               <tr style={{ background: '#f0f0f0', borderBottom: '2px solid black' }}>
                  <th style={{ padding: '3mm', border: '1px solid #ccc' }}>#</th>
                  <th style={{ padding: '3mm', border: '1px solid #ccc' }}>فاکتور</th>
                  <th style={{ padding: '3mm', border: '1px solid #ccc' }}>مشتری</th>
                  <th style={{ padding: '3mm', border: '1px solid #ccc' }}>زمان</th>
                  <th style={{ padding: '3mm', border: '1px solid #ccc' }}>وضعیت</th>
                  <th style={{ padding: '3mm', border: '1px solid #ccc' }}>مبلغ</th>
               </tr>
            </thead>
            <tbody>
               {rangeFilteredSales.map((s, idx) => (
                  <tr key={s.id}>
                     <td style={{ padding: '2mm', border: '1px solid #ccc', textAlign: 'center' }}>{idx + 1}</td>
                     <td style={{ padding: '2mm', border: '1px solid #ccc', textAlign: 'center' }}>{s.id}</td>
                     <td style={{ padding: '2mm', border: '1px solid #ccc' }}>{s.customerName}</td>
                     <td style={{ padding: '2mm', border: '1px solid #ccc', fontSize: '8pt' }}>{FORMAT_DATE(s.timestamp)}</td>
                     <td style={{ padding: '2mm', border: '1px solid #ccc', color: s.isReturned ? 'red' : 'green' }}>{s.isReturned ? 'مرجوعی' : 'موفق'}</td>
                     <td style={{ padding: '2mm', border: '1px solid #ccc', textAlign: 'left' }}>{FORMAT_CURRENCY(s.totalAmount).replace(' تومان', '')}</td>
                  </tr>
               ))}
            </tbody>
         </table>
         <div style={{ marginTop: '10mm', borderTop: '2px solid black', paddingTop: '5mm', textAlign: 'left' }}>
            <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>
               جمع کل: {FORMAT_CURRENCY(rangeFilteredSales.reduce((a, b) => a + (b.isReturned ? 0 : b.totalAmount), 0))}
            </div>
         </div>
      </div>

      {viewingSale && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 no-print text-right">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] w-full max-w-lg shadow-2xl flex flex-col h-[85vh] md:h-auto md:max-h-[90vh] overflow-hidden">
            <div className="p-5 md:p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-lg md:text-xl font-black">نمایش فاکتور #{viewingSale.id}</h3>
              <button onClick={() => setViewingSale(null)} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X size={20}/></button>
            </div>
            
            <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-white">
              <div className="text-center border-b-2 border-dashed pb-6">
                <h4 className="text-2xl md:text-3xl font-black text-slate-800">{shopInfo.name}</h4>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">{FORMAT_DATE(viewingSale.timestamp)}</p>
              </div>
              
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-2">
                <div className="flex justify-between font-black text-sm"><span>مشتری:</span><span>{viewingSale.customerName}</span></div>
                {viewingSale.isReturned && (
                  <div className="flex items-center gap-2 text-red-500 text-[10px] font-black">
                    <Ban size={14}/> <span>مرجوع شده</span>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm min-w-[300px]">
                  <thead>
                    <tr className="text-slate-400 border-b-2 border-slate-50 text-[10px] uppercase font-black">
                      <th className="pb-3 text-right">شرح</th>
                      <th className="pb-3 text-center">تعداد</th>
                      <th className="pb-3 text-left">مجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {viewingSale.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-4 font-black text-slate-800">
                          {item.name}
                          {item.returnedQuantity ? <span className="text-red-500 block text-[9px] mt-1 font-bold">(مرجوع)</span> : null}
                        </td>
                        <td className="py-4 text-center text-slate-500 font-bold">x{item.quantity}</td>
                        <td className="py-4 text-left font-mono font-black text-slate-900">{FORMAT_CURRENCY(item.unitPrice * (item.quantity - (item.returnedQuantity || 0))).replace(' تومان', '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-6 border-t-2 border-dashed border-slate-200 flex justify-between text-xl md:text-2xl font-black">
                <span>مبلغ نهایی:</span>
                <span className="text-orange-600">{FORMAT_CURRENCY(viewingSale.totalAmount)}</span>
              </div>
            </div>

            <div className="p-5 md:p-6 bg-slate-50 border-t flex gap-4">
              <button onClick={generatePDFForHistoricalSale} className="flex-1 bg-slate-900 text-white py-4 md:py-5 rounded-[2rem] font-black flex items-center justify-center gap-2 shadow-xl hover:bg-slate-800 transition-all text-sm active:scale-95">
                <Download size={20} /> دریافت فایل PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL PDF TEMPLATE (HIDDEN) */}
      <div id="history-pdf-template" style={{ display: 'none', width: '130mm', padding: '10mm', background: 'white', color: 'black', fontFamily: 'Tahoma', direction: 'rtl', border: '1px solid black' }}>
        {viewingSale && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ textAlign: 'center', marginBottom: '8mm' }}>
              <h1 style={{ fontSize: '24pt', margin: '0', fontWeight: 'bold' }}>نانوایی نانیک</h1>
              <div style={{ borderBottom: '1px solid black', marginTop: '3mm' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', marginBottom: '5mm' }}>
              <span>فاکتور: #{viewingSale.id}</span>
              <span>تاریخ: {FORMAT_DATE(viewingSale.timestamp)}</span>
            </div>
            <p style={{ fontSize: '10pt' }}>مشتری: {viewingSale.customerName}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6mm', fontSize: '10pt' }}>
              <thead><tr style={{ borderBottom: '1.5px solid black' }}><th style={{ textAlign: 'right', padding: '2mm 0' }}>شرح کالا</th><th style={{ textAlign: 'center' }}>تعداد</th><th style={{ textAlign: 'left' }}>مجموع</th></tr></thead>
              <tbody>
                {viewingSale.items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '0.5px solid #ccc' }}>
                    <td style={{ padding: '3mm 0' }}>{item.name}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'left' }}>{FORMAT_CURRENCY(item.unitPrice * item.quantity).replace(' تومان', '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ borderTop: '1.5px solid black', paddingTop: '3mm', fontSize: '14pt', fontWeight: 'bold', textAlign: 'left' }}>
               قابل پرداخت: {FORMAT_CURRENCY(viewingSale.totalAmount)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
