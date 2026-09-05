import React from 'react';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Printer } from 'lucide-react';

export const BudgetReportPage = () => {
  const budgets = useStore((state) => state.budgets);

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'Budget Name',
      cell: (r) => (
        <div>
          <p className="font-bold text-gray-900">{r.name}</p>
          <p className="text-xs text-gray-400">{r.period}</p>
        </div>
      )
    },
    { header: 'Analytic Account', accessor: 'analyticAccount' },
    {
      header: 'Planned Amount (₹)',
      cell: (r) => <span className="font-bold text-gray-900">₹{r.plannedAmount.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Actual Spend (₹)',
      cell: (r) => <span className="font-bold text-purple-900">₹{r.actualAmount.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Variance (₹)',
      cell: (r) => {
        const variance = r.plannedAmount - r.actualAmount;
        return (
          <span className={`font-bold ${variance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            ₹{variance.toLocaleString('en-IN')}
          </span>
        );
      }
    },
    {
      header: 'Utilization',
      cell: (r) => (
        <span className={`font-bold px-2 py-0.5 rounded text-xs ${
          r.utilization > 80 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
        }`}>
          {r.utilization}%
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="reports" />

      <PageHeader
        title="Budget Performance & Variance Report"
        subtitle="Analytical comparison of planned expenditure versus actual operational spending."
        breadcrumbs={['Dashboard', 'Reports', 'Budget Report']}
        actions={
          <Button variant="secondary" icon={Printer} onClick={handlePrint}>
            Print Report
          </Button>
        }
      />

      <Card>
        <Table columns={columns} data={budgets} />
      </Card>
    </div>
  );
};
