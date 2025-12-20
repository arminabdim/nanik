
import React, { useState } from 'react';
import { Lock, ChevronLeft, User } from 'lucide-react';

interface AuthOverlayProps {
  onAuthorized: () => void;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onAuthorized }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // بررسی نام کاربری و رمز عبور ثابت طبق درخواست
    if (username === 'nanik' && password === '1234') {
      onAuthorized();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[100] p-4 font-['Vazirmatn'] text-right" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="bg-orange-500 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_20px_50px_rgba(249,115,22,0.3)]">
            <Lock size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">مدیریت نانوایی نانیک</h1>
          <p className="text-slate-500 text-sm">لطفاً برای ورود به سیستم هویت خود را تایید کنید</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User size={18} className="absolute right-4 top-5 text-slate-500" />
            <input 
              type="text"
              placeholder="نام کاربری (nanik)"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl pr-12 pl-6 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold"
            />
          </div>
          
          <div className="relative">
            <Lock size={18} className="absolute right-4 top-5 text-slate-500" />
            <input 
              type="password"
              placeholder="رمز عبور (1234)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl pr-12 pl-6 py-4 text-white focus:outline-none focus:border-orange-500 transition-all font-bold font-mono tracking-widest"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs font-bold text-center animate-shake">
              اطلاعات ورود اشتباه است
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
          >
            ورود به سیستم مدیریت
            <ChevronLeft size={24} />
          </button>
        </form>
        
        <p className="text-center text-[10px] text-slate-600 mt-10 font-bold uppercase tracking-widest">Nanik Bakery Management v3.5</p>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default AuthOverlay;
