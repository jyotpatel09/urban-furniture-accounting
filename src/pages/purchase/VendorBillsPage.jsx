import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Modal, Input, Select, StatCard } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Search, Eye, CreditCard, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const VendorBillsPage = () => {
  const navigate = useNavigate();
  const bills = useStore((state) => state.vendorBills);
  const registerVendorPayment = useStore((state) => state.registerVendorPayment);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeBillModal, setActiveBillModal] = useState(null);

  // Payment Form
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Bank - HDFC Account');
  const [payRef, setPayRef] = useState('');

  // Summary Metrics
  const totalAmount = bills.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalPaid = bills.reduce((acc, b) => acc + (b.paid || 0), 0);
  const totalRemaining = bills.reduce((acc, b) => acc + (b.remaining || 0), 0);
  const overdueCount = bills.filter(b => b.status === 'Overdue').length;

  const filtered = bills.filter((b) => {
    const matchesSearch = b.id.toLowerCase().includes(search.toLowerCase()) || b.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenPayment = (bill) => {
    setActiveBillModal(bill);
    setPayAmount(bill.remaining || bill.amount);
    setPayRef(`PAY-V-${Date.now().toString().slice(-4)}`);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (activeBillModal) {
      registerVendorPayment(activeBillModal.id, payAmount, payMethod, payRef);
      setActiveBillModal(null);
    }
  };

  const columns = [
    {
      header: 'Bill Number',
      cell: (r) => <span className="font-mono font-bold text-amber-900">{r.id}</span>
    },
    { header: 'Vendor', cell: (r) => <span className="font-semibold text-slate-900">{r.vendor}</span> },
    { header: 'Bill Date', accessor: 'date' },
    { header: 'Due Date', accessor: 'dueDate' },
    {
      header: 'Bill Total',
      cell: (r) => <span className="font-bold text-slate-900 font-mono">₹{r.amount.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Paid',
      cell: (r) => <span className="font-semibold text-emerald-700 font-mono">₹{r.paid.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Remaining Payables',
      cell: (r) => <span className="font-semibold text-rose-600 font-mono">₹{r.remaining.toLocaleString('en-IN')}</span>
    },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" icon={Eye} onClick={() => navigate(`/purchase/bills/${r.id}`)}>
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
        title="Vendor Bills"
        subtitle="Manage accounts payable, supplier invoices, due dates, and payment disbursement."
        breadcrumbs={['Dashboard', 'Purchase', 'Vendor Bills']}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <StatCard title="Total Vendor Billed" value={`₹${totalAmount.toLocaleString('en-IN')}`} comparisonText={`${bills.length} Bills`} icon={FileText} color="amber" />
        <StatCard title="Outstanding Payables" value={`₹${totalRemaining.toLocaleString('en-IN')}`} comparisonText="Creditors" icon={Clock} color="rose" />
        <StatCard title="Total Amount Disbursed" value={`₹${totalPaid.toLocaleString('en-IN')}`} comparisonText="Paid" icon={CheckCircle} color="emerald" />
        <StatCard title="Overdue Bills" value={`${overdueCount}`} comparisonText="Pending Action" icon={AlertTriangle} color="purple" />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search bill number or vendor..."
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

        <Table columns={columns} data={filtered} onRowClick={(row) => navigate(`/purchase/bills/${row.id}`)} />
      </Card>

      <Modal isOpen={!!activeBillModal} onClose={() => setActiveBillModal(null)} title={`Pay Vendor Bill ${activeBillModal?.id}`}>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 flex justify-between font-semibold border border-amber-100">
            <span>Vendor: <b>{activeBillModal?.vendor}</b></span>
            <span>Outstanding Payable: <b>₹{activeBillModal?.remaining.toLocaleString('en-IN')}</b></span>
          </div>

          <Input label="Payment Amount (₹)" type="number" required max={activeBillModal?.remaining} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
          <Select label="Disbursement Method" value={payMethod} onChange={(e) => setPayMethod(e.target.value)} options={['Bank - HDFC Account', 'Cash Account']} />
          <Input label="Reference / NEFT UTR" required value={payRef} onChange={(e) => setPayRef(e.target.value)} />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setActiveBillModal(null)}>Cancel</Button>
            <Button type="submit" variant="teal">Disburse Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
