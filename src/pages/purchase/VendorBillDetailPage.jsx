import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, StatusBadge, Button, Modal, Input, Select } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { ArrowLeft, CreditCard, Printer, BookOpen } from 'lucide-react';

export const VendorBillDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const bill = useStore((state) => state.vendorBills.find((b) => b.id === id)) || useStore((state) => state.vendorBills[0]);
  const registerVendorPayment = useStore((state) => state.registerVendorPayment);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(bill?.remaining || 0);
  const [payMethod, setPayMethod] = useState('Bank - HDFC Account');
  const [payRef, setPayRef] = useState(`PAY-V-${Date.now().toString().slice(-4)}`);

  if (!bill) return <div className="p-8 text-center text-gray-500">Vendor Bill not found.</div>;

  const handleRegister = (e) => {
    e.preventDefault();
    registerVendorPayment(bill.id, payAmount, payMethod, payRef);
    setIsPayModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="billing" />

      <PageHeader
        title={`Vendor Bill ${bill.id}`}
        subtitle={`Vendor: ${bill.vendor} • Due Date: ${bill.dueDate}`}
        breadcrumbs={['Dashboard', 'Vendor Bills', bill.id]}
        actions={
          <div className="flex items-center gap-2 no-print">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/purchase/bills')}>
              Back to Bills
            </Button>
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>
              Print Bill
            </Button>
            {bill.remaining > 0 && (
              <Button variant="teal" icon={CreditCard} onClick={() => setIsPayModalOpen(true)}>
                Register Payment
              </Button>
            )}
            {bill.journalEntryId && (
              <Button variant="primary" icon={BookOpen} onClick={() => navigate(`/accounting/journal-entries/${bill.journalEntryId}`)}>
                View Journal Entry ({bill.journalEntryId})
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Bill Line Items & Tax Calculation">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">GST %</th>
                  <th className="py-3 px-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bill.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{item.productName}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">{item.qty}</td>
                    <td className="py-3.5 px-4 text-gray-700">₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-gray-600">{item.taxRate}%</td>
                    <td className="py-3.5 px-4 font-bold text-amber-900">₹{item.total?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 flex flex-col items-end space-y-2 text-sm">
            <div className="flex justify-between w-64 text-gray-600">
              <span>Total Bill Amount:</span>
              <span className="font-bold text-gray-900">₹{bill.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-emerald-700 font-semibold">
              <span>Amount Paid:</span>
              <span>₹{bill.paid.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-base font-bold text-rose-600 pt-2 border-t border-gray-200">
              <span>Remaining Payable:</span>
              <span>₹{bill.remaining.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Vendor Information">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block">Vendor</span>
                <span className="font-bold text-gray-900 text-sm">{bill.vendor}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Bill Date</span>
                <span className="font-medium text-gray-800">{bill.date}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Payment Status</span>
                <div className="mt-1"><StatusBadge status={bill.status} /></div>
              </div>
            </div>
          </Card>

          <Card title="Disbursement Log">
            {bill.payments?.length === 0 ? (
              <p className="text-xs text-gray-400">No disbursements recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {bill.payments?.map((p, idx) => (
                  <div key={idx} className="p-2.5 bg-amber-50 rounded-lg border border-amber-100 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-amber-900 block">{p.ref}</span>
                      <span className="text-amber-700">{p.date} • {p.method}</span>
                    </div>
                    <span className="font-bold text-amber-900">₹{p.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title={`Disburse Payment for ${bill.id}`}>
        <form onSubmit={handleRegister} className="space-y-4">
          <Input label="Payment Amount (₹)" type="number" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
          <Select label="Payment Method" value={payMethod} onChange={(e) => setPayMethod(e.target.value)} options={['Bank - HDFC Account', 'Cash Account']} />
          <Input label="Reference" required value={payRef} onChange={(e) => setPayRef(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsPayModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="teal">Confirm Disbursement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
