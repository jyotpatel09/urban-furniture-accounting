import React from 'react';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Target, Plus } from 'lucide-react';

export const AnalyticAccountsPage = () => {
  const analyticAccounts = useStore((state) => state.analyticAccounts);

  const columns = [
    {
      header: 'Analytic Account Name',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{r.name}</p>
            <p className="text-xs text-gray-400 font-mono">Code: {r.code}</p>
          </div>
        </div>
      )
    },
    { header: 'Responsible Lead', accessor: 'responsible' },
    { header: 'Company Unit', accessor: 'company' },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="entries" />

      <PageHeader
        title="Analytic Accounts & Cost Centers"
        subtitle="Track revenue and expenses by project, department, or business unit for Urban Furniture."
        breadcrumbs={['Dashboard', 'Accounting', 'Analytic Accounts']}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => alert('Analytic Accounts created.')}>
            + Add Analytic Account
          </Button>
        }
      />

      <Card>
        <Table columns={columns} data={analyticAccounts} />
      </Card>
    </div>
  );
};
