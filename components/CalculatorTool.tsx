
import React, { useState } from 'react';
import { Calculator as CalcIcon, Delete, RefreshCcw } from 'lucide-react';
import { FORMAT_CURRENCY } from '../constants';

const CalculatorTool: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullEq = equation + display;
      // Note: In a production app, use a proper math parser. eval is used here for simplicity within the constraints.
      const result = eval(fullEq.replace('×', '*').replace('÷', '/'));
      setDisplay(String(result));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const buttons = [
    { label: 'C', action: clear, color: 'text-red-500' },
    { label: '÷', action: () => handleOperator('÷'), color: 'text-orange-500' },
    { label: '×', action: () => handleOperator('×'), color: 'text-orange-500' },
    { label: 'DEL', action: () => setDisplay(p => p.length > 1 ? p.slice(0, -1) : '0'), color: 'text-slate-400' },
    { label: '7', action: () => handleNumber('7') },
    { label: '8', action: () => handleNumber('8') },
    { label: '9', action: () => handleNumber('9') },
    { label: '-', action: () => handleOperator('-'), color: 'text-orange-500' },
    { label: '4', action: () => handleNumber('4') },
    { label: '5', action: () => handleNumber('5') },
    { label: '6', action: () => handleNumber('6') },
    { label: '+', action: () => handleOperator('+'), color: 'text-orange-500' },
    { label: '1', action: () => handleNumber('1') },
    { label: '2', action: () => handleNumber('2') },
    { label: '3', action: () => handleNumber('3') },
    { label: '=', action: calculate, color: 'bg-orange-500 text-white rounded-2xl row-span-2' },
    { label: '0', action: () => handleNumber('0'), color: 'col-span-2' },
    { label: '.', action: () => handleNumber('.') },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-right" dir="ltr">
      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-slate-50">
        <div className="bg-slate-900 p-8 text-white flex flex-col items-end justify-center min-h-[160px]">
          <div className="text-slate-500 text-sm font-mono h-6 mb-1">{equation}</div>
          <div className="text-4xl font-black font-mono truncate w-full text-right">{display}</div>
          <div className="text-[10px] text-orange-400 mt-2 font-bold tracking-widest uppercase">Bakery Calculator</div>
        </div>

        <div className="p-6 grid grid-cols-4 gap-3">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              className={`h-16 flex items-center justify-center font-black text-xl transition-all active:scale-90 rounded-xl hover:bg-slate-50 ${btn.color || 'text-slate-800'} ${btn.label === '=' ? 'h-full' : ''} ${btn.label === '0' ? 'col-span-2' : ''}`}
            >
              {btn.label === 'DEL' ? <Delete size={20}/> : btn.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-8 flex gap-4 text-slate-400 no-print">
         <div className="bg-white px-6 py-3 rounded-2xl border flex items-center gap-2">
            <span className="text-xs font-bold">معادل به تومان:</span>
            <span className="font-black text-slate-800">{FORMAT_CURRENCY(parseFloat(display) || 0)}</span>
         </div>
      </div>
    </div>
  );
};

export default CalculatorTool;
