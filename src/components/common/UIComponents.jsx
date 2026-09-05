import React from 'react';
import { 
  X, Check, AlertTriangle, Info, ChevronLeft, ChevronRight, 
  Search, SlidersHorizontal, ArrowUpDown, Calendar
} from 'lucide-react';

export const Button = ({ children, variant = 'primary', size = 'md', className = '', icon: Icon, ...props }) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-purple-900 hover:bg-purple-800 text-white focus:ring-purple-700 shadow-xs',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-purple-500 shadow-xs',
    teal: 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 shadow-xs',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-xs',
    outline: 'bg-transparent border border-slate-300 hover:bg-slate-100 text-slate-700',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2',
    lg: 'text-sm px-4.5 py-2.5 gap-2.5',
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', title, subtitle, headerAction }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden min-w-0 ${className}`}>
    {(title || subtitle || headerAction) && (
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="min-w-0">
          {title && <h3 className="font-bold text-slate-900 text-sm tracking-tight truncate">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${maxWidth} transform transition-all overflow-hidden`}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const styles = {
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant] || styles.gray} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    Active: 'green',
    Draft: 'gray',
    Quotation: 'blue',
    Confirmed: 'amber',
    Delivered: 'blue',
    Invoiced: 'purple',
    Billed: 'purple',
    Posted: 'teal',
    Paid: 'green',
    Partial: 'amber',
    'Partially Paid': 'amber',
    Overdue: 'rose',
    Cancelled: 'rose',
    'In Progress': 'blue',
  };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
};

export const Input = ({ label, error, required, icon: Icon, className = '', ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        className={`w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-purple-600 focus:border-purple-600 disabled:bg-slate-100 ${
          Icon ? 'pl-9' : ''
        } ${error ? 'border-rose-500 focus:ring-rose-500' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);

export const Select = ({ label, options = [], error, required, className = '', ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
    )}
    <select
      className={`w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-purple-600 focus:border-purple-600 ${
        error ? 'border-rose-500' : ''
      } ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
  </div>
);

export const Avatar = ({ name, src, size = 'md' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-xs', lg: 'w-11 h-11 text-sm' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'UF';
  
  return src ? (
    <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover border border-slate-200 shrink-0`} />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center border border-purple-200 shrink-0`}>
      {initials}
    </div>
  );
};

export const PageHeader = ({ title, subtitle, breadcrumbs = [], actions }) => (
  <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="min-w-0">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 flex-wrap">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumbs.length - 1 ? 'font-semibold text-slate-900' : 'hover:text-slate-700'}>
                {b}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">{title}</h1>
      {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
  </div>
);

// REFINED FINANCIAL KPI STATCARD WITH EMBEDDED MINI SPARKLINE CHART
export const StatCard = ({ title, value, change, isPositive, comparisonText = 'vs last month', icon: Icon, color = 'purple', sparklineData = [30, 45, 35, 60, 50, 75] }) => {
  const iconBg = {
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    blue: 'bg-blue-50 text-blue-100 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  const sparkColor = {
    purple: '#714b67',
    teal: '#00a09d',
    blue: '#2563eb',
    amber: '#d97706',
    rose: '#e11d48',
    emerald: '#059669',
  };

  // Convert sparkline numbers to SVG polygon points
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * 100;
    const y = 30 - ((val - min) / (max - min || 1)) * 24;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs transition-all hover:shadow-md hover:border-slate-300 min-w-0 flex flex-col justify-between group">
      {/* Top: Category Title + Subtle Icon Container */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${iconBg[color] || iconBg.purple} shrink-0 transition-transform group-hover:scale-105`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Middle: Dominant Financial Value */}
      <div className="my-1 min-w-0">
        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight block truncate font-sans">
          {value}
        </span>
      </div>

      {/* Bottom: Trend Badge, Context & Mini Sparkline Chart */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-end justify-between gap-2 min-w-0">
        <div className="min-w-0 flex flex-col">
          {change ? (
            <span className={`inline-flex items-center text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
              isPositive === true
                ? 'bg-emerald-50 text-emerald-700'
                : isPositive === false
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {isPositive === true ? '↑ ' : isPositive === false ? '↓ ' : ''}{change}
            </span>
          ) : null}
          <span className="text-slate-400 text-[10px] truncate mt-0.5">{comparisonText}</span>
        </div>

        {/* Embedded SVG Mini Sparkline */}
        <div className="w-16 h-8 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 32">
            <polyline
              fill="none"
              stroke={sparkColor[color] || '#714b67'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const Table = ({ columns = [], data = [], onRowClick, emptyMessage = 'No records found.' }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
    <table className="w-full text-left text-xs">
      <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className={`px-4 py-3 whitespace-nowrap ${col.className || ''}`}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, rIdx) => (
            <tr
              key={row.id || rIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`hover:bg-purple-50/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, cIdx) => (
                <td key={cIdx} className={`px-4 py-3.5 text-slate-700 ${col.className || ''}`}>
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export const Tabs = ({ tabs = [], activeTab, onChange }) => (
  <div className="border-b border-slate-200 mb-6 flex gap-6 overflow-x-auto">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
          activeTab === tab.id
            ? 'border-purple-800 text-purple-900 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        }`}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
            activeTab === tab.id ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
          }`}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

export const Timeline = ({ steps = [] }) => (
  <div className="relative flex items-center justify-between w-full py-4 overflow-x-auto min-w-0">
    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
    {steps.map((step, i) => (
      <div key={i} className="relative z-10 flex flex-col items-center shrink-0 px-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
          step.completed
            ? 'bg-purple-900 border-purple-900 text-white'
            : step.active
            ? 'bg-white border-purple-800 text-purple-900 font-bold shadow-md'
            : 'bg-white border-slate-300 text-slate-400'
        }`}>
          {step.completed ? <Check className="w-4 h-4" /> : i + 1}
        </div>
        <span className={`text-xs mt-2 font-medium ${step.active || step.completed ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
          {step.label}
        </span>
        {step.date && <span className="text-[10px] text-slate-400">{step.date}</span>}
      </div>
    ))}
  </div>
);

export const Toast = ({ message, type = 'success', onClose }) => (
  <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white ${
    type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-purple-900'
  }`}>
    {type === 'success' && <Check className="w-5 h-5" />}
    {type === 'error' && <AlertTriangle className="w-5 h-5" />}
    {type === 'info' && <Info className="w-5 h-5" />}
    <span className="text-xs font-semibold">{message}</span>
    {onClose && (
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);
