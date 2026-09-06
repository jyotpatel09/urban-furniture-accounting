import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { salesService } from '../../services';
import { PageHeader, Card, StatusBadge, Button, Timeline } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { ArrowLeft, FileText } from 'lucide-react';

export const SalesOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const createInvoiceFromSO = useStore((state) => state.createInvoiceFromSO);

  const [so, setSo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    salesService.getOrderById(id)
      .then(data => {
        setSo(data);
      })
      .catch(err => {
        console.error('Failed to load sales order:', err);
        setError(err.message || 'Failed to load sales order.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading sales order...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!so) return <div className="p-8 text-center text-gray-500">Sales Order not found.</div>;

  const customerName = so.customer?.name || so.customerName || '—';
  const orderDate = so.date ? new Date(so.date).toLocaleDateString('en-IN') : '—';
  const subtotal = Number(so.subtotal || 0);
  const taxAmount = Number(so.taxAmount || so.tax || 0);
  const totalAmount = Number(so.totalAmount || so.total || 0);
  const items = Array.isArray(so.items) ? so.items : [];

  const invoices = Array.isArray(so.invoices) ? so.invoices : [];
  const hasInvoice = invoices.length > 0;
  const firstInvoice = invoices[0];

  const steps = [
    { label: 'Created', completed: true, date: orderDate },
    { label: 'Confirmed', completed: so.status === 'CONFIRMED' || so.status === 'INVOICED', date: orderDate },
    { label: 'Invoice Generated', completed: hasInvoice, active: !hasInvoice, date: hasInvoice ? 'Generated' : 'Pending' },
    { label: 'Payment Received', completed: false, date: 'Pending' }
  ];

  const handleCreateInvoice = async () => {
    try {
      await createInvoiceFromSO(so.id);
      navigate('/sales/invoices');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create invoice.');
    }
  };

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="transactions" />

      <PageHeader
        title={`Sales Order ${so.number || so.id}`}
        subtitle={`Customer: ${customerName} • Date: ${orderDate}`}
        breadcrumbs={['Dashboard', 'Sales Orders', so.number || so.id]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/sales/orders')}>
              Back to Orders
            </Button>
            {!hasInvoice && so.status !== 'CANCELLED' && (
              <Button variant="teal" icon={FileText} onClick={handleCreateInvoice}>
                Create Customer Invoice
              </Button>
            )}
            {hasInvoice && firstInvoice && (
              <Button variant="primary" icon={FileText} onClick={() => navigate(`/sales/invoices/${firstInvoice.id}`)}>
                View Linked Invoice ({firstInvoice.number || firstInvoice.id})
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
                {items.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-400 text-xs">No items found.</td></tr>
                ) : items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {item.product?.name || item.productName || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-bold">{item.quantity || item.qty || 0}</td>
                    <td className="py-3.5 px-4 text-gray-700">₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-gray-600">{item.taxRate || 0}%</td>
                    <td className="py-3.5 px-4 font-bold text-purple-900">
                      ₹{Number(item.lineSubtotal || item.subtotal || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 flex flex-col items-end space-y-2 text-sm">
            <div className="flex justify-between w-64 text-gray-600">
              <span>Untaxed Amount:</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-gray-600">
              <span>GST Tax Amount:</span>
              <span className="font-semibold text-gray-900">₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-base font-bold text-purple-900 pt-2 border-t border-gray-200">
              <span>Total Amount:</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        {/* Customer & Status Card */}
        <Card title="Customer & Status Information">
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Customer Name</span>
              <span className="text-sm font-bold text-gray-900">{customerName}</span>
            </div>
            {so.customer?.email && (
              <div>
                <span className="text-gray-400 block font-medium">Email</span>
                <span className="text-sm text-gray-700">{so.customer.email}</span>
              </div>
            )}
            <div>
              <span className="text-gray-400 block font-medium">Order Status</span>
              <div className="mt-1"><StatusBadge status={so.status} /></div>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Order Number</span>
              <span className="font-mono text-sm font-bold text-gray-900">{so.number || so.id}</span>
            </div>
            {so.notes && (
              <div>
                <span className="text-gray-400 block font-medium">Notes</span>
                <span className="text-gray-700">{so.notes}</span>
              </div>
            )}
            {hasInvoice && firstInvoice && (
              <div className="p-3 bg-purple-50 rounded-lg text-purple-900 border border-purple-100">
                <span className="font-bold block">Linked Invoice:</span>
                <span className="font-mono text-sm font-bold">{firstInvoice.number || firstInvoice.id}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
