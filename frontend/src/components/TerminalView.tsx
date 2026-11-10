import React, { useState } from 'react';
import { Terminal as TerminalIcon, Copy, Check } from 'lucide-react';

interface TerminalViewProps {
  title?: string;
  command?: string;
  output: string;
  hostname?: string;
  user?: string;
  className?: string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  title = 'RHEL 9 / 10 Terminal Session',
  command,
  output,
  hostname = 'server1.example.com',
  user = 'admin1',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = command ? `[${user}@${hostname} ~]$ ${command}\n${output}` : output;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border border-slate-800 bg-[#070b14] overflow-hidden shadow-2xl ${className}`}>
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center space-x-2 ml-3">
            <TerminalIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-mono text-slate-300 font-medium">{title}</span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Copy output"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Terminal Screen */}
      <div className="p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-96 leading-relaxed select-text space-y-2">
        {command && (
          <div className="flex items-start text-sky-400 font-semibold space-x-1">
            <span className="text-emerald-400">[{user}@{hostname} ~]$</span>
            <span className="text-white">{command}</span>
          </div>
        )}
        <pre className="text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
          {output}
        </pre>
      </div>
    </div>
  );
};

