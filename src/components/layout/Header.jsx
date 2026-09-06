import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { GlobalSearch } from '../common/GlobalSearch';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { 
  Search, HelpCircle, Menu, User, Settings, LogOut, ChevronDown, Shield
} from 'lucide-react';

export const Header = ({ onOpenMobile }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const user = useStore((state) => state.user);
  const switchRoleAccount = useStore((state) => state.switchRoleAccount);
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    switchRoleAccount(role);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    useStore.getState().setUser({
      name: 'Admin User',
      email: 'admin@urbanfurniture.in',
      role: 'Administrator',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    });
    navigate('/login');
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Bar Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200/80 text-gray-500 hover:text-gray-900 rounded-lg text-xs font-medium border border-gray-200 transition-colors w-64 md:w-80"
          >
            <Search className="w-4 h-4 text-gray-400" />
            <span className="flex-1 text-left">Search everything (Press '/')</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-gray-300 rounded shadow-xs text-gray-400">
              /
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Help Button */}
          <button
            onClick={() => alert('Urban Furniture Accounting ERP Help & Manual\n- Master Data: Contacts, Products, COA\n- Sales: Quotation -> Order -> Invoice -> Payment\n- Purchase: PO -> Vendor Bill -> Payment\n- Accounting: Balanced Journal Entries & General Ledger\n- Reports: Balance Sheet & Profit & Loss')}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Accounting Help & Documentation"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          <div className="h-6 w-px bg-gray-200 my-auto hidden sm:block" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-purple-200"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{user.name}</p>
                <p className="text-[10px] text-purple-700 font-semibold">{user.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-40 overflow-hidden divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 bg-purple-50/50">
                    <p className="text-xs font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-purple-700" />
                      <span className="text-[11px] font-semibold text-purple-800">Role: {user.role}</span>
                    </div>
                  </div>

                  <div className="p-1 text-xs">
                    <button
                      onClick={() => { setIsProfileOpen(false); navigate('/settings/users'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      <User className="w-4 h-4 text-gray-500" /> My Profile
                    </button>
                    <button
                      onClick={() => { setIsProfileOpen(false); navigate('/settings/general'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      <Settings className="w-4 h-4 text-gray-500" /> System Settings
                    </button>
                  </div>

                  {/* Demo Role Switcher for Hackathon Judges */}
                  <div className="p-2 bg-purple-50/70 border-t border-purple-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-900 mb-1 px-1">
                      Active User Accounts
                    </p>
                    <div className="flex flex-col gap-1">
                      {[
                        { label: 'Administrator', role: 'Administrator', email: 'admin@urbanfurniture.in' },
                        { label: 'Accountant', role: 'Accountant', email: 'accountant@urbanfurniture.in' },
                        { label: 'Sales & Purchase User', role: 'Sales & Purchase User', email: 'sales@urbanfurniture.in' }
                      ].map((acc) => (
                        <button
                          key={acc.role}
                          onClick={() => handleRoleChange(acc.role)}
                          className={`text-[11px] py-1.5 px-2 rounded-md font-medium text-left flex items-center justify-between border transition-all ${
                            user.role === acc.role
                              ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-100/60'
                          }`}
                        >
                          <span className="truncate">{acc.label}</span>
                          <span className={`text-[9px] px-1 rounded ${user.role === acc.role ? 'bg-purple-800 text-teal-300' : 'text-gray-400'}`}>
                            {user.role === acc.role ? 'Active' : 'Switch'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
