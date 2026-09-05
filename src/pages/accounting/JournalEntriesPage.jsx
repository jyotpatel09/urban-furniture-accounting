import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Modal, Input, Select } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Plus, Search, Eye, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';

export const JournalEntriesPage = () => {
  const navigate = useNavigate();
  const journalEntries = useStore((state) => state.journalEntries);
  const addJournalEntry = useStore((state) => state.addJournalEntry);
  const journals = useStore((state) => state.journals);
  const accounts = useStore((state) => state.chartOfAccounts);

  const [search, setSearch] = useState('');
  const [journalFilter, setJournalFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New JE Form
  const [journalName, setJournalName] = useState('Sales Journal');
  const [ref, setRef] = useState('JE-MANUAL-001');
  const [drAccount, setDrAccount] = useState('101000');
  const [crAccount, setCrAccount] = useState('401000');
  const [amount, setAmount] = useState(10000);

  const filtered = journalEntries.filter((j) => {
    const matchesSearch = j.id.toLowerCase().includes(search.toLowerCase()) || j.reference.toLowerCase().includes(search.toLowerCase());
    const matchesJournal = journalFilter === 'All' || j.journal === journalFilter;
    return matchesSearch && matchesJournal;
  });

  const handleCreateJE = (e) => {
    e.preventDefault();
    const drAccObj = accounts.find(a => a.code === drAccount) || accounts[0];
    const crAccObj = accounts.find(a => a.code === crAccount) || accounts[1];
    const val = Number(amount);

    addJournalEntry({
      journal: journalName,
      reference: ref,
      totalDebit: val,
      totalCredit: val,
      items: [
        { accountCode: drAccObj.code, accountName: drAccObj.name, debit: val, credit: 0 },
        { accountCode: crAccObj.code, accountName: crAccObj.name, debit: 0, credit: val }
      ]
    });
    setIsAddModalOpen(false);
  };

  const columns = [
    {
      header: 'Entry Number',
      cell: (r) => <span className="font-mono font-bold text-purple-900">{r.id}</span>
    },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Journal',
      cell: (r) => <span className="font-semibold text-gray-800">{r.journal}</span>
    },
    {
      header: 'Reference',
      cell: (r) => <span className="font-mono text-gray-600">{r.reference}</span>
    },
    {
      header: 'Total Debit (₹)',
      cell: (r) => <span className="font-bold text-purple-900">₹{r.totalDebit.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Total Credit (₹)',
      cell: (r) => <span className="font-bold text-teal-800">₹{r.totalCredit.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Balance',
      cell: (r) => (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
          r.totalDebit === r.totalCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          <CheckCircle className="w-3 h-3" /> Balanced
        </span>
      )
    },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      cell: (r) => (
        <Button size="sm" variant="ghost" icon={Eye} onClick={() => navigate(`/accounting/journal-entries/${r.id}`)}>
          Inspect
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="entries" />

      <PageHeader
        title="Journal Entries & Vouchers"
        subtitle="Double-entry accounting journal vouchers. Total Debit must equal Total Credit."
        breadcrumbs={['Dashboard', 'Accounting', 'Journal Entries']}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Create Journal Entry
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search entry ID or reference (e.g. INV-00124)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['All', 'Sales Journal', 'Purchase Journal', 'Bank Journal', 'Cash Journal'].map((j) => (
              <button
                key={j}
                onClick={() => setJournalFilter(j)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  journalFilter === j
                    ? 'bg-purple-900 text-white border-purple-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {j}
              </button>
            ))}
          </div>
        </div>

        <Table columns={columns} data={filtered} onRowClick={(row) => navigate(`/accounting/journal-entries/${row.id}`)} />
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="+ Manual Double-Entry Journal Entry">
        <form onSubmit={handleCreateJE} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Journal" value={journalName} onChange={(e) => setJournalName(e.target.value)} options={journals.map(j => j.name)} />
            <Input label="Reference" required value={ref} onChange={(e) => setRef(e.target.value)} />
          </div>

          <div className="p-3 bg-purple-50 rounded-lg text-xs space-y-3">
            <p className="font-bold text-purple-900 uppercase tracking-wider">Double Entry Items (Balanced):</p>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Debit Account (Dr)"
                value={drAccount}
                onChange={(e) => setDrAccount(e.target.value)}
                options={accounts.map(a => ({ label: `${a.code} - ${a.name}`, value: a.code }))}
              />
              <Select
                label="Credit Account (Cr)"
                value={crAccount}
                onChange={(e) => setCrAccount(e.target.value)}
                options={accounts.map(a => ({ label: `${a.code} - ${a.name}`, value: a.code }))}
              />
            </div>

            <Input label="Amount (₹)" type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Post Journal Entry</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
