import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Modal, Input, Select, StatCard } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Search, Eye, CreditCard, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const InvoicesPage = () => {
  const navigate = useNavigate();
  const invoices = useStore((state) => state.customerInvoices);
  const registerPayment = useStore((state) => state.registerCustomerPayment);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeInvModal, setActiveInvModal] = useState(null);

  // Payment Form State
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Bank - HDFC Account');
  const [payRef, setPayRef] = useState('');

  // Summary Metrics
  const totalAmount = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
  const totalPaid = invoices.reduce((acc, i) => acc + (i.paid || 0), 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + (i.remaining || 0), 0);
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;

  const filtered = invoices.filter((i) => {
    const matchesSearch = i.id.toLowerCase().includes(search.toLowerCase()) || i.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenPayment = (inv) => {
    setActiveInvModal(inv);
    setPayAmount(inv.remaining || inv.amount);
    setPayRef(`PAY-C-${Date.now().toString().slice(-4)}`);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (activeInvModal) {
      registerPayment(activeInvModal.id, payAmount, payMethod, payRef);
      setActiveInvModal(null);
    }
  };

  const columns = [
    {
      header: 'Invoice Number',
      cell: (r) => <span className="font-mono font-bold text-purple-900">{r.id}</span>
    },
    { header: 'Customer', cell: (r) => <span className="font-semibold text-slate-900">{r.customer}</span> },
    { header: 'Invoice Date', accessor: 'date' },
    { header: 'Due Date', accessor: 'dueDate' },
    {
      header: 'Total Amount',
      cell: (r) => <span className="font-bold text-slate-900 font-mono">₹{r.amount.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Paid',
      cell: (r) => <span className="font-semibold text-emerald-700 font-mono">₹{r.paid.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Remaining',
      cell: (r) => <span className="font-semibold text-rose-600 font-mono">₹{r.remaining.toLocaleString('en-IN')}</span>
    },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" icon={Eye} onClick={() => navigate(`/sales/invoices/${r.id}`)}>
            View
          </Button>
          {r.remaining > 0 && (
            <Button size="sm" variant="teal" icon={CreditCard} onClick={() => handleOpenPayment(r)}>
              Pay
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 min-w-0">
      <WorkflowBanner activeStep="billing" />

      <PageHeader
        title="Customer Invoices"
        subtitle="Track accounts receivable, due dates, outstanding balances, and journal entries."
        breadcrumbs={['Dashboard', 'Sales', 'Customer Invoices']}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <StatCard title="Total Invoiced" value={`₹${totalAmount.toLocaleString('en-IN')}`} comparisonText={`${invoices.length} Invoices`} icon={FileText} color="purple" />
        <StatCard title="Outstanding Balance" value={`₹${totalOutstanding.toLocaleString('en-IN')}`} comparisonText="Receivables" icon={Clock} color="amber" />
        <StatCard title="Total Amount Received" value={`₹${totalPaid.toLocaleString('en-IN')}`} comparisonText="Collected" icon={CheckCircle} color="emerald" />
        <StatCard title="Overdue Invoices" value={`${overdueCount}`} comparisonText="Action Required" icon={AlertTriangle} color="rose" />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['All', 'Draft', 'Posted', 'Partially Paid', 'Paid', 'Overdue'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-purple-900 text-white border-purple-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <Table columns={columns} data={filtered} onRowClick={(row) => navigate(`/sales/invoices/${row.id}`)} />
      </Card>

      {/* Register Payment Modal */}
      <Modal isOpen={!!activeInvModal} onClose={() => setActiveInvModal(null)} title={`Register Payment for ${activeInvModal?.id}`}>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 flex justify-between font-semibold border border-purple-100">
            <span>Customer: <b>{activeInvModal?.customer}</b></span>
            <span>Remaining: <b>₹{activeInvModal?.remaining.toLocaleString('en-IN')}</b></span>
          </div>

          <Input
            label="Payment Amount (₹)"
            type="number"
            required
            max={activeInvModal?.remaining}
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
          />

          <Select
            label="Payment Method"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
            options={['Bank - HDFC Account', 'Cash Account']}
          />

          <Input
            label="Transaction Reference / Cheque No."
            required
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setActiveInvModal(null)}>Cancel</Button>
            <Button type="submit" variant="teal">Confirm & Post Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
