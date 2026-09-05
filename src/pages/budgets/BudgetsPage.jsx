import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Modal, Input, Select, StatCard } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { PieChart, Plus, Eye, Target } from 'lucide-react';

export const BudgetsPage = () => {
  const navigate = useNavigate();
  const budgets = useStore((state) => state.budgets);
  const addBudget = useStore((state) => state.addBudget);
  const analyticAccounts = useStore((state) => state.analyticAccounts);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('September 2026');
  const [responsible, setResponsible] = useState('Admin');
  const [analyticAccount, setAnalyticAccount] = useState('Furniture Operations');
  const [plannedAmount, setPlannedAmount] = useState(500000);

  const handleCreate = (e) => {
    e.preventDefault();
    addBudget({
      name,
      period,
      responsible,
      analyticAccount,
      plannedAmount: Number(plannedAmount)
    });
    setIsAddModalOpen(false);
  };

  const totalPlanned = budgets.reduce((acc, b) => acc + (b.plannedAmount || 0), 0);
  const totalActual = budgets.reduce((acc, b) => acc + (b.actualAmount || 0), 0);
  const totalRemaining = totalPlanned - totalActual;
  const overallUtilization = Math.round((totalActual / totalPlanned) * 100) || 0;

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
      header: 'Planned (₹)',
      cell: (r) => <span className="font-bold text-gray-900">₹{r.plannedAmount.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Actual Spend (₹)',
      cell: (r) => <span className="font-bold text-purple-900">₹{r.actualAmount.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Utilization',
      cell: (r) => (
        <div className="w-36">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="font-semibold text-gray-700">{r.utilization}%</span>
            <span className="text-gray-400">₹{(r.plannedAmount - r.actualAmount).toLocaleString('en-IN')} left</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                r.utilization > 80 ? 'bg-rose-500' : r.utilization > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, r.utilization)}%` }}
            />
          </div>
        </div>
      )
    },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      cell: (r) => (
        <Button size="sm" variant="ghost" icon={Eye} onClick={() => navigate(`/budgets/${r.id}`)}>
          View
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="reports" />

      <PageHeader
        title="Budget Management & Monitoring"
        subtitle="Set planned expenditure budgets by analytic account and track actual variance."
        breadcrumbs={['Dashboard', 'Budgeting', 'Budgets']}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            + Create New Budget
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Planned Budget" value={`₹${totalPlanned.toLocaleString('en-IN')}`} color="purple" icon={PieChart} />
        <StatCard title="Total Actual Spend" value={`₹${totalActual.toLocaleString('en-IN')}`} color="amber" icon={PieChart} />
        <StatCard title="Remaining Capital" value={`₹${totalRemaining.toLocaleString('en-IN')}`} color="emerald" icon={PieChart} />
        <StatCard title="Overall Utilization" value={`${overallUtilization}%`} color="teal" icon={Target} />
      </div>

      <Card>
        <Table columns={columns} data={budgets} onRowClick={(row) => navigate(`/budgets/${row.id}`)} />
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="+ Create Expenditure Budget">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Budget Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Showroom Renovation Budget" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Budget Period" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="September 2026" />
            <Select label="Analytic Account" value={analyticAccount} onChange={(e) => setAnalyticAccount(e.target.value)} options={analyticAccounts.map(a => a.name)} />
          </div>
          <Input label="Planned Amount (₹)" type="number" required value={plannedAmount} onChange={(e) => setPlannedAmount(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Budget</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
