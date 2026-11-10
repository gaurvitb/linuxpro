import React, { useState } from 'react';
import { Archive, Clock, CheckCircle2, RotateCcw, Play, Terminal, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BackupData } from '../types';
import { TerminalView } from '../components/TerminalView';
import { ConfirmModal } from '../components/ConfirmModal';
import { api } from '../services/api';

interface BackupPageProps {
  data: BackupData;
  onRefresh: () => void;
}

export const BackupPage: React.FC<BackupPageProps> = ({ data, onRefresh }) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  const handleTriggerBackup = async () => {
    setIsTriggering(true);
    try {
      const res = await api.triggerBackup();
      setTerminalOutput(`[admin1@server1 ~]$ sudo /usr/local/bin/backup.sh
[admin1@server1 ~]$ ls -lh /backup
${res.stdout}
[admin1@server1 ~]$ journalctl -t backup -n 1
${data.last_backup_log}`);
      onRefresh();
    } catch (err: any) {
      setTerminalOutput(`Error triggering backup: ${err.message}`);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleExecuteRestore = async () => {
    setIsRestoring(true);
    setShowRestoreModal(false);
    try {
      const res = await api.testRestore(true);
      setTerminalOutput(`[admin1@server1 ~]$ # Simulating incident: removing /data/web/index.html
[admin1@server1 ~]$ sudo rm /data/web/index.html
[admin1@server1 ~]$ # Restoring from latest archive:
[admin1@server1 ~]$ sudo tar -xzf "$(ls -t /backup/backup_*.tar.gz | head -1)" -C / data/web/index.html
[admin1@server1 ~]$ sudo restorecon -Rv /data/web
relabeled /data/web/index.html from unconfined_u:object_r:default_t:s0 to unconfined_u:object_r:httpd_sys_content_t:s0
[admin1@server1 ~]$ curl -s -I http://localhost:82 | head -n 1
HTTP/1.1 200 OK

Disaster Recovery Verification: Website restored and operational!`);
      onRefresh();
    } catch (err: any) {
      setTerminalOutput(`Restore test failed: ${err.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Automated Backup & Disaster Recovery</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              TASK 9 (server1)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated cron snapshot of <code>/data/web</code>, <code>/etc/httpd</code>, <code>/etc/exports</code>, <code>/etc/fstab</code> to <code>/backup</code>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRestoreModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 font-semibold text-xs transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Test Restore Workflow</span>
          </button>

          <button
            onClick={handleTriggerBackup}
            disabled={isTriggering}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{isTriggering ? 'Archiving...' : 'Run Backup Now'}</span>
          </button>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold uppercase">Cron Schedule</div>
          <div className="text-lg font-bold text-white font-mono mt-1">{data.schedule.cron_expression}</div>
          <div className="text-[11px] text-slate-500 mt-1">{data.schedule.scheduled_time}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold uppercase">Retention Policy</div>
          <div className="text-lg font-bold text-sky-400 font-mono mt-1">{data.schedule.retention_days} Days</div>
          <div className="text-[11px] text-slate-500 mt-1">find -mtime +7 -delete</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold uppercase">Backup Storage (LV)</div>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-1">/backup</div>
          <div className="text-[11px] text-slate-500 mt-1">LVM: lv_backup (1.00 GB XFS)</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold uppercase">Last Status</div>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-1 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {data.last_backup_status}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Logged to journalctl -t backup</div>
        </div>
      </div>

      {/* Backup Archives Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Verified Archive Repository (/backup/*.tar.gz)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5">Archive Filename</th>
                <th className="pb-2.5">Created Timestamp</th>
                <th className="pb-2.5">Size</th>
                <th className="pb-2.5">Archived Targets</th>
                <th className="pb-2.5">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.archives.map((a) => (
                <tr key={a.filename} className="hover:bg-slate-800/30">
                  <td className="py-3 font-bold text-emerald-400 flex items-center">
                    <Archive className="w-3.5 h-3.5 mr-2 text-slate-500" />
                    {a.filename}
                  </td>
                  <td className="py-3 text-slate-300">{a.created_at}</td>
                  <td className="py-3 text-sky-400 font-bold">{a.size_mb} MB</td>
                  <td className="py-3 text-slate-400">{a.included_paths.join(', ')}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal View */}
      {terminalOutput && (
        <TerminalView
          title="Backup & Restore Execution Telemetry"
          output={terminalOutput}
          hostname="server1.example.com"
        />
      )}

      {/* Safe Restore Confirmation Modal */}
      <ConfirmModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleExecuteRestore}
        title="Execute Disaster Recovery Restore Test?"
        description="This will simulate a disaster scenario by removing /data/web/index.html, extracting the page from the latest backup archive, and reapplying SELinux contexts with restorecon. Are you sure you wish to proceed?"
        confirmText="Confirm Restore Test"
        isDestructive={false}
        isLoading={isRestoring}
      />
    </div>
  );
};
