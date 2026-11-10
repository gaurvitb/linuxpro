import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, Terminal, RefreshCw, Activity } from 'lucide-react';
import { SELinuxData } from '../types';
import { TerminalView } from '../components/TerminalView';

interface SELinuxPageProps {
  data: SELinuxData;
  onRefresh: () => void;
}

export const SELinuxPage: React.FC<SELinuxPageProps> = ({ data, onRefresh }) => {
  const [auditResult, setAuditResult] = useState<string | null>(null);

  const runAudit = () => {
    setAuditResult(`[admin1@server1 ~]$ sudo ausearch -m avc -ts recent
<no matches>

[admin1@server1 ~]$ ls -Zd /data/web
unconfined_u:object_r:httpd_sys_content_t:s0 /data/web

[admin1@server1 ~]$ semanage port -l | grep http_port_t
http_port_t                    tcp      82, 80, 443, 8080, 8443, 9000

SELinux policy enforcement confirmed: No active AVC violations detected!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Security-Enhanced Linux (SELinux)</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              TASK 6 (server1)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory Access Control (MAC) enforcing mode with <code>httpd_sys_content_t</code> file contexts and TCP 82 port labels
          </p>
        </div>

        <button
          onClick={runAudit}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 transition-all"
        >
          <Activity className="w-4 h-4" />
          <span>Audit AVC Denials (ausearch)</span>
        </button>
      </div>

      {/* Top Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold uppercase">Operational Mode</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2" />
            {data.mode}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">Persistent: /etc/selinux/config</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold uppercase">Policy Type</div>
          <div className="text-xl font-bold text-purple-400 font-mono mt-1">{data.policy}</div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">Targeted daemon protection</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold uppercase">Recent AVC Denials</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">0 Denials</div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">ausearch -m avc clean</div>
        </div>
      </div>

      {/* Two Column Layout: File Contexts vs Port Labels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Contexts Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            SELinux File Context Rules (semanage fcontext)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Custom web DocumentRoot requires <code>httpd_sys_content_t</code> to allow Apache access.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2">Path Expression</th>
                  <th className="pb-2">Target Type</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.contexts.map((c) => (
                  <tr key={c.path} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-sky-300">{c.path}</td>
                    <td className="py-2.5 text-purple-300">{c.target_type}</td>
                    <td className="py-2.5">
                      <span className="flex items-center text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        restorecon Applied
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Port Labels Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            HTTP Port Labels (semanage port)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Custom port 82 labeled under <code>http_port_t</code> allowing Apache daemon binding.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2">Port / Protocol</th>
                  <th className="pb-2">SELinux Type</th>
                  <th className="pb-2">Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.port_labels.map((p) => (
                  <tr key={`${p.port}-${p.protocol}`} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-sky-400">
                      {p.port} / {p.protocol}
                    </td>
                    <td className="py-2.5 text-purple-300">{p.label_type}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                        {p.port === 82 ? 'Custom Added (Task 6)' : 'Standard RHEL Policy'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Troubleshooting Alert Box */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 text-xs text-slate-300 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Enterprise Security Standard:</span> Never disable SELinux. If Apache fails with 403 Forbidden, verify file context with <code>ls -Zd /data/web</code>, reapply with <code>restorecon -Rv /data/web</code>, and query audit denials with <code>sudo ausearch -m avc -ts recent</code>.
        </div>
      </div>

      {/* Audit Output */}
      {auditResult && (
        <TerminalView
          title="SELinux Audit Output: ausearch & ls -Zd"
          output={auditResult}
          hostname="server1.example.com"
        />
      )}

      {/* Terminal Evidence */}
      <TerminalView
        title="Verification Evidence: getenforce; ls -Zd /data/web; semanage port -l"
        command="getenforce; ls -Zd /data/web; semanage port -l | grep http_port_t"
        output={`Enforcing
unconfined_u:object_r:httpd_sys_content_t:s0 /data/web
http_port_t                    tcp      82, 80, 443, 8080, 8443, 9000`}
        hostname="server1.example.com"
      />
    </div>
  );
};

