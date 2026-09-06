import React, { useState, useEffect } from 'react';
import { reportsService } from '../../services';
import { PageHeader, Card, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Printer, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ProfitLossPage = () => {
  const [period, setPeriod] = useState('YTD');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        // We request a wide date range to ensure demo data is captured
        const params = { startDate: '2026-01-01', endDate: '2026-12-31' };
        const res = await reportsService.getProfitLoss(params);
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load Profit & Loss report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [period]);

  const handlePrint = () => window.print();

  if (loading) return <div className="p-8 text-center text-gray-500">Generating report from General Ledger...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center text-gray-500">No data available.</div>;

  const { totalIncome = 0, totalExpenses = 0, netProfit = 0, incomeBreakdown = [], expenseBreakdown = [] } = data;

  const chartData = [
    { category: 'Operating Income', Amount: totalIncome },
    { category: 'Expenses & COGS', Amount: totalExpenses },
    { category: 'Net Profit', Amount: netProfit }
  ];

  const netMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="reports" />

      <PageHeader
        title="Profit & Loss Statement (P&L)"
        subtitle="Urban Furniture Revenue, Operating Expenses, and Net Profit Margin."
        breadcrumbs={['Dashboard', 'Reports', 'Profit & Loss']}
        actions={
          <div className="flex items-center gap-2 no-print">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              <option value="YTD">FY 2026 (YTD)</option>
            </select>
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>
              Print P&L
            </Button>
          </div>
        }
      />

      <div className="bg-gradient-to-r from-purple-900 to-teal-800 text-white rounded-xl p-6 shadow-md flex justify-between items-center">
        <div>
          <span className="text-xs uppercase font-bold text-teal-300 tracking-wider">Net Operating Profit ({period})</span>
          <h2 className="text-3xl font-bold mt-1">₹{netProfit.toLocaleString('en-IN')}</h2>
          <p className="text-xs text-purple-200 mt-1">Net Margin: {netMargin}%</p>
        </div>
        <div className="p-3 bg-white/10 rounded-xl">
          <TrendingUp className="w-8 h-8 text-teal-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="INCOME & REVENUE" className="border-t-4 border-t-purple-800">
          <div className="space-y-3">
            {incomeBreakdown.length === 0 && <p className="text-xs text-gray-400">No income recorded in this period.</p>}
            {incomeBreakdown.map((i) => (
              <div key={i.code} className="flex justify-between py-2 border-b border-gray-100 text-xs">
                <div>
                  <span className="font-semibold text-gray-900">{i.name}</span>
                  <span className="text-[10px] text-gray-400 block font-mono">Code: {i.code}</span>
                </div>
                <span className="font-bold text-gray-900">₹{i.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="pt-3 border-t-2 border-gray-900 flex justify-between items-center text-sm font-bold text-purple-900">
              <span>TOTAL REVENUE:</span>
              <span>₹{totalIncome.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        <Card title="EXPENSES & COGS" className="border-t-4 border-t-amber-600">
          <div className="space-y-3">
            {expenseBreakdown.length === 0 && <p className="text-xs text-gray-400">No expenses recorded in this period.</p>}
            {expenseBreakdown.map((e) => (
              <div key={e.code} className="flex justify-between py-2 border-b border-gray-100 text-xs">
                <div>
                  <span className="font-semibold text-gray-900">{e.name}</span>
                  <span className="text-[10px] text-gray-400 block font-mono">Code: {e.code}</span>
                </div>
                <span className="font-bold text-gray-900">₹{e.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="pt-3 border-t-2 border-gray-900 flex justify-between items-center text-sm font-bold text-amber-900">
              <span>TOTAL EXPENSES:</span>
              <span>₹{totalExpenses.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Income vs Expense Visual Summary">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
              <Bar dataKey="Amount" fill="#714b67" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
