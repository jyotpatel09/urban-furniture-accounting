import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { PageHeader, Card, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { Printer, Download, Calendar, CheckCircle } from 'lucide-react';

export const BalanceSheetPage = () => {
  const accounts = useStore((state) => state.chartOfAccounts);
  const [asOfDate, setAsOfDate] = useState('2026-09-05');

  const assets = accounts.filter(a => a.category === 'ASSETS');
  const liabilities = accounts.filter(a => a.category === 'LIABILITIES');
  const capital = accounts.filter(a => a.category === 'CAPITAL');

  const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
  const totalCapital = capital.reduce((sum, a) => sum + a.balance, 0);

  const handlePrint = () => {
    window.print();
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASSETS SECTION */}
        <Card title="ASSETS (Current & Fixed Assets)" className="border-t-4 border-t-purple-800">
          <div className="space-y-3">
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

        {/* LIABILITIES & CAPITAL SECTION */}
        <div className="space-y-6">
          <Card title="LIABILITIES (Current & Long-Term)" className="border-t-4 border-t-rose-600">
            <div className="space-y-3">
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
