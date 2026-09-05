import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Search, X, Users, Package, FileText, ShoppingCart, CreditCard, BookOpen } from 'lucide-react';

export const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const contacts = useStore((state) => state.contacts);
  const products = useStore((state) => state.products);
  const salesOrders = useStore((state) => state.salesOrders);
  const purchaseOrders = useStore((state) => state.purchaseOrders);
  const customerInvoices = useStore((state) => state.customerInvoices);
  const vendorBills = useStore((state) => state.vendorBills);
  const journalEntries = useStore((state) => state.journalEntries);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredContacts = q ? contacts.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) : [];
  const filteredProducts = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) : [];
  const filteredSOs = q ? salesOrders.filter(s => s.id.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q)) : [];
  const filteredPOs = q ? purchaseOrders.filter(p => p.id.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q)) : [];
  const filteredInvoices = q ? customerInvoices.filter(i => i.id.toLowerCase().includes(q) || i.customer.toLowerCase().includes(q)) : [];
  const filteredBills = q ? vendorBills.filter(b => b.id.toLowerCase().includes(q) || b.vendor.toLowerCase().includes(q)) : [];
  const filteredJEs = q ? journalEntries.filter(j => j.id.toLowerCase().includes(q) || j.reference.toLowerCase().includes(q)) : [];

  const hasResults = q && (
    filteredContacts.length > 0 ||
    filteredProducts.length > 0 ||
    filteredSOs.length > 0 ||
    filteredPOs.length > 0 ||
    filteredInvoices.length > 0 ||
    filteredBills.length > 0 ||
    filteredJEs.length > 0
  );

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search contacts, products, orders, invoices, journal entries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base border-none outline-none focus:ring-0 text-gray-900 placeholder-gray-400"
          />
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!q && (
            <p className="text-center py-6 text-xs text-gray-400">
              Type to search across Master Data, Sales, Purchases, Invoices, and Journal Entries...
            </p>
          )}

          {q && !hasResults && (
            <p className="text-center py-6 text-xs text-gray-500">
              No results found for "<span className="font-semibold text-gray-800">{query}</span>"
            </p>
          )}

          {filteredContacts.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" /> Contacts
              </div>
              <div className="space-y-1">
                {filteredContacts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(`/contacts/${c.id}`)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50/60 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{c.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({c.type})</span>
                    </div>
                    <span className="text-xs text-purple-700 font-mono">{c.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-teal-600" /> Products
              </div>
              <div className="space-y-1">
                {filteredProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(`/products/${p.id}`)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-teal-50/60 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                      <span className="text-xs text-gray-500 ml-2">₹{p.salesPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-xs text-teal-700 font-mono">{p.sku}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredInvoices.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Customer Invoices
              </div>
              <div className="space-y-1">
                {filteredInvoices.map(i => (
                  <div
                    key={i.id}
                    onClick={() => handleSelect(`/sales/invoices/${i.id}`)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50/60 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="text-sm font-semibold text-gray-900 font-mono">{i.id}</span>
                      <span className="text-xs text-gray-500 ml-2">{i.customer}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">₹{i.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredJEs.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Journal Entries
              </div>
              <div className="space-y-1">
                {filteredJEs.map(j => (
                  <div
                    key={j.id}
                    onClick={() => handleSelect(`/accounting/journal-entries/${j.id}`)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50/60 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="text-sm font-semibold text-gray-900 font-mono">{j.id}</span>
                      <span className="text-xs text-gray-500 ml-2">Ref: {j.reference}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">Balanced (₹{j.totalDebit.toLocaleString('en-IN')})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
