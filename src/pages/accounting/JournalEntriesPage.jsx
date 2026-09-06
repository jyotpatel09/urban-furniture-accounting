import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Modal, Input, Select } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Plus, Search, Eye, CheckCircle } from 'lucide-react';

// Normalize JE from backend
function normalizeJE(j) {
  return {
    ...j,
    journal: j.journal?.name || j.journalName || '—',
    reference: j.reference || j.number || '—',
    totalDebit: Number(j.totalDebit || 0),
    totalCredit: Number(j.totalCredit || 0),
    date: j.date || j.createdAt,
    status: j.status || 'DRAFT',
  };
}

export const JournalEntriesPage = () => {
  const navigate = useNavigate();
  const rawJournalEntries = useStore((state) => state.journalEntries);
  const addJournalEntry = useStore((state) => state.addJournalEntry);
  const journals = useStore((state) => state.journals);
  const accounts = useStore((state) => state.chartOfAccounts);
  const fetchJournalEntries = useStore((state) => state.fetchJournalEntries);
  const fetchJournals = useStore((state) => state.fetchJournals);
  const fetchChartOfAccounts = useStore((state) => state.fetchChartOfAccounts);

  const [search, setSearch] = useState('');
  const [journalFilter, setJournalFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // New JE Form — use journalId (UUID), accountId (UUID)
  const [journalId, setJournalId] = useState('');
  const [ref, setRef] = useState('');
  const [drAccountId, setDrAccountId] = useState('');
  const [crAccountId, setCrAccountId] = useState('');
  const [amount, setAmount] = useState(10000);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchJournalEntries(),
      fetchJournals(),
      fetchChartOfAccounts(),
    ]).finally(() => setLoading(false));
  }, [fetchJournalEntries, fetchJournals, fetchChartOfAccounts]);

  // Set defaults once data loads
  useEffect(() => {
    if (!journalId && journals.length > 0) setJournalId(journals[0].id);
  }, [journals, journalId]);

  useEffect(() => {
    if (accounts.length >= 2) {
      if (!drAccountId) setDrAccountId(accounts[0].id);
      if (!crAccountId) setCrAccountId(accounts[1].id);
    }
  }, [accounts, drAccountId, crAccountId]);

  const journalEntries = (Array.isArray(rawJournalEntries) ? rawJournalEntries : []).map(normalizeJE);

  const filteredEntries = journalEntries.filter((j) => {
    const jeId = (j.number || j.id || '').toLowerCase();
    const jeRef = (j.reference || '').toLowerCase();
    const matchesSearch = jeId.includes(search.toLowerCase()) || jeRef.includes(search.toLowerCase());
    const matchesJournal = journalFilter === 'All' || j.journal === journalFilter;
    return matchesSearch && matchesJournal;
  });

  const handleCreateJE = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!journalId) { setFormError('Please select a journal.'); return; }
    if (!drAccountId) { setFormError('Please select a debit account.'); return; }
    if (!crAccountId) { setFormError('Please select a credit account.'); return; }
    if (drAccountId === crAccountId) { setFormError('Debit and credit accounts must be different.'); return; }
    if (!amount || Number(amount) <= 0) { setFormError('Amount must be greater than 0.'); return; }

    const val = Number(amount);
    setSubmitting(true);
    try {
      await addJournalEntry({
        journalId,
        date: entryDate,
        reference: ref || `JE-${Date.now().toString().slice(-6)}`,
        lines: [
          { accountId: drAccountId, debit: val, credit: 0 },
          { accountId: crAccountId, debit: 0, credit: val },
        ]
      });
      setIsAddModalOpen(false);
      setRef('');
      setAmount(10000);
      setFormError('');
    } catch (err) {
      console.error('Create JE error:', err);
      setFormError(err.message || 'Failed to create journal entry. Check that debit equals credit.');
    } finally {
      setSubmitting(false);
    }
  };

  const uniqueJournalNames = [...new Set(journalEntries.map(j => j.journal).filter(Boolean))];

  const columns = [
    {
      header: 'Entry Number',
      cell: (r) => <span className="font-mono font-bold text-purple-900">{r.number || r.id}</span>
    },
    {
      header: 'Date',
      cell: (r) => r.date ? new Date(r.date).toLocaleDateString('en-IN') : '—'
    },
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
          Math.abs(r.totalDebit - r.totalCredit) < 0.01 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          <CheckCircle className="w-3 h-3" />
          {Math.abs(r.totalDebit - r.totalCredit) < 0.01 ? 'Balanced' : 'Unbalanced'}
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
            {['All', ...uniqueJournalNames].map((j) => (
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

        {loading ? (
          <div className="py-12 text-center text-gray-500 text-sm">Loading journal entries from database...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No journal entries found.</div>
        ) : (
          <Table columns={columns} data={filteredEntries} onRowClick={(row) => navigate(`/accounting/journal-entries/${row.id}`)} />
        )}
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setFormError(''); }} title="+ Manual Double-Entry Journal Entry">
        <form onSubmit={handleCreateJE} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">{formError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Journal *</label>
              <select
                required
                value={journalId}
                onChange={(e) => setJournalId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
              >
                <option value="">— Select Journal —</option>
                {journals.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
              {journals.length === 0 && <p className="text-xs text-amber-600 mt-1">No journals found.</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Reference</label>
              <input
                type="text"
                value={ref}
                placeholder="JE-MANUAL-001"
                onChange={(e) => setRef(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Entry Date</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            />
          </div>

          <div className="p-3 bg-purple-50 rounded-lg text-xs space-y-3">
            <p className="font-bold text-purple-900 uppercase tracking-wider">Double Entry Items (Balanced):</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Debit Account (Dr) *</label>
                <select
                  required
                  value={drAccountId}
                  onChange={(e) => setDrAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
                >
                  <option value="">— Select Account —</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Credit Account (Cr) *</label>
                <select
                  required
                  value={crAccountId}
                  onChange={(e) => setCrAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
                >
                  <option value="">— Select Account —</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {accounts.length === 0 && (
              <p className="text-amber-700 text-xs">No accounts found. Please add chart of accounts first.</p>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsAddModalOpen(false); setFormError(''); }}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Journal Entry'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
