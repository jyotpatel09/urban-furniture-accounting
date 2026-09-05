import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Printer, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const ProfitLossPage = () => {
  const accounts = useStore((state) => state.chartOfAccounts);
  const [period, setPeriod] = useState('Q3 2026');

  const income = accounts.filter(a => a.category === 'INCOME');
  const expenses = accounts.filter(a => a.category === 'EXPENSES');

  const totalIncome = income.reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = expenses.reduce((sum, a) => sum + a.balance, 0);
  const netProfit = totalIncome - totalExpenses;

  const chartData = [
    { category: 'Operating Income', Amount: totalIncome },
    { category: 'Cost of Goods Sold & Expenses', Amount: totalExpenses },
    { category: 'Net Operating Profit', Amount: netProfit }
  ];

  const handlePrint = () => {
    window.print();
  };

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
              <option>September 2026</option>
              <option>Q3 2026</option>
              <option>FY 2026-27</option>
            </select>
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>
              Print P&L
            </Button>
          </div>
        }
      />

      {/* Net Profit Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-teal-800 text-white rounded-xl p-6 shadow-md flex justify-between items-center">
        <div>
          <span className="text-xs uppercase font-bold text-teal-300 tracking-wider">Net Operating Profit ({period})</span>
          <h2 className="text-3xl font-bold mt-1">₹{netProfit.toLocaleString('en-IN')}</h2>
          <p className="text-xs text-purple-200 mt-1">Net Margin: {Math.round((netProfit / totalIncome) * 100)}%</p>
        </div>
        <div className="p-3 bg-white/10 rounded-xl">
          <TrendingUp className="w-8 h-8 text-teal-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INCOME */}
        <Card title="INCOME & REVENUE" className="border-t-4 border-t-purple-800">
          <div className="space-y-3">
            {income.map((i) => (
              <div key={i.code} className="flex justify-between py-2 border-b border-gray-100 text-xs">
                <div>
                  <span className="font-semibold text-gray-900">{i.name}</span>
                  <span className="text-[10px] text-gray-400 block font-mono">Code: {i.code}</span>
                </div>
                <span className="font-bold text-gray-900">₹{i.balance.toLocaleString('en-IN')}</span>
              </div>
            ))}

            <div className="pt-3 border-t-2 border-gray-900 flex justify-between items-center text-sm font-bold text-purple-900">
              <span>TOTAL REVENUE:</span>
              <span>₹{totalIncome.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        {/* EXPENSES */}
        <Card title="EXPENSES & COGS" className="border-t-4 border-t-amber-600">
          <div className="space-y-3">
            {expenses.map((e) => (
              <div key={e.code} className="flex justify-between py-2 border-b border-gray-100 text-xs">
                <div>
                  <span className="font-semibold text-gray-900">{e.name}</span>
                  <span className="text-[10px] text-gray-400 block font-mono">Code: {e.code}</span>
                </div>
                <span className="font-bold text-gray-900">₹{e.balance.toLocaleString('en-IN')}</span>
              </div>
            ))}

            <div className="pt-3 border-t-2 border-gray-900 flex justify-between items-center text-sm font-bold text-amber-900">
              <span>TOTAL EXPENSES:</span>
              <span>₹{totalExpenses.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Chart Card */}
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
