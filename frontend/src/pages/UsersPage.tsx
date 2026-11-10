import React from 'react';
import { Users, Shield, FolderLock, CheckCircle2, Lock, Terminal, FileText } from 'lucide-react';
import { UserManagementData } from '../types';
import { TerminalView } from '../components/TerminalView';

interface UsersPageProps {
  data: UserManagementData;
  onRefresh: () => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ data, onRefresh }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Users, Groups & Delegated Sudo</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              TASK 2 (server1 & server2)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Department collaboration via setgid (<code>/srv/sales</code> 2770) and least-privilege delegated sudo for the <code>it</code> group
          </p>
        </div>

        <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
          <Shield className="w-4 h-4 mr-1.5" />
          Least-Privilege RBAC Enforced
        </span>
      </div>

      {/* Shared Department Directory Card & Delegated Sudo Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Directory Card (chmod 2770) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FolderLock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shared Department Directory</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Setgid (2770)
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Target Path:</span>
              <span className="text-sky-300 font-bold">{data.shared_directory.path}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Ownership:</span>
              <span className="text-slate-200">{data.shared_directory.owner}:{data.shared_directory.group}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Octal Permissions:</span>
              <span className="text-emerald-400 font-bold">{data.shared_directory.permissions_octal}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Symbolic Mode:</span>
              <span className="text-amber-300">{data.shared_directory.permissions_symbolic}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Setgid Behavior:</span>
              <span className="text-emerald-400 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                New files automatically inherit 'sales' group
              </span>
            </div>
          </div>
        </div>

        {/* Delegated Sudoers Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Delegated Sudo Policy</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {data.delegated_sudo.file_path}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Target Principal:</span>
              <span className="text-purple-300 font-bold">{data.delegated_sudo.target} (Group members)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">File Mode:</span>
              <span className="text-slate-200">0440 (read-only)</span>
            </div>
            <div className="py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400 block mb-1">Permitted Command Allowlist:</span>
              <div className="space-y-1">
                {data.delegated_sudo.commands_allowed.map((cmd, idx) => (
                  <div key={idx} className="p-1.5 rounded bg-slate-950 text-emerald-400 font-mono text-[11px] border border-slate-800">
                    {cmd}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">visudo Syntax Check:</span>
              <span className="text-emerald-400 font-semibold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Validated via visudo -cf
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Users & Groups Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">System Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2">Username</th>
                  <th className="pb-2">UID / GID</th>
                  <th className="pb-2">Primary</th>
                  <th className="pb-2">Supplementary Groups</th>
                  <th className="pb-2">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.users.map((u) => (
                  <tr key={u.username} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-white flex items-center">
                      <Lock className="w-3 h-3 text-slate-500 mr-1.5" />
                      {u.username}
                    </td>
                    <td className="py-2.5 text-slate-400">{u.uid} : {u.gid}</td>
                    <td className="py-2.5 text-slate-300">{u.primary_group}</td>
                    <td className="py-2.5 text-sky-400">{u.supplementary_groups.join(', ')}</td>
                    <td className="py-2.5">
                      {u.is_admin ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          IT Admin (Delegated)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          Standard User
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Groups Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Department Groups</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2">Group</th>
                  <th className="pb-2">GID</th>
                  <th className="pb-2">Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.groups.map((g) => (
                  <tr key={g.groupname} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-sky-300">{g.groupname}</td>
                    <td className="py-2.5 text-slate-400">{g.gid}</td>
                    <td className="py-2.5 text-slate-200">{g.members.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Terminal Evidence */}
      <TerminalView
        title="Verification Evidence: sudo -l -U admin1 & ls -ld /srv/sales"
        command="sudo -l -U admin1; id alice; ls -ld /srv/sales"
        output={`Matching Defaults entries for admin1 on server1:
    !visiblepw, always_set_home, match_group_by_gid, env_reset,
    env_keep="COLORS DISPLAY HOSTNAME HISTSIZE KDEDIR LS_COLORS",
    secure_path=/sbin\\:/bin\\:/usr/sbin\\:/usr/bin

User admin1 may run the following commands on server1:
    (ALL) /usr/bin/systemctl restart httpd, /usr/bin/systemctl status httpd

uid=1001(alice) gid=1001(alice) groups=1001(alice),1004(sales)

drwxrws---. 2 root sales 6 Nov 10 09:30 /srv/sales`}
        hostname="server1.example.com"
      />
    </div>
  );
};

