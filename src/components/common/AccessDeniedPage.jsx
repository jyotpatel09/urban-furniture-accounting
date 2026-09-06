import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const AccessDeniedPage = ({ moduleName = 'this section' }) => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-rose-100 p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-full inline-block mb-3 border border-rose-200">
          HTTP 403 — Access Restricted
        </span>

        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Permission Denied</h2>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Your current account role <strong className="text-purple-900 font-bold">({user?.role})</strong> does not have permission to access <strong className="text-gray-800">{moduleName}</strong>.
        </p>

        <div className="mt-6 p-3.5 bg-purple-50/70 rounded-xl border border-purple-100 text-left text-xs">
          <p className="font-bold text-purple-950 mb-1">Role Permissions Summary:</p>
          <ul className="text-purple-800 space-y-1 list-disc pl-4">
            <li><strong>Administrator</strong>: Full system & configuration access.</li>
            <li><strong>Accountant</strong>: Financial ledgers, invoices, bills, budgets & reports.</li>
            <li><strong>Sales & Purchase User</strong>: Sales orders, purchase orders, customer & vendor master data.</li>
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Home className="w-4 h-4 text-teal-300" /> Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
