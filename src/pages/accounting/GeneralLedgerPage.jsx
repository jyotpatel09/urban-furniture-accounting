import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, Select, Input } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Layers, Filter, Search } from 'lucide-react';

export const GeneralLedgerPage = () => {
  const journalEntries = useStore((state) => state.journalEntries);
  const accounts = useStore((state) => state.chartOfAccounts);
  const journals = useStore((state) => state.journals);

  const [selectedAccount, setSelectedAccount] = useState('All');
  const [selectedJournal, setSelectedJournal] = useState('All');
  const [search, setSearch] = useState('');

  // Extract ledger lines from posted journal entries
  const ledgerLines = journalEntries.flatMap((je) =>
    (je.items || []).map((item) => ({
      date: je.date,
      ref: je.reference,
      jeId: je.id,
      journal: je.journal,
      accountCode: item.accountCode,
      accountName: item.accountName,
      debit: item.debit,
      credit: item.credit,
    }))
  );

  let runningBalance = 0;
  const processedLines = ledgerLines
    .filter((l) => {
      const matchesAcc = selectedAccount === 'All' || l.accountCode === selectedAccount;
      const matchesJrnl = selectedJournal === 'All' || l.journal === selectedJournal;
      const matchesSearch = l.ref.toLowerCase().includes(search.toLowerCase()) || l.accountName.toLowerCase().includes(search.toLowerCase());
      return matchesAcc && matchesJrnl && matchesSearch;
    })
    .map((line) => {
      runningBalance += line.debit - line.credit;
      return {
        ...line,
        runningBalance,
      };
    });

  const columns = [
    { header: 'Date', accessor: 'date' },
    {
      header: 'Voucher Ref',
      cell: (r) => <span className="font-mono font-bold text-purple-900">{r.ref}</span>
    },
    {
      header: 'Account',
      cell: (r) => (
        <div>
          <span className="font-semibold text-gray-900">{r.accountName}</span>
          <span className="text-xs font-mono text-gray-400 ml-2">({r.accountCode})</span>
        </div>
      )
    },
    { header: 'Journal', accessor: 'journal' },
    {
      header: 'Debit (Dr ₹)',
      cell: (r) => <span className="font-bold text-purple-900">{r.debit > 0 ? `₹${r.debit.toLocaleString('en-IN')}` : '-'}</span>
    },
    {
      header: 'Credit (Cr ₹)',
      cell: (r) => <span className="font-bold text-teal-800">{r.credit > 0 ? `₹${r.credit.toLocaleString('en-IN')}` : '-'}</span>
    },
    {
      header: 'Running Balance',
      cell: (r) => (
        <span className={`font-bold ${r.runningBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
          ₹{r.runningBalance.toLocaleString('en-IN')}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="ledger" />

      <PageHeader
        title="General Ledger & Running Balances"
        subtitle="Complete chronological transaction log and account running balances."
        breadcrumbs={['Dashboard', 'Accounting', 'General Ledger']}
      />

      <Card>
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Select
            label="Filter by Chart of Account"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            options={[{ label: 'All Accounts', value: 'All' }, ...accounts.map(a => ({ label: `${a.code} - ${a.name}`, value: a.code }))]}
          />
          <Select
            label="Filter by Journal"
            value={selectedJournal}
            onChange={(e) => setSelectedJournal(e.target.value)}
            options={[{ label: 'All Journals', value: 'All' }, ...journals.map(j => ({ label: j.name, value: j.name }))]}
          />
          <Input
            label="Search Voucher Reference"
            placeholder="Search ref (e.g. INV-00124)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table columns={columns} data={processedLines} emptyMessage="No ledger entries found." />
      </Card>
    </div>
  );
};
