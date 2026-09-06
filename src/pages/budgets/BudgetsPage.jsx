import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Table, StatusBadge, Button, Modal, Input, StatCard } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { PieChart, Plus, Eye, Target } from 'lucide-react';

// Normalize budget from backend
function normalizeBudget(b) {
  return {
    ...b,
    analyticAccount: b.analyticAccount?.name || b.analyticAccountName || '—',
    plannedAmount: Number(b.plannedAmount || 0),
    achievedAmount: Number(b.achievedAmount || b.actualAmount || 0),
    remainingAmount: Number(b.remainingAmount || 0),
    utilization: Number(b.utilization || 0),
    status: b.status || 'Active',
  };
}

export const BudgetsPage = () => {
  const navigate = useNavigate();
  const rawBudgets = useStore((state) => state.budgets);
  const addBudget = useStore((state) => state.addBudget);
  const analyticAccounts = useStore((state) => state.analyticAccounts);
  const fetchBudgets = useStore((state) => state.fetchBudgets);
  const fetchAnalyticAccounts = useStore((state) => state.fetchAnalyticAccounts);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State — use analyticAccountId (UUID), periodStart/periodEnd dates
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('FY 2026-27');
  const [responsible, setResponsible] = useState('Admin User');
  const [analyticAccountId, setAnalyticAccountId] = useState('');
  const [plannedAmount, setPlannedAmount] = useState(500000);
  const [periodStart, setPeriodStart] = useState(new Date().toISOString().split('T')[0]);
  const [periodEnd, setPeriodEnd] = useState(
    new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split('T')[0]
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBudgets(),
      fetchAnalyticAccounts ? fetchAnalyticAccounts() : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [fetchBudgets, fetchAnalyticAccounts]);

  useEffect(() => {
    if (!analyticAccountId && analyticAccounts.length > 0) {
      setAnalyticAccountId(analyticAccounts[0].id);
    }
  }, [analyticAccounts, analyticAccountId]);

  const budgets = (Array.isArray(rawBudgets) ? rawBudgets : []).map(normalizeBudget);

  const totalPlanned = budgets.reduce((acc, b) => acc + b.plannedAmount, 0);
  const totalActual = budgets.reduce((acc, b) => acc + b.achievedAmount, 0);
  const totalRemaining = budgets.reduce((acc, b) => acc + b.remainingAmount, 0);
  const overallUtilization = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) { setFormError('Budget name is required.'); return; }
    if (!analyticAccountId) { setFormError('Please select an analytic account.'); return; }
    if (!periodStart || !periodEnd) { setFormError('Period start and end dates are required.'); return; }
    if (new Date(periodStart) >= new Date(periodEnd)) { setFormError('Period start must be before period end.'); return; }
    if (Number(plannedAmount) <= 0) { setFormError('Planned amount must be greater than 0.'); return; }

    setSubmitting(true);
    try {
      await addBudget({
        name: name.trim(),
        period,
        responsible,
        analyticAccountId,
        plannedAmount: Number(plannedAmount),
        periodStart,
        periodEnd,
      });
      setIsAddModalOpen(false);
      setName('');
      setFormError('');
    } catch (err) {
      console.error('Create budget error:', err);
      setFormError(err.message || 'Failed to create budget. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
    { header: 'Analytic Account', cell: (r) => r.analyticAccount },
    {
      header: 'Planned (₹)',
      cell: (r) => <span className="font-bold text-gray-900">₹{r.plannedAmount.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Actual Spend (₹)',
      cell: (r) => <span className="font-bold text-purple-900">₹{r.achievedAmount.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Utilization',
      cell: (r) => (
        <div className="w-36">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="font-semibold text-gray-700">{r.utilization}%</span>
            <span className="text-gray-400">₹{r.remainingAmount.toLocaleString('en-IN')} left</span>
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
        {loading ? (
          <div className="py-12 text-center text-gray-500 text-sm">Loading budgets from database...</div>
        ) : budgets.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No budgets found. Create one to get started.</div>
        ) : (
          <Table columns={columns} data={budgets} onRowClick={(row) => navigate(`/budgets/${row.id}`)} />
        )}
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setFormError(''); }} title="+ Create Expenditure Budget">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">{formError}</div>
          )}

          <Input label="Budget Name *" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Showroom Renovation Budget" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Budget Period Label" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="FY 2026-27" />
            <Input label="Responsible Person" value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Admin User" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Period Start *</label>
              <input
                type="date"
                required
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Period End *</label>
              <input
                type="date"
                required
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Analytic Account *</label>
            <select
              required
              value={analyticAccountId}
              onChange={(e) => setAnalyticAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-800"
            >
              <option value="">— Select Analytic Account —</option>
              {analyticAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} {a.code ? `(${a.code})` : ''}</option>
              ))}
            </select>
            {analyticAccounts.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No analytic accounts found. Please create one first under Accounting → Analytic Accounts.</p>
            )}
          </div>

          <Input label="Planned Amount (₹) *" type="number" min="1" required value={plannedAmount} onChange={(e) => setPlannedAmount(e.target.value)} />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsAddModalOpen(false); setFormError(''); }}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
