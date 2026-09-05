import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { StatCard, Card, StatusBadge, Button, Modal, Input, Select } from '../../components/common/UIComponents';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight,
  PlusCircle, ShoppingBag, ShoppingCart, FileText, CreditCard, UserPlus, PackagePlus,
  ArrowRight, Eye, CheckCircle2, AlertCircle, Clock, ShieldCheck, PieChart as PieIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);

  const salesOrders = useStore((state) => state.salesOrders);
  const purchaseOrders = useStore((state) => state.purchaseOrders);
  const customerInvoices = useStore((state) => state.customerInvoices);
  const vendorBills = useStore((state) => state.vendorBills);
  const contacts = useStore((state) => state.contacts);
  const products = useStore((state) => state.products);

  const addSalesOrder = useStore((state) => state.addSalesOrder);
  const addPurchaseOrder = useStore((state) => state.addPurchaseOrder);
  const addContact = useStore((state) => state.addContact);
  const addProduct = useStore((state) => state.addProduct);

  // Quick Action Modal States
  const [activeModal, setActiveModal] = useState(null);

  // Form states for Quick Actions
  const [newSoCustomer, setNewSoCustomer] = useState(contacts[0]?.name || '');
  const [newSoProduct, setNewSoProduct] = useState(products[0]?.id || '');
  const [newSoQty, setNewSoQty] = useState(2);

  const [newPoVendor, setNewPoVendor] = useState(contacts.find(c => c.type === 'Vendor')?.name || 'Azure Furniture');
  const [newPoProduct, setNewPoProduct] = useState(products[0]?.id || '');
  const [newPoQty, setNewPoQty] = useState(10);

  const [newContactName, setNewContactName] = useState('');
  const [newContactType, setNewContactType] = useState('Customer');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(5000);
  const [newProdCategory, setNewProdCategory] = useState('Office Furniture');

  // Chart Datasets
  const salesVsPurchasesData = [
    { month: 'Jan', Sales: 180000, Purchases: 110000 },
    { month: 'Feb', Sales: 220000, Purchases: 140000 },
    { month: 'Mar', Sales: 290000, Purchases: 185000 },
    { month: 'Apr', Sales: 240000, Purchases: 150000 },
    { month: 'May', Sales: 310000, Purchases: 195000 },
    { month: 'Jun', Sales: 380000, Purchases: 220000 },
  ];

  const revenueBreakdownData = [
    { name: 'Office Furniture (40%)', value: 498000, color: '#4c1d95' },
    { name: 'Home Furniture (25%)', value: 311250, color: '#0d9488' },
    { name: 'Custom Suites (20%)', value: 249000, color: '#2563eb' },
    { name: 'Services & Setup (15%)', value: 186750, color: '#d97706' },
  ];

  const cashFlowData = [
    { month: 'Jan', CashIn: 170000, CashOut: 105000, Net: 65000 },
    { month: 'Feb', CashIn: 210000, CashOut: 135000, Net: 75000 },
    { month: 'Mar', CashIn: 280000, CashOut: 175000, Net: 105000 },
    { month: 'Apr', CashIn: 230000, CashOut: 145000, Net: 85000 },
    { month: 'May', CashIn: 300000, CashOut: 190000, Net: 110000 },
    { month: 'Jun', CashIn: 360000, CashOut: 210000, Net: 150000 },
  ];

  // Combined Recent Transactions
  const recentTransactions = [
    { date: '05 Sep', ref: 'SO-00124', contact: 'Nimesh Pathak', type: 'Sales', amount: 29500, status: 'Paid' },
    { date: '04 Sep', ref: 'SO-00125', contact: 'Rajesh Shah', type: 'Sales', amount: 112100, status: 'Paid' },
    { date: '03 Sep', ref: 'BILL-00231', contact: 'Azure Furniture', type: 'Purchase', amount: 75520, status: 'Paid' },
    { date: '02 Sep', ref: 'SO-00126', contact: 'Aarav Enterprises', type: 'Sales', amount: 64900, status: 'Quotation' },
    { date: '01 Sep', ref: 'BILL-00232', contact: 'WoodCraft Industries', type: 'Purchase', amount: 128800, status: 'Partial' },
  ];

  // Live Activity Feed Items
  const recentActivity = [
    { title: 'Customer Payment Received', desc: '₹29,500 received from Nimesh Pathak (INV-00124)', time: '10m ago', icon: CheckCircle2, color: 'text-emerald-600' },
    { title: 'Sales Order Confirmed', desc: 'SO-00125 confirmed for Rajesh Shah (₹1,12,100)', time: '1h ago', icon: ShoppingBag, color: 'text-purple-600' },
    { title: 'Vendor Bill Posted', desc: 'BILL-00231 posted from Azure Furniture (₹75,520)', time: '3h ago', icon: FileText, color: 'text-amber-600' },
    { title: 'Quotation Issued', desc: 'SO-00126 sent to Aarav Enterprises (₹64,900)', time: '1d ago', icon: Clock, color: 'text-blue-600' },
  ];

  // Handlers
  const handleCreateSO = (e) => {
    e.preventDefault();
    const prod = products.find(p => p.id === newSoProduct) || products[0];
    const subtotal = prod.salesPrice * Number(newSoQty);
    const tax = Math.round(subtotal * (prod.taxRate / 100));

    addSalesOrder({
      customer: newSoCustomer,
      customerId: contacts.find(c => c.name === newSoCustomer)?.id || 'CUST-001',
      items: [{ productId: prod.id, productName: prod.name, qty: Number(newSoQty), unitPrice: prod.salesPrice, taxRate: prod.taxRate, subtotal }],
      subtotal,
      tax,
      total: subtotal + tax
    });
    setActiveModal(null);
    navigate('/sales/orders');
  };

  const handleCreatePO = (e) => {
    e.preventDefault();
    const prod = products.find(p => p.id === newPoProduct) || products[0];
    const subtotal = prod.purchasePrice * Number(newPoQty);
    const tax = Math.round(subtotal * (prod.taxRate / 100));

    addPurchaseOrder({
      vendor: newPoVendor,
      vendorId: contacts.find(c => c.name === newPoVendor)?.id || 'VEND-001',
      items: [{ productId: prod.id, productName: prod.name, qty: Number(newPoQty), unitPrice: prod.purchasePrice, taxRate: prod.taxRate, subtotal }],
      subtotal,
      tax,
      total: subtotal + tax
    });
    setActiveModal(null);
    navigate('/purchase/orders');
  };

  const handleCreateContact = (e) => {
    e.preventDefault();
    addContact({
      name: newContactName,
      type: newContactType,
      email: newContactEmail,
      phone: newContactPhone,
      address: '101 Commercial Street',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001'
    });
    setActiveModal(null);
    navigate('/contacts');
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    addProduct({
      name: newProdName,
      salesPrice: Number(newProdPrice),
      purchasePrice: Math.round(Number(newProdPrice) * 0.65),
      category: newProdCategory,
      type: 'Goods',
      taxRate: 18,
      sku: `FURN-${newProdName.slice(0, 3).toUpperCase()}-099`,
      description: 'Newly added urban furniture inventory item.'
    });
    setActiveModal(null);
    navigate('/products');
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* 1. Integrated Business Workflow Banner */}
      <WorkflowBanner activeStep="dashboard" />

      {/* 2. Hero Card Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
            Good morning, {user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here's your real-time accounting overview for <span className="font-semibold text-purple-900">Urban Furniture</span>.
          </p>
        </div>

        {/* Hero Actions (Primary: + New Sales Order, Secondary: + New PO, Register Payment) */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Button variant="primary" size="md" icon={PlusCircle} onClick={() => setActiveModal('so')}>
            + New Sales Order
          </Button>
          <Button variant="secondary" size="md" icon={PlusCircle} onClick={() => setActiveModal('po')}>
            + New PO
          </Button>
          <Button variant="secondary" size="md" icon={CreditCard} onClick={() => navigate('/sales/invoices')}>
            Register Payment
          </Button>
        </div>
      </div>

      {/* 3. Financial KPI Section (6 Cards with Embedded SVG Sparklines) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-w-0">
        <StatCard
          title="Total Sales"
          value="₹12,45,000"
          change="12.5%"
          isPositive={true}
          comparisonText="vs last month"
          icon={TrendingUp}
          color="purple"
          sparklineData={[40, 55, 45, 70, 65, 90]}
        />
        <StatCard
          title="Total Purchases"
          value="₹7,82,000"
          change="8.2%"
          isPositive={true}
          comparisonText="vs last month"
          icon={ShoppingCart}
          color="amber"
          sparklineData={[30, 40, 50, 45, 60, 75]}
        />
        <StatCard
          title="Receivables"
          value="₹3,45,000"
          change="Debtors"
          isPositive={null}
          comparisonText="Accounts Receivable"
          icon={ArrowUpRight}
          color="blue"
          sparklineData={[50, 40, 65, 55, 70, 60]}
        />
        <StatCard
          title="Payables"
          value="₹2,18,000"
          change="Creditors"
          isPositive={null}
          comparisonText="Accounts Payable"
          icon={ArrowDownRight}
          color="rose"
          sparklineData={[40, 60, 45, 35, 50, 40]}
        />
        <StatCard
          title="Net Profit"
          value="₹2,63,000"
          change="21.1%"
          isPositive={true}
          comparisonText="Net Margin"
          icon={DollarSign}
          color="emerald"
          sparklineData={[25, 35, 55, 60, 75, 95]}
        />
        <StatCard
          title="Cash & Bank"
          value="₹5,72,000"
          change="Liquid"
          isPositive={true}
          comparisonText="Total Liquidity"
          icon={Wallet}
          color="teal"
          sparklineData={[60, 65, 70, 75, 80, 88]}
        />
      </div>

      {/* 4. Financial Charts Section (Sales vs Purchases ~65% / Revenue Breakdown ~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Sales vs Purchases Bar Chart */}
        <Card title="Sales vs Purchases" subtitle="Monthly financial performance comparison (Jan - Jun)" className="lg:col-span-2 min-w-0">
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesVsPurchasesData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']} />
                <Legend />
                <Bar dataKey="Sales" fill="#4c1d95" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Purchases" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Breakdown Donut Chart with Center Total */}
        <Card title="Revenue Breakdown" subtitle="By product category" className="min-w-0">
          <div className="h-72 w-full flex flex-col items-center justify-between min-w-0">
            <div className="relative w-full h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={54} outerRadius={76} paddingAngle={4}>
                    {revenueBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
              {/* Donut Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
                <span className="text-base font-extrabold text-slate-900">₹12,45,000</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-[11px] border-t border-slate-100 pt-2 min-w-0">
              {revenueBreakdownData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Accounting Health & Insight Banner (Requirement 18) */}
      <Card title="Accounting Health & Financial Position" subtitle="Real-time liquidity and budget utilization indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
            <span className="text-slate-500 font-medium block">Total Receivables</span>
            <span className="text-lg font-bold text-purple-900 block mt-0.5">₹3,45,000</span>
            <span className="text-[10px] text-purple-700 font-semibold">Debtors Outstanding</span>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
            <span className="text-slate-500 font-medium block">Total Payables</span>
            <span className="text-lg font-bold text-amber-900 block mt-0.5">₹2,18,000</span>
            <span className="text-[10px] text-amber-700 font-semibold">Creditors Outstanding</span>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <span className="text-slate-500 font-medium block">Net Position</span>
            <span className="text-lg font-bold text-emerald-900 block mt-0.5">₹1,27,000</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Receivables - Payables</span>
          </div>

          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 font-medium">Budget Utilization</span>
              <span className="font-bold text-teal-800">72%</span>
            </div>
            <div className="w-full h-2 bg-teal-200/60 rounded-full overflow-hidden my-1.5">
              <div className="h-full bg-teal-600 rounded-full w-[72%]" />
            </div>
            <span className="text-[10px] text-teal-700 font-semibold">₹3,60,000 spent of ₹5,00,000</span>
          </div>
        </div>
      </Card>

      {/* 6. Quick Operations & Live Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Quick Actions Panel */}
        <Card title="Quick Operations" subtitle="One-click forms & transactions" className="lg:col-span-1 min-w-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveModal('so')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50 hover:border-purple-200 text-slate-800 transition-all text-xs font-semibold gap-1.5"
            >
              <ShoppingBag className="w-5 h-5 text-purple-700" />
              <span>+ Sales Order</span>
            </button>
            <button
              onClick={() => setActiveModal('po')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-amber-50 hover:border-amber-200 text-slate-800 transition-all text-xs font-semibold gap-1.5"
            >
              <ShoppingCart className="w-5 h-5 text-amber-700" />
              <span>+ PO Order</span>
            </button>
            <button
              onClick={() => navigate('/sales/orders')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 text-slate-800 transition-all text-xs font-semibold gap-1.5"
            >
              <FileText className="w-5 h-5 text-blue-700" />
              <span>+ Invoice</span>
            </button>
            <button
              onClick={() => navigate('/purchase/orders')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-teal-50 hover:border-teal-200 text-slate-800 transition-all text-xs font-semibold gap-1.5"
            >
              <FileText className="w-5 h-5 text-teal-700" />
              <span>+ Vendor Bill</span>
            </button>
            <button
              onClick={() => navigate('/sales/invoices')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-800 transition-all text-xs font-semibold gap-1.5"
            >
              <CreditCard className="w-5 h-5 text-emerald-700" />
              <span>Register Payment</span>
            </button>
            <button
              onClick={() => setActiveModal('contact')}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-800 transition-all text-xs font-semibold gap-1.5"
            >
              <UserPlus className="w-5 h-5 text-indigo-700" />
              <span>+ New Contact</span>
            </button>
          </div>
        </Card>

        {/* Live Activity Feed */}
        <Card title="Recent Business Activity" subtitle="Real-time operational audit log" className="lg:col-span-2 min-w-0">
          <div className="space-y-3">
            {recentActivity.map((act, idx) => {
              const Icon = act.icon;
              return (
                <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-3 text-xs">
                  <div className={`p-2 rounded-lg bg-white border border-slate-200 ${act.color} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 truncate">{act.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{act.time}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 truncate">{act.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* 7. Cash Flow Area Chart & Recent Transactions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        <Card title="Cash Flow Liquidity" subtitle="Cash In vs Cash Out" className="min-w-0">
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                <Area type="monotone" dataKey="CashIn" stroke="#059669" fill="#ecfdf5" fillOpacity={0.6} />
                <Area type="monotone" dataKey="CashOut" stroke="#e11d48" fill="#fff1f2" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Transactions Table */}
        <Card
          title="Recent Transactions Ledger"
          subtitle="Latest business orders and bills"
          className="lg:col-span-2 min-w-0"
          headerAction={
            <Button variant="ghost" size="sm" onClick={() => navigate('/sales/orders')}>
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          }
        >
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Reference</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Contact</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 font-mono whitespace-nowrap">{tx.date}</td>
                    <td className="py-2.5 px-3 font-bold text-purple-900 font-mono whitespace-nowrap">{tx.ref}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">{tx.contact}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'Sales' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900 text-right whitespace-nowrap font-mono">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* QUICK ACTION MODALS */}
      <Modal isOpen={activeModal === 'so'} onClose={() => setActiveModal(null)} title="+ Create New Sales Order">
        <form onSubmit={handleCreateSO} className="space-y-4">
          <Select
            label="Customer"
            required
            value={newSoCustomer}
            onChange={(e) => setNewSoCustomer(e.target.value)}
            options={contacts.filter(c => c.type !== 'Vendor').map(c => ({ label: c.name, value: c.name }))}
          />
          <Select
            label="Product"
            required
            value={newSoProduct}
            onChange={(e) => setNewSoProduct(e.target.value)}
            options={products.map(p => ({ label: `${p.name} (Sales: ₹${p.salesPrice.toLocaleString('en-IN')})`, value: p.id }))}
          />
          <Input
            label="Quantity"
            type="number"
            min="1"
            required
            value={newSoQty}
            onChange={(e) => setNewSoQty(e.target.value)}
          />
          <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 border border-purple-100">
            <p className="font-bold">Workflow Progression:</p>
            <p>Creating this SO will allow 1-click generation of Customer Invoice & Journal Entries.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Sales Order</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'po'} onClose={() => setActiveModal(null)} title="+ Create New Purchase Order">
        <form onSubmit={handleCreatePO} className="space-y-4">
          <Select
            label="Vendor"
            required
            value={newPoVendor}
            onChange={(e) => setNewPoVendor(e.target.value)}
            options={contacts.filter(c => c.type !== 'Customer').map(c => ({ label: c.name, value: c.name }))}
          />
          <Select
            label="Product"
            required
            value={newPoProduct}
            onChange={(e) => setNewPoProduct(e.target.value)}
            options={products.map(p => ({ label: `${p.name} (Cost: ₹${p.purchasePrice.toLocaleString('en-IN')})`, value: p.id }))}
          />
          <Input
            label="Quantity"
            type="number"
            min="1"
            required
            value={newPoQty}
            onChange={(e) => setNewPoQty(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button type="submit" variant="teal">Confirm Purchase Order</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'contact'} onClose={() => setActiveModal(null)} title="+ Add New Contact">
        <form onSubmit={handleCreateContact} className="space-y-4">
          <Input label="Name" required value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="Aarav Sharma" />
          <Select label="Type" value={newContactType} onChange={(e) => setNewContactType(e.target.value)} options={['Customer', 'Vendor', 'Both']} />
          <Input label="Email" type="email" required value={newContactEmail} onChange={(e) => setNewContactEmail(e.target.value)} placeholder="aarav@example.com" />
          <Input label="Phone" required value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} placeholder="+91 98765 43210" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Contact</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={activeModal === 'product'} onClose={() => setActiveModal(null)} title="+ Add New Product">
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input label="Product Name" required value={newProdName} onChange={(e) => setNewProdName(e.target.value)} placeholder="Ergonomic Workstation Desk" />
          <Input label="Sales Price (₹)" type="number" required value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} />
          <Select label="Category" value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} options={['Office Furniture', 'Home Furniture', 'Services']} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
