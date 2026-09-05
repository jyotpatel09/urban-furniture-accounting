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
      billId: bill.id,
      vendor: bill.vendor,
    }))
  );

  const columns = [
    {
      header: 'Payment Ref',
      cell: (r) => <span className="font-mono font-bold text-amber-900">{r.ref}</span>
    },
    { header: 'Vendor', accessor: 'vendor' },
    {
      header: 'Linked Bill',
      cell: (r) => <span className="font-mono text-purple-900 font-semibold">{r.billId}</span>
    },
    { header: 'Disbursement Date', accessor: 'date' },
    { header: 'Payment Method', accessor: 'method' },
    {
      header: 'Amount Paid (₹)',
      cell: (r) => <span className="font-bold text-rose-600">₹{r.amount.toLocaleString('en-IN')}</span>
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
