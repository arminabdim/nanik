
import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_DISCOUNTS, GET_JALALI_NOW, GET_TIME_NOW } from './constants';
import { Product, Sale, Expense, Discount, AppSettings, Customer, Voucher } from './types';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Expenses from './components/Expenses';
import Accounting from './components/Accounting';
import Discounts from './components/Discounts';
import Settings from './components/Settings';
import Customers from './components/Customers';
import Reports from './components/Reports';
import Labels from './components/Labels';
import CalculatorTool from './components/CalculatorTool';
import ProductionCalculator from './components/ProductionCalculator';
import AuthOverlay from './components/AuthOverlay';
import { 
  LayoutDashboard, ShoppingCart, Package, 
  Receipt, Wallet, Settings as SettingsIcon, 
  Percent, Calculator, Lock, Users, BarChart3, Tag, Clock, Scale
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'dashboard' | 'history' | 'expenses' | 'accounting' | 'discounts' | 'settings' | 'customers' | 'reports' | 'labels' | 'calculator' | 'prod_calc'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTime, setCurrentTime] = useState(GET_TIME_NOW());
  const [currentDate, setCurrentDate] = useState(GET_JALALI_NOW());

  // دیتابیس نانیک: لود اولیه از حافظه لوکال (شبیه‌ساز فایل دیتابیس همراه برنامه)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nanik_db_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('nanik_db_sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('nanik_db_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [discounts, setDiscounts] = useState<Discount[]>(() => {
    const saved = localStorage.getItem('nanik_db_discounts');
    return saved ? JSON.parse(saved) : INITIAL_DISCOUNTS;
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('nanik_db_customers');
    return saved ? JSON.parse(saved) : [];
  });
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('nanik_db_settings');
    return saved ? JSON.parse(saved) : { 
      shopName: 'نانوایی نانیک', 
      isPasswordEnabled: true,
      voucherThreshold: 1000000,
      voucherAmount: 50000,
      voucherValidityDays: 30
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(GET_TIME_NOW());
      setCurrentDate(GET_JALALI_NOW());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // مکانیسم همگام‌سازی خودکار دیتابیس (ذخیره آنی در هر تغییر)
  useEffect(() => {
    localStorage.setItem('nanik_db_products', JSON.stringify(products));
    localStorage.setItem('nanik_db_sales', JSON.stringify(sales));
    localStorage.setItem('nanik_db_expenses', JSON.stringify(expenses));
    localStorage.setItem('nanik_db_discounts', JSON.stringify(discounts));
    localStorage.setItem('nanik_db_customers', JSON.stringify(customers));
    localStorage.setItem('nanik_db_settings', JSON.stringify(settings));
    console.log("Nanik Database Auto-Synced.");
  }, [products, sales, expenses, discounts, customers, settings]);

  const handleSale = (newSale: Sale) => {
    setSales(prev => [newSale, ...prev]);
    if (newSale.customerId) {
      updateCustomerPurchases(newSale.customerId, newSale.totalAmount);
    }
  };

  const updateCustomerPurchases = (cid: string, amountChange: number) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === cid) {
        const newTotal = c.totalPurchases + amountChange;
        const updatedVouchers = [...c.vouchers];
        const milestoneCount = Math.floor(newTotal / settings.voucherThreshold);
        const currentVoucherCount = c.vouchers.length;
        
        if (milestoneCount > currentVoucherCount) {
          for(let i = 0; i < (milestoneCount - currentVoucherCount); i++) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + settings.voucherValidityDays);
            updatedVouchers.push({
              code: `BON-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
              amount: settings.voucherAmount,
              isUsed: false,
              issuedAt: new Date().toISOString(),
              expiresAt: expiryDate.toISOString()
            });
          }
        }
        return { ...c, totalPurchases: newTotal, vouchers: updatedVouchers };
      }
      return c;
    }));
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const updateSale = (updatedSale: Sale) => {
    const oldSale = sales.find(s => s.id === updatedSale.id);
    if (oldSale && oldSale.customerId) {
       const diff = updatedSale.totalAmount - oldSale.totalAmount;
       if (diff !== 0) updateCustomerPurchases(oldSale.customerId, diff);
    }
    setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
  };

  const navItems = [
    { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard size={20} /> },
    { id: 'pos', label: 'صندوق فروش', icon: <ShoppingCart size={20} /> },
    { id: 'inventory', label: 'انبار کالا', icon: <Package size={20} /> },
    { id: 'prod_calc', label: 'آنالیز قیمت پخت', icon: <Scale size={20} /> },
    { id: 'labels', label: 'اتیکت قیمت', icon: <Tag size={20} /> },
    { id: 'discounts', label: 'تخفیفات', icon: <Percent size={20} /> },
    { id: 'customers', label: 'مشتریان', icon: <Users size={20} /> },
    { id: 'accounting', label: 'حسابداری', icon: <Calculator size={20} /> },
    { id: 'expenses', label: 'هزینه‌ها', icon: <Wallet size={20} /> },
    { id: 'history', label: 'فاکتورها', icon: <Receipt size={20} /> },
    { id: 'settings', label: 'تنظیمات', icon: <SettingsIcon size={20} /> },
  ];

  // لایه امنیتی ورود نانیک
  if (!isAuthenticated) {
    return <AuthOverlay onAuthorized={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-right font-['Vazirmatn']" dir="rtl">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white p-6 no-print overflow-y-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-orange-500 p-2.5 rounded-2xl shadow-lg">
            <Package size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-black">{settings.shopName}</h1>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-orange-500 text-white shadow-xl' : 'hover:bg-slate-800 text-slate-400'}`}>
              {item.icon} <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b p-4 md:p-6 flex justify-between items-center no-print shadow-sm z-30">
          <h2 className="text-lg md:text-xl font-black text-slate-800 lg:hidden">{settings.shopName}</h2>
          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border">
              <Clock size={16} className="text-orange-500" />
              <span className="text-sm font-mono font-bold">{currentTime}</span>
              <span className="hidden md:block text-[10px] text-slate-400 mr-2 border-r pr-2">{currentDate}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 lg:pb-8">
          {activeTab === 'dashboard' && <Dashboard sales={sales} expenses={expenses} products={products} />}
          {activeTab === 'pos' && <POS products={products} discounts={discounts} customers={customers} onSale={handleSale} onAddCustomer={(c) => setCustomers(p => [...p, c])} onUpdateCustomer={handleUpdateCustomer} voucherThreshold={settings.voucherThreshold} voucherAmount={settings.voucherAmount} salesHistory={sales} onUpdateSale={updateSale} />}
          {activeTab === 'inventory' && <Inventory products={products} onUpdate={(prod) => setProducts(prev => prev.map(x => x.id === prod.id ? prod : x))} onAdd={(newProd) => setProducts(prev => [...prev, newProd])} onDelete={(id) => setProducts(prev => prev.filter(x => x.id !== id))} />}
          {activeTab === 'prod_calc' && <ProductionCalculator />}
          {activeTab === 'labels' && <Labels products={products} />}
          {activeTab === 'discounts' && <Discounts discounts={discounts} setDiscounts={setDiscounts} />}
          {activeTab === 'calculator' && <CalculatorTool />}
          {activeTab === 'customers' && <Customers customers={customers} onUpdate={handleUpdateCustomer} onDelete={(id) => setCustomers(p => p.filter(x => x.id !== id))} />}
          {activeTab === 'expenses' && <Expenses expenses={expenses} onAdd={(e) => setExpenses(prev => [e, ...prev])} />}
          {activeTab === 'accounting' && <Accounting sales={sales} expenses={expenses} />}
          {activeTab === 'history' && <History sales={sales} onReturn={updateSale} shopInfo={{ name: settings.shopName, address: settings.shopAddress, phone: settings.shopPhone }} />}
          {activeTab === 'settings' && <Settings settings={settings} onUpdate={setSettings} products={products} sales={sales} expenses={expenses} customers={customers} discounts={discounts} onImport={(d) => { setProducts(d.products); setSales(d.sales); setExpenses(d.expenses); setCustomers(d.customers); setDiscounts(d.discounts); setSettings(d.settings); }} />}
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t p-2 no-print shadow-[0_-8px_30px_rgb(0,0,0,0.12)] z-50 overflow-x-auto custom-scrollbar-hide">
          <div className="flex items-center gap-1 min-w-max px-2">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id as any)} 
                className={`flex flex-col items-center gap-1.5 p-3 min-w-[76px] rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'text-orange-600 bg-orange-50/50 scale-105' : 'text-slate-400'}`}
              >
                <div className={`${activeTab === item.id ? 'text-orange-600' : 'text-slate-400'}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-black whitespace-nowrap ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </main>

      <style>{`
        .custom-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
