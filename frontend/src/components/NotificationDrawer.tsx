import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Info, Trash2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'security';
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: '1',
      title: 'SELinux Enforcing Active',
      message: 'SELinux policy targeted is in Enforcing mode with 0 AVC denials.',
      time: '10 min ago',
      type: 'security',
    },
    {
      id: '2',
      title: 'Nightly Backup Verified',
      message: 'Archive backup_2026-11-10_0200.tar.gz verified in /backup.',
      time: '2 hours ago',
      type: 'success',
    },
    {
      id: '3',
      title: 'Autofs Direct Map Online',
      message: 'Server 2 autofs service triggered mount at /mnt/nfs/share.',
      time: '3 hours ago',
      type: 'info',
    },
    {
      id: '4',
      title: 'SSH Hardening Active',
      message: 'Password authentication disabled. Ed25519 key authentication enforced.',
      time: '5 hours ago',
      type: 'security',
    },
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm h-full bg-[#0d1424] border-l border-slate-800 p-6 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-white text-base">Infrastructure Alerts</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-400">
              {notifications.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <button
                onClick={() => setNotifications([])}
                className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                title="Clear all alerts"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No active alerts. All systems operational.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {item.type === 'security' && <ShieldCheck className="w-4 h-4 text-purple-400" />}
                    {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {item.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {item.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
                    <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed pl-6">{item.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

