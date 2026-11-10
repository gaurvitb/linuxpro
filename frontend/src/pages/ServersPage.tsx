import React, { useState } from 'react';
import {
  Server, Cpu, MemoryStick, HardDrive, Network, CheckCircle2,
  RefreshCw, Terminal, Activity, ArrowRight, ShieldCheck, Clock
} from 'lucide-react';
import { ServerSummary } from '../types';
import { TerminalView } from '../components/TerminalView';

interface ServersPageProps {
  servers: ServerSummary[];
  onRefresh: () => void;
  isRefreshing: boolean;
  onNavigateToTab: (tab: string) => void;
}

export const ServersPage: React.FC<ServersPageProps> = ({
  servers,
  onRefresh,
  isRefreshing,
  onNavigateToTab,
}) => {
  const [selectedServer, setSelectedServer] = useState<string>('server1');
  const [pingOutput, setPingOutput] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  const current = servers.find((s) => s.id === selectedServer) || servers[0];

  const handlePingTest = () => {
    setIsPinging(true);
    setPingOutput(null);
    setTimeout(() => {
      setIsPinging(false);
      const target = current.id === 'server1' ? 'server2 (192.168.56.12)' : 'server1 (192.168.56.11)';
      setPingOutput(`PING ${target}: 56 data bytes
64 bytes from ${current.id === 'server1' ? '192.168.56.12' : '192.168.56.11'}: icmp_seq=1 ttl=64 time=0.284 ms
64 bytes from ${current.id === 'server1' ? '192.168.56.12' : '192.168.56.11'}: icmp_seq=2 ttl=64 time=0.271 ms

--- ${target} ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 0.271/0.277/0.284/0.012 ms`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header with Server Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Cluster Server Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Node hardware telemetry, systemd units, network interfaces and connectivity probes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {servers.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedServer(s.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                selectedServer === s.id
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>{s.hostname}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Server Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Server Profile & OS Specifications */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Node Specifications</h3>
            <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {current.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Static FQDN:</span>
              <span className="font-mono font-semibold text-slate-200">{current.hostname}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Lab IP (enp0s8):</span>
              <span className="font-mono font-semibold text-sky-400">{current.ip}/24</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Operating System:</span>
              <span className="font-semibold text-slate-200">{current.os_name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Linux Kernel:</span>
              <span className="font-mono text-slate-300">{current.kernel_version}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Architecture:</span>
              <span className="font-mono text-slate-300">{current.arch}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">System Uptime:</span>
              <span className="font-mono text-emerald-400">{current.uptime}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Load Average:</span>
              <span className="font-mono text-slate-200">
                {current.metrics.load_1m}, {current.metrics.load_5m}, {current.metrics.load_15m}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handlePingTest}
              disabled={isPinging}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 disabled:opacity-50"
            >
              <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-sky-400' : ''}`} />
              <span>{isPinging ? 'Pinging Peer Node...' : `Test Ping to ${current.id === 'server1' ? 'server2' : 'server1'}`}</span>
            </button>
          </div>
        </div>

        {/* Right Columns: Hardware Telemetry, Interfaces, Systemd Units */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resource Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>CPU Core Allocation</span>
                <Cpu className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white mt-2">{current.metrics.cpu_percent}%</div>
              <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full" style={{ width: `${current.metrics.cpu_percent}%` }} />
              </div>
              <div className="text-[10px] text-slate-500 mt-2 font-mono">2 vCPUs Assigned (VirtualBox)</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Memory (RAM)</span>
                <MemoryStick className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white mt-2">
                {current.metrics.ram_used_gb} / {current.metrics.ram_total_gb} GB
              </div>
              <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${current.metrics.ram_percent}%` }} />
              </div>
              <div className="text-[10px] text-slate-500 mt-2 font-mono">{current.metrics.ram_percent}% Committed</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Disk Utilization</span>
                <HardDrive className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white mt-2">
                {current.metrics.disk_used_gb} / {current.metrics.disk_total_gb} GB
              </div>
              <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${current.metrics.disk_percent}%` }} />
              </div>
              <div className="text-[10px] text-slate-500 mt-2 font-mono">{current.metrics.disk_percent}% Used (XFS)</div>
            </div>
          </div>

          {/* Network Interfaces Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Network Interfaces (nmcli)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2">Device</th>
                    <th className="pb-2">IP Address</th>
                    <th className="pb-2">MAC Address</th>
                    <th className="pb-2">Profile</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {current.interfaces.map((iface) => (
                    <tr key={iface.name} className="hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-white">{iface.name}</td>
                      <td className="py-2.5 text-sky-400">{iface.ip_address}</td>
                      <td className="py-2.5 text-slate-400">{iface.mac_address}</td>
                      <td className="py-2.5 text-slate-300">{iface.profile_name}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                          {iface.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active System Services List */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Managed Services (systemd)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.services.map((svc) => (
                <div key={svc.name} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-200">{svc.name}</div>
                    <div className="text-[11px] text-slate-400">{svc.description}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300">
                    {svc.sub_state}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Ping Terminal Output */}
          {pingOutput && (
            <TerminalView
              title={`Diagnostics: ping -c 2 ${current.id === 'server1' ? 'server2' : 'server1'}`}
              command={`ping -c 2 ${current.id === 'server1' ? 'server2' : 'server1'}`}
              output={pingOutput}
              hostname={current.hostname}
            />
          )}
        </div>
      </div>
    </div>
  );
};

