import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, StatusBadge, Button, Timeline } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { ArrowLeft, FileText, CheckCircle, CreditCard, ShoppingBag } from 'lucide-react';

export const SalesOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const so = useStore((state) => state.salesOrders.find((s) => s.id === id)) || useStore((state) => state.salesOrders[0]);
  const createInvoiceFromSO = useStore((state) => state.createInvoiceFromSO);

  if (!so) return <div className="p-8 text-center text-gray-500">Sales Order not found.</div>;

  const steps = [
    { label: 'Created', completed: true, date: so.date },
    { label: 'Confirmed', completed: true, date: so.date },
    { label: 'Invoice Generated', completed: !!so.invoiceId, active: !so.invoiceId, date: so.invoiceId ? 'Generated' : 'Pending' },
    { label: 'Payment Received', completed: so.paymentStatus === 'Paid', date: so.paymentStatus }
  ];

  const handleCreateInvoice = () => {
    createInvoiceFromSO(so.id);
    navigate('/sales/invoices');
  };

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="transactions" />

      <PageHeader
        title={`Sales Order ${so.id}`}
        subtitle={`Customer: ${so.customer} • Date: ${so.date}`}
        breadcrumbs={['Dashboard', 'Sales Orders', so.id]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/sales/orders')}>
              Back to Orders
            </Button>
            {!so.invoiceId && (
              <Button variant="teal" icon={FileText} onClick={handleCreateInvoice}>
                Create Customer Invoice
              </Button>
            )}
            {so.invoiceId && (
              <Button variant="primary" icon={FileText} onClick={() => navigate(`/sales/invoices/${so.invoiceId}`)}>
                View Linked Invoice ({so.invoiceId})
              </Button>
            )}
          </div>
        }
      />

      {/* Visual Workflow Timeline */}
      <Card>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Progress Timeline</h3>
        <Timeline steps={steps} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items Table */}
        <Card className="lg:col-span-2" title="Order Items & Pricing">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Tax %</th>
                  <th className="py-3 px-4">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {so.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{item.productName}</td>
                    <td className="py-3.5 px-4 text-gray-700 font-bold">{item.qty}</td>
                    <td className="py-3.5 px-4 text-gray-700">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-gray-600">{item.taxRate}%</td>
                    <td className="py-3.5 px-4 font-bold text-purple-900">₹{item.subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 flex flex-col items-end space-y-2 text-sm">
            <div className="flex justify-between w-64 text-gray-600">
              <span>Untaxed Amount:</span>
              <span className="font-semibold text-gray-900">₹{so.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-gray-600">
              <span>GST Tax Amount:</span>
              <span className="font-semibold text-gray-900">₹{so.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-base font-bold text-purple-900 pt-2 border-t border-gray-200">
              <span>Total Amount:</span>
              <span>₹{so.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        {/* Customer & Status Card */}
        <Card title="Customer & Status Information">
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Customer Name</span>
              <span className="text-sm font-bold text-gray-900">{so.customer}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Order Status</span>
              <div className="mt-1"><StatusBadge status={so.status} /></div>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Payment Status</span>
              <div className="mt-1"><StatusBadge status={so.paymentStatus} /></div>
            </div>
            {so.invoiceId && (
              <div className="p-3 bg-purple-50 rounded-lg text-purple-900 border border-purple-100">
                <span className="font-bold block">Linked Invoice:</span>
                <span className="font-mono text-sm font-bold">{so.invoiceId}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
