import React from 'react';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Percent, Plus } from 'lucide-react';

export const TaxesPage = () => {
  const taxes = useStore((state) => state.taxes);

  const columns = [
    {
      header: 'Tax Name',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Percent className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900">{r.name}</span>
        </div>
      )
    },
    {
      header: 'Tax Rate %',
      cell: (r) => <span className="font-bold text-purple-900">{r.rate}%</span>
    },
    { header: 'Type', accessor: 'type' },
    { header: 'Linked Account', accessor: 'account' },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="entries" />

      <PageHeader
        title="GST Tax Rates Configuration"
        subtitle="Indian Goods and Services Tax (GST 5%, 12%, 18%) tax brackets."
        breadcrumbs={['Dashboard', 'Accounting', 'Taxes']}
        actions={
          <Button variant="teal" icon={Plus} onClick={() => alert('GST rates configured.')}>
            Add Tax Rate
          </Button>
        }
      />

      <Card>
        <Table columns={columns} data={taxes} />
      </Card>
    </div>
  );
};
