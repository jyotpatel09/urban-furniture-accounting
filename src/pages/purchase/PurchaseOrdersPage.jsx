import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Modal, Input, Select } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Plus, Search, Eye, FileText, ShoppingCart } from 'lucide-react';

export const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const purchaseOrders = useStore((state) => state.purchaseOrders);
  const addPurchaseOrder = useStore((state) => state.addPurchaseOrder);
  const createVendorBillFromPO = useStore((state) => state.createVendorBillFromPO);
  const contacts = useStore((state) => state.contacts);
  const products = useStore((state) => state.products);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // PO Form
  const [vendor, setVendor] = useState(contacts.find(c => c.type === 'Vendor')?.name || 'Azure Furniture');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [qty, setQty] = useState(10);

  const filtered = purchaseOrders.filter((p) => {
    const matchesSearch = p.id.toLowerCase().includes(search.toLowerCase()) || p.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePO = (e) => {
    e.preventDefault();
    const prod = products.find(p => p.id === productId) || products[0];
    const subtotal = prod.purchasePrice * Number(qty);
    const tax = Math.round(subtotal * (prod.taxRate / 100));

    addPurchaseOrder({
      vendor,
      vendorId: contacts.find(c => c.name === vendor)?.id || 'VEND-001',
      items: [{ productId: prod.id, productName: prod.name, qty: Number(qty), unitPrice: prod.purchasePrice, taxRate: prod.taxRate, subtotal }],
      subtotal,
      tax,
      total: subtotal + tax
    });
    setIsAddModalOpen(false);
  };

  const columns = [
    {
      header: 'PO Number',
      cell: (r) => <span className="font-mono font-bold text-amber-900">{r.id}</span>
    },
    { header: 'Vendor', cell: (r) => <span className="font-medium text-gray-900">{r.vendor}</span> },
    { header: 'Order Date', accessor: 'date' },
    {
      header: 'Products Summary',
      cell: (r) => (
        <span className="text-xs text-gray-600">
          {r.items?.map(i => `${i.productName} (x${i.qty})`).join(', ')}
        </span>
      )
    },
    {
      header: 'Total Cost (₹)',
      cell: (r) => <span className="font-bold text-gray-900">₹{r.total.toLocaleString('en-IN')}</span>
    },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    { header: 'Bill Status', cell: (r) => <StatusBadge status={r.billStatus} /> },
    {
      header: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" icon={Eye} onClick={() => navigate(`/purchase/orders/${r.id}`)}>
            View
          </Button>
          {r.status !== 'Billed' && (
            <Button
              size="sm"
              variant="teal"
              icon={FileText}
              onClick={() => {
                createVendorBillFromPO(r.id);
                navigate('/purchase/bills');
              }}
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
            {['All', 'Draft', 'Confirmed', 'Received', 'Billed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-purple-900 text-white border-purple-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <Table columns={columns} data={filtered} onRowClick={(row) => navigate(`/purchase/orders/${row.id}`)} />
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="+ Create Purchase Order">
        <form onSubmit={handleCreatePO} className="space-y-4">
          <Select
            label="Vendor"
            required
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            options={contacts.filter(c => c.type !== 'Customer').map(c => ({ label: c.name, value: c.name }))}
          />
          <Select
            label="Product Item"
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            options={products.map(p => ({ label: `${p.name} — Cost: ₹${p.purchasePrice.toLocaleString('en-IN')}`, value: p.id }))}
          />
          <Input label="Quantity" type="number" min="1" required value={qty} onChange={(e) => setQty(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="teal">Confirm Purchase Order</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
