import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { productsService } from '../../services';
import { PageHeader, Card, StatCard, Table, StatusBadge, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { ArrowLeft, Package, ShoppingBag, ShoppingCart } from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const productsInStore = useStore((state) => state.products);
  const salesOrders = useStore((state) => state.salesOrders);
  const purchaseOrders = useStore((state) => state.purchaseOrders);

  const [product, setProduct] = useState(() => productsInStore.find((p) => p.id === id));
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      productsService.getById(id)
        .then((data) => {
          if (isMounted && data) setProduct(data);
        })
        .catch((err) => {
          if (isMounted) setError(err.message || 'Product not found');
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading product details...</div>;
  if (error || !product) return <div className="p-8 text-center text-red-500">{error || 'Product not found.'}</div>;

  const salesHistory = salesOrders.filter((s) => s.items?.some((i) => i.productId === product.id || i.productName === product.name));
  const purchaseHistory = purchaseOrders.filter((p) => p.items?.some((i) => i.productId === product.id || i.productName === product.name));

  const salesPrice = Number(product.salesPrice || 0);
  const purchasePrice = Number(product.purchasePrice || 0);
  const marginPercent = salesPrice > 0 ? Math.round(((salesPrice - purchasePrice) / salesPrice) * 100) : 0;

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="master" />

      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku} • Category: ${product.category}`}
        breadcrumbs={['Dashboard', 'Products', product.name]}
        actions={
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/products')}>
            Back to Catalog
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                {product.type}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Sales Price:</span>
              <span className="font-bold text-emerald-700">₹{salesPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Purchase Cost:</span>
              <span className="font-semibold text-gray-800">₹{purchasePrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Gross Profit Margin:</span>
              <span className="font-bold text-purple-900">{marginPercent}%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Applicable GST:</span>
              <span className="font-semibold text-gray-900">{product.taxRate}%</span>
            </div>
            <p className="text-gray-600 pt-2">{product.description || 'No description provided.'}</p>
          </div>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard title="Total Sold Quantity" value={`${product.salesCount || 0} Units`} color="purple" icon={ShoppingBag} />
          <StatCard title="Total Purchased Stock" value={`${product.purchaseCount || 0} Units`} color="teal" icon={ShoppingCart} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sales Order History">
          <Table
            columns={[
              { header: 'SO Ref', cell: (r) => <span className="font-mono font-bold text-purple-900">{r.id}</span> },
              { header: 'Customer', accessor: 'customer' },
              { header: 'Date', accessor: 'date' },
              { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> }
            ]}
            data={salesHistory}
          />
        </Card>

        <Card title="Purchase Order History">
          <Table
            columns={[
              { header: 'PO Ref', cell: (r) => <span className="font-mono font-bold text-teal-800">{r.id}</span> },
              { header: 'Vendor', accessor: 'vendor' },
              { header: 'Date', accessor: 'date' },
              { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> }
            ]}
            data={purchaseHistory}
          />
        </Card>
      </div>
    </div>
  );
};
