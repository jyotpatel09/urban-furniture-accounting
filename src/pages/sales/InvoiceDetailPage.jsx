import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { salesService } from '../../services';
import { PageHeader, Card, StatusBadge, Button, Modal, Input, Select } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { ArrowLeft, CreditCard, Printer, BookOpen } from 'lucide-react';

export const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const registerPayment = useStore((state) => state.registerCustomerPayment);
  const fetchCustomerInvoices = useStore((state) => state.fetchCustomerInvoices);

  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('Bank - HDFC Account');
  const [payRef, setPayRef] = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payError, setPayError] = useState('');
  const [postSubmitting, setPostSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    salesService.getInvoiceById(id)
      .then(data => {
        setInv(data);
        const remaining = Number(data.remainingAmount || data.remaining || 0);
        setPayAmount(remaining);
        setPayRef(`PAY-C-${Date.now().toString().slice(-4)}`);
      })
      .catch(err => {
        console.error('Failed to load invoice:', err);
        setError(err.message || 'Failed to load invoice.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!inv) return <div className="p-8 text-center text-gray-500">Invoice not found.</div>;

  const customerName = inv.customer?.name || inv.customerName || '—';
  const amount = Number(inv.totalAmount || inv.total || 0);
  const paid = Number(inv.paidAmount || inv.paid || 0);
  const remaining = Number(inv.remainingAmount || inv.outstanding || inv.remaining || 0);
  const invoiceDate = inv.invoiceDate || inv.date;
  const dueDate = inv.dueDate;
  const items = Array.isArray(inv.items) ? inv.items : [];
  const payments = Array.isArray(inv.payments) ? inv.payments : [];

  const isDraft = inv.status === 'DRAFT';
  const isCancelled = inv.status === 'CANCELLED';
  const canPay = !isDraft && !isCancelled && remaining > 0;

  const handlePostInvoice = async () => {
    if (!window.confirm('Are you sure you want to post this invoice? This will create journal entries and cannot be undone.')) return;
    setPostSubmitting(true);
    try {
      await salesService.postInvoice(id);
      const updated = await salesService.getInvoiceById(id);
      setInv(updated);
    } catch (err) {
      alert(err.message || 'Failed to post invoice.');
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setPaySubmitting(true);
    setPayError('');
    try {
      await registerPayment(inv.id, payAmount, payMethod, payRef);
      // Reload this invoice
      const updated = await salesService.getInvoiceById(id);
      setInv(updated);
      await fetchCustomerInvoices();
      setIsPayModalOpen(false);
    } catch (err) {
      console.error('Payment error:', err);
      setPayError(err.message || 'Failed to register payment.');
    } finally {
      setPaySubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="billing" />

      <PageHeader
        title={`Customer Invoice ${inv.number || inv.id}`}
        subtitle={`Customer: ${customerName} • Due: ${dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : '—'}`}
        breadcrumbs={['Dashboard', 'Invoices', inv.number || inv.id]}
        actions={
          <div className="flex items-center gap-2 no-print">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/sales/invoices')}>
              Back to Invoices
            </Button>
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
              Print Invoice
            </Button>
            {isDraft && (
              <Button variant="primary" icon={BookOpen} onClick={handlePostInvoice} disabled={postSubmitting}>
                {postSubmitting ? 'Posting...' : 'Confirm & Post Invoice'}
              </Button>
            )}
            {canPay && (
              <Button variant="teal" icon={CreditCard} onClick={() => setIsPayModalOpen(true)}>
                Register Payment
              </Button>
            )}
            {inv.journalEntryId && (
              <Button variant="primary" icon={BookOpen} onClick={() => navigate(`/accounting/journal-entries/${inv.journalEntryId}`)}>
                View Journal Entry
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Invoice Items & Accounting Summary">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">GST %</th>
                  <th className="py-3 px-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-400 text-xs">No items.</td></tr>
                ) : items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {item.product?.name || item.productName || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">{item.quantity || item.qty || 0}</td>
                    <td className="py-3.5 px-4 text-gray-700">₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-gray-600">{item.taxRate || 0}%</td>
                    <td className="py-3.5 px-4 font-bold text-purple-900">
                      ₹{Number(item.lineTotal || item.total || item.lineSubtotal || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 flex flex-col items-end space-y-2 text-sm">
            <div className="flex justify-between w-64 text-gray-600">
              <span>Total Invoice Amount:</span>
              <span className="font-bold text-gray-900">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-emerald-700 font-semibold">
              <span>Amount Paid:</span>
              <span>₹{paid.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between w-64 text-base font-bold text-rose-600 pt-2 border-t border-gray-200">
              <span>Balance Remaining:</span>
              <span>₹{remaining.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Invoice Information">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block">Customer</span>
                <span className="font-bold text-gray-900 text-sm">{customerName}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Invoice Number</span>
                <span className="font-mono font-bold text-gray-900">{inv.number || inv.id}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Invoice Date</span>
                <span className="font-medium text-gray-800">
                  {invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN') : '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Due Date</span>
                <span className="font-medium text-gray-800">
                  {dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : '—'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Payment Status</span>
                <div className="mt-1"><StatusBadge status={inv.status} /></div>
              </div>
            </div>
          </Card>

          <Card title="Payment Log History">
            {payments.length === 0 ? (
              <p className="text-xs text-gray-400">No payments registered yet.</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p, idx) => (
                  <div key={p.id || idx} className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-emerald-900 block">{p.reference || p.ref || '—'}</span>
                      <span className="text-emerald-700">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '—'} • {p.paymentMethod || p.method || '—'}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-900">₹{Number(p.amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal isOpen={isPayModalOpen} onClose={() => { setIsPayModalOpen(false); setPayError(''); }} title={`Register Payment for ${inv.number || inv.id}`}>
        <form onSubmit={handleRegister} className="space-y-4">
          {payError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">{payError}</div>
          )}
          <Input label="Payment Amount (₹)" type="number" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
          <Select label="Payment Method" value={payMethod} onChange={(e) => setPayMethod(e.target.value)} options={['Bank - HDFC Account', 'Cash Account']} />
          <Input label="Reference" required value={payRef} onChange={(e) => setPayRef(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsPayModalOpen(false); setPayError(''); }}>Cancel</Button>
            <Button type="submit" variant="teal" disabled={paySubmitting}>
              {paySubmitting ? 'Processing...' : 'Save Payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
