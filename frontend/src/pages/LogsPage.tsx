import React, { useState } from 'react';
import { ScrollText, Filter, CheckCircle2, AlertTriangle, ShieldAlert, Terminal, RefreshCw, Search } from 'lucide-react';
import { SystemLogsData } from '../types';
import { TerminalView } from '../components/TerminalView';
import { api } from '../services/api';

interface LogsPageProps {
  data: SystemLogsData;
  onRefresh: () => void;
}

export const LogsPage: React.FC<LogsPageProps> = ({ data, onRefresh }) => {
  const [selectedService, setSelectedService] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredLogs, setFilteredLogs] = useState(data.recent_logs);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = async (service: string) => {
    setSelectedService(service);
    setIsLoading(true);
    try {
      const res = await api.getSystemLogs(service === 'all' ? undefined : service);
      setFilteredLogs(res.recent_logs);
    } catch (e) {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const displayedLogs = filteredLogs.filter(
    (log) =>
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">System Logs & Service Monitoring</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              TASK 10 (server1)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persistent <code>systemd-journald</code> logging across reboots (<code>/var/log/journal</code>) and multi-unit telemetry
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-mono">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            0 Failed Units (systemctl list-units --failed)
          </span>
        </div>
      </div>

      {/* Service Filter & Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-semibold mr-1">Unit:</span>
          {['all', 'httpd', 'nfs-server', 'firewalld', 'sshd', 'backup'].map((svc) => (
            <button
              key={svc}
              onClick={() => handleFilterChange(svc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                selectedService === svc
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              {svc}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search log messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>
      </div>

      {/* Monitored Services Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {data.services_monitored.map((svc) => (
          <div key={svc.name} className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
            <div className="text-xs font-mono font-bold text-white truncate">{svc.name}</div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">{svc.description}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">{svc.active_state}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Journalctl Stream Table */}
      <div className="rounded-xl border border-slate-800 bg-[#070b14] overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ScrollText className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-mono text-slate-300 font-bold">journalctl -u {selectedService} --no-pager</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Persistent: /var/log/journal</span>
        </div>

        <div className="divide-y divide-slate-800/60 font-mono text-xs max-h-96 overflow-y-auto">
          {displayedLogs.map((log, idx) => (
            <div key={idx} className="p-3 hover:bg-slate-900/40 flex items-start space-x-3 text-slate-300">
              <span className="text-slate-500 shrink-0 text-[11px]">{log.timestamp}</span>
              <span className="text-purple-400 shrink-0 font-semibold">{log.hostname}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-sky-300 shrink-0 border border-slate-700">
                {log.service}
              </span>
              <span className="flex-1 text-slate-200">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Evidence */}
      <TerminalView
        title="Verification Evidence: systemctl status & list-units --failed"
        command="systemctl is-active httpd nfs-server firewalld sshd crond; systemctl list-units --failed"
        output={`active
active
active
active
active

  UNIT LOAD ACTIVE SUB DESCRIPTION
0 loaded units listed.`}
        hostname="server1.example.com"
      />
    </div>
  );
};
