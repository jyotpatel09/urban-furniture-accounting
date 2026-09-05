import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Input, Select, Tabs } from '../../components/common/UIComponents';
import { Sliders, Users, ShieldCheck, Check, Save } from 'lucide-react';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const users = useStore((state) => state.users);
  const roles = useStore((state) => state.roles);

  // General Settings Form
  const [companyName, setCompanyName] = useState('Urban Furniture Pvt Ltd');
  const [industry, setIndustry] = useState('Furniture & Corporate Interiors');
  const [currency, setCurrency] = useState('INR (₹)');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [phone, setPhone] = useState('+91 79 4000 1234');
  const [email, setEmail] = useState('info@urbanfurniture.in');
  const [address, setAddress] = useState('101 Urban Tower, S.G. Highway, Ahmedabad - 380054');

  const [savedToast, setSavedToast] = useState(false);

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const userColumns = [
    {
      header: 'User Name',
      cell: (r) => (
        <div>
          <p className="font-bold text-gray-900">{r.name}</p>
          <p className="text-xs text-gray-400">{r.email}</p>
        </div>
      )
    },
    {
      header: 'Assigned Role',
      cell: (r) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900">
          {r.role}
        </span>
      )
    },
    { header: 'Last Login', accessor: 'lastLogin' },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings & Governance"
        subtitle="Manage Urban Furniture company details, user access controls, and permission matrix."
        breadcrumbs={['Dashboard', 'Settings']}
      />

      <Card>
        <Tabs
          tabs={[
            { id: 'general', label: 'General Configuration' },
            { id: 'users', label: 'Users Registry' },
            { id: 'roles', label: 'Roles & Permission Matrix' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-4 max-w-2xl">
            {savedToast && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" /> Settings saved successfully!
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Company Legal Name" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <Input label="Industry Sector" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Phone Line" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <Input label="Corporate Address" value={address} onChange={(e) => setAddress(e.target.value)} />

            <div className="grid grid-cols-2 gap-4">
              <Input label="System Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
              <Input label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" icon={Save}>
                Save Company Settings
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900">System Users ({users.length})</h3>
              <Button size="sm" variant="primary" onClick={() => alert('New user creation available in admin console.')}>
                + Add System User
              </Button>
            </div>
            <Table columns={userColumns} data={users} />
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role-Based Access Control (RBAC) Matrix</h3>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Module</th>
                    <th className="p-3">Admin</th>
                    <th className="p-3">Accountant</th>
                    <th className="p-3">Contact Portal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr>
                    <td className="p-3 font-bold text-gray-900">Master Data (Contacts, Products)</td>
                    <td className="p-3 text-emerald-700 font-bold">Read / Write / Delete</td>
                    <td className="p-3 text-emerald-700 font-medium">Read / Write</td>
                    <td className="p-3 text-gray-500">Read Self</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">Transactions (SO, PO, Bills)</td>
                    <td className="p-3 text-emerald-700 font-bold">Read / Write / Approve</td>
                    <td className="p-3 text-emerald-700 font-medium">Read / Write</td>
                    <td className="p-3 text-gray-500">Read Self & Pay</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">Accounting Entries & Ledger</td>
                    <td className="p-3 text-emerald-700 font-bold">Read / Write / Post</td>
                    <td className="p-3 text-emerald-700 font-medium">Read / Write / Post</td>
                    <td className="p-3 text-rose-500 font-semibold">No Access</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">Financial Reports & P&L</td>
                    <td className="p-3 text-emerald-700 font-bold">Full Export & Print</td>
                    <td className="p-3 text-emerald-700 font-medium">Full Export & Print</td>
                    <td className="p-3 text-rose-500 font-semibold">No Access</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">System Settings & Governance</td>
                    <td className="p-3 text-emerald-700 font-bold">Full Admin Config</td>
                    <td className="p-3 text-gray-500">Read Only</td>
                    <td className="p-3 text-rose-500 font-semibold">No Access</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
