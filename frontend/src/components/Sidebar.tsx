import React from 'react';
import {
  LayoutDashboard, Server, Activity, HardDrive, Network, Users,
  FolderSync, Globe, ShieldCheck, Flame, KeyRound, Archive,
  Boxes, ScrollText, PlayCircle, BookOpen, Settings, ChevronLeft,
  ChevronRight, CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  verificationScore: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  verificationScore,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'servers', label: 'Servers', icon: Server },
    { id: 'monitoring', label: 'System Monitoring', icon: Activity },
    { id: 'storage', label: 'Storage & LVM', icon: HardDrive, task: 'T3' },
    { id: 'network', label: 'Network & Topology', icon: Network, task: 'T1' },
    { id: 'users', label: 'User Management', icon: Users, task: 'T2' },
    { id: 'nfs', label: 'NFS & Shared Storage', icon: FolderSync, task: 'T4' },
    { id: 'web', label: 'Web Server (Apache)', icon: Globe, task: 'T5' },
    { id: 'selinux', label: 'Security & SELinux', icon: ShieldCheck, task: 'T6' },
    { id: 'firewall', label: 'Firewall (firewalld)', icon: Flame, task: 'T7' },
    { id: 'ssh', label: 'SSH Management', icon: KeyRound, task: 'T8' },
    { id: 'backup', label: 'Backup & Recovery', icon: Archive, task: 'T9' },
    { id: 'containers', label: 'Containers (Podman)', icon: Boxes, task: 'T11' },
    { id: 'logs', label: 'Logs & Events', icon: ScrollText, task: 'T10' },
    { id: 'automation', label: 'Automation Engine', icon: PlayCircle },
    { id: 'verification', label: 'Reboot Verification', icon: CheckCircle2, task: 'T12', highlight: true },
    { id: 'documentation', label: 'Project Documentation', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[#0b1120] border-r border-[#1e293b] flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e293b]">
        {!collapsed ? (
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('overview')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider text-white">LINUX<span className="text-sky-400">PULSE</span></span>
              <span className="block text-[10px] text-slate-400 font-mono tracking-tight uppercase">RHEL Enterprise</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto cursor-pointer" onClick={() => setCurrentTab('overview')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-3 py-1.5">
          {!collapsed && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Administration & Tasks
            </span>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              } ${item.highlight ? 'ring-1 ring-emerald-500/30 bg-emerald-500/5' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-sky-400' : item.highlight ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!collapsed && (
                <div className="ml-3 flex-1 flex items-center justify-between text-left truncate">
                  <span className="truncate">{item.label}</span>
                  {item.task && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        item.highlight
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.task}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-4 border-t border-[#1e293b] bg-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Reboot Audit Score</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{verificationScore}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${verificationScore}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>RHEL 9 / 10 Lab</span>
            <span className="flex items-center text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping" />
              2 Nodes
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
