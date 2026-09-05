import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Database, ShoppingBag, Receipt, CreditCard, BookOpen, Layers, BarChart3, ChevronRight } from 'lucide-react';

export const WorkflowBanner = ({ activeStep = 'dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    { num: '01', id: 'master', label: 'Master Data', desc: 'Contacts & Products', icon: Database, path: '/contacts', color: 'purple' },
    { num: '02', id: 'transactions', label: 'Sales & Purchase', desc: 'Orders & Procurement', icon: ShoppingBag, path: '/sales/orders', color: 'blue' },
    { num: '03', id: 'billing', label: 'Billing', desc: 'Invoices & Bills', icon: Receipt, path: '/sales/invoices', color: 'green' },
    { num: '04', id: 'payment', label: 'Payment', desc: 'Receivables & Payables', icon: CreditCard, path: '/sales/payments', color: 'amber' },
    { num: '05', id: 'entries', label: 'Accounting', desc: 'Journal Entries', icon: BookOpen, path: '/accounting/journal-entries', color: 'purple' },
    { num: '06', id: 'ledger', label: 'Ledger', desc: 'General Ledger', icon: Layers, path: '/accounting/ledger', color: 'teal' },
    { num: '07', id: 'reports', label: 'Reports', desc: 'Financial Statements', icon: BarChart3, path: '/reports/profit-loss', color: 'rose' },
  ];

  const colorStyles = {
    purple: { bg: 'bg-purple-500/20 text-purple-300 border-purple-400/30', activeIcon: 'text-purple-600' },
    blue: { bg: 'bg-blue-500/20 text-blue-300 border-blue-400/30', activeIcon: 'text-blue-600' },
    green: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30', activeIcon: 'text-emerald-600' },
    amber: { bg: 'bg-amber-500/20 text-amber-300 border-amber-400/30', activeIcon: 'text-amber-600' },
    teal: { bg: 'bg-teal-500/20 text-teal-300 border-teal-400/30', activeIcon: 'text-teal-600' },
    rose: { bg: 'bg-rose-500/20 text-rose-300 border-rose-400/30', activeIcon: 'text-rose-600' },
  };

  return (
    <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white rounded-2xl p-5 mb-6 shadow-md border border-purple-800/40 min-w-0">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-purple-800/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border border-teal-400/30 tracking-wider">
              Odoo Architecture
            </span>
            <h2 className="text-xs font-bold text-white tracking-wide uppercase">Integrated Business Workflow</h2>
          </div>
          <p className="text-[11px] text-purple-200/80 mt-0.5">
            Urban Furniture end-to-end accounting flow from Master Data to Financial Reports
          </p>
        </div>
        <span className="text-[11px] text-purple-300/80 font-medium hidden md:inline shrink-0">
          Click stage to navigate →
        </span>
      </div>

      {/* Process Flow Steps Container - Horizontally scrollable inside its own container without causing page overflow */}
      <div className="overflow-x-auto pb-1 scrollbar-thin">
        <div className="flex items-center gap-2 min-w-max">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = location.pathname.startsWith(s.path.split('/')[1]);
            const theme = colorStyles[s.color] || colorStyles.purple;

            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => navigate(s.path)}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all text-left border ${
                    isActive
                      ? 'bg-white text-slate-950 font-bold border-teal-400 shadow-lg ring-2 ring-teal-400/40'
                      : 'bg-purple-950/50 text-purple-100 border-purple-800/40 hover:bg-purple-800/60 hover:border-purple-600'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 border ${
                    isActive ? 'bg-slate-900 text-teal-300 border-slate-700' : theme.bg
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold ${isActive ? 'text-teal-600' : 'text-teal-400'}`}>
                        {s.num}
                      </span>
                      <span className="text-xs font-bold truncate">{s.label}</span>
                    </div>
                    <span className={`text-[10px] block mt-0.5 truncate ${isActive ? 'text-slate-600 font-medium' : 'text-purple-300/70'}`}>
                      {s.desc}
                    </span>
                  </div>
                </button>

                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-purple-500/60 shrink-0 mx-0.5" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
