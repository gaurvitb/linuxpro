import React from 'react';
import { Flame, ShieldCheck, CheckCircle2, Terminal, ArrowRight, Activity } from 'lucide-react';
import { FirewallData } from '../types';
import { TerminalView } from '../components/TerminalView';

interface FirewallPageProps {
  data: FirewallData;
  onRefresh: () => void;
}

export const FirewallPage: React.FC<FirewallPageProps> = ({ data, onRefresh }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Dynamic Firewall (firewalld)</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              TASK 7 (server1)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic packet filtering for Apache Port 82, SSH (22), and NFSv4 cluster services (mountd, rpc-bind, nfs)
          </p>
        </div>

        <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-mono">
          <Flame className="w-4 h-4 mr-1.5 text-rose-400" />
          Active (public zone)
        </span>
      </div>

      {/* Rules Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Open Ports */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Allowed TCP Ports</h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-emerald-400">82/tcp</span>
              <span className="text-slate-400">Apache HTTP Server</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-sky-400">22/tcp</span>
              <span className="text-slate-400">SSH Service (Hardened)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-indigo-400">2049/tcp</span>
              <span className="text-slate-400">NFS Daemon</span>
            </div>
          </div>
        </div>

        {/* Enabled Services */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Permanent Services</h3>
          <div className="space-y-2">
            {data.rules.services.map((svc) => (
              <div key={svc} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
                <span className="text-sky-300 font-bold">{svc}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">ALLOW</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bound Interfaces */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Bound Interfaces</h3>
          <div className="space-y-2">
            {data.rules.interfaces.map((iface) => (
              <div key={iface} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs font-mono">
                <span className="text-white font-bold">{iface}</span>
                <span className="text-slate-400">{iface === 'enp0s8' ? 'Host-only Lab Subnet' : 'NAT Uplink'}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400">
            Target: <code>default</code> | Forward: <code>yes</code> | Masquerade: <code>no</code>
          </div>
        </div>
      </div>

      {/* Raw firewall-cmd output */}
      <TerminalView
        title="Verification Evidence: sudo firewall-cmd --list-all"
        command="sudo firewall-cmd --list-all"
        output={data.raw_list_all}
        hostname="server1.example.com"
      />
    </div>
  );
};
