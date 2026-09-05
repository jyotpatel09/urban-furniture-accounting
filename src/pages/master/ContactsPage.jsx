import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Modal, Input, Select, Avatar } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Plus, Search, Filter, Eye, Edit3, Trash2, Mail, Phone, MapPin } from 'lucide-react';

export const ContactsPage = () => {
  const navigate = useNavigate();
  const contacts = useStore((state) => state.contacts);
  const addContact = useStore((state) => state.addContact);
  const deleteContact = useStore((state) => state.deleteContact);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Customer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setStateName] = useState('Gujarat');
  const [pincode, setPincode] = useState('380001');

  const filtered = contacts.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.email.toLowerCase().includes(search.toLowerCase()) || 
                          c.city.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || c.type === typeFilter || c.type === 'Both';
    return matchesSearch && matchesType;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    addContact({ name, type, email, phone, address, city, state, pincode });
    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  const columns = [
    {
      header: 'Contact Name',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} src={r.avatar} />
          <div>
            <p className="font-semibold text-gray-900">{r.name}</p>
            <p className="text-xs text-gray-400 font-mono">{r.id}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      cell: (r) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          r.type === 'Customer' ? 'bg-purple-100 text-purple-800' : r.type === 'Vendor' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
        }`}>
          {r.type}
        </span>
      )
    },
    {
      header: 'Email / Phone',
      cell: (r) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-gray-700">
            <Mail className="w-3 h-3 text-gray-400" /> {r.email}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Phone className="w-3 h-3 text-gray-400" /> {r.phone}
          </div>
        </div>
      )
    },
    {
      header: 'City / Location',
      cell: (r) => (
        <div className="text-xs text-gray-700 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          {r.city}, {r.state}
        </div>
      )
    },
    {
      header: 'Outstanding (₹)',
      cell: (r) => (
        <span className="font-semibold text-gray-900">
          ₹{(r.outstanding || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Status',
      cell: (r) => <StatusBadge status={r.status || 'Active'} />
    },
    {
      header: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/contacts/${r.id}`)}
            className="p-1.5 rounded hover:bg-purple-100 text-purple-900 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteContact(r.id)}
            className="p-1.5 rounded hover:bg-rose-100 text-rose-600 transition-colors"
            title="Archive Contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="master" />

      <PageHeader
        title="Contacts & Master Parties"
        subtitle="Manage Urban Furniture customers, vendors, and business partners."
        breadcrumbs={['Dashboard', 'Master Data', 'Contacts']}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Add New Contact
          </Button>
        }
      />

      <Card>
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contact by name, email, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {['All', 'Customer', 'Vendor', 'Both'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-purple-900 text-white border-purple-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {t} {t === 'All' ? `(${contacts.length})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Table */}
        <Table
          columns={columns}
          data={filtered}
          onRowClick={(row) => navigate(`/contacts/${row.id}`)}
          emptyMessage="No contacts found."
        />
      </Card>

      {/* Add Contact Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="+ Create Contact Record">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name / Company" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nimesh Pathak" />
            <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} options={['Customer', 'Vendor', 'Both']} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email Address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" />
            <Input label="Mobile / Phone" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98250 00000" />
          </div>
          <Input label="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="101 Commercial Hub, SG Highway" />
          <div className="grid grid-cols-3 gap-3">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ahmedabad" />
            <Input label="State" value={state} onChange={(e) => setStateName(e.target.value)} placeholder="Gujarat" />
            <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="380054" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Contact</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
