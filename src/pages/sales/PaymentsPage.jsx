import React from 'react';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { CreditCard, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PaymentsPage = () => {
  const navigate = useNavigate();
  const invoices = useStore((state) => state.customerInvoices);

  // Extract all payment logs
  const allPayments = invoices.flatMap((inv) =>
    (inv.payments || []).map((p) => ({
      ...p,
      invoiceId: inv.id,
      customer: inv.customer,
    }))
  );

  const columns = [
    {
      header: 'Payment Ref',
      cell: (r) => <span className="font-mono font-bold text-emerald-800">{r.ref}</span>
    },
    { header: 'Customer', accessor: 'customer' },
    {
      header: 'Linked Invoice',
      cell: (r) => <span className="font-mono text-purple-900 font-semibold">{r.invoiceId}</span>
    },
    { header: 'Payment Date', accessor: 'date' },
    { header: 'Payment Method', accessor: 'method' },
    {
      header: 'Amount Received (₹)',
      cell: (r) => <span className="font-bold text-emerald-700">₹{r.amount.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Actions',
      cell: (r) => (
        <Button size="sm" variant="ghost" icon={Eye} onClick={() => navigate(`/sales/invoices/${r.invoiceId}`)}>
          View Invoice
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="payment" />

      <PageHeader
        title="Customer Payments Register"
        subtitle="Log of received payments, cash/bank receipts, and linked journal vouchers."
        breadcrumbs={['Dashboard', 'Sales', 'Payments']}
      />

      <Card>
        <Table columns={columns} data={allPayments} emptyMessage="No payment records registered yet." />
      </Card>
    </div>
  );
};
