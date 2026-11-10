import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, ShieldCheck, Download, RefreshCw, Terminal, FileText, Check } from 'lucide-react';
import { RebootVerificationReport } from '../types';
import { TerminalView } from '../components/TerminalView';

interface VerificationPageProps {
  data: RebootVerificationReport;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ data, onRefresh, isRefreshing }) => {
  const [selectedServer, setSelectedServer] = useState<'all' | 'server1' | 'server2'>('all');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [inspectCheck, setInspectCheck] = useState<any | null>(null);

  const displayedChecks = data.checks.filter(
    (c) => selectedServer === 'all' || c.server === selectedServer
  );

  const handleDownloadReport = () => {
    const reportData = {
      project: "LINUXPULSE - Enterprise Linux Infrastructure Management Platform",
      objective: "RHEL 9 / 10 RHCSA Infrastructure Capstone Verification Report",
      generated_at: data.timestamp,
      overall_score: `${data.score_percentage}%`,
      status: data.status,
      summary: {
        total_checks: data.total_checks,
        passed: data.passed_checks,
        failed: data.failed_checks,
        pending: data.pending_checks,
      },
      checks: data.checks,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LINUXPULSE_Reboot_Verification_Report_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Reboot & Final Verification Checklist</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              TASK 12 (All Tasks Audit)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end post-reboot validation across all 12 tasks on server1 and server2
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadReport}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            {downloadSuccess ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
            <span>{downloadSuccess ? 'Report Downloaded!' : 'Download Official Report (JSON)'}</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>Audit All</span>
          </button>
        </div>
      </div>

      {/* Audit Score & Statistics Card */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-1 border-r border-slate-800/80 pr-6">
            <span className="text-xs text-slate-400 font-semibold uppercase">Reboot Validation Score</span>
            <div className="text-4xl font-extrabold text-emerald-400 font-mono mt-1">
              {data.score_percentage}%
            </div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {data.status}
            </span>
          </div>

          <div className="md:col-span-3 grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> Passed Checks
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{data.passed_checks}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center">
                <XCircle className="w-4 h-4 text-rose-400 mr-1.5" /> Failed Checks
              </span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{data.failed_checks}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center">
                <Clock className="w-4 h-4 text-amber-400 mr-1.5" /> Pending Checks
              </span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{data.pending_checks}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setSelectedServer('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedServer === 'all'
              ? 'bg-sky-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Checks ({data.total_checks})
        </button>
        <button
          onClick={() => setSelectedServer('server1')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedServer === 'server1'
              ? 'bg-sky-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Server 1 (Storage & Web)
        </button>
        <button
          onClick={() => setSelectedServer('server2')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedServer === 'server2'
              ? 'bg-sky-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Server 2 (Client & Podman)
        </button>
      </div>

      {/* Checklist Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/70">
                <th className="p-3">Status</th>
                <th className="p-3">Node</th>
                <th className="p-3">Task #</th>
                <th className="p-3">Verification Item</th>
                <th className="p-3">Diagnostic Command</th>
                <th className="p-3">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedChecks.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setInspectCheck(c)}
                  className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                >
                  <td className="p-3">
                    {c.status === 'passed' && (
                      <span className="flex items-center text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" /> PASS
                      </span>
                    )}
                    {c.status === 'failed' && (
                      <span className="flex items-center text-rose-400 font-bold">
                        <XCircle className="w-4 h-4 mr-1 text-rose-400" /> FAIL
                      </span>
                    )}
                    {c.status === 'pending' && (
                      <span className="flex items-center text-amber-400 font-bold">
                        <Clock className="w-4 h-4 mr-1 text-amber-400" /> PENDING
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-white">{c.server}</td>
                  <td className="p-3 text-sky-400 font-bold">Task {c.task_num}</td>
                  <td className="p-3 text-slate-200 font-sans">{c.check_item}</td>
                  <td className="p-3 text-slate-400">{c.command_executed}</td>
                  <td className="p-3 text-indigo-300 max-w-xs truncate">{c.evidence_snippet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Inspection Terminal View */}
      {inspectCheck && (
        <TerminalView
          title={`Check Inspection: ${inspectCheck.task_name} (${inspectCheck.check_item})`}
          command={inspectCheck.command_executed}
          output={`Expected Output: ${inspectCheck.expected_output}\n\nActual Command Output:\n${inspectCheck.actual_output}\n\nVerification Status: ${inspectCheck.status.toUpperCase()}`}
          hostname={inspectCheck.server === 'server1' ? 'server1.example.com' : 'server2.example.com'}
        />
      )}
    </div>
  );
};

