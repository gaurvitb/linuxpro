import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { OverviewPage } from './pages/OverviewPage';
import { ServersPage } from './pages/ServersPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { StoragePage } from './pages/StoragePage';
import { NetworkPage } from './pages/NetworkPage';
import { UsersPage } from './pages/UsersPage';
import { NFSPage } from './pages/NFSPage';
import { WebPage } from './pages/WebPage';
import { SELinuxPage } from './pages/SELinuxPage';
import { FirewallPage } from './pages/FirewallPage';
import { SSHPage } from './pages/SSHPage';
import { BackupPage } from './pages/BackupPage';
import { ContainersPage } from './pages/ContainersPage';
import { LogsPage } from './pages/LogsPage';
import { AutomationPage } from './pages/AutomationPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { VerificationPage } from './pages/VerificationPage';
import { SettingsPage } from './pages/SettingsPage';
import { api } from './services/api';
import {
  OverviewData, ServerSummary, NetworkTopologyInfo, UserManagementData,
  LVMStorageData, NFSData, ApacheStatus, SELinuxData, FirewallData,
  SSHManagementData, BackupData, SystemLogsData, PodmanData, RebootVerificationReport
} from './types';
import { RefreshCw, AlertCircle } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Core State
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [servers, setServers] = useState<ServerSummary[]>([]);
  const [network, setNetwork] = useState<NetworkTopologyInfo | null>(null);
  const [users, setUsers] = useState<UserManagementData | null>(null);
  const [storage, setStorage] = useState<LVMStorageData | null>(null);
  const [nfs, setNfs] = useState<NFSData | null>(null);
  const [apache, setApache] = useState<ApacheStatus | null>(null);
  const [selinux, setSelinux] = useState<SELinuxData | null>(null);
  const [firewall, setFirewall] = useState<FirewallData | null>(null);
  const [ssh, setSsh] = useState<SSHManagementData | null>(null);
  const [backup, setBackup] = useState<BackupData | null>(null);
  const [logs, setLogs] = useState<SystemLogsData | null>(null);
  const [containers, setContainers] = useState<PodmanData | null>(null);
  const [verification, setVerification] = useState<RebootVerificationReport | null>(null);

  const fetchAllData = async () => {
    setIsRefreshing(true);
    setErrorMsg(null);
    try {
      const [
        ovRes, srvRes, netRes, usrRes, storRes, nfsRes,
        webRes, seRes, fwRes, sshRes, bkpRes, logRes,
        cntRes, verRes
      ] = await Promise.all([
        api.getOverview(),
        api.getServers(),
        api.getNetworkTopology(),
        api.getUsers(),
        api.getLVMStorage(),
        api.getNFSStatus(),
        api.getApacheStatus(),
        api.getSELinuxData(),
        api.getFirewallData(),
        api.getSSHManagement(),
        api.getBackupHistory(),
        api.getSystemLogs(),
        api.getContainers(),
        api.getRebootVerification(),
      ]);

      setOverview(ovRes);
      setServers(srvRes);
      setNetwork(netRes);
      setUsers(usrRes);
      setStorage(storRes);
      setNfs(nfsRes);
      setApache(webRes);
      setSelinux(seRes);
      setFirewall(fwRes);
      setSsh(sshRes);
      setBackup(bkpRes);
      setLogs(logRes);
      setContainers(cntRes);
      setVerification(verRes);
    } catch (err: any) {
      console.warn('API error, falling back or waiting:', err.message);
      setErrorMsg('Connecting to LINUXPULSE Backend... Refreshing telemetry.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Auto-refresh telemetry every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMode = async () => {
    if (!overview) return;
    const newMode = overview.mode === 'LIVE' ? 'DEMO' : 'LIVE';
    try {
      await api.setMode(newMode);
      fetchAllData();
    } catch (e) {
      // fallback
    }
  };

  if (!overview || servers.length === 0) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 mx-auto">
            <RefreshCw className="w-6 h-6 text-white animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wider">LINUX<span className="text-sky-400">PULSE</span></h2>
            <p className="text-xs text-slate-400 font-mono mt-1">Initializing Infrastructure Telemetry Engine...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        verificationScore={verification?.score_percentage ?? 100}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Topbar */}
        <Topbar
          servers={servers}
          mode={overview.mode}
          onToggleMode={handleToggleMode}
          onRefresh={fetchAllData}
          isRefreshing={isRefreshing}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onNavigateToTab={setCurrentTab}
        />

        {/* Global Error Notice if any */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={fetchAllData} className="underline hover:text-white">Retry</button>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentTab === 'overview' && (
            <OverviewPage
              data={overview}
              onNavigateToTab={setCurrentTab}
              onRefresh={fetchAllData}
              isRefreshing={isRefreshing}
            />
          )}

          {currentTab === 'servers' && (
            <ServersPage
              servers={servers}
              onRefresh={fetchAllData}
              isRefreshing={isRefreshing}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'monitoring' && (
            <MonitoringPage
              servers={servers}
              onRefresh={fetchAllData}
              isRefreshing={isRefreshing}
            />
          )}

          {currentTab === 'storage' && storage && (
            <StoragePage data={storage} onRefresh={fetchAllData} />
          )}

          {currentTab === 'network' && network && (
            <NetworkPage data={network} onRefresh={fetchAllData} />
          )}

          {currentTab === 'users' && users && (
            <UsersPage data={users} onRefresh={fetchAllData} />
          )}

          {currentTab === 'nfs' && nfs && (
            <NFSPage data={nfs} onRefresh={fetchAllData} />
          )}

          {currentTab === 'web' && apache && (
            <WebPage data={apache} onRefresh={fetchAllData} />
          )}

          {currentTab === 'selinux' && selinux && (
            <SELinuxPage data={selinux} onRefresh={fetchAllData} />
          )}

          {currentTab === 'firewall' && firewall && (
            <FirewallPage data={firewall} onRefresh={fetchAllData} />
          )}

          {currentTab === 'ssh' && ssh && (
            <SSHPage data={ssh} onRefresh={fetchAllData} />
          )}

          {currentTab === 'backup' && backup && (
            <BackupPage data={backup} onRefresh={fetchAllData} />
          )}

          {currentTab === 'containers' && containers && (
            <ContainersPage data={containers} onRefresh={fetchAllData} />
          )}

          {currentTab === 'logs' && logs && (
            <LogsPage data={logs} onRefresh={fetchAllData} />
          )}

          {currentTab === 'automation' && (
            <AutomationPage onRefresh={fetchAllData} />
          )}

          {currentTab === 'verification' && verification && (
            <VerificationPage
              data={verification}
              onRefresh={fetchAllData}
              isRefreshing={isRefreshing}
            />
          )}

          {currentTab === 'documentation' && (
            <DocumentationPage />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              mode={overview.mode}
              onToggleMode={handleToggleMode}
              onRefresh={fetchAllData}
            />
          )}
        </main>
      </div>

      {/* Flyout Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}

export default App;
