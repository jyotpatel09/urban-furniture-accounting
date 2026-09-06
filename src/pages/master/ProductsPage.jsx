import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Modal, Input, Select } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Plus, Search, Package, Eye } from 'lucide-react';

export const ProductsPage = () => {
  const navigate = useNavigate();
  const products = useStore((state) => state.products);
  const fetchProducts = useStore((state) => state.fetchProducts);
  const addProduct = useStore((state) => state.addProduct);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [type, setType] = useState('Goods');
  const [category, setCategory] = useState('Office Furniture');
  const [salesPrice, setSalesPrice] = useState(5000);
  const [purchasePrice, setPurchasePrice] = useState(3200);
  const [taxRate, setTaxRate] = useState(18);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchProducts()
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load products');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [fetchProducts]);

  const filtered = products.filter((p) => {
    const matchesSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const typeEnum = type.toUpperCase() === 'GOODS' ? 'GOODS' : type.toUpperCase() === 'SERVICE' ? 'SERVICE' : 'COMBO';
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const sku = `FURN-${name.slice(0, 3).toUpperCase()}-${randomId}`;

      await addProduct({
        name,
        type: typeEnum,
        category,
        salesPrice: Number(salesPrice),
        purchasePrice: Number(purchasePrice),
        taxRate: Number(taxRate),
        sku,
        description: 'Urban furniture high-durability item.'
      });

      setIsAddModalOpen(false);
      setName('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create product record in database');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Product Name',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{r.name}</p>
            <p className="text-xs text-gray-400 font-mono">{r.sku}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      cell: (r) => (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
          r.type === 'Goods' || r.type === 'GOODS' ? 'bg-blue-100 text-blue-800' : r.type === 'Service' || r.type === 'SERVICE' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {r.type}
        </span>
      )
    },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Sales Price',
      cell: (r) => <span className="font-bold text-emerald-700">₹{Number(r.salesPrice).toLocaleString('en-IN')}</span>
    },
    {
      header: 'Purchase Price',
      cell: (r) => <span className="font-medium text-gray-700">₹{Number(r.purchasePrice).toLocaleString('en-IN')}</span>
    },
    { header: 'GST %', cell: (r) => `${r.taxRate}%` },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status || 'Active'} /> },
    {
      header: 'Actions',
      cell: (r) => (
        <Button size="sm" variant="ghost" icon={Eye} onClick={() => navigate(`/products/${r.id}`)}>
          View
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="master" />

      <PageHeader
        title="Products & Inventory Catalog"
        subtitle="Manage Urban Furniture product catalog, sales prices, purchase costs, and GST rates."
        breadcrumbs={['Dashboard', 'Master Data', 'Products']}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Add New Product
          </Button>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['All', 'Office Furniture', 'Home Furniture', 'Services'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-purple-900 text-white border-purple-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 text-sm">Loading products from database...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No product records found.</div>
        ) : (
          <Table columns={columns} data={filtered} onRowClick={(row) => navigate(`/products/${row.id}`)} />
        )}
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="+ Add New Product Record">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Product Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Executive Conference Chair" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} options={['Goods', 'Service', 'Combo']} />
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={['Office Furniture', 'Home Furniture', 'Services']} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Sales Price (₹)" type="number" required value={salesPrice} onChange={(e) => setSalesPrice(e.target.value)} />
            <Input label="Purchase Cost (₹)" type="number" required value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
            <Select label="GST Rate %" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} options={[5, 12, 18]} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving to Database...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
