import React, { useState } from 'react';
import { Server, ArrowRight, ShieldCheck, CheckCircle2, Globe, Key, FolderSync, Boxes } from 'lucide-react';
import { NetworkTopologyInfo } from '../types';

interface TopologyCanvasProps {
  data: NetworkTopologyInfo;
  onTestPing?: () => void;
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({ data, onTestPing }) => {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl relative overflow-hidden">
      {/* Network Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white tracking-wide">Enterprise VirtualBox Host-Only Subnet</h3>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {data.subnet}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Two-server architecture interconnected over adapter 2 (<code>enp0s8</code>)
          </p>
        </div>

        {/* Filter protocol pills */}
        <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedProtocol(null)}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedProtocol === null ? 'bg-sky-500 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Protocols
          </button>
          <button
            onClick={() => setSelectedProtocol('SSH')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedProtocol === 'SSH' ? 'bg-sky-500 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SSH :22
          </button>
          <button
            onClick={() => setSelectedProtocol('NFS')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedProtocol === 'NFS' ? 'bg-sky-500 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            NFS :2049
          </button>
          <button
            onClick={() => setSelectedProtocol('HTTP')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedProtocol === 'HTTP' ? 'bg-sky-500 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            HTTP :82
          </button>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
        {/* Server 2 (Client) - Left Side */}
        <div className="lg:col-span-4 rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-slate-900/90 p-5 shadow-lg relative">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">server2.example.com</h4>
                <div className="text-xs font-mono text-indigo-300 font-semibold">{data.server2_ip}</div>
              </div>
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Client Node
            </span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center">
                <Key className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> SSH Client
              </span>
              <span className="font-mono text-slate-200">Ed25519 Key (admin1)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center">
                <FolderSync className="w-3.5 h-3.5 mr-1.5 text-sky-400" /> Autofs Client
              </span>
              <span className="font-mono text-slate-200">/mnt/nfs/share (timeout: 60s)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center">
                <Boxes className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Podman Container
              </span>
              <span className="font-mono text-slate-200">webc (8081:8080)</span>
            </div>
          </div>
        </div>

        {/* Central Interconnect Channels */}
        <div className="lg:col-span-3 flex flex-col space-y-3 py-4">
          {/* SSH Arrow (Port 22) */}
          {(!selectedProtocol || selectedProtocol === 'SSH') && (
            <div className="rounded-lg bg-slate-950/80 border border-indigo-500/30 p-2.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-indigo-300">TCP 22 (SSH)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] text-slate-400 font-mono">Key-Auth Only</span>
            </div>
          )}

          {/* NFS Arrow (Port 2049) */}
          {(!selectedProtocol || selectedProtocol === 'NFS') && (
            <div className="rounded-lg bg-slate-950/80 border border-sky-500/30 p-2.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-sky-300">TCP 2049 (NFS)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-400" />
              <span className="text-[11px] text-slate-400 font-mono">mountd, rpc-bind</span>
            </div>
          )}

          {/* HTTP Arrow (Port 82) */}
          {(!selectedProtocol || selectedProtocol === 'HTTP') && (
            <div className="rounded-lg bg-slate-950/80 border border-emerald-500/30 p-2.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-300">TCP 82 (HTTP)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] text-slate-400 font-mono">Apache vHost</span>
            </div>
          )}
        </div>

        {/* Server 1 (Infrastructure & Storage) - Right Side */}
        <div className="lg:col-span-4 rounded-xl border border-sky-500/30 bg-gradient-to-b from-sky-950/30 to-slate-900/90 p-5 shadow-lg relative">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">server1.example.com</h4>
                <div className="text-xs font-mono text-sky-300 font-semibold">{data.server1_ip}</div>
              </div>
            </div>
            <span className="flex items-center text-xs font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Infrastructure Server
            </span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Apache Web Server
              </span>
              <span className="font-mono text-slate-200">Port 82 (httpd_sys_content_t)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center">
                <FolderSync className="w-3.5 h-3.5 mr-1.5 text-sky-400" /> NFS Server
              </span>
              <span className="font-mono text-slate-200">Export: /data/share (rw,sync)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> Security Hardening
              </span>
              <span className="font-mono text-slate-200">SELinux Enforcing | firewalld</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Verification Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            server1 ↔ server2 Ping Succeeded (0.28ms latency)
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-400 font-mono hidden md:inline">
            /etc/hosts verified: 192.168.56.11 server1, 192.168.56.12 server2
          </span>
        </div>

        {onTestPing && (
          <button
            onClick={onTestPing}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors border border-slate-700"
          >
            Re-run Ping Diagnostic
          </button>
        )}
      </div>
    </div>
  );
};
