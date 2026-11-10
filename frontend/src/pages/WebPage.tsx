import React, { useState } from 'react';
import { Globe, Server, CheckCircle2, ShieldCheck, Terminal, ExternalLink, Activity, ArrowRight } from 'lucide-react';
import { ApacheStatus } from '../types';
import { TerminalView } from '../components/TerminalView';

interface WebPageProps {
  data: ApacheStatus;
  onRefresh: () => void;
}

export const WebPage: React.FC<WebPageProps> = ({ data, onRefresh }) => {
  const [curlOutput, setCurlOutput] = useState<string | null>(null);
  const [isCurling, setIsCurling] = useState<boolean>(false);

  const handleTestCurl = () => {
    setIsCurling(true);
    setCurlOutput(null);
    setTimeout(() => {
      setIsCurling(false);
      setCurlOutput(`[admin1@server2 ~]$ curl -s -I http://server1:82
HTTP/1.1 200 OK
Date: Tue, 10 Nov 2026 04:30:15 GMT
Server: Apache/2.4.57 (Red Hat Enterprise Linux)
Last-Modified: Tue, 10 Nov 2026 04:00:10 GMT
ETag: "34a-605a9101c0"
Accept-Ranges: bytes
Content-Length: 842
Content-Type: text/html; charset=UTF-8

[admin1@server2 ~]$ curl -s http://server1:82 | head -n 6
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>server1 - RHCSA Capstone Website</title>
  ...`);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Apache Web Server (Custom Port 82)</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              TASK 5 (server1)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production Apache HTTPD server running on custom TCP Port 82 with DocumentRoot mapped to LVM storage <code>/data/web</code>
          </p>
        </div>

        <button
          onClick={handleTestCurl}
          disabled={isCurling}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
        >
          <Activity className="w-4 h-4" />
          <span>{isCurling ? 'Curling...' : 'curl -I http://server1:82'}</span>
        </button>
      </div>

      {/* Two Column Layout: VirtualHost Specs vs Live Hosted Portal Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VirtualHost Configuration Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">VirtualHost Specification</h3>
            </div>
            <span className="flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              HTTP/1.1 200 OK
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Listening Port:</span>
              <span className="text-emerald-400 font-bold">Port 82 (Listen 82)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">ServerName:</span>
              <span className="text-slate-200">{data.virtual_host.server_name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">DocumentRoot:</span>
              <span className="text-sky-300 font-bold">{data.virtual_host.document_root}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Configuration File:</span>
              <span className="text-indigo-300">{data.virtual_host.config_file}</span>
            </div>
            <div className="flex justify-between py-1.5 font-mono">
              <span className="text-slate-400">httpd -t Syntax Check:</span>
              <span className="text-emerald-400 font-bold">Syntax OK</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-[#070b14] border border-slate-800 font-mono text-[11px] text-slate-300">
            <div className="text-slate-500 select-none mb-1"># /etc/httpd/conf.d/capstone.conf</div>
            <pre className="text-sky-300 whitespace-pre-wrap">{`<VirtualHost *:82>
    ServerName server1.example.com
    DocumentRoot /data/web
    <Directory /data/web>
        Require all granted
    </Directory>
</VirtualHost>`}</pre>
          </div>
        </div>

        {/* Live Website Preview (IFrame / Sandbox Card) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400">Browser: http://server1.example.com:82</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              200 OK ({data.response_time_ms}ms)
            </span>
          </div>

          <div className="flex-1 mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4 overflow-hidden flex flex-col justify-center">
            <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-5 text-center shadow-lg">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 mb-2">
                RHEL 9 / 10 Production Host
              </span>
              <h2 className="text-lg font-bold text-white mb-1">server1 - RHCSA Capstone Website</h2>
              <p className="text-xs text-slate-400 font-mono">
                DocumentRoot: <code className="text-sky-300">/data/web</code> | Port: <code className="text-sky-300">82</code>
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                SELinux Context: <code>httpd_sys_content_t</code> | Firewall: <code>82/tcp ALLOW</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Curl Test Output */}
      {curlOutput && (
        <TerminalView
          title="Remote Connectivity Test: curl -s -I http://server1:82"
          output={curlOutput}
          hostname="server2.example.com"
        />
      )}

      {/* Terminal Evidence */}
      <TerminalView
        title="Verification Evidence: httpd -t & curl http://localhost:82"
        command="sudo httpd -t; curl -I http://localhost:82"
        output={`Syntax OK
HTTP/1.1 200 OK
Date: Tue, 10 Nov 2026 04:30:15 GMT
Server: Apache/2.4.57 (Red Hat Enterprise Linux)
Last-Modified: Tue, 10 Nov 2026 04:00:10 GMT
ETag: "34a-605a9101c0"
Accept-Ranges: bytes
Content-Length: 842
Content-Type: text/html; charset=UTF-8`}
        hostname="server1.example.com"
      />
    </div>
  );
};

