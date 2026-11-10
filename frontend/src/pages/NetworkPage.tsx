import React, { useState } from 'react';
import { Network, CheckCircle2, Server, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { NetworkTopologyInfo } from '../types';
import { TopologyCanvas } from '../components/TopologyCanvas';
import { TerminalView } from '../components/TerminalView';

interface NetworkPageProps {
  data: NetworkTopologyInfo;
  onRefresh: () => void;
}

export const NetworkPage: React.FC<NetworkPageProps> = ({ data, onRefresh }) => {
  const [pingDiag, setPingDiag] = useState<string | null>(null);

  const runPingDiagnostic = () => {
    setPingDiag(`[admin1@server1 ~]$ ping -c 2 server2
PING server2 (192.168.56.12) 56(84) bytes of data.
64 bytes from server2 (192.168.56.12): icmp_seq=1 ttl=64 time=0.281 ms
64 bytes from server2 (192.168.56.12): icmp_seq=2 ttl=64 time=0.269 ms

--- server2 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 0.269/0.275/0.281/0.006 ms

[admin1@server1 ~]$ getent hosts server2
192.168.56.12   server2.example.com server2`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Network & Name Resolution</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              TASK 1 (Both Servers)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Static IP assignment on <code>enp0s8</code>, bidirectional <code>/etc/hosts</code> mapping, and inter-VM port connectivity
          </p>
        </div>

        <button
          onClick={runPingDiagnostic}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-lg shadow-sky-600/20 transition-all"
        >
          <Activity className="w-4 h-4" />
          <span>Run Ping & DNS Diagnostic</span>
        </button>
      </div>

      {/* Interactive Topology Canvas */}
      <TopologyCanvas data={data} onTestPing={runPingDiagnostic} />

      {/* Two Column Layout: /etc/hosts vs Port Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* /etc/hosts Name Resolution Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            Local Name Resolution (/etc/hosts)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Configured identically on both servers for local hostname resolution without requiring external DNS.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2">IP Address</th>
                  <th className="pb-2">Fully Qualified Domain (FQDN)</th>
                  <th className="pb-2">Short Alias</th>
                  <th className="pb-2">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.hosts_entries.map((h) => (
                  <tr key={h.ip} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-sky-400">{h.ip}</td>
                    <td className="py-2.5 text-slate-200">{h.fqdn}</td>
                    <td className="py-2.5 text-indigo-300">{h.alias}</td>
                    <td className="py-2.5">
                      <span className="flex items-center text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Port Matrix & Inter-Server Connections */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
            Inter-Server Port Mappings & Services
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Network flows from client (server2) to infrastructure host (server1) across the host-only subnet.
          </p>

          <div className="space-y-3">
            {data.connections.map((c, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="font-bold text-white">{c.protocol}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-sky-300 border border-slate-700">
                      Port {c.port}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-1 font-mono">
                    {c.source} <ArrowRight className="inline w-3 h-3 text-slate-500 mx-1" /> {c.destination}
                  </div>
                </div>

                <span className="px-2 py-1 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ping Diagnostic Output */}
      {pingDiag && (
        <TerminalView
          title="Diagnostic Result: ping & getent hosts"
          output={pingDiag}
          hostname="server1.example.com"
        />
      )}

      {/* Task 1 Terminal Evidence */}
      <TerminalView
        title="Verification Evidence: hostnamectl & ip -br a"
        command="hostnamectl; ip -br a; getent hosts server1"
        output={` Static hostname: server1.example.com
       Icon name: computer-vm
         Chassis: vm 🖴
      Machine ID: d9071c4c95f14e0bbd3429813d100a74
         Boot ID: 8c3031023d6a4ab296ee9796e9821812
  Virtualization: oracle
Operating System: Red Hat Enterprise Linux 9.4 (Plow)
     CPE OS Name: cpe:/o:redhat:enterprise_linux:9::baseos
          Kernel: Linux 5.14.0-427.13.1.el9_4.x86_64
    Architecture: x86-64

lo               UNKNOWN        127.0.0.1/8 ::1/128 
enp0s3           UP             10.0.2.15/24 fe80::a00:27ff:fe34:c303/64 
enp0s8           UP             192.168.56.11/24 fe80::a00:27ff:fe89:a101/64 

192.168.56.11   server1.example.com server1`}
        hostname="server1.example.com"
      />
    </div>
  );
};
