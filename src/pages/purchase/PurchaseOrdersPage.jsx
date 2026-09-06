import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Modal, Input } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Plus, Search, Eye, FileText } from 'lucide-react';

export const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const purchaseOrders = useStore((state) => state.purchaseOrders);
  const addPurchaseOrder = useStore((state) => state.addPurchaseOrder);
  const createVendorBillFromPO = useStore((state) => state.createVendorBillFromPO);
  const contacts = useStore((state) => state.contacts);
  const products = useStore((state) => state.products);
  const fetchPurchaseOrders = useStore((state) => state.fetchPurchaseOrders);
  const fetchContacts = useStore((state) => state.fetchContacts);
  const fetchProducts = useStore((state) => state.fetchProducts);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // PO Form — use IDs
  const [vendorId, setVendorId] = useState('');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState(10);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchPurchaseOrders(),
      fetchContacts(),
      fetchProducts(),
    ]).finally(() => setLoading(false));
  }, [fetchPurchaseOrders, fetchContacts, fetchProducts]);

  // Set default selections once data loads
  useEffect(() => {
    const vendors = contacts.filter(c => c.type !== 'CUSTOMER');
    if (!vendorId && vendors.length > 0) setVendorId(vendors[0].id);
  }, [contacts, vendorId]);

  useEffect(() => {
    if (!productId && products.length > 0) setProductId(products[0].id);
  }, [products, productId]);

  const vendors = contacts.filter(c => c.type !== 'CUSTOMER');
  const safeOrders = Array.isArray(purchaseOrders) ? purchaseOrders : [];

  const filtered = safeOrders.filter((p) => {
    const poId = (p.number || p.id || '').toLowerCase();
    const vendorName = (p.vendor?.name || p.vendorName || '').toLowerCase();
    const matchesSearch = poId.includes(search.toLowerCase()) || vendorName.includes(search.toLowerCase());
    const poStatus = (p.status || '').toUpperCase();
    const matchesStatus =
      statusFilter === 'All' ||
      poStatus === statusFilter.toUpperCase() ||
      p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePO = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!vendorId) { setFormError('Please select a vendor.'); return; }
    if (!productId) { setFormError('Please select a product.'); return; }
    if (!qty || Number(qty) < 1) { setFormError('Quantity must be at least 1.'); return; }

    const prod = products.find(p => p.id === productId);
    if (!prod) { setFormError('Selected product not found. Please refresh.'); return; }

    setSubmitting(true);
    try {
      await addPurchaseOrder({
        vendorId,
        date: orderDate,
        items: [{
          productId: prod.id,
          quantity: Number(qty),
          unitPrice: Number(prod.purchasePrice),
          taxRate: Number(prod.taxRate || 18),
        }],
      });
      setIsAddModalOpen(false);
      setQty(10);
      setFormError('');
    } catch (err) {
      console.error('Create PO error:', err);
      setFormError(err.message || 'Failed to create purchase order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBill = async (poId, e) => {
    e.stopPropagation();
    try {
      await createVendorBillFromPO(poId);
      navigate('/purchase/bills');
    } catch (err) {
      console.error('Create bill error:', err);
      alert(err.message || 'Failed to create vendor bill.');
    }
  };

  const columns = [
    {
      header: 'PO Number',
      cell: (r) => <span className="font-mono font-bold text-amber-900">{r.number || r.id}</span>
    },
    {
      header: 'Vendor',
      cell: (r) => <span className="font-medium text-gray-900">{r.vendor?.name || r.vendorName || '—'}</span>
    },
    {
      header: 'Order Date',
      cell: (r) => {
        const d = r.date || r.createdAt;
        return d ? new Date(d).toLocaleDateString('en-IN') : '—';
      }
    },
    {
      header: 'Products Summary',
      cell: (r) => (
        <span className="text-xs text-gray-600">
          {(r.items || []).map(i => `${i.product?.name || i.productName || 'Item'} (x${i.quantity || i.qty || 0})`).join(', ') || '—'}
        </span>
      )
    },
    {
      header: 'Total Cost (₹)',
      cell: (r) => {
        const total = Number(r.totalAmount || r.total || 0);
        return <span className="font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</span>;
      }
    },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" icon={Eye} onClick={() => navigate(`/purchase/orders/${r.id}`)}>
            View
          </Button>
          {r.status !== 'BILLED' && r.status !== 'Billed' && (
            <Button
              size="sm"
              variant="teal"
              icon={FileText}
              onClick={(e) => handleCreateBill(r.id, e)}
            >
              Create Bill
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="transactions" />

      <PageHeader
        title="Purchase Orders (PO)"
        subtitle="Manage supplier procurement, raw material stock POs, and vendor billing."
        breadcrumbs={['Dashboard', 'Purchase', 'Purchase Orders']}
        actions={
          <Button variant="teal" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + New Purchase Order
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search PO number or vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {['All', 'DRAFT', 'CONFIRMED', 'RECEIVED', 'BILLED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-purple-900 text-white border-purple-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {st === 'All' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 text-sm">Loading purchase orders from database...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No purchase orders found.</div>
        ) : (
          <Table columns={columns} data={filtered} onRowClick={(row) => navigate(`/purchase/orders/${row.id}`)} />
        )}
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setFormError(''); }} title="+ Create Purchase Order">
        <form onSubmit={handleCreatePO} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Vendor *</label>
            <select
              required
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            >
              <option value="">— Select Vendor —</option>
              {vendors.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.email ? `(${c.email})` : ''}</option>
              ))}
            </select>
            {vendors.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No vendors found. Add contacts first.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Product *</label>
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            >
              <option value="">— Select Product —</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — Cost: ₹{Number(p.purchasePrice).toLocaleString('en-IN')} (GST: {p.taxRate}%)
                </option>
              ))}
            </select>
            {products.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No products found. Add products first.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity *</label>
            <input
              type="number"
              min="1"
              required
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Order Date</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            />
          </div>

          {productId && products.find(p => p.id === productId) && (() => {
            const prod = products.find(p => p.id === productId);
            const subtotal = Number(prod.purchasePrice) * Number(qty || 0);
            const tax = (subtotal * Number(prod.taxRate || 18)) / 100;
            const total = subtotal + tax;
            return (
              <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-900 space-y-1 border border-amber-100">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({prod.taxRate}%):</span>
                  <span className="font-semibold">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-amber-200 pt-1">
                  <span>Total:</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })()}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsAddModalOpen(false); setFormError(''); }}>Cancel</Button>
            <Button type="submit" variant="teal" disabled={submitting || !vendorId || !productId}>
              {submitting ? 'Creating...' : 'Confirm Purchase Order'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
