import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Database, ShoppingBag, ShoppingCart, 
  BookOpen, PieChart, BarChart3, Settings, ChevronDown, ChevronRight, 
  Users, Package, FileText, CreditCard, Layers, Percent, Target, 
  Sliders, ShieldCheck, Armchair, PanelLeftClose, PanelLeft, X
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, toggleCollapse, isMobileOpen, closeMobile }) => {
  const location = useLocation();

  const [openSections, setOpenSections] = useState({
    master: true,
    sales: true,
    purchase: true,
    accounting: true,
    budgeting: true,
    reports: true,
    settings: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navGroups = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }
      ]
    },
    {
      key: 'master',
      title: 'Master Data',
      icon: Database,
      items: [
        { label: 'Contacts', icon: Users, path: '/contacts' },
        { label: 'Products', icon: Package, path: '/products' },
        { label: 'Chart of Accounts', icon: Layers, path: '/accounts' },
        { label: 'Journals', icon: BookOpen, path: '/journals' },
      ]
    },
    {
      key: 'sales',
      title: 'Sales',
      icon: ShoppingBag,
      items: [
        { label: 'Sales Orders', icon: ShoppingBag, path: '/sales/orders' },
        { label: 'Customer Invoices', icon: FileText, path: '/sales/invoices' },
        { label: 'Payments', icon: CreditCard, path: '/sales/payments' },
      ]
    },
    {
      key: 'purchase',
      title: 'Purchase',
      icon: ShoppingCart,
      items: [
        { label: 'Purchase Orders', icon: ShoppingCart, path: '/purchase/orders' },
        { label: 'Vendor Bills', icon: FileText, path: '/purchase/bills' },
        { label: 'Payments', icon: CreditCard, path: '/purchase/payments' },
      ]
    },
    {
      key: 'accounting',
      title: 'Accounting',
      icon: BookOpen,
      items: [
        { label: 'Journal Entries', icon: BookOpen, path: '/accounting/journal-entries' },
        { label: 'General Ledger', icon: Layers, path: '/accounting/ledger' },
        { label: 'Taxes', icon: Percent, path: '/accounting/taxes' },
        { label: 'Analytic Accounts', icon: Target, path: '/accounting/analytic-accounts' },
      ]
    },
    {
      key: 'budgeting',
      title: 'Budgeting',
      icon: PieChart,
      items: [
        { label: 'Budgets', icon: PieChart, path: '/budgets' },
      ]
    },
    {
      key: 'reports',
      title: 'Reports',
      icon: BarChart3,
      items: [
        { label: 'Balance Sheet', icon: BarChart3, path: '/reports/balance-sheet' },
        { label: 'Profit & Loss', icon: BarChart3, path: '/reports/profit-loss' },
        { label: 'Budget Report', icon: BarChart3, path: '/reports/budget' },
      ]
    },
    {
      key: 'settings',
      title: 'Settings',
      icon: Settings,
      items: [
        { label: 'General', icon: Sliders, path: '/settings/general' },
        { label: 'Users', icon: Users, path: '/settings/users' },
        { label: 'Roles & Permissions', icon: ShieldCheck, path: '/settings/roles' },
      ]
    }
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-[#1e1728] text-purple-100 select-none border-r border-purple-900/40">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-purple-800/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-800 to-purple-600 border border-purple-500/30 flex items-center justify-center text-white shadow-sm shrink-0">
              <Armchair className="w-5 h-5 text-teal-300" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-bold text-white text-sm tracking-tight leading-none">Urban Furniture</h1>
                <p className="text-[10px] text-teal-400 font-semibold tracking-wide uppercase mt-1">Odoo Accounting ERP</p>
              </div>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/50 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeft className="w-4.5 h-4.5" /> : <PanelLeftClose className="w-4.5 h-4.5" />}
          </button>

          <button
            onClick={closeMobile}
            className="md:hidden p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {navGroups.map((group) => {
            if (group.title === 'Main') {
              return group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobile}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-800/80 text-white font-bold border-l-4 border-teal-400 shadow-xs'
                        : 'text-purple-200/90 hover:bg-purple-900/40 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-300' : 'text-purple-300'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              });
            }

            const isExpanded = openSections[group.key];
            const hasActiveChild = group.items.some((i) => location.pathname === i.path || location.pathname.startsWith(i.path + '/'));

            return (
              <div key={group.key} className="pt-1">
                {!isCollapsed ? (
                  <div>
                    <button
                      onClick={() => toggleSection(group.key)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${
                        hasActiveChild ? 'text-teal-300' : 'text-purple-300/70 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {group.icon && <group.icon className="w-3.5 h-3.5 opacity-70" />}
                        {group.title}
                      </span>
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-1 ml-3 pl-2.5 border-l border-purple-800/40 space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                          return (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              onClick={closeMobile}
                              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                                isActive
                                  ? 'bg-purple-800/80 text-white font-bold border-l-2 border-teal-400 shadow-xs'
                                  : 'text-purple-200/80 hover:bg-purple-900/40 hover:text-white'
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-300' : 'text-purple-400'}`} />
                              <span>{item.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  // Collapsed mode icons with hover tooltips
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={closeMobile}
                          className={`flex items-center justify-center p-2 rounded-lg text-xs transition-all relative group ${
                            isActive
                              ? 'bg-purple-800 text-white font-semibold border-l-2 border-teal-400'
                              : 'text-purple-200 hover:bg-purple-900/50 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-teal-300' : ''}`} />
                          <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                            {item.label}
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-purple-800/40 bg-purple-950/60">
          <div className="bg-purple-900/30 rounded-lg p-2 border border-purple-800/40 text-center">
            <p className="text-[11px] font-semibold text-purple-200">Odoo Hackathon Finalist</p>
            <p className="text-[10px] text-teal-400 font-medium">Urban Furniture ERP v1.0</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block fixed top-0 left-0 h-screen z-30 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeMobile} />
          <div className="relative w-60 max-w-xs h-full z-50 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
