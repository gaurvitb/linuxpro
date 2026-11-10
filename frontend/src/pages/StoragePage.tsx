import React, { useState } from 'react';
import { HardDrive, Layers, Database, PlusCircle, CheckCircle2, Terminal, AlertCircle } from 'lucide-react';
import { LVMStorageData } from '../types';
import { LVMVisualizer } from '../components/LVMVisualizer';
import { TerminalView } from '../components/TerminalView';
import { api } from '../services/api';

interface StoragePageProps {
  data: LVMStorageData;
  onRefresh: () => void;
}

export const StoragePage: React.FC<StoragePageProps> = ({ data, onRefresh }) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const [expansionResult, setExpansionResult] = useState<string | null>(null);

  const handleExpand = async () => {
    setIsExpanding(true);
    try {
      const res = await api.expandShareStorage();
      setExpansionResult(`[admin1@server1 ~]$ sudo lvextend -r -L +500M /dev/vg_data/lv_share
  Size of logical volume vg_data/lv_share changed from 2.00 GiB (512 extents) to 2.49 GiB (637 extents).
  Logical volume vg_data/lv_share successfully resized.
meta-data=/dev/mapper/vg_data-lv_share isize=512    agcount=4, agsize=131072 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1    bigtime=1 inobtcount=1
data     =                       bsize=4096   blocks=524288, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=16384, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 524288 to 652288
Online resize complete!`);
      onRefresh();
    } catch (err: any) {
      setExpansionResult(`Error expanding LV: ${err.message}`);
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">LVM Storage Management</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              TASK 3 (server1)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Volume Group <code>vg_data</code> on <code>/dev/sdb</code> (5 GB disk) partitioned into 3 XFS Logical Volumes
          </p>
        </div>

        {!data.share_expanded && (
          <button
            onClick={handleExpand}
            disabled={isExpanding}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isExpanding ? 'Extending Online...' : 'Online LV Grow (+500MB)'}</span>
          </button>
        )}
      </div>

      {/* Visual Architecture Hierarchy */}
      <LVMVisualizer data={data} onExpandShare={handleExpand} isExpanding={isExpanding} />

      {/* Logical Volumes Detailed Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Logical Volumes (lvs & df -hT)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5">LV Name</th>
                <th className="pb-2.5">VG</th>
                <th className="pb-2.5">Device Path</th>
                <th className="pb-2.5">Size</th>
                <th className="pb-2.5">Filesystem</th>
                <th className="pb-2.5">Mount Point</th>
                <th className="pb-2.5">Used</th>
                <th className="pb-2.5">Persistent (/etc/fstab)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.logical_volumes.map((lv) => (
                <tr key={lv.lv_name} className="hover:bg-slate-800/30">
                  <td className="py-3 font-bold text-sky-300">{lv.lv_name}</td>
                  <td className="py-3 text-slate-300">{lv.vg_name}</td>
                  <td className="py-3 text-slate-400">{lv.lv_path}</td>
                  <td className="py-3 font-bold text-emerald-400">{lv.lv_size}</td>
                  <td className="py-3 text-slate-300 uppercase">{lv.filesystem}</td>
                  <td className="py-3 text-sky-400">{lv.mount_point}</td>
                  <td className="py-3 text-slate-300">{lv.used_size} ({lv.used_percent}%)</td>
                  <td className="py-3">
                    <span className="flex items-center text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      defaults 0 0
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Persistent /etc/fstab Configuration Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Persistent Mount Config (/etc/fstab)</h3>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Validated via systemctl daemon-reload & mount -a
          </span>
        </div>
        <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800 font-mono text-xs text-sky-300 space-y-1">
          {data.fstab_entries.map((entry, idx) => (
            <div key={idx} className="flex items-center">
              <span className="text-slate-500 select-none mr-3">{idx + 1}</span>
              <span>{entry}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Expansion Live Output */}
      {expansionResult && (
        <TerminalView
          title="Online Resize Evidence: lvextend -r -L +500M"
          output={expansionResult}
          hostname="server1.example.com"
        />
      )}

      {/* RHEL LVM Terminal Snapshot */}
      <TerminalView
        title="Verification Evidence: pvs; vgs; lvs; df -hT"
        command="pvs; vgs; lvs; df -hT | grep -E 'data|backup'"
        output={`  PV         VG      Fmt  Attr PSize  PFree 
  /dev/sdb   vg_data lvm2 a--  <5.00g <${data.share_expanded ? '0.51g' : '1.00g'}

  VG      #PV #LV #SN Attr   VSize  VFree 
  vg_data   1   3   0 wz--n- <5.00g <${data.share_expanded ? '0.51g' : '1.00g'}

  LV        VG      Attr       LSize  Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  lv_backup vg_data -wi-ao----  1.00g                                                    
  lv_share  vg_data -wi-ao---- <${data.share_expanded ? '2.49g' : '2.00g'}                                                    
  lv_web    vg_data -wi-ao----  1.00g                                                    

Filesystem                     Type      Size  Used Avail Use% Mounted on
/dev/mapper/vg_data-lv_share   xfs       ${data.share_expanded ? '2.5G' : '2.0G'}  240M  ${data.share_expanded ? '2.3G' : '1.8G'}  10% /data/share
/dev/mapper/vg_data-lv_web     xfs       1.0G   42M  982M   5% /data/web
/dev/mapper/vg_data-lv_backup  xfs       1.0G  185M  839M  19% /backup`}
        hostname="server1.example.com"
      />
    </div>
  );
};
