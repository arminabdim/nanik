
import React, { useState } from 'react';
import { Product } from '../types';
import { FORMAT_CURRENCY } from '../constants';
import { Tag, Download, Barcode as BarcodeIcon } from 'lucide-react';

interface LabelsProps {
  products: Product[];
}

const Labels: React.FC<LabelsProps> = ({ products }) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [customText, setCustomText] = useState('پخت سنتی نانیک');

  const product = products.find(p => p.id === selectedProductId);

  const generateLabelPDF = () => {
    const element = document.getElementById('nanik-label-pdf-template');
    if (!element) return;
    element.style.display = 'flex';
    const opt = {
      margin: 0,
      filename: `Label_${product?.name}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 4 },
      jsPDF: { unit: 'mm', format: 'a6', orientation: 'portrait' }
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save().then(() => element.style.display = 'none');
  };

  return (
    <div className="space-y-8 text-right pb-10">
      <div className="no-print">
        <h2 className="text-3xl font-black text-slate-800">اتیکت قیمت</h2>
        <p className="text-slate-500 font-bold">طراحی فشرده و شیک برای قفسه‌ها</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 no-print">
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl space-y-6 h-fit">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="bg-orange-500 p-2.5 rounded-2xl text-white"><Tag size={20}/></div>
            <h3 className="text-xl font-black">تنظیمات اتیکت</h3>
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 mb-2 block">انتخاب کالا</label>
            <select value={selectedProductId || ''} onChange={e => setSelectedProductId(e.target.value)} className="w-full border-2 p-4 rounded-xl font-black cursor-pointer bg-slate-50">
              <option value="">-- انتخاب کنید --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 mb-2 block">متن تبلیغاتی (کوتاه)</label>
            <input value={customText} maxLength={20} onChange={e => setCustomText(e.target.value)} className="w-full border-2 p-4 rounded-xl font-bold bg-slate-50"/>
          </div>
          <button disabled={!selectedProductId} onClick={generateLabelPDF} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all">
            <Download size={22} /> دریافت فایل PDF اتیکت
          </button>
        </div>

        {/* Live Preview */}
        <div className="flex flex-col items-center">
          <p className="text-[10px] font-black text-slate-300 mb-4 uppercase tracking-widest">پیش‌نمایش چاپ A6</p>
          <div className="w-[280px] h-[400px] bg-white border-8 border-black rounded-[2rem] p-8 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl">
             <div className="w-full border-b-2 border-black pb-4">
               <h4 className="text-2xl font-black text-black leading-tight break-words">{product ? product.name : 'نام کالا'}</h4>
               <p className="text-black font-bold text-xs mt-1">{customText}</p>
             </div>
             <div className="flex-1 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-black uppercase mb-1">قیمت واحد (تومان)</span>
                <span className="text-5xl font-black text-black font-mono leading-none tracking-tighter">
                  {product ? FORMAT_CURRENCY(product.unitPrice).replace(' تومان', '') : '۰'}
                </span>
             </div>
             <div className="w-full pt-4 border-t-2 border-black flex flex-col items-center gap-1">
                <div className="flex h-10 gap-0.5 items-end mb-1">
                   {[...Array(20)].map((_, i) => (
                      <div key={i} className="bg-black" style={{ width: i%4===0 ? '3px' : '1px', height: '100%' }}></div>
                   ))}
                </div>
                <p className="text-xs font-black font-mono">{product ? product.barcode : '0000'}</p>
             </div>
          </div>
        </div>
      </div>

      {/* COMPACT PDF TEMPLATE */}
      <div id="nanik-label-pdf-template" style={{ display: 'none', width: '105mm', height: '148mm', background: 'white', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '12mm', textAlign: 'center', border: '3mm solid black', boxSizing: 'border-box', direction: 'rtl', fontFamily: 'Tahoma' }}>
        {product && (
          <>
            <div style={{ width: '100%', borderBottom: '1.5mm solid black', paddingBottom: '4mm' }}>
              <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>نانوایی سنتی نانیک</div>
              <div style={{ fontSize: '30pt', fontWeight: 'bold', margin: '3mm 0' }}>{product.name}</div>
              <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>{customText}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '4mm' }}>قیمت واحد (تومان)</div>
              <div style={{ fontSize: '60pt', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '-2px' }}>
                {FORMAT_CURRENCY(product.unitPrice).replace(' تومان', '')}
              </div>
            </div>
            <div style={{ borderTop: '1.5mm solid black', width: '100%', paddingTop: '5mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', height: '12mm', alignItems: 'center', marginBottom: '2mm' }}>
                 {[...Array(15)].map((_, i) => (
                    <div key={i} style={{ width: i % 3 === 0 ? '1.5mm' : '0.6mm', height: '100%', background: 'black', marginLeft: '1mm' }}></div>
                 ))}
              </div>
              <div style={{ fontSize: '14pt', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '4px' }}>{product.barcode}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Labels;
