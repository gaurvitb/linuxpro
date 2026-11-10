import React from 'react';
import { RefreshCw, Bell, Shield, Radio, Terminal, Settings as SettingsIcon } from 'lucide-react';
import { ServerSummary } from '../types';

interface TopbarProps {
  servers: ServerSummary[];
  mode: 'LIVE' | 'DEMO';
  onToggleMode: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenNotifications: () => void;
  onNavigateToTab: (tab: string) => void;
  unreadCount?: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  servers,
  mode,
  onToggleMode,
  onRefresh,
  isRefreshing,
  onOpenNotifications,
  onNavigateToTab,
  unreadCount = 2,
}) => {
  const s1 = servers.find((s) => s.id === 'server1');
  const s2 = servers.find((s) => s.id === 'server2');

  return (
    <header className="h-16 border-b border-[#1e293b] bg-[#0c1322]/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Left: Server Status Pills */}
      <div className="flex items-center space-x-3">
        {/* Server 1 Status */}
        <div
          onClick={() => onNavigateToTab('servers')}
          className="flex items-center px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-sm group"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 group-hover:scale-125 transition-transform animate-pulse" />
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <span>server1</span>
              <span className="text-[10px] text-slate-400 font-mono">192.168.56.11</span>
            </div>
            <div className="text-[10px] text-slate-400">Storage & Apache :82</div>
          </div>
        </div>

        {/* Server 2 Status */}
        <div
          onClick={() => onNavigateToTab('servers')}
          className="flex items-center px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-sm group"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 group-hover:scale-125 transition-transform animate-pulse" />
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <span>server2</span>
              <span className="text-[10px] text-slate-400 font-mono">192.168.56.12</span>
            </div>
            <div className="text-[10px] text-slate-400">Autofs & Podman :8081</div>
          </div>
        </div>
      </div>

      {/* Right Controls: Mode Toggle, Refresh, Quick Actions */}
      <div className="flex items-center space-x-3">
        {/* Operational Mode Badge & Switcher */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={onToggleMode}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              mode === 'LIVE'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${mode === 'LIVE' ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>LIVE</span>
          </button>

          <button
            onClick={onToggleMode}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              mode === 'DEMO'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>DEMO MODE</span>
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all disabled:opacity-50"
          title="Refresh Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
        </button>

        {/* Verification Checklist Shortcut */}
        <button
          onClick={() => onNavigateToTab('verification')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 transition-all text-xs font-semibold"
        >
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Reboot Audit</span>
        </button>

        {/* Terminal / Automation Shortcut */}
        <button
          onClick={() => onNavigateToTab('automation')}
          className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          title="Open Automation Engine"
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          title="Notifications & Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-[#0c1322]" />
          )}
        </button>

        {/* Settings Shortcut */}
        <button
          onClick={() => onNavigateToTab('settings')}
          className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

