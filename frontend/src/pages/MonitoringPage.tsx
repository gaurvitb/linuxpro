import React from 'react';
import { Activity, Cpu, MemoryStick, HardDrive, Server, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ServerSummary } from '../types';
import { MetricCard } from '../components/MetricCard';

interface MonitoringPageProps {
  servers: ServerSummary[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const MonitoringPage: React.FC<MonitoringPageProps> = ({ servers, onRefresh, isRefreshing }) => {
  const s1 = servers.find((s) => s.id === 'server1') || servers[0];
  const s2 = servers.find((s) => s.id === 'server2') || servers[1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Resource Monitoring</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time memory pressure, CPU core load, storage thresholds, and systemd service health
          </p>
        </div>

        <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-mono">
          <Activity className="w-4 h-4 mr-1.5 animate-pulse" />
          Continuous Telemetry Sampling
        </span>
      </div>

      {/* Cluster Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="text-slate-400 font-bold uppercase">CPU Load (1m, 5m, 15m)</span>
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">server1:</span>
              <span className="text-sky-300 font-bold">{s1.metrics.load_1m}, {s1.metrics.load_5m}, {s1.metrics.load_15m}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">server2:</span>
              <span className="text-indigo-300 font-bold">{s2.metrics.load_1m}, {s2.metrics.load_5m}, {s2.metrics.load_15m}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="text-slate-400 font-bold uppercase">RAM Allocation Breakdown</span>
            <MemoryStick className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">server1 (2.0 GB):</span>
              <span className="text-indigo-300 font-bold">{s1.metrics.ram_used_gb} GB ({s1.metrics.ram_percent}%)</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">server2 (2.0 GB):</span>
              <span className="text-indigo-300 font-bold">{s2.metrics.ram_used_gb} GB ({s2.metrics.ram_percent}%)</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="text-slate-400 font-bold uppercase">Network Throughput (I/O)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Total Rx (Received):</span>
              <span className="text-emerald-400 font-bold">{s1.metrics.network_rx_mb} MB</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Total Tx (Transmitted):</span>
              <span className="text-sky-400 font-bold">{s1.metrics.network_tx_mb} MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node Metrics Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server 1 Details */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{s1.hostname}</h3>
            <span className="text-xs font-mono text-sky-400">192.168.56.11</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">CPU Core Utilization</span>
                <span className="text-sky-400 font-bold">{s1.metrics.cpu_percent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full" style={{ width: `${s1.metrics.cpu_percent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">RAM Utilization</span>
                <span className="text-indigo-400 font-bold">{s1.metrics.ram_percent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${s1.metrics.ram_percent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Storage Utilization</span>
                <span className="text-emerald-400 font-bold">{s1.metrics.disk_percent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${s1.metrics.disk_percent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Server 2 Details */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{s2.hostname}</h3>
            <span className="text-xs font-mono text-indigo-400">192.168.56.12</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">CPU Core Utilization</span>
                <span className="text-sky-400 font-bold">{s2.metrics.cpu_percent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full" style={{ width: `${s2.metrics.cpu_percent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">RAM Utilization</span>
                <span className="text-indigo-400 font-bold">{s2.metrics.ram_percent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${s2.metrics.ram_percent}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Storage Utilization</span>
                <span className="text-emerald-400 font-bold">{s2.metrics.disk_percent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${s2.metrics.disk_percent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

