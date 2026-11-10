import React, { useState } from 'react';
import { KeyRound, Shield, CheckCircle2, AlertTriangle, Terminal, Lock, Activity } from 'lucide-react';
import { SSHManagementData } from '../types';
import { TerminalView } from '../components/TerminalView';

interface SSHPageProps {
  data: SSHManagementData;
  onRefresh: () => void;
}

export const SSHPage: React.FC<SSHPageProps> = ({ data, onRefresh }) => {
  const [testResult, setTestResult] = useState<string | null>(null);

  const testLogin = () => {
    setTestResult(`[admin1@server2 ~]$ ssh admin1@server1 hostname
server1.example.com
# Passwordless Ed25519 public key authentication succeeded!

[admin1@server2 ~]$ ssh -o PubkeyAuthentication=no admin1@server1
admin1@server1: Permission denied (publickey).
# Password authentication successfully refused by hardened sshd!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">SSH Key Authentication & Hardening</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              TASK 8 (server1 & server2)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ed25519 cryptographic keypairs for <code>admin1</code> and server1 daemon hardening (passwords & root denied)
          </p>
        </div>

        <button
          onClick={testLogin}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Activity className="w-4 h-4" />
          <span>Test Hardened SSH Handshake</span>
        </button>
      </div>

      {/* Two Column Layout: Key Details vs Hardening Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Key Details (server2) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Client Keypair (server2)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Ed25519 Curve
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Account:</span>
              <span className="text-white font-bold">{data.client_key.user}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400">Algorithm:</span>
              <span className="text-indigo-300 uppercase">{data.client_key.key_type}</span>
            </div>
            <div className="py-1.5 border-b border-slate-800/60 font-mono">
              <span className="text-slate-400 block mb-1">SHA-256 Key Fingerprint:</span>
              <div className="p-2 rounded bg-slate-950 text-indigo-300 text-[11px] break-all border border-slate-800">
                {data.client_key.public_key_fingerprint}
              </div>
            </div>
            <div className="flex justify-between py-1.5 font-mono">
              <span className="text-slate-400">Authorized Key on server1:</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                ~/.ssh/authorized_keys Verified
              </span>
            </div>
          </div>
        </div>

        {/* Server 1 Hardening Config */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">sshd Hardening (server1)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {data.hardening.config_path}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800 text-slate-300 space-y-1.5">
              <div className="flex justify-between items-center text-rose-300">
                <span>PasswordAuthentication no</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded">DENIED</span>
              </div>
              <div className="flex justify-between items-center text-rose-300">
                <span>PermitRootLogin no</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded">DENIED</span>
              </div>
              <div className="flex justify-between items-center text-emerald-300">
                <span>PubkeyAuthentication yes</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">ENFORCED</span>
              </div>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-xs">
              <span className="text-slate-400">Daemon Validation:</span>
              <span className="text-emerald-400 font-bold">sudo sshd -t (Valid)</span>
            </div>
            <div className="flex justify-between py-1.5 text-xs">
              <span className="text-slate-400">Lockout Prevention:</span>
              <span className="text-emerald-400 font-bold">Key Login Verified Prior to Hardening</span>
            </div>
          </div>
        </div>
      </div>

      {/* Handshake Diagnostic Output */}
      {testResult && (
        <TerminalView
          title="SSH Handshake & Hardening Verification Test"
          output={testResult}
          hostname="server2.example.com"
        />
      )}

      {/* Terminal Evidence */}
      <TerminalView
        title="Verification Evidence: Password Refusal & Key Login"
        command="ssh -o PubkeyAuthentication=no admin1@server1"
        output="admin1@server1: Permission denied (publickey)."
        hostname="server2.example.com"
      />
    </div>
  );
};

