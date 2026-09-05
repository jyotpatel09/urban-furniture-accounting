import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, StatCard, Table, StatusBadge, Button, Avatar, Tabs } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Mail, Phone, MapPin, Building, ArrowLeft, Plus, FileText, ShoppingBag, CreditCard } from 'lucide-react';

export const ContactDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const contact = useStore((state) => state.contacts.find((c) => c.id === id)) || useStore((state) => state.contacts[0]);
  const salesOrders = useStore((state) => state.salesOrders.filter((s) => s.customer === contact?.name || s.customerId === id));
  const purchaseOrders = useStore((state) => state.purchaseOrders.filter((p) => p.vendor === contact?.name || p.vendorId === id));
  const customerInvoices = useStore((state) => state.customerInvoices.filter((i) => i.customer === contact?.name || i.customerId === id));
  const vendorBills = useStore((state) => state.vendorBills.filter((b) => b.vendor === contact?.name || b.vendorId === id));

  const [activeTab, setActiveTab] = useState('orders');

  if (!contact) {
    return <div className="p-8 text-center text-gray-500">Contact not found.</div>;
  }

  const isCustomer = contact.type === 'Customer' || contact.type === 'Both';
  const isVendor = contact.type === 'Vendor' || contact.type === 'Both';

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="master" />

      <PageHeader
        title={contact.name}
        subtitle={`Master Data Record ID: ${contact.id} • ${contact.type}`}
        breadcrumbs={['Dashboard', 'Contacts', contact.name]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/contacts')}>
              Back to List
            </Button>
            {isCustomer && (
              <Button variant="primary" icon={Plus} onClick={() => navigate('/sales/orders')}>
                + New Sales Order
              </Button>
            )}
            {isVendor && (
              <Button variant="teal" icon={Plus} onClick={() => navigate('/purchase/orders')}>
                + New PO
              </Button>
            )}
          </div>
        }
      />

      {/* Main Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
            <Avatar name={contact.name} src={contact.avatar} size="lg" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">{contact.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                contact.type === 'Customer' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {contact.type}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4 text-purple-700" />
              <span className="font-medium">{contact.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="w-4 h-4 text-purple-700" />
              <span>{contact.phone}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <span>{contact.address}, {contact.city}, {contact.state} - {contact.pincode}</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-gray-500">Account Status:</span>
              <StatusBadge status={contact.status} />
            </div>
          </div>
        </Card>

        {/* Financial KPI Summary Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isCustomer && (
            <>
              <StatCard title="Total Customer Sales" value={`₹${(contact.totalSales || 175000).toLocaleString('en-IN')}`} color="purple" icon={ShoppingBag} />
              <StatCard title="Outstanding Receivables" value={`₹${(contact.outstanding || 25000).toLocaleString('en-IN')}`} color="rose" icon={FileText} />
            </>
          )}

          {isVendor && (
            <>
              <StatCard title="Total Purchases" value={`₹${(contact.totalPurchases || 450000).toLocaleString('en-IN')}`} color="amber" icon={ShoppingBag} />
              <StatCard title="Outstanding Payables" value={`₹${(contact.outstanding || 70000).toLocaleString('en-IN')}`} color="rose" icon={CreditCard} />
            </>
          )}
        </div>
      </div>

      {/* Linked Transactions Tabs */}
      <Card>
        <Tabs
          tabs={[
            { id: 'orders', label: 'Sales / Purchase Orders', count: salesOrders.length + purchaseOrders.length },
            { id: 'invoices', label: 'Invoices & Vendor Bills', count: customerInvoices.length + vendorBills.length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {isCustomer && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sales Orders History</h3>
                <Table
                  columns={[
                    { header: 'Order ID', cell: (r) => <span className="font-mono font-bold text-purple-900">{r.id}</span> },
                    { header: 'Date', accessor: 'date' },
                    { header: 'Amount', cell: (r) => `₹${r.total.toLocaleString('en-IN')}` },
                    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
                    { header: 'Actions', cell: (r) => <Button size="sm" variant="ghost" onClick={() => navigate(`/sales/orders/${r.id}`)}>View</Button> }
                  ]}
                  data={salesOrders}
                />
              </div>
            )}

            {isVendor && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Purchase Orders History</h3>
                <Table
                  columns={[
                    { header: 'PO ID', cell: (r) => <span className="font-mono font-bold text-teal-800">{r.id}</span> },
                    { header: 'Date', accessor: 'date' },
                    { header: 'Amount', cell: (r) => `₹${r.total.toLocaleString('en-IN')}` },
                    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
                    { header: 'Actions', cell: (r) => <Button size="sm" variant="ghost" onClick={() => navigate(`/purchase/orders/${r.id}`)}>View</Button> }
                  ]}
                  data={purchaseOrders}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {isCustomer && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Customer Invoices</h3>
                <Table
                  columns={[
                    { header: 'Invoice ID', cell: (r) => <span className="font-mono font-bold text-purple-900">{r.id}</span> },
                    { header: 'Date', accessor: 'date' },
                    { header: 'Amount', cell: (r) => `₹${r.amount.toLocaleString('en-IN')}` },
                    { header: 'Paid', cell: (r) => `₹${r.paid.toLocaleString('en-IN')}` },
                    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
                    { header: 'Actions', cell: (r) => <Button size="sm" variant="ghost" onClick={() => navigate(`/sales/invoices/${r.id}`)}>View</Button> }
                  ]}
                  data={customerInvoices}
                />
              </div>
            )}

            {isVendor && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Vendor Bills</h3>
                <Table
                  columns={[
                    { header: 'Bill ID', cell: (r) => <span className="font-mono font-bold text-amber-800">{r.id}</span> },
                    { header: 'Date', accessor: 'date' },
                    { header: 'Amount', cell: (r) => `₹${r.amount.toLocaleString('en-IN')}` },
                    { header: 'Remaining', cell: (r) => `₹${r.remaining.toLocaleString('en-IN')}` },
                    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
                    { header: 'Actions', cell: (r) => <Button size="sm" variant="ghost" onClick={() => navigate(`/purchase/bills/${r.id}`)}>View</Button> }
                  ]}
                  data={vendorBills}
                />
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
