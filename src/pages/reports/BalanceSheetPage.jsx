import React, { useState, useEffect } from 'react';
import { reportsService } from '../../services';
import { PageHeader, Card, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Printer, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

export const BalanceSheetPage = () => {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await reportsService.getBalanceSheet({ asOfDate });
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load Balance Sheet');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [asOfDate]);

  const handlePrint = () => window.print();

  if (loading) return <div className="p-8 text-center text-gray-500">Generating report from General Ledger...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center text-gray-500">No data available.</div>;

  const { totalAssets = 0, totalLiabilities = 0, totalCapital = 0, assets = [], liabilities = [], capital = [], isBalanced = false } = data;

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="reports" />

      <PageHeader
        title="Balance Sheet — Financial Position"
        subtitle="Urban Furniture Statement of Assets, Liabilities, and Equity Capital."
        breadcrumbs={['Dashboard', 'Reports', 'Balance Sheet']}
        actions={
          <div className="flex items-center gap-2 no-print">
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500">As of:</span>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="border-none outline-none text-xs font-semibold text-gray-900"
              />
            </div>
            <Button variant="secondary" icon={Printer} onClick={handlePrint}>
              Print Report
            </Button>
          </div>
        }
      />

      <div className={`p-4 rounded-xl border flex items-center gap-3 ${isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
        {isBalanced ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        <div>
          <h3 className="font-bold text-sm">{isBalanced ? 'Balance Sheet is perfectly balanced' : 'Accounting Equation Mismatch'}</h3>
          <p className="text-xs mt-0.5">Assets (₹{totalAssets.toLocaleString('en-IN')}) {isBalanced ? '=' : '≠'} Liabilities + Capital (₹{(totalLiabilities + totalCapital).toLocaleString('en-IN')})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="ASSETS (Current & Fixed Assets)" className="border-t-4 border-t-purple-800">
          <div className="space-y-3">
            {assets.length === 0 && <p className="text-xs text-gray-400">No assets recorded.</p>}
            {assets.map((a) => (
              <div key={a.code} className="flex justify-between py-2 border-b border-gray-100 text-xs">
                <div>
                  <span className="font-semibold text-gray-900">{a.name}</span>
                  <span className="text-[10px] text-gray-400 block font-mono">Code: {a.code}</span>
                </div>
                <span className="font-bold text-gray-900">₹{a.balance.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="pt-3 border-t-2 border-gray-900 flex justify-between items-center text-sm font-bold text-purple-900">
              <span>TOTAL ASSETS:</span>
              <span>₹{totalAssets.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="LIABILITIES (Current & Long-Term)" className="border-t-4 border-t-rose-600">
            <div className="space-y-3">
              {liabilities.length === 0 && <p className="text-xs text-gray-400">No liabilities recorded.</p>}
              {liabilities.map((l) => (
                <div key={l.code} className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <div>
                    <span className="font-semibold text-gray-900">{l.name}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">Code: {l.code}</span>
                  </div>
                  <span className="font-bold text-gray-900">₹{l.balance.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="pt-3 border-t-2 border-gray-900 flex justify-between items-center text-sm font-bold text-rose-700">
                <span>TOTAL LIABILITIES:</span>
                <span>₹{totalLiabilities.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Card>

          <Card title="CAPITAL & EQUITY" className="border-t-4 border-t-teal-600">
            <div className="space-y-3">
              {capital.length === 0 && <p className="text-xs text-gray-400">No capital recorded.</p>}
              {capital.map((c) => (
                <div key={c.code} className="flex justify-between py-2 border-b border-gray-100 text-xs">
                  <div>
                    <span className="font-semibold text-gray-900">{c.name}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">Code: {c.code}</span>
                  </div>
                  <span className="font-bold text-gray-900">₹{c.balance.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="pt-3 border-t-2 border-gray-900 flex justify-between items-center text-sm font-bold text-teal-800">
                <span>TOTAL LIABILITIES & CAPITAL:</span>
                <span>₹{(totalLiabilities + totalCapital).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
