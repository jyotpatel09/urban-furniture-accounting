import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { accountingService } from '../../services';
import { PageHeader, Card, StatusBadge, Button } from '../../components/common/UIComponents';
import { WorkflowBanner } from '../../components/common/WorkflowBanner';
import { ArrowLeft, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

export const JournalEntryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [je, setJe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    accountingService.getJournalEntryById(id)
      .then(data => setJe(data))
      .catch(err => {
        console.error('Failed to load journal entry:', err);
        setError(err.message || 'Failed to load journal entry.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading journal entry...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!je) return <div className="p-8 text-center text-gray-500">Journal Entry not found.</div>;

  const journalName = je.journal?.name || je.journalName || '—';
  const totalDebit = Number(je.totalDebit || 0);
  const totalCredit = Number(je.totalCredit || 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  // Backend returns lines, not items
  const lines = Array.isArray(je.lines) ? je.lines : (Array.isArray(je.items) ? je.items : []);
  const entryDate = je.date ? new Date(je.date).toLocaleDateString('en-IN') : '—';

  return (
    <div className="space-y-6">
      <WorkflowBanner activeStep="entries" />

      <PageHeader
        title={`Journal Entry ${je.number || je.id}`}
        subtitle={`Journal: ${journalName} • Reference: ${je.reference || '—'}`}
        breadcrumbs={['Dashboard', 'Journal Entries', je.number || je.id]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/accounting/journal-entries')}>
              Back to Journal Entries
            </Button>
            <Button variant="primary" icon={Layers} onClick={() => navigate('/accounting/ledger')}>
              View in General Ledger
            </Button>
          </div>
        }
      />

      {/* Balance Indicator Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between shadow-xs ${
        isBalanced
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        <div className="flex items-center gap-3">
          {isBalanced ? (
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 bg-rose-600 text-white rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-sm">
              {isBalanced ? 'Balanced Accounting Voucher' : 'Unbalanced Entry Warning'}
            </h3>
            <p className="text-xs opacity-90">
              {isBalanced
                ? 'Total Debit equals Total Credit. Conforms strictly to double-entry accounting standard.'
                : 'Debit and Credit sums do not match. Adjustment required.'}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          isBalanced ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
        }`}>
          {isBalanced ? 'BALANCED' : 'UNBALANCED'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal Lines Table */}
        <Card className="lg:col-span-2" title="Journal Line Items">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Debit (Dr ₹)</th>
                  <th className="py-3 px-4 text-right">Credit (Cr ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lines.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-gray-400 text-xs">No journal lines found.</td></tr>
                ) : lines.map((line, idx) => {
                  // Backend includes: line.account.code, line.account.name (or line.accountCode fallback)
                  const accountCode = line.account?.code || line.accountCode || '—';
                  const accountName = line.account?.name || line.accountName || '—';
                  const debit = Number(line.debit || 0);
                  const credit = Number(line.credit || 0);
                  return (
                    <tr key={line.id || idx}>
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-900">{accountCode}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-900">{accountName}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">{line.description || '—'}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-purple-900">
                        {debit > 0 ? `₹${debit.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-teal-800">
                        {credit > 0 ? `₹${credit.toLocaleString('en-IN')}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center text-sm font-bold">
            <span className="text-gray-700">Total Verification Sum:</span>
            <div className="flex gap-8">
              <span className="text-purple-900">Dr ₹{totalDebit.toLocaleString('en-IN')}</span>
              <span className="text-teal-800">Cr ₹{totalCredit.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>

        {/* Voucher Metadata */}
        <Card title="Voucher Metadata">
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-gray-400 block font-medium">Entry Number</span>
              <span className="font-mono text-sm font-bold text-purple-900">{je.number || je.id}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Journal</span>
              <span className="text-sm font-bold text-gray-900">{journalName}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Voucher Reference</span>
              <span className="font-mono text-sm font-bold text-purple-900">{je.reference || '—'}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Posting Date</span>
              <span className="font-medium text-gray-800">{entryDate}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Posting Status</span>
              <div className="mt-1"><StatusBadge status={je.status} /></div>
            </div>
            {je.sourceType && (
              <div>
                <span className="text-gray-400 block font-medium">Source</span>
                <span className="font-medium text-gray-800">{je.sourceType}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
