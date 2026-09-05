import React from 'react';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { BookOpen, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const JournalsPage = () => {
  const navigate = useNavigate();
  const journals = useStore((state) => state.journals);

  const columns = [
    {
      header: 'Journal Name',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{r.name}</p>
            <p className="text-xs text-gray-400 font-mono">Code: {r.code}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      cell: (r) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
          {r.type}
        </span>
      )
    },
    { header: 'Default Account', accessor: 'defaultAccount' },
    { header: 'Last Entry Date', accessor: 'lastEntry' },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      cell: (r) => (
        <Button size="sm" variant="ghost" onClick={() => navigate('/accounting/journal-entries')}>
          View Entries <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="master" />

      <PageHeader
        title="Journals Master Registry"
        subtitle="Operational accounting journals (Sales, Purchase, Bank, Cash)."
        breadcrumbs={['Dashboard', 'Accounting', 'Journals']}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => alert('Journals configured for Urban Furniture.')}>
            + Create Journal
          </Button>
        }
      />

      <Card>
        <Table columns={columns} data={journals} />
      </Card>
    </div>
  );
};
