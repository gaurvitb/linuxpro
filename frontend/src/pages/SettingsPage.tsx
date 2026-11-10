import React, { useState } from 'react';
import { Settings as SettingsIcon, Radio, Shield, Server, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface SettingsPageProps {
  mode: 'LIVE' | 'DEMO';
  onToggleMode: () => void;
  onRefresh: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ mode, onToggleMode, onRefresh }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSwitchMode = async (newMode: 'LIVE' | 'DEMO') => {
    setIsUpdating(true);
    try {
      await api.setMode(newMode);
      setStatusMsg(`Operational mode switched to ${newMode}`);
      onRefresh();
    } catch (e: any) {
      setStatusMsg(`Failed to switch mode: ${e.message}`);
    } finally {
      setIsUpdating(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">Platform Settings & Environment</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure telemetry source mode, VM network endpoints, and backend API integration
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-mono">
          {statusMsg}
        </div>
      )}

      {/* Mode Selection Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Operational Telemetry Mode</h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          LINUXPULSE operates in two modes. When virtual machines are online and reachable, switch to <strong>LIVE MODE</strong> to query real systemd, LVM, and firewall stats. When offline or demonstrating without VMs, select <strong>DEMO MODE</strong> for hyper-realistic presentation data.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => handleSwitchMode('LIVE')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              mode === 'LIVE'
                ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center">
                <Radio className={`w-4 h-4 mr-2 ${mode === 'LIVE' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                LIVE INFRASTRUCTURE
              </span>
              {mode === 'LIVE' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Interrogates live RHEL 9/10 virtual machines via secure SSH and socket probes.
            </p>
          </div>

          <div
            onClick={() => handleSwitchMode('DEMO')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              mode === 'DEMO'
                ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center">
                <Radio className={`w-4 h-4 mr-2 ${mode === 'DEMO' ? 'text-amber-400' : 'text-slate-500'}`} />
                DEMO MODE
              </span>
              {mode === 'DEMO' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Provides offline mock telemetry matching all 12 tasks from the RHEL Capstone Guide.
            </p>
          </div>
        </div>
      </div>

      {/* Cluster Endpoints Configuration */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Cluster Network Nodes</h3>
        <div className="space-y-3 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-sky-400">server1.example.com</span>
              <span className="text-slate-400 block text-[11px]">Storage, NFS, Apache (Port 82), Backups</span>
            </div>
            <span className="text-slate-200">192.168.56.11:22 (SSH)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="font-bold text-indigo-400">server2.example.com</span>
              <span className="text-slate-400 block text-[11px]">NFS Autofs Client, Podman UBI9 Container</span>
            </div>
            <span className="text-slate-200">192.168.56.12:22 (SSH)</span>
          </div>
        </div>
      </div>

      {/* Backend API & Swagger Link */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">FastAPI Backend & OpenAPI</h3>
          <p className="text-xs text-slate-400 mt-1">
            Explore interactive API endpoints, test requests, and view Pydantic schema definitions.
          </p>
        </div>

        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold transition-colors border border-slate-700"
        >
          <span>Open Swagger UI</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

