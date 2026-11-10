import React, { useState } from 'react';
import { PlayCircle, ShieldCheck, CheckCircle2, AlertTriangle, Terminal, Play, Lock, Clock, History } from 'lucide-react';
import { OperationResult } from '../types';
import { TerminalView } from '../components/TerminalView';
import { ConfirmModal } from '../components/ConfirmModal';
import { api } from '../services/api';

interface AutomationPageProps {
  onRefresh: () => void;
}

export const AutomationPage: React.FC<AutomationPageProps> = ({ onRefresh }) => {
  const [runningOp, setRunningOp] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<'server1' | 'server2'>('server1');
  const [history, setHistory] = useState<OperationResult[]>([]);
  const [confirmOp, setConfirmOp] = useState<any | null>(null);

  const operations = [
    {
      id: 'health-check',
      title: 'Run Cluster Health Diagnostic',
      desc: 'Runs hostnamectl, ip -br a, and checks for failed systemctl units.',
      destructive: false,
      server: 'server1',
    },
    {
      id: 'verify-nfs',
      title: 'Audit NFS Exports & Mounts',
      desc: 'Checks exportfs on server1 and verifies autofs mount status.',
      destructive: false,
      server: 'server1',
    },
    {
      id: 'verify-apache',
      title: 'Verify Apache Port 82 & HTTP Headers',
      desc: 'Performs curl -s -I check and verifies VirtualHost syntax.',
      destructive: false,
      server: 'server1',
    },
    {
      id: 'verify-selinux',
      title: 'Audit SELinux Contexts & AVC Logs',
      desc: 'Checks getenforce, verifies httpd_sys_content_t and scans ausearch logs.',
      destructive: false,
      server: 'server1',
    },
    {
      id: 'verify-firewall',
      title: 'Inspect firewalld Public Zone',
      desc: 'Verifies active services (ssh, nfs, mountd, rpc-bind) and port 82/tcp.',
      destructive: false,
      server: 'server1',
    },
    {
      id: 'test-ssh',
      title: 'Test Hardened SSH Handshake',
      desc: 'Verifies Ed25519 key login and confirms password logins are rejected.',
      destructive: false,
      server: 'server2',
    },
    {
      id: 'trigger-backup',
      title: 'Trigger Automated Backup Script',
      desc: 'Executes /usr/local/bin/backup.sh and rotates archives older than 7 days.',
      destructive: false,
      server: 'server1',
    },
    {
      id: 'test-restore',
      title: 'Execute Safe DR Restore Test',
      desc: 'Simulates deletion of index.html and restores it from latest archive with restorecon.',
      destructive: true,
      server: 'server1',
    },
    {
      id: 'expand-lvm',
      title: 'Online Grow LVM lv_share (+500MB)',
      desc: 'Executes lvextend -r -L +500M /dev/vg_data/lv_share online with xfs_growfs.',
      destructive: false,
      server: 'server1',
    },
  ];

  const handleExecute = async (op: any) => {
    if (op.destructive) {
      setConfirmOp(op);
      return;
    }
    executeOpConfirmed(op);
  };

  const executeOpConfirmed = async (op: any) => {
    setConfirmOp(null);
    setRunningOp(op.id);
    try {
      const res = await api.executeOperation(op.id, op.server || selectedTarget, true);
      setHistory((prev) => [res, ...prev]);
      onRefresh();
    } catch (err: any) {
      const failedRes: OperationResult = {
        operation_id: op.id,
        title: op.title,
        executed_at: new Date().toLocaleTimeString(),
        server_id: op.server || selectedTarget,
        command: 'execution_dispatch',
        success: false,
        stdout: '',
        stderr: err.message,
        exit_code: 1,
        execution_time_ms: 0,
      };
      setHistory((prev) => [failedRes, ...prev]);
    } finally {
      setRunningOp(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Infrastructure Automation Engine</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Security Allowlist Enforced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pre-authorized administrative operations with strict parameter validation, non-root execution, and audit logging
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setSelectedTarget('server1')}
            className={`px-3 py-1 rounded font-semibold transition-all ${
              selectedTarget === 'server1'
                ? 'bg-sky-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            server1 (192.168.56.11)
          </button>
          <button
            onClick={() => setSelectedTarget('server2')}
            className={`px-3 py-1 rounded font-semibold transition-all ${
              selectedTarget === 'server2'
                ? 'bg-indigo-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            server2 (192.168.56.12)
          </button>
        </div>
      </div>

      {/* Allowlisted Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operations.map((op) => (
          <div
            key={op.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-white tracking-wide">{op.title}</h3>
                {op.destructive ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    DESTRUCTIVE
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                    SAFE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{op.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Target: {op.server}</span>
              <button
                onClick={() => handleExecute(op)}
                disabled={runningOp === op.id}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50 ${
                  op.destructive
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20'
                    : 'bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{runningOp === op.id ? 'Running...' : 'Execute'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Execution Output & Audit History */}
      {history.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <History className="w-4 h-4 mr-2 text-sky-400" />
              Administrative Audit Log (Recent Executions)
            </h3>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear Log
            </button>
          </div>

          <div className="space-y-3">
            {history.map((item, idx) => (
              <TerminalView
                key={idx}
                title={`Audit #00${history.length - idx}: ${item.title} (${item.executed_at})`}
                command={item.command}
                output={item.success ? item.stdout : `[ERROR] ${item.stderr}`}
                hostname={item.server_id === 'server1' ? 'server1.example.com' : 'server2.example.com'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOp && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setConfirmOp(null)}
          onConfirm={() => executeOpConfirmed(confirmOp)}
          title={`Confirm Operation: ${confirmOp.title}`}
          description={`You are about to execute '${confirmOp.title}' on ${confirmOp.server}. This operation is guarded by administrator authorization. Please confirm to proceed.`}
          confirmText="Authorize & Execute"
          isDestructive={confirmOp.destructive}
          isLoading={runningOp === confirmOp.id}
        />
      )}
    </div>
  );
};
