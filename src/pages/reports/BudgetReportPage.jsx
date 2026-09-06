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

  const formattedBudgets = budgets.map(b => ({
    ...b,
    actualSpend: Number(b.achievedAmount || 0),
    plannedAmt: Number(b.plannedAmount || 0),
    varianceAmt: Number(b.variance || (Number(b.plannedAmount || 0) - Number(b.achievedAmount || 0))),
    utilPct: Number(b.utilization || 0),
    analyticName: b.analyticAccount?.name || b.analyticAccountId || 'General'
  }));

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
    { header: 'Analytic Account', accessor: 'analyticName' },
    {
      header: 'Planned Amount (₹)',
      cell: (r) => <span className="font-bold text-gray-900">₹{r.plannedAmt.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Actual Spend (₹)',
      cell: (r) => <span className="font-bold text-purple-900">₹{r.actualSpend.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Variance (₹)',
      cell: (r) => (
        <span className={`font-bold ${r.varianceAmt >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
          ₹{r.varianceAmt.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Utilization',
      cell: (r) => (
        <span className={`font-bold px-2 py-0.5 rounded text-xs ${
          r.utilPct > 80 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
        }`}>
          {r.utilPct}%
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
        <Table columns={columns} data={formattedBudgets} emptyMessage="No budgets defined." />
      </Card>
    </div>
  );
};
