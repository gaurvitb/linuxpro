"""
LINUXPULSE - Pydantic Data Schemas
Structured models for infrastructure telemetry, tasks, and system states.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Server & Core Schemas ---
class MetricPoint(BaseModel):
    timestamp: str
    value: float

class ServerMetrics(BaseModel):
    cpu_percent: float
    ram_used_gb: float
    ram_total_gb: float
    ram_percent: float
    disk_used_gb: float
    disk_total_gb: float
    disk_percent: float
    load_1m: float
    load_5m: float
    load_15m: float
    cpu_history: List[MetricPoint] = []
    ram_history: List[MetricPoint] = []
    network_rx_mb: float = 0.0
    network_tx_mb: float = 0.0

class NetworkInterface(BaseModel):
    name: str
    ip_address: str
    mac_address: str
    status: str
    mtu: int
    profile_name: str

class SystemService(BaseModel):
    name: str
    description: str
    load_state: str
    active_state: str
    sub_state: str
    enabled: bool
    unit_file_preset: Optional[str] = None

class ServerSummary(BaseModel):
    id: str
    hostname: str
    ip: str
    os_name: str
    kernel_version: str
    arch: str
    uptime: str
    status: str  # "online", "degraded", "offline"
    metrics: ServerMetrics
    services: List[SystemService] = []
    interfaces: List[NetworkInterface] = []
    mode: str = "DEMO"  # "LIVE" or "DEMO"
    last_check: str

# --- Task 1: Network & Name Resolution ---
class HostMapping(BaseModel):
    ip: str
    fqdn: str
    alias: str

class NetworkTopologyInfo(BaseModel):
    subnet: str
    gateway: Optional[str] = None
    server1_ip: str
    server2_ip: str
    hosts_entries: List[HostMapping]
    connections: List[Dict[str, Any]]
    ping_server1_to_server2: bool
    ping_server2_to_server1: bool

# --- Task 2: Users & Sudo ---
class UserAccount(BaseModel):
    username: str
    uid: int
    gid: int
    primary_group: str
    supplementary_groups: List[str]
    home_dir: str
    shell: str
    is_admin: bool

class GroupAccount(BaseModel):
    groupname: str
    gid: int
    members: List[str]

class DirectoryPermission(BaseModel):
    path: str
    owner: str
    group: str
    permissions_symbolic: str  # e.g., "drwxrws---"
    permissions_octal: str     # e.g., "2770"
    setgid_enabled: bool

class SudoDelegation(BaseModel):
    file_path: str
    target: str
    commands_allowed: List[str]
    permissions: str
    visudo_verified: bool

class UserManagementData(BaseModel):
    users: List[UserAccount]
    groups: List[GroupAccount]
    shared_directory: DirectoryPermission
    delegated_sudo: SudoDelegation

# --- Task 3: LVM Storage ---
class PhysicalVolume(BaseModel):
    pv_name: str
    vg_name: str
    pv_size: str
    pv_free: str
    device_path: str

class VolumeGroup(BaseModel):
    vg_name: str
    pv_count: int
    lv_count: int
    vg_size: str
    vg_free: str

class LogicalVolume(BaseModel):
    lv_name: str
    vg_name: str
    lv_path: str
    lv_size: str
    filesystem: str
    mount_point: str
    used_size: str
    used_percent: float
    auto_mount_fstab: bool

class LVMStorageData(BaseModel):
    physical_volumes: List[PhysicalVolume]
    volume_groups: List[VolumeGroup]
    logical_volumes: List[LogicalVolume]
    fstab_entries: List[str]
    can_online_expand: bool = True
    share_expanded: bool = False

# --- Task 4: NFS & Autofs ---
class NFSExport(BaseModel):
    path: str
    client_network: str
    options: str
    status: str

class AutofsMount(BaseModel):
    mount_point: str
    map_file: str
    remote_server: str
    remote_share: str
    options: str
    timeout_seconds: int
    is_active: bool
    last_triggered: Optional[str] = None

class NFSData(BaseModel):
    nfs_server_active: bool
    exported_directories: List[NFSExport]
    rpc_bind_active: bool
    mountd_active: bool
    client_autofs_active: bool
    autofs_mounts: List[AutofsMount]
    test_mount_accessible: bool

# --- Task 5: Apache Web Server ---
class VirtualHostConfig(BaseModel):
    port: int
    server_name: str
    document_root: str
    directory_directive: str
    config_file: str

class ApacheStatus(BaseModel):
    service_active: bool
    listening_port: int
    virtual_host: VirtualHostConfig
    config_test_passed: bool
    html_title: str
    html_preview_content: str
    http_response_code: int
    response_time_ms: float

# --- Task 6: SELinux ---
class SELinuxContext(BaseModel):
    path: str
    target_type: str
    expected_type: str
    current_context: str
    status: str  # "MATCHED", "MISMATCHED"

class SELinuxPortLabel(BaseModel):
    port: int
    protocol: str
    label_type: str
    is_assigned: bool

class SELinuxData(BaseModel):
    mode: str  # "Enforcing", "Permissive", "Disabled"
    config_mode: str
    policy: str
    contexts: List[SELinuxContext]
    port_labels: List[SELinuxPortLabel]
    recent_avc_denials: List[Dict[str, Any]]
    ausearch_command: str

# --- Task 7: Firewalld ---
class FirewallRule(BaseModel):
    zone: str
    services: List[str]
    ports: List[str]
    interfaces: List[str]
    masquerade: bool

class FirewallData(BaseModel):
    firewalld_active: bool
    default_zone: str
    rules: FirewallRule
    raw_list_all: str

# --- Task 8: SSH Management ---
class SSHKeyInfo(BaseModel):
    user: str
    key_type: str  # "ed25519"
    public_key_fingerprint: str
    installed_on_server1: bool

class SSHHardeningConfig(BaseModel):
    config_path: str
    password_authentication: bool
    permit_root_login: bool
    pubkey_authentication: bool
    service_active: bool
    config_test_valid: bool

class SSHManagementData(BaseModel):
    client_key: SSHKeyInfo
    hardening: SSHHardeningConfig
    key_login_verified: bool
    password_login_refused: bool

# --- Task 9: Backup & Recovery ---
class BackupArchive(BaseModel):
    filename: str
    created_at: str
    size_mb: float
    file_path: str
    included_paths: List[str]
    status: str

class BackupSchedule(BaseModel):
    cron_expression: str
    scheduled_time: str
    script_path: str
    cron_file: str
    retention_days: int
    cron_service_active: bool

class BackupData(BaseModel):
    schedule: BackupSchedule
    archives: List[BackupArchive]
    last_backup_status: str
    last_backup_log: str
    latest_restore_test_passed: bool

# --- Task 10: Systemctl & Logs ---
class LogEntry(BaseModel):
    timestamp: str
    hostname: str
    service: str
    priority: str  # "info", "warning", "err"
    message: str

class SystemLogsData(BaseModel):
    services_monitored: List[SystemService]
    failed_units: List[str]
    journald_persistent: bool
    journal_path: str
    recent_logs: List[LogEntry]

# --- Task 11: Podman Containers ---
class PodmanContainer(BaseModel):
    id: str
    name: str
    image: str
    state: str
    status: str
    ports: str
    created_at: str
    is_rootless: bool
    systemd_service: str
    systemd_active: bool
    systemd_enabled: bool

class PodmanData(BaseModel):
    podman_installed: bool
    version: str
    containers: List[PodmanContainer]
    user_linger_enabled: bool
    curl_test_status: str

# --- Task 12: Reboot & Verification Checklist ---
class VerificationCheck(BaseModel):
    id: str
    server: str  # "server1" or "server2"
    task_num: int
    task_name: str
    check_item: str
    command_executed: str
    expected_output: str
    actual_output: str
    status: str  # "passed", "failed", "pending"
    evidence_snippet: str

class RebootVerificationReport(BaseModel):
    timestamp: str
    total_checks: int
    passed_checks: int
    failed_checks: int
    pending_checks: int
    score_percentage: float
    status: str  # "READY_FOR_SUBMISSION", "INCOMPLETE", "NEEDS_ATTENTION"
    checks: List[VerificationCheck]

# --- Operations & Automation Engine ---
class OperationRequest(BaseModel):
    operation_id: str
    server_id: str = "server1"
    parameters: Optional[Dict[str, Any]] = None
    confirm: bool = False

class OperationResult(BaseModel):
    operation_id: str
    title: str
    executed_at: str
    server_id: str
    command: str
    success: bool
    stdout: str
    stderr: str
    exit_code: int
    execution_time_ms: float

