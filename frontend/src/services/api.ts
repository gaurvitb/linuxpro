import {
  OverviewData, ServerSummary, NetworkTopologyInfo, UserManagementData,
  LVMStorageData, NFSData, ApacheStatus, SELinuxData, FirewallData,
  SSHManagementData, BackupData, SystemLogsData, PodmanData,
  RebootVerificationReport, OperationResult
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  getOverview: () => fetchJSON<OverviewData>('/system/overview'),
  getServers: () => fetchJSON<ServerSummary[]>('/servers'),
  getServer: (id: string) => fetchJSON<ServerSummary>(`/servers/${id}`),
  getNetworkTopology: () => fetchJSON<NetworkTopologyInfo>('/network/topology'),
  getUsers: () => fetchJSON<UserManagementData>('/users'),
  getLVMStorage: () => fetchJSON<LVMStorageData>('/storage/lvm'),
  expandShareStorage: () => fetchJSON<{ success: boolean; message: string; new_size: string }>('/storage/expand-share', { method: 'POST' }),
  getNFSStatus: () => fetchJSON<NFSData>('/nfs/status'),
  getApacheStatus: () => fetchJSON<ApacheStatus>('/apache/status'),
  getSELinuxData: () => fetchJSON<SELinuxData>('/security/selinux'),
  getFirewallData: () => fetchJSON<FirewallData>('/security/firewall'),
  getSSHManagement: () => fetchJSON<SSHManagementData>('/security/ssh'),
  getBackupHistory: () => fetchJSON<BackupData>('/backup/history'),
  triggerBackup: () => fetchJSON<OperationResult>('/backup/trigger', { method: 'POST' }),
  testRestore: (confirm: boolean) => fetchJSON<OperationResult>('/backup/restore-test', {
    method: 'POST',
    body: JSON.stringify({ confirm }),
  }),
  getSystemLogs: (service?: string) => fetchJSON<SystemLogsData>(`/logs/system${service ? `?service=${service}` : ''}`),
  getContainers: () => fetchJSON<PodmanData>('/containers'),
  getRebootVerification: () => fetchJSON<RebootVerificationReport>('/verification/reboot'),
  executeOperation: (operation_id: string, server_id: string = 'server1', confirm: boolean = false) =>
    fetchJSON<OperationResult>('/operations/execute', {
      method: 'POST',
      body: JSON.stringify({ operation_id, server_id, confirm }),
    }),
  getSettings: () => fetchJSON<any>('/settings'),
  setMode: (mode: 'LIVE' | 'DEMO') => fetchJSON<{ status: string; mode: string }>('/settings/mode', {
    method: 'POST',
    body: JSON.stringify({ mode }),
  }),
};
