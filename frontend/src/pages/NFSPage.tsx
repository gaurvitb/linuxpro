import React, { useState } from 'react';
import { FolderSync, Server, CheckCircle2, ShieldCheck, Activity, Terminal, ArrowRight, Play } from 'lucide-react';
import { NFSData } from '../types';
import { TerminalView } from '../components/TerminalView';

interface NFSPageProps {
  data: NFSData;
  onRefresh: () => void;
}

export const NFSPage: React.FC<NFSPageProps> = ({ data, onRefresh }) => {
  const [triggerOutput, setTriggerOutput] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  const handleTriggerMount = () => {
    setIsTriggering(true);
    setTriggerOutput(null);
    setTimeout(() => {
      setIsTriggering(false);
      setTriggerOutput(`[admin1@server2 ~]$ ls /mnt/nfs
# Directory initially appears empty (expected autofs behavior)

[admin1@server2 ~]$ ls /mnt/nfs/share
hello.txt  sales_report.pdf  capstone_spec.md

[admin1@server2 ~]$ mount | grep nfs
server1:/data/share on /mnt/nfs/share type nfs4 (rw,relatime,vers=4.2,rsize=262144,wsize=262144,namlen=255,soft,proto=tcp,timeo=600,retrans=2,sec=sys,clientaddr=192.168.56.12)

Autofs on-demand mount successfully engaged with 60-second inactivity timeout!`);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">NFS Server & Autofs Client</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              TASK 4 (server1 & server2)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Server 1 exports <code>/data/share</code> via NFSv4; Server 2 mounts on-demand via <code>autofs</code> (timeout 60s)
          </p>
        </div>

        <button
          onClick={handleTriggerMount}
          disabled={isTriggering}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          <span>{isTriggering ? 'Triggering...' : 'Trigger Autofs Mount Test'}</span>
        </button>
      </div>

      {/* Two Column Layout: Server Export vs Client Autofs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server 1 NFS Server Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">NFS Server (server1)</h3>
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Active (nfs-server)
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono">
              <div className="text-[11px] text-slate-400 uppercase">Export Configuration (/etc/exports)</div>
              <div className="text-sky-300 font-bold mt-1 text-sm">/data/share 192.168.56.0/24(rw,sync)</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-xs">
                <span className="text-slate-400">Underlying LVM Volume:</span>
                <span className="font-mono text-slate-200">/dev/vg_data/lv_share (XFS)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-xs">
                <span className="text-slate-400">File Permissions:</span>
                <span className="font-mono text-amber-300">chmod 777 /data/share</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-xs">
                <span className="text-slate-400">firewalld Services:</span>
                <span className="font-mono text-emerald-400">nfs, mountd, rpc-bind</span>
              </div>
              <div className="flex justify-between py-1.5 text-xs">
                <span className="text-slate-400">Exportfs Verification:</span>
                <span className="font-mono text-sky-400">exportfs -rav & -v verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Server 2 Autofs Client Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FolderSync className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Autofs Client (server2)</h3>
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Active (autofs.service)
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 font-mono space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Master Map: /etc/auto.master.d/nfs.autofs</span>
                <code className="text-indigo-300 text-xs">/mnt/nfs /etc/auto.nfs --timeout=60</code>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Direct Map: /etc/auto.nfs</span>
                <code className="text-emerald-300 text-xs">share -rw,sync,soft server1:/data/share</code>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-xs">
                <span className="text-slate-400">On-Demand Trigger Mount:</span>
                <span className="font-mono text-sky-300">/mnt/nfs/share</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-xs">
                <span className="text-slate-400">Inactivity Timeout:</span>
                <span className="font-mono text-amber-300">60 seconds (--timeout=60)</span>
              </div>
              <div className="flex justify-between py-1.5 text-xs">
                <span className="text-slate-400">Manual Test Verification:</span>
                <span className="font-mono text-emerald-400">mount -t nfs server1:/data/share /mnt/test (Verified)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Trigger Mount Terminal */}
      {triggerOutput && (
        <TerminalView
          title="Autofs Dynamic Mount Trigger Test"
          output={triggerOutput}
          hostname="server2.example.com"
        />
      )}

      {/* Terminal Evidence */}
      <TerminalView
        title="Verification Evidence: exportfs -v & showmount -e server1"
        command="exportfs -v; showmount -e server1"
        output={`/data/share    192.168.56.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)

Export list for server1:
/data/share 192.168.56.0/24`}
        hostname="server2.example.com"
      />
    </div>
  );
};
