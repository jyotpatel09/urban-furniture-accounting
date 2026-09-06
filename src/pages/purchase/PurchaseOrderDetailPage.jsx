import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { purchaseService } from '../../services';
import { PageHeader, Card, StatusBadge, Button, Timeline } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { ArrowLeft, FileText } from 'lucide-react';

export const PurchaseOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const createVendorBillFromPO = useStore((state) => state.createVendorBillFromPO);

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    purchaseService.getOrderById(id)
      .then(data => setPo(data))
      .catch(err => {
        console.error('Failed to load purchase order:', err);
        setError(err.message || 'Failed to load purchase order.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading purchase order...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!po) return <div className="p-8 text-center text-gray-500">Purchase Order not found.</div>;

  const vendorName = po.vendor?.name || po.vendorName || '—';
  const orderDate = po.date ? new Date(po.date).toLocaleDateString('en-IN') : '—';
  const subtotal = Number(po.subtotal || 0);
  const taxAmount = Number(po.taxAmount || po.tax || 0);
  const totalAmount = Number(po.totalAmount || po.total || 0);
  const items = Array.isArray(po.items) ? po.items : [];
  const vendorBills = Array.isArray(po.vendorBills) ? po.vendorBills : [];
  const hasBill = vendorBills.length > 0;
  const firstBill = vendorBills[0];

  const steps = [
    { label: 'PO Created', completed: true, date: orderDate },
    { label: 'Confirmed', completed: po.status === 'CONFIRMED' || po.status === 'RECEIVED' || po.status === 'BILLED', date: orderDate },
    { label: 'Goods Received', completed: po.status === 'RECEIVED' || po.status === 'BILLED', date: po.status === 'RECEIVED' || po.status === 'BILLED' ? 'Received' : 'Pending' },
    { label: 'Vendor Bill Created', completed: hasBill, active: !hasBill, date: hasBill ? 'Created' : 'Pending' },
    { label: 'Payment Made', completed: false, date: 'Pending' }
  ];

  const handleCreateBill = async () => {
    try {
      await createVendorBillFromPO(po.id);
      navigate('/purchase/bills');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create vendor bill.');
    }
  };

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="transactions" />

      <PageHeader
        title={`Purchase Order ${po.number || po.id}`}
        subtitle={`Vendor: ${vendorName} • Date: ${orderDate}`}
        breadcrumbs={['Dashboard', 'Purchase Orders', po.number || po.id]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/purchase/orders')}>
              Back to POs
            </Button>
            {!hasBill && po.status !== 'CANCELLED' && (
              <Button variant="teal" icon={FileText} onClick={handleCreateBill}>
                Create Vendor Bill
              </Button>
            )}
            {hasBill && firstBill && (
              <Button variant="primary" icon={FileText} onClick={() => navigate(`/purchase/bills/${firstBill.id}`)}>
                View Linked Bill ({firstBill.number || firstBill.id})
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Procurement Timeline</h3>
        <Timeline steps={steps} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Purchased Items & Cost Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">GST %</th>
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
                    <td className="py-3.5 px-4 font-bold text-gray-800">{item.quantity || item.qty || 0}</td>
                    <td className="py-3.5 px-4 text-gray-700">₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-gray-600">{item.taxRate || 0}%</td>
                    <td className="py-3.5 px-4 font-bold text-amber-900">
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
              <span>GST Input Tax:</span>
              <span className="font-semibold text-gray-900">₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-base font-bold text-amber-900 pt-2 border-t border-gray-200">
              <span>Total Cost:</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        <Card title="Vendor & Procurement Summary">
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Vendor Name</span>
              <span className="text-sm font-bold text-gray-900">{vendorName}</span>
            </div>
            {po.vendor?.email && (
              <div>
                <span className="text-gray-400 block font-medium">Email</span>
                <span className="text-sm text-gray-700">{po.vendor.email}</span>
              </div>
            )}
            <div>
              <span className="text-gray-400 block font-medium">PO Status</span>
              <div className="mt-1"><StatusBadge status={po.status} /></div>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">PO Number</span>
              <span className="font-mono text-sm font-bold text-gray-900">{po.number || po.id}</span>
            </div>
            {po.notes && (
              <div>
                <span className="text-gray-400 block font-medium">Notes</span>
                <span className="text-gray-700">{po.notes}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
