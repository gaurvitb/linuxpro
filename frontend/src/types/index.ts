// TypeScript interfaces for LINUXPULSE

export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface ServerMetrics {
  cpu_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  ram_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
  disk_percent: number;
  load_1m: number;
  load_5m: number;
  load_15m: number;
  cpu_history: MetricPoint[];
  ram_history: MetricPoint[];
  network_rx_mb: number;
  network_tx_mb: number;
}

export interface NetworkInterface {
  name: string;
  ip_address: string;
  mac_address: string;
  status: string;
  mtu: number;
  profile_name: string;
}

export interface SystemService {
  name: string;
  description: string;
  load_state: string;
  active_state: string;
  sub_state: string;
  enabled: boolean;
  unit_file_preset?: string;
}

export interface ServerSummary {
  id: string;
  hostname: string;
  ip: string;
  os_name: string;
  kernel_version: string;
  arch: string;
  uptime: string;
  status: 'online' | 'degraded' | 'offline';
  metrics: ServerMetrics;
  services: SystemService[];
  interfaces: NetworkInterface[];
  mode: 'LIVE' | 'DEMO';
  last_check: string;
}

export interface OverviewData {
  app_name: string;
  tagline: string;
  mode: 'LIVE' | 'DEMO';
  total_servers: number;
  online_servers: number;
  offline_servers: number;
  overall_cpu_percent: number;
  overall_ram_percent: number;
  overall_disk_percent: number;
  active_services_count: number;
  failed_services_count: number;
  network_status: string;
  last_backup_status: string;
  reboot_verification_score: number;
  servers: ServerSummary[];
  key_statuses: {
    apache: string;
    nfs: string;
    selinux: string;
    firewall: string;
    podman: string;
  };
}

export interface HostMapping {
  ip: string;
  fqdn: string;
  alias: string;
}

export interface NetworkTopologyInfo {
  subnet: string;
  gateway?: string;
  server1_ip: string;
  server2_ip: string;
  hosts_entries: HostMapping[];
  connections: Array<{
    protocol: string;
    port: number;
    source: string;
    destination: string;
    status: string;
    auth?: string;
    mount?: string;
    vhost?: string;
  }>;
  ping_server1_to_server2: boolean;
  ping_server2_to_server1: boolean;
}

export interface UserAccount {
  username: string;
  uid: number;
  gid: number;
  primary_group: string;
  supplementary_groups: string[];
  home_dir: string;
  shell: string;
  is_admin: boolean;
}

export interface GroupAccount {
  groupname: string;
  gid: number;
  members: string[];
}

export interface DirectoryPermission {
  path: string;
  owner: string;
  group: string;
  permissions_symbolic: string;
  permissions_octal: string;
  setgid_enabled: boolean;
}

export interface SudoDelegation {
  file_path: string;
  target: string;
  commands_allowed: string[];
  permissions: string;
  visudo_verified: boolean;
}

export interface UserManagementData {
  users: UserAccount[];
  groups: GroupAccount[];
  shared_directory: DirectoryPermission;
  delegated_sudo: SudoDelegation;
}

export interface PhysicalVolume {
  pv_name: string;
  vg_name: string;
  pv_size: string;
  pv_free: string;
  device_path: string;
}

export interface VolumeGroup {
  vg_name: string;
  pv_count: number;
  lv_count: number;
  vg_size: string;
  vg_free: string;
}

export interface LogicalVolume {
  lv_name: string;
  vg_name: string;
  lv_path: string;
  lv_size: string;
  filesystem: string;
  mount_point: string;
  used_size: string;
  used_percent: number;
  auto_mount_fstab: boolean;
}

export interface LVMStorageData {
  physical_volumes: PhysicalVolume[];
  volume_groups: VolumeGroup[];
  logical_volumes: LogicalVolume[];
  fstab_entries: string[];
  can_online_expand: boolean;
  share_expanded: boolean;
}

export interface NFSExport {
  path: string;
  client_network: string;
  options: string;
  status: string;
}

export interface AutofsMount {
  mount_point: string;
  map_file: string;
  remote_server: string;
  remote_share: string;
  options: string;
  timeout_seconds: number;
  is_active: boolean;
  last_triggered?: string;
}

export interface NFSData {
  nfs_server_active: boolean;
  exported_directories: NFSExport[];
  rpc_bind_active: boolean;
  mountd_active: boolean;
  client_autofs_active: boolean;
  autofs_mounts: AutofsMount[];
  test_mount_accessible: boolean;
}

export interface VirtualHostConfig {
  port: number;
  server_name: string;
  document_root: string;
  directory_directive: string;
  config_file: string;
}

export interface ApacheStatus {
  service_active: boolean;
  listening_port: number;
  virtual_host: VirtualHostConfig;
  config_test_passed: boolean;
  html_title: string;
  html_preview_content: string;
  http_response_code: number;
  response_time_ms: number;
}

export interface SELinuxContext {
  path: string;
  target_type: string;
  expected_type: string;
  current_context: string;
  status: string;
}

export interface SELinuxPortLabel {
  port: number;
  protocol: string;
  label_type: string;
  is_assigned: boolean;
}

export interface SELinuxData {
  mode: string;
  config_mode: string;
  policy: string;
  contexts: SELinuxContext[];
  port_labels: SELinuxPortLabel[];
  recent_avc_denials: any[];
  ausearch_command: string;
}

export interface FirewallRule {
  zone: string;
  services: string[];
  ports: string[];
  interfaces: string[];
  masquerade: boolean;
}

export interface FirewallData {
  firewalld_active: boolean;
  default_zone: string;
  rules: FirewallRule;
  raw_list_all: string;
}

export interface SSHKeyInfo {
  user: string;
  key_type: string;
  public_key_fingerprint: string;
  installed_on_server1: boolean;
}

export interface SSHHardeningConfig {
  config_path: string;
  password_authentication: boolean;
  permit_root_login: boolean;
  pubkey_authentication: boolean;
  service_active: boolean;
  config_test_valid: boolean;
}

export interface SSHManagementData {
  client_key: SSHKeyInfo;
  hardening: SSHHardeningConfig;
  key_login_verified: boolean;
  password_login_refused: boolean;
}

export interface BackupArchive {
  filename: string;
  created_at: string;
  size_mb: number;
  file_path: string;
  included_paths: string[];
  status: string;
}

export interface BackupSchedule {
  cron_expression: string;
  scheduled_time: string;
  script_path: string;
  cron_file: string;
  retention_days: number;
  cron_service_active: boolean;
}

export interface BackupData {
  schedule: BackupSchedule;
  archives: BackupArchive[];
  last_backup_status: string;
  last_backup_log: string;
  latest_restore_test_passed: boolean;
}

export interface LogEntry {
  timestamp: string;
  hostname: string;
  service: string;
  priority: 'info' | 'warning' | 'err';
  message: string;
}

export interface SystemLogsData {
  services_monitored: SystemService[];
  failed_units: string[];
  journald_persistent: boolean;
  journal_path: string;
  recent_logs: LogEntry[];
}

export interface PodmanContainer {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
  ports: string;
  created_at: string;
  is_rootless: boolean;
  systemd_service: string;
  systemd_active: boolean;
  systemd_enabled: boolean;
}

export interface PodmanData {
  podman_installed: boolean;
  version: string;
  containers: PodmanContainer[];
  user_linger_enabled: boolean;
  curl_test_status: string;
}

export interface VerificationCheck {
  id: string;
  server: 'server1' | 'server2';
  task_num: number;
  task_name: string;
  check_item: string;
  command_executed: string;
  expected_output: string;
  actual_output: string;
  status: 'passed' | 'failed' | 'pending';
  evidence_snippet: string;
}

export interface RebootVerificationReport {
  timestamp: string;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  pending_checks: number;
  score_percentage: number;
  status: string;
  checks: VerificationCheck[];
}

export interface OperationResult {
  operation_id: string;
  title: string;
  executed_at: string;
  server_id: string;
  command: string;
  success: boolean;
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
}

