import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, StatusBadge, Button, Timeline } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { ArrowLeft, FileText, ShoppingCart } from 'lucide-react';

export const PurchaseOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const po = useStore((state) => state.purchaseOrders.find((p) => p.id === id)) || useStore((state) => state.purchaseOrders[0]);
  const createVendorBillFromPO = useStore((state) => state.createVendorBillFromPO);

  if (!po) return <div className="p-8 text-center text-gray-500">Purchase Order not found.</div>;

  const steps = [
    { label: 'PO Created', completed: true, date: po.date },
    { label: 'Goods Received', completed: po.status === 'Received' || po.status === 'Billed', date: po.date },
    { label: 'Vendor Bill Created', completed: !!po.billId, active: !po.billId, date: po.billId ? 'Created' : 'Pending' },
    { label: 'Payment Made', completed: po.billStatus === 'Billed', date: po.billStatus }
  ];

  const handleCreateBill = () => {
    createVendorBillFromPO(po.id);
    navigate('/purchase/bills');
  };

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="transactions" />

      <PageHeader
        title={`Purchase Order ${po.id}`}
        subtitle={`Vendor: ${po.vendor} • Date: ${po.date}`}
        breadcrumbs={['Dashboard', 'Purchase Orders', po.id]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/purchase/orders')}>
              Back to POs
            </Button>
            {!po.billId && (
              <Button variant="teal" icon={FileText} onClick={handleCreateBill}>
                Create Vendor Bill
              </Button>
            )}
            {po.billId && (
              <Button variant="primary" icon={FileText} onClick={() => navigate(`/purchase/bills/${po.billId}`)}>
                View Linked Bill ({po.billId})
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
                {po.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{item.productName}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">{item.qty}</td>
                    <td className="py-3.5 px-4 text-gray-700">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-gray-600">{item.taxRate}%</td>
                    <td className="py-3.5 px-4 font-bold text-amber-900">₹{item.subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 flex flex-col items-end space-y-2 text-sm">
            <div className="flex justify-between w-64 text-gray-600">
              <span>Untaxed Amount:</span>
              <span className="font-semibold text-gray-900">₹{po.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-gray-600">
              <span>GST Input Tax:</span>
              <span className="font-semibold text-gray-900">₹{po.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-base font-bold text-amber-900 pt-2 border-t border-gray-200">
              <span>Total Cost:</span>
              <span>₹{po.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        <Card title="Vendor & Procurement Summary">
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Vendor Name</span>
              <span className="text-sm font-bold text-gray-900">{po.vendor}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">PO Status</span>
              <div className="mt-1"><StatusBadge status={po.status} /></div>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Billing Status</span>
              <div className="mt-1"><StatusBadge status={po.billStatus} /></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
