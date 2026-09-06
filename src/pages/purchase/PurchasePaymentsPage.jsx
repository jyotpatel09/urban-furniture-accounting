import React from 'react';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { CreditCard, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PurchasePaymentsPage = () => {
  const navigate = useNavigate();
  const bills = useStore((state) => state.vendorBills);

  const allPayments = bills.flatMap((bill) =>
    (bill.payments || []).map((p) => ({
      ...p,
      billNumber: bill.number || bill.id,
      billId: bill.id,
      vendorName: bill.vendor?.name || 'Unknown',
    }))
  );

  const columns = [
    {
      header: 'Payment Ref',
      cell: (r) => <span className="font-mono font-bold text-amber-900">{r.reference || r.ref || '—'}</span>
    },
    { header: 'Vendor', accessor: 'vendorName' },
    {
      header: 'Linked Bill',
      cell: (r) => <span className="font-mono text-purple-900 font-semibold">{r.billNumber}</span>
    },
    { 
      header: 'Disbursement Date', 
      cell: (r) => <span>{r.paymentDate || r.date ? new Date(r.paymentDate || r.date).toLocaleDateString('en-IN') : '—'}</span> 
    },
    { header: 'Method', accessor: 'method' },
    {
      header: 'Amount Paid (₹)',
      cell: (r) => <span className="font-bold text-rose-600">₹{Number(r.amount || 0).toLocaleString('en-IN')}</span>
    },
    {
      header: 'Actions',
      cell: (r) => (
        <Button size="sm" variant="ghost" icon={Eye} onClick={() => navigate(`/purchase/bills/${r.billId}`)}>
          View Bill
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="payment" />

      <PageHeader
        title="Vendor Payments Register"
        subtitle="Log of supplier payments disbursed from cash and bank journals."
        breadcrumbs={['Dashboard', 'Purchase', 'Vendor Payments']}
      />

      <Card>
        <Table columns={columns} data={allPayments} emptyMessage="No vendor disbursements registered yet." />
      </Card>
    </div>
  );
};
