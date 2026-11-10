import React, { useState } from 'react';
import { Boxes, Play, Terminal, CheckCircle2, ShieldCheck, Activity, Globe } from 'lucide-react';
import { PodmanData } from '../types';
import { TerminalView } from '../components/TerminalView';

interface ContainersPageProps {
  data: PodmanData;
  onRefresh: () => void;
}

export const ContainersPage: React.FC<ContainersPageProps> = ({ data, onRefresh }) => {
  const [curlOutput, setCurlOutput] = useState<string | null>(null);

  const testContainerEndpoint = () => {
    setCurlOutput(`[admin1@server2 ~]$ curl -s -I http://localhost:8081
HTTP/1.1 200 OK
Date: Tue, 10 Nov 2026 04:35:10 GMT
Server: Apache/2.4.57 (Red Hat Enterprise Linux)
Last-Modified: Fri, 01 Mar 2026 12:00:00 GMT
ETag: "1c-5c8e1a0"
Accept-Ranges: bytes
Content-Length: 28
Content-Type: text/html; charset=UTF-8

[admin1@server2 ~]$ systemctl --user status container-webc.service
● container-webc.service - Podman container-webc.service
     Loaded: loaded (/home/admin1/.config/systemd/user/container-webc.service; enabled; preset: disabled)
     Active: active (running) since Tue 2026-11-10 02:15:30 UTC; 3h ago
       Docs: man:podman-generate-systemd(1)
   Main PID: 14820 (conmon)
      Tasks: 4 (limit: 11128)
     Memory: 18.2M
        CPU: 1.412s
     CGroup: /user.slice/user-1003.slice/user@1003.service/app.slice/container-webc.service`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Rootless Podman Containerization</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              TASK 11 (server2)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Red Hat Universal Base Image (UBI 9) HTTPD container managed via user-level systemd unit with linger enabled
          </p>
        </div>

        <button
          onClick={testContainerEndpoint}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Activity className="w-4 h-4" />
          <span>curl http://localhost:8081</span>
        </button>
      </div>

      {/* Containers Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Containers (podman ps)</h3>
          <span className="text-xs font-mono text-slate-400">{data.version}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5">Name</th>
                <th className="pb-2.5">Container ID</th>
                <th className="pb-2.5">Base Image</th>
                <th className="pb-2.5">Port Forwarding</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Systemd Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.containers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="py-3 font-bold text-emerald-400 flex items-center">
                    <Boxes className="w-4 h-4 mr-2 text-slate-500" />
                    {c.name}
                  </td>
                  <td className="py-3 text-slate-400">{c.id}</td>
                  <td className="py-3 text-slate-300">{c.image}</td>
                  <td className="py-3 text-sky-400 font-bold">{c.ports}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 text-indigo-300 font-semibold">{c.systemd_service} (enabled)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout: Systemd Integration vs Security Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Systemd User Service Integration Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">User Systemd Service</h3>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Auto-Start at Boot
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Unit File Path:</span>
              <span className="text-sky-300">~/.config/systemd/user/container-webc.service</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">User Lingering:</span>
              <span className="text-emerald-400 font-bold">loginctl enable-linger admin1 (Active)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Service Status:</span>
              <span className="text-emerald-400 font-bold">systemctl --user is-active container-webc (active)</span>
            </div>
            <div className="flex justify-between py-1.5 font-mono">
              <span className="text-slate-400">Host Port:</span>
              <span className="text-white">8081 mapped to container 8080 (non-privileged)</span>
            </div>
          </div>
        </div>

        {/* Rootless Container Architecture Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Rootless Security Architecture</h3>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              No Daemon / No Root
            </span>
          </div>

          <p className="mt-4 text-xs text-slate-300 leading-relaxed">
            Podman executes containers using Linux user namespaces without requiring a privileged daemon like Docker. Even if the process inside the container is breached, root privileges are constrained strictly within the unprivileged user namespace of <code>admin1</code>.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
            Command: <code>podman run -d --name webc -p 8081:8080 registry.access.redhat.com/ubi9/httpd-24</code>
          </div>
        </div>
      </div>

      {/* Terminal Curl Test Output */}
      {curlOutput && (
        <TerminalView
          title="Podman Container Service Response (curl :8081)"
          output={curlOutput}
          hostname="server2.example.com"
        />
      )}

      {/* Terminal Evidence */}
      <TerminalView
        title="Verification Evidence: podman ps"
        command="podman ps"
        output={`CONTAINER ID  IMAGE                                              COMMAND               CREATED        STATUS            PORTS                   NAMES
a39f1c7e92b8  registry.access.redhat.com/ubi9/httpd-24:latest  /usr/bin/run-httpd    3 hours ago    Up 3 hours ago    0.0.0.0:8081->8080/tcp  webc`}
        hostname="server2.example.com"
      />
    </div>
  );
};
