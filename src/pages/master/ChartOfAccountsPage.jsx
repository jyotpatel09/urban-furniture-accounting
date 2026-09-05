import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Modal, Input, Select } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Plus, Search, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChartOfAccountsPage = () => {
  const navigate = useNavigate();
  const accounts = useStore((state) => state.chartOfAccounts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = accounts.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search);
    const matchesCat = categoryFilter === 'All' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const columns = [
    {
      header: 'Account Code',
      cell: (r) => <span className="font-mono font-bold text-purple-900">{r.code}</span>
    },
    {
      header: 'Account Name',
      cell: (r) => (
        <div>
          <p className="font-semibold text-gray-900">{r.name}</p>
          <p className="text-[11px] text-gray-400">{r.parent}</p>
        </div>
      )
    },
    {
      header: 'Category',
      cell: (r) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          r.category === 'ASSETS' ? 'bg-emerald-100 text-emerald-800' :
          r.category === 'LIABILITIES' ? 'bg-rose-100 text-rose-800' :
          r.category === 'INCOME' ? 'bg-purple-100 text-purple-800' :
          r.category === 'EXPENSES' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {r.category}
        </span>
      )
    },
    { header: 'Account Type', accessor: 'type' },
    {
      header: 'Balance (₹)',
      cell: (r) => <span className="font-bold text-gray-900">₹{r.balance.toLocaleString('en-IN')}</span>
    },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      cell: (r) => (
        <Button size="sm" variant="ghost" onClick={() => navigate('/accounting/ledger')}>
          View Ledger
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="master" />

      <PageHeader
        title="Chart of Accounts (COA)"
        subtitle="Standard accounting taxonomy for Urban Furniture (Assets, Liabilities, Capital, Income, Expenses)."
        breadcrumbs={['Dashboard', 'Accounting', 'Chart of Accounts']}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => alert('Default Chart of Accounts locked in demo mode.')}>
            Add Account
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code (e.g. 101000) or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['All', 'ASSETS', 'LIABILITIES', 'CAPITAL', 'INCOME', 'EXPENSES'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-purple-900 text-white border-purple-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <Table columns={columns} data={filtered} />
      </Card>
    </div>
  );
};
