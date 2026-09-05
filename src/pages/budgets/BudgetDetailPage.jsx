import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, StatCard, StatusBadge, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { ArrowLeft, Target, PieChart } from 'lucide-react';

export const BudgetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const budget = useStore((state) => state.budgets.find((b) => b.id === id)) || useStore((state) => state.budgets[0]);

  if (!budget) return <div className="p-8 text-center text-gray-500">Budget record not found.</div>;

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="reports" />

      <PageHeader
        title={budget.name}
        subtitle={`Period: ${budget.period} • Analytic Account: ${budget.analyticAccount}`}
        breadcrumbs={['Dashboard', 'Budgets', budget.name]}
        actions={
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/budgets')}>
            Back to Budgets
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Planned Budget" value={`₹${budget.plannedAmount.toLocaleString('en-IN')}`} color="purple" icon={PieChart} />
        <StatCard title="Actual Spend" value={`₹${budget.actualAmount.toLocaleString('en-IN')}`} color="amber" icon={PieChart} />
        <StatCard title="Remaining Balance" value={`₹${(budget.plannedAmount - budget.actualAmount).toLocaleString('en-IN')}`} color="emerald" icon={Target} />
      </div>

      <Card title="Budget Performance & Progress">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span>Utilization Rate</span>
            <span className="text-purple-900">{budget.utilization}%</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                budget.utilization > 80 ? 'bg-rose-500' : budget.utilization > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budget.utilization)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            Responsible Manager: <span className="font-semibold text-gray-800">{budget.responsible}</span>
          </p>
        </div>
      </Card>
    </div>
  );
};
