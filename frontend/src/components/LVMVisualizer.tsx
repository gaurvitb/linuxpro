import React from 'react';
import { HardDrive, Layers, Database, ArrowRight, PlusCircle, CheckCircle2 } from 'lucide-react';
import { LVMStorageData } from '../types';

interface LVMVisualizerProps {
  data: LVMStorageData;
  onExpandShare?: () => void;
  isExpanding?: boolean;
}

export const LVMVisualizer: React.FC<LVMVisualizerProps> = ({
  data,
  onExpandShare,
  isExpanding = false,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white tracking-wide">LVM Storage Hierarchy & Online Allocation</h3>
            {data.share_expanded ? (
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                lv_share Expanded (+500MB)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Baseline (5 GB Pool)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Physical Volume <code>/dev/sdb</code> partitioned and mapped to Volume Group <code>vg_data</code>
          </p>
        </div>

        {onExpandShare && !data.share_expanded && (
          <button
            onClick={onExpandShare}
            disabled={isExpanding}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all text-xs font-semibold disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isExpanding ? 'Extending...' : 'Demo Online Expansion (+500MB)'}</span>
          </button>
        )}
      </div>

      {/* Visual Hierarchy Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Physical Storage (PV) */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">1. Physical Volume (PV)</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">pvcreate</span>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-mono font-bold text-amber-300">/dev/sdb</span>
              <span className="font-mono text-slate-400">5.00 GiB</span>
            </div>
            <div className="text-[11px] text-slate-500">VirtualBox SATA Port 2 (Disk 2)</div>
            <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full"
                style={{ width: data.share_expanded ? '90%' : '80%' }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Allocated: {data.share_expanded ? '4.5 GiB' : '4.0 GiB'}</span>
              <span>Free: {data.share_expanded ? '0.5 GiB' : '1.0 GiB'}</span>
            </div>
          </div>
        </div>

        {/* Volume Group (VG) */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-slate-200">2. Volume Group (VG)</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">vgcreate</span>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-mono font-bold text-sky-300">vg_data</span>
              <span className="font-mono text-slate-400">5.00 GiB Pool</span>
            </div>
            <div className="text-[11px] text-slate-500">Extent Size: 4.00 MiB (1279 extents)</div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300 font-mono">
              <span>Active LVs: 3</span>
              <span className="text-emerald-400">Status: Resilient</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              Backing device: <code>/dev/sdb</code>
            </div>
          </div>
        </div>

        {/* Logical Volumes (LV) */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">3. Logical Volumes (LV)</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">lvcreate</span>
          </div>

          <div className="mt-4 space-y-2.5">
            {data.logical_volumes.map((lv) => (
              <div
                key={lv.lv_name}
                className={`p-2.5 rounded-lg border text-xs transition-all ${
                  lv.lv_name === 'lv_share' && data.share_expanded
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold text-slate-200">{lv.lv_name}</span>
                  <span className="text-emerald-400 font-semibold">{lv.lv_size}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>Mount: <code className="text-sky-300">{lv.mount_point}</code></span>
                  <span className="uppercase text-[10px] font-mono text-slate-500">{lv.filesystem}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

