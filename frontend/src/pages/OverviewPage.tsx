import React from 'react';
import {
  Server, HardDrive, ShieldCheck, Flame, Globe, FolderSync,
  Activity, CheckCircle2, AlertTriangle, ArrowUpRight, Cpu, MemoryStick,
  Boxes, RefreshCw, KeyRound, Archive
} from 'lucide-react';
import { OverviewData } from '../types';
import { MetricCard } from '../components/MetricCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface OverviewPageProps {
  data: OverviewData;
  onNavigateToTab: (tab: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  data,
  onNavigateToTab,
  onRefresh,
  isRefreshing,
}) => {
  const s1 = data.servers.find((s) => s.id === 'server1') || data.servers[0];
  const s2 = data.servers.find((s) => s.id === 'server2') || data.servers[1];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Infrastructure Overview</h1>
            {data.mode === 'DEMO' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DEMO TELEMETRY
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                LIVE INFRASTRUCTURE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Linux Management & Telemetry Plane for RHEL 9 / 10 Two-Server Cluster
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateToTab('verification')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 transition-all text-xs font-semibold"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Reboot Audit: {data.reboot_verification_score}% Passed</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top Infrastructure Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Cluster Nodes"
          value={`${data.online_servers} / ${data.total_servers}`}
          subtitle="Both RHEL 9/10 VMs Online"
          icon={Server}
          status="success"
          trend="192.168.56.0/24"
          onClick={() => onNavigateToTab('servers')}
        />
        <MetricCard
          title="Cluster CPU Load"
          value={`${data.overall_cpu_percent}%`}
          subtitle="Average across all cores"
          icon={Cpu}
          status={data.overall_cpu_percent > 80 ? 'danger' : 'info'}
          progress={data.overall_cpu_percent}
          onClick={() => onNavigateToTab('monitoring')}
        />
        <MetricCard
          title="Cluster Memory"
          value={`${data.overall_ram_percent}%`}
          subtitle="RAM utilization aggregate"
          icon={MemoryStick}
          status={data.overall_ram_percent > 85 ? 'warning' : 'info'}
          progress={data.overall_ram_percent}
          onClick={() => onNavigateToTab('monitoring')}
        />
        <MetricCard
          title="Cluster Storage"
          value={`${data.overall_disk_percent}%`}
          subtitle="LVM /data & root filesystems"
          icon={HardDrive}
          status="info"
          progress={data.overall_disk_percent}
          onClick={() => onNavigateToTab('storage')}
        />
      </div>

      {/* Two Main Server Health Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server 1 Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl hover:border-sky-500/40 transition-all">
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-bold text-base text-white">{s1.hostname}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/20 text-sky-400">
                  Storage & Web
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">IP: {s1.ip} | Host-only: enp0s8</p>
            </div>

            <button
              onClick={() => onNavigateToTab('servers')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">CPU Usage</span>
              <div className="text-base font-bold text-white font-mono mt-0.5">{s1.metrics.cpu_percent}%</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">RAM Usage</span>
              <div className="text-base font-bold text-white font-mono mt-0.5">{s1.metrics.ram_used_gb} GB ({s1.metrics.ram_percent}%)</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Storage</span>
              <div className="text-base font-bold text-white font-mono mt-0.5">{s1.metrics.disk_percent}%</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400 flex items-center">
                <Globe className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Apache HTTPD (Port 82)
              </span>
              <span className="text-emerald-400 font-semibold font-mono">Active (200 OK)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400 flex items-center">
                <FolderSync className="w-3.5 h-3.5 mr-2 text-sky-400" /> NFS Server (/data/share)
              </span>
              <span className="text-emerald-400 font-semibold font-mono">Exported</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-2 text-purple-400" /> SELinux Mode
              </span>
              <span className="text-purple-300 font-semibold font-mono">Enforcing (http_port_t:82)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400 flex items-center">
                <Flame className="w-3.5 h-3.5 mr-2 text-rose-400" /> firewalld
              </span>
              <span className="text-emerald-400 font-semibold font-mono">Active (82/tcp, NFS, SSH)</span>
            </div>
          </div>
        </div>

        {/* Server 2 Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl hover:border-indigo-500/40 transition-all">
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-bold text-base text-white">{s2.hostname}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-400">
                  Client & Podman
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">IP: {s2.ip} | Host-only: enp0s8</p>
            </div>

            <button
              onClick={() => onNavigateToTab('servers')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">CPU Usage</span>
              <div className="text-base font-bold text-white font-mono mt-0.5">{s2.metrics.cpu_percent}%</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">RAM Usage</span>
              <div className="text-base font-bold text-white font-mono mt-0.5">{s2.metrics.ram_used_gb} GB ({s2.metrics.ram_percent}%)</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Storage</span>
              <div className="text-base font-bold text-white font-mono mt-0.5">{s2.metrics.disk_percent}%</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400 flex items-center">
                <FolderSync className="w-3.5 h-3.5 mr-2 text-sky-400" /> Autofs On-Demand NFS
              </span>
              <span className="text-emerald-400 font-semibold font-mono">Active (/mnt/nfs/share)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400 flex items-center">
                <KeyRound className="w-3.5 h-3.5 mr-2 text-indigo-400" /> SSH Key Authentication
              </span>
              <span className="text-emerald-400 font-semibold font-mono">Ed25519 Verified</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400 flex items-center">
                <Boxes className="w-3.5 h-3.5 mr-2 text-emerald-400" /> Podman Container (webc)
              </span>
              <span className="text-emerald-400 font-semibold font-mono">Port 8081:8080 (UBI9)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/50">
              <span className="text-slate-400 flex items-center">
                <Activity className="w-3.5 h-3.5 mr-2 text-amber-400" /> User Systemd Unit
              </span>
              <span className="text-emerald-400 font-semibold font-mono">container-webc.service</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Charts (CPU & Memory Timeseries) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Utilization History */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Cluster CPU Utilization (%)</h3>
              <p className="text-xs text-slate-400">1-hour rolling historical window</p>
            </div>
            <span className="text-xs font-mono text-sky-400 font-bold">{s1.metrics.cpu_percent}% Current</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s1.metrics.cpu_history}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#cpuGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Utilization History */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Cluster RAM Utilization (%)</h3>
              <p className="text-xs text-slate-400">Memory pressure and buffer caches</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold">{s1.metrics.ram_percent}% Current</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s1.metrics.ram_history}>
                <defs>
                  <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#ramGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
