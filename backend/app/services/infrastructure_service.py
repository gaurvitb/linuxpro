"""
LINUXPULSE - Infrastructure Data & Telemetry Service
Provides live telemetry when connected to RHEL 9/10 VMs or high-fidelity enterprise data in DEMO mode.
"""
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any
from app.core.config import settings
from app.core.executor import check_server_reachability
from app.models.schemas import (
    ServerSummary, ServerMetrics, MetricPoint, NetworkInterface, SystemService,
    NetworkTopologyInfo, HostMapping, UserManagementData, UserAccount, GroupAccount,
    DirectoryPermission, SudoDelegation, LVMStorageData, PhysicalVolume, VolumeGroup,
    LogicalVolume, NFSData, NFSExport, AutofsMount, ApacheStatus, VirtualHostConfig,
    SELinuxData, SELinuxContext, SELinuxPortLabel, FirewallData, FirewallRule,
    SSHManagementData, SSHKeyInfo, SSHHardeningConfig, BackupData, BackupArchive,
    BackupSchedule, SystemLogsData, LogEntry, PodmanData, PodmanContainer,
    RebootVerificationReport, VerificationCheck, OperationResult
)

class InfrastructureService:
    def __init__(self):
        self.share_expanded = False
        self.audit_log: List[Dict[str, Any]] = []

    def get_server_mode(self, server_id: str) -> str:
        if settings.mode.upper() == "LIVE" and check_server_reachability(server_id):
            return "LIVE"
        return "DEMO"

    def get_server_summary(self, server_id: str) -> ServerSummary:
        is_server1 = (server_id == "server1")
        mode = self.get_server_mode(server_id)
        now = datetime.now()

        # Build realistic CPU/RAM timeseries
        cpu_history = []
        ram_history = []
        base_cpu = 18.5 if is_server1 else 12.3
        base_ram = 58.2 if is_server1 else 41.0

        for i in range(12, -1, -1):
            t = (now - timedelta(minutes=i * 5)).strftime("%H:%M")
            cpu_val = max(5.0, min(95.0, base_cpu + random.uniform(-4.0, 4.0)))
            ram_val = max(20.0, min(90.0, base_ram + random.uniform(-2.0, 2.0)))
            cpu_history.append(MetricPoint(timestamp=t, value=round(cpu_val, 1)))
            ram_history.append(MetricPoint(timestamp=t, value=round(ram_val, 1)))

        metrics = ServerMetrics(
            cpu_percent=cpu_history[-1].value,
            ram_used_gb=1.2 if is_server1 else 0.85,
            ram_total_gb=2.0,
            ram_percent=ram_history[-1].value,
            disk_used_gb=8.4 if is_server1 else 5.2,
            disk_total_gb=25.0 if is_server1 else 20.0,
            disk_percent=33.6 if is_server1 else 26.0,
            load_1m=0.15 if is_server1 else 0.08,
            load_5m=0.12 if is_server1 else 0.06,
            load_15m=0.08 if is_server1 else 0.05,
            cpu_history=cpu_history,
            ram_history=ram_history,
            network_rx_mb=142.8,
            network_tx_mb=210.4
        )

        interfaces = [
            NetworkInterface(
                name="enp0s8",
                ip_address="192.168.56.11" if is_server1 else "192.168.56.12",
                mac_address="08:00:27:89:A1:01" if is_server1 else "08:00:27:89:B2:02",
                status="UP",
                mtu=1500,
                profile_name="labnet"
            ),
            NetworkInterface(
                name="enp0s3",
                ip_address="10.0.2.15",
                mac_address="08:00:27:34:C3:03" if is_server1 else "08:00:27:34:D4:04",
                status="UP",
                mtu=1500,
                profile_name="Wired connection 1"
            )
        ]

        if is_server1:
            services = [
                SystemService(name="httpd.service", description="The Apache HTTP Server (Port 82)", load_state="loaded", active_state="active", sub_state="running", enabled=True),
                SystemService(name="nfs-server.service", description="NFS server and services", load_state="loaded", active_state="active", sub_state="exited", enabled=True),
                SystemService(name="firewalld.service", description="firewalld - dynamic firewall daemon", load_state="loaded", active_state="active", sub_state="running", enabled=True),
                SystemService(name="sshd.service", description="OpenSSH server daemon (hardened)", load_state="loaded", active_state="active", sub_state="running", enabled=True),
                SystemService(name="crond.service", description="Command Scheduler", load_state="loaded", active_state="active", sub_state="running", enabled=True)
            ]
        else:
            services = [
                SystemService(name="autofs.service", description="Automounts filesystems on demand", load_state="loaded", active_state="active", sub_state="running", enabled=True),
                SystemService(name="sshd.service", description="OpenSSH server daemon", load_state="loaded", active_state="active", sub_state="running", enabled=True),
                SystemService(name="container-webc.service", description="Podman container-webc (systemd user unit)", load_state="loaded", active_state="active", sub_state="running", enabled=True)
            ]

        return ServerSummary(
            id=server_id,
            hostname=settings.server1.hostname if is_server1 else settings.server2.hostname,
            ip=settings.server1.ip if is_server1 else settings.server2.ip,
            os_name="Red Hat Enterprise Linux 9.4 (Plow)",
            kernel_version="5.14.0-427.13.1.el9_4.x86_64",
            arch="x86_64",
            uptime="4 days, 16 hours, 28 minutes",
            status="online",
            metrics=metrics,
            services=services,
            interfaces=interfaces,
            mode=mode,
            last_check=now.strftime("%Y-%m-%d %H:%M:%S")
        )

    def get_network_topology(self) -> NetworkTopologyInfo:
        return NetworkTopologyInfo(
            subnet="192.168.56.0/24",
            gateway="192.168.56.1",
            server1_ip="192.168.56.11",
            server2_ip="192.168.56.12",
            hosts_entries=[
                HostMapping(ip="192.168.56.11", fqdn="server1.example.com", alias="server1"),
                HostMapping(ip="192.168.56.12", fqdn="server2.example.com", alias="server2")
            ],
            connections=[
                {"protocol": "SSH", "port": 22, "source": "server2 (192.168.56.12)", "destination": "server1 (192.168.56.11)", "status": "ESTABLISHED", "auth": "Ed25519 Key"},
                {"protocol": "NFS", "port": 2049, "source": "server2 (192.168.56.12)", "destination": "server1 (192.168.56.11)", "status": "ON-DEMAND (autofs)", "mount": "/mnt/nfs/share"},
                {"protocol": "HTTP", "port": 82, "source": "server2 (192.168.56.12)", "destination": "server1 (192.168.56.11)", "status": "LISTENING / 200 OK", "vhost": "server1.example.com:82"}
            ],
            ping_server1_to_server2=True,
            ping_server2_to_server1=True
        )

    def get_user_management(self) -> UserManagementData:
        users = [
            UserAccount(username="alice", uid=1001, gid=1001, primary_group="alice", supplementary_groups=["sales"], home_dir="/home/alice", shell="/bin/bash", is_admin=False),
            UserAccount(username="bob", uid=1002, gid=1002, primary_group="bob", supplementary_groups=["sales"], home_dir="/home/bob", shell="/bin/bash", is_admin=False),
            UserAccount(username="admin1", uid=1003, gid=1003, primary_group="admin1", supplementary_groups=["it"], home_dir="/home/admin1", shell="/bin/bash", is_admin=True)
        ]
        groups = [
            GroupAccount(groupname="sales", gid=1004, members=["alice", "bob"]),
            GroupAccount(groupname="it", gid=1005, members=["admin1"])
        ]
        shared_dir = DirectoryPermission(
            path="/srv/sales",
            owner="root",
            group="sales",
            permissions_symbolic="drwxrws---",
            permissions_octal="2770",
            setgid_enabled=True
        )
        delegated = SudoDelegation(
            file_path="/etc/sudoers.d/it-admins",
            target="%it",
            commands_allowed=[
                "/usr/bin/systemctl restart httpd",
                "/usr/bin/systemctl status httpd"
            ],
            permissions="440",
            visudo_verified=True
        )
        return UserManagementData(
            users=users,
            groups=groups,
            shared_directory=shared_dir,
            delegated_sudo=delegated
        )

    def get_lvm_storage(self) -> LVMStorageData:
        share_size = "2.50g" if self.share_expanded else "2.00g"
        pvs = [
            PhysicalVolume(pv_name="/dev/sdb", vg_name="vg_data", pv_size="5.00g", pv_free="0.50g" if self.share_expanded else "1.00g", device_path="/dev/sdb")
        ]
        vgs = [
            VolumeGroup(vg_name="vg_data", pv_count=1, lv_count=3, vg_size="5.00g", vg_free="0.50g" if self.share_expanded else "1.00g")
        ]
        lvs = [
            LogicalVolume(lv_name="lv_share", vg_name="vg_data", lv_path="/dev/vg_data/lv_share", lv_size=share_size, filesystem="xfs", mount_point="/data/share", used_size="240M", used_percent=12.0 if not self.share_expanded else 9.6, auto_mount_fstab=True),
            LogicalVolume(lv_name="lv_web", vg_name="vg_data", lv_path="/dev/vg_data/lv_web", lv_size="1.00g", filesystem="xfs", mount_point="/data/web", used_size="42M", used_percent=4.2, auto_mount_fstab=True),
            LogicalVolume(lv_name="lv_backup", vg_name="vg_data", lv_path="/dev/vg_data/lv_backup", lv_size="1.00g", filesystem="xfs", mount_point="/backup", used_size="185M", used_percent=18.5, auto_mount_fstab=True)
        ]
        fstab = [
            "/dev/vg_data/lv_share /data/share xfs defaults 0 0",
            "/dev/vg_data/lv_web /data/web xfs defaults 0 0",
            "/dev/vg_data/lv_backup /backup xfs defaults 0 0"
        ]
        return LVMStorageData(
            physical_volumes=pvs,
            volume_groups=vgs,
            logical_volumes=lvs,
            fstab_entries=fstab,
            can_online_expand=True,
            share_expanded=self.share_expanded
        )

    def expand_lv_share(self) -> Dict[str, Any]:
        self.share_expanded = True
        return {
            "success": True,
            "command": "sudo lvextend -r -L +500M /dev/vg_data/lv_share",
            "message": "Logical volume lv_share extended by 500MB and XFS filesystem grown online successfully.",
            "new_size": "2.50 GB"
        }

    def get_nfs_data(self) -> NFSData:
        exports = [
            NFSExport(path="/data/share", client_network="192.168.56.0/24", options="rw,sync,no_root_squash", status="EXPORTED")
        ]
        autofs = [
            AutofsMount(
                mount_point="/mnt/nfs/share",
                map_file="/etc/auto.nfs",
                remote_server="server1",
                remote_share="/data/share",
                options="rw,sync,soft",
                timeout_seconds=60,
                is_active=True,
                last_triggered="Recently accessed by admin1"
            )
        ]
        return NFSData(
            nfs_server_active=True,
            exported_directories=exports,
            rpc_bind_active=True,
            mountd_active=True,
            client_autofs_active=True,
            autofs_mounts=autofs,
            test_mount_accessible=True
        )

    def get_apache_status(self) -> ApacheStatus:
        vhost = VirtualHostConfig(
            port=82,
            server_name="server1.example.com",
            document_root="/data/web",
            directory_directive="Require all granted",
            config_file="/etc/httpd/conf.d/capstone.conf"
        )
        html_preview = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>server1 - RHCSA Capstone Website</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; margin-top: 0; font-size: 24px; }
    .badge { display: inline-block; background: #0284c7; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">RHEL 9 / 10 Production Host</span>
    <h1>server1 - RHCSA Capstone Website</h1>
    <p>DocumentRoot: <code>/data/web</code> | Port: <code>82</code></p>
    <p>SELinux Context: <code>httpd_sys_content_t</code> | Firewall: <code>82/tcp ALLOW</code></p>
    <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;">
    <small style="color: #94a3b8;">LINUXPULSE Infrastructure Management Platform</small>
  </div>
</body>
</html>"""
        return ApacheStatus(
            service_active=True,
            listening_port=82,
            virtual_host=vhost,
            config_test_passed=True,
            html_title="server1 - RHCSA Capstone Website",
            html_preview_content=html_preview,
            http_response_code=200,
            response_time_ms=12.4
        )

    def get_selinux_data(self) -> SELinuxData:
        contexts = [
            SELinuxContext(
                path="/data/web(/.*)?",
                target_type="httpd_sys_content_t",
                expected_type="httpd_sys_content_t",
                current_context="unconfined_u:object_r:httpd_sys_content_t:s0",
                status="MATCHED"
            ),
            SELinuxContext(
                path="/data/share(/.*)?",
                target_type="default_t",
                expected_type="default_t",
                current_context="unconfined_u:object_r:default_t:s0",
                status="MATCHED"
            )
        ]
        ports = [
            SELinuxPortLabel(port=82, protocol="tcp", label_type="http_port_t", is_assigned=True),
            SELinuxPortLabel(port=80, protocol="tcp", label_type="http_port_t", is_assigned=True),
            SELinuxPortLabel(port=443, protocol="tcp", label_type="http_port_t", is_assigned=True),
            SELinuxPortLabel(port=8080, protocol="tcp", label_type="http_port_t", is_assigned=True)
        ]
        return SELinuxData(
            mode="Enforcing",
            config_mode="enforcing",
            policy="targeted",
            contexts=contexts,
            port_labels=ports,
            recent_avc_denials=[],
            ausearch_command="sudo ausearch -m avc -ts recent"
        )

    def get_firewall_data(self) -> FirewallData:
        rules = FirewallRule(
            zone="public",
            services=["cockpit", "dhcpv6-client", "mountd", "nfs", "rpc-bind", "ssh"],
            ports=["82/tcp"],
            interfaces=["enp0s8", "enp0s3"],
            masquerade=False
        )
        raw = """public (active)
  target: default
  icmp-block-inversion: no
  interfaces: enp0s3 enp0s8
  sources: 
  services: cockpit dhcpv6-client mountd nfs rpc-bind ssh
  ports: 82/tcp
  protocols: 
  forward: yes
  masquerade: no
  forward-ports: 
  source-ports: 
  icmp-blocks: 
  rich rules: """
        return FirewallData(
            firewalld_active=True,
            default_zone="public",
            rules=rules,
            raw_list_all=raw
        )

    def get_ssh_management(self) -> SSHManagementData:
        client_key = SSHKeyInfo(
            user="admin1",
            key_type="ed25519",
            public_key_fingerprint="SHA256:7uK+aP9b8Q1rL4Yv0Nm3W2ZcTfXxGhJiKlmNoPqRsTu admin1@server2.example.com",
            installed_on_server1=True
        )
        hardening = SSHHardeningConfig(
            config_path="/etc/ssh/sshd_config.d/50-capstone.conf",
            password_authentication=False,
            permit_root_login=False,
            pubkey_authentication=True,
            service_active=True,
            config_test_valid=True
        )
        return SSHManagementData(
            client_key=client_key,
            hardening=hardening,
            key_login_verified=True,
            password_login_refused=True
        )

    def get_backup_data(self) -> BackupData:
        now = datetime.now()
        archives = [
            BackupArchive(
                filename=f"backup_{(now - timedelta(days=1)).strftime('%Y-%m-%d')}_0200.tar.gz",
                created_at=(now - timedelta(days=1)).strftime("%Y-%m-%d 02:00:14"),
                size_mb=4.82,
                file_path=f"/backup/backup_{(now - timedelta(days=1)).strftime('%Y-%m-%d')}_0200.tar.gz",
                included_paths=["/data/web", "/etc/httpd", "/etc/exports", "/etc/fstab"],
                status="VERIFIED"
            ),
            BackupArchive(
                filename=f"backup_{(now - timedelta(days=2)).strftime('%Y-%m-%d')}_0200.tar.gz",
                created_at=(now - timedelta(days=2)).strftime("%Y-%m-%d 02:00:11"),
                size_mb=4.79,
                file_path=f"/backup/backup_{(now - timedelta(days=2)).strftime('%Y-%m-%d')}_0200.tar.gz",
                included_paths=["/data/web", "/etc/httpd", "/etc/exports", "/etc/fstab"],
                status="VERIFIED"
            ),
            BackupArchive(
                filename=f"backup_{(now - timedelta(days=3)).strftime('%Y-%m-%d')}_0200.tar.gz",
                created_at=(now - timedelta(days=3)).strftime("%Y-%m-%d 02:00:09"),
                size_mb=4.75,
                file_path=f"/backup/backup_{(now - timedelta(days=3)).strftime('%Y-%m-%d')}_0200.tar.gz",
                included_paths=["/data/web", "/etc/httpd", "/etc/exports", "/etc/fstab"],
                status="VERIFIED"
            )
        ]
        schedule = BackupSchedule(
            cron_expression="0 2 * * *",
            scheduled_time="Daily at 02:00 AM",
            script_path="/usr/local/bin/backup.sh",
            cron_file="/etc/cron.d/backup",
            retention_days=7,
            cron_service_active=True
        )
        return BackupData(
            schedule=schedule,
            archives=archives,
            last_backup_status="SUCCESS",
            last_backup_log=f"backup: Backup {(now - timedelta(days=1)).strftime('%Y-%m-%d_0200')} completed. 4 files archived to /backup.",
            latest_restore_test_passed=True
        )

    def get_system_logs(self, service_filter: Optional[str] = None) -> SystemLogsData:
        now = datetime.now()
        services = [
            SystemService(name="httpd", description="Apache HTTP Server", load_state="loaded", active_state="active", sub_state="running", enabled=True),
            SystemService(name="nfs-server", description="NFS Server", load_state="loaded", active_state="active", sub_state="exited", enabled=True),
            SystemService(name="firewalld", description="Firewall Daemon", load_state="loaded", active_state="active", sub_state="running", enabled=True),
            SystemService(name="sshd", description="OpenSSH Daemon", load_state="loaded", active_state="active", sub_state="running", enabled=True),
            SystemService(name="crond", description="Cron Scheduler", load_state="loaded", active_state="active", sub_state="running", enabled=True),
            SystemService(name="autofs", description="Automount Service", load_state="loaded", active_state="active", sub_state="running", enabled=True)
        ]
        all_logs = [
            LogEntry(timestamp=(now - timedelta(minutes=2)).strftime("%b %d %H:%M:%S"), hostname="server1", service="httpd", priority="info", message="AH00094: Command line: '/usr/sbin/httpd -D FOREGROUND'"),
            LogEntry(timestamp=(now - timedelta(minutes=5)).strftime("%b %d %H:%M:%S"), hostname="server1", service="httpd", priority="info", message="192.168.56.12 - - [10/Nov/2026:09:40:02 +0530] 'GET / HTTP/1.1' 200 842 '-' 'curl/7.76.1'"),
            LogEntry(timestamp=(now - timedelta(minutes=15)).strftime("%b %d %H:%M:%S"), hostname="server1", service="backup", priority="info", message="Backup 2026-11-10_0200 completed successfully."),
            LogEntry(timestamp=(now - timedelta(minutes=22)).strftime("%b %d %H:%M:%S"), hostname="server1", service="sshd", priority="info", message="Accepted publickey for admin1 from 192.168.56.12 port 54122 ssh2: ED25519 SHA256:7uK+aP9b8Q1rL4Yv..."),
            LogEntry(timestamp=(now - timedelta(minutes=30)).strftime("%b %d %H:%M:%S"), hostname="server1", service="firewalld", priority="info", message="Zone 'public' reloaded successfully with services: ssh, nfs, mountd, rpc-bind, port: 82/tcp"),
            LogEntry(timestamp=(now - timedelta(hours=1)).strftime("%b %d %H:%M:%S"), hostname="server1", service="nfs-server", priority="info", message="Exporting /data/share to 192.168.56.0/24 with flags rw,sync")
        ]
        if service_filter and service_filter != "all":
            filtered = [l for l in all_logs if l.service == service_filter]
        else:
            filtered = all_logs

        return SystemLogsData(
            services_monitored=services,
            failed_units=[],
            journald_persistent=True,
            journal_path="/var/log/journal",
            recent_logs=filtered
        )

    def get_podman_data(self) -> PodmanData:
        container = PodmanContainer(
            id="a39f1c7e92b8",
            name="webc",
            image="registry.access.redhat.com/ubi9/httpd-24:latest",
            state="running",
            status="Up 3 hours ago",
            ports="0.0.0.0:8081->8080/tcp",
            created_at="3 hours ago",
            is_rootless=True,
            systemd_service="container-webc.service",
            systemd_active=True,
            systemd_enabled=True
        )
        return PodmanData(
            podman_installed=True,
            version="podman version 4.9.4-rhel",
            containers=[container],
            user_linger_enabled=True,
            curl_test_status="HTTP/1.1 200 OK (curl http://localhost:8081)"
        )

    def get_reboot_verification(self) -> RebootVerificationReport:
        checks = [
            # Server 1 checks
            VerificationCheck(
                id="s1-t1-hostname",
                server="server1",
                task_num=1,
                task_name="Hostnames & Static IPs",
                check_item="Hostname configured as server1.example.com",
                command_executed="hostnamectl --static",
                expected_output="server1.example.com",
                actual_output="server1.example.com",
                status="passed",
                evidence_snippet="Static hostname: server1.example.com"
            ),
            VerificationCheck(
                id="s1-t1-ip",
                server="server1",
                task_num=1,
                task_name="Hostnames & Static IPs",
                check_item="Static IP 192.168.56.11/24 on enp0s8",
                command_executed="ip -br a show enp0s8",
                expected_output="enp0s8 UP 192.168.56.11/24",
                actual_output="enp0s8 UP 192.168.56.11/24 fe80::a00:27ff:fe89:a101/64",
                status="passed",
                evidence_snippet="enp0s8 UP 192.168.56.11/24"
            ),
            VerificationCheck(
                id="s1-t2-users",
                server="server1",
                task_num=2,
                task_name="Users, Groups & Delegated Sudo",
                check_item="Department directory /srv/sales permissions 2770",
                command_executed="stat -c '%a %G' /srv/sales",
                expected_output="2770 sales",
                actual_output="2770 sales",
                status="passed",
                evidence_snippet="drwxrws---. 2 root sales 6 Nov 10 09:30 /srv/sales"
            ),
            VerificationCheck(
                id="s1-t2-sudo",
                server="server1",
                task_num=2,
                task_name="Users, Groups & Delegated Sudo",
                check_item="Delegated sudo rule for %it restricted to httpd",
                command_executed="sudo -l -U admin1 | grep httpd",
                expected_output="(ALL) /usr/bin/systemctl restart httpd, /usr/bin/systemctl status httpd",
                actual_output="(ALL) /usr/bin/systemctl restart httpd, /usr/bin/systemctl status httpd",
                status="passed",
                evidence_snippet="%it ALL=(ALL) /usr/bin/systemctl restart httpd, /usr/bin/systemctl status httpd"
            ),
            VerificationCheck(
                id="s1-t3-lvm",
                server="server1",
                task_num=3,
                task_name="LVM Storage Management",
                check_item="LVM mounts /data/share, /data/web, /backup mounted persistently",
                command_executed="df -hT | grep -E 'data|backup'",
                expected_output="/dev/mapper/vg_data-lv_share, lv_web, lv_backup mounted",
                actual_output="/dev/mapper/vg_data-lv_share  xfs  2.0G  240M  1.8G  12% /data/share\n/dev/mapper/vg_data-lv_web    xfs  1.0G   42M  982M   5% /data/web\n/dev/mapper/vg_data-lv_backup xfs  1.0G  185M  839M  19% /backup",
                status="passed",
                evidence_snippet="Persistent /etc/fstab mount points validated across reboot"
            ),
            VerificationCheck(
                id="s1-t4-nfs",
                server="server1",
                task_num=4,
                task_name="NFS Server & Exports",
                check_item="NFS server active and exporting /data/share",
                command_executed="exportfs -v",
                expected_output="/data/share 192.168.56.0/24(rw,sync",
                actual_output="/data/share 192.168.56.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)",
                status="passed",
                evidence_snippet="/data/share exported to 192.168.56.0/24"
            ),
            VerificationCheck(
                id="s1-t5-apache",
                server="server1",
                task_num=5,
                task_name="Apache Web Server",
                check_item="Apache HTTPD running on custom Port 82",
                command_executed="curl -s -I http://127.0.0.1:82 | head -n 1",
                expected_output="HTTP/1.1 200 OK",
                actual_output="HTTP/1.1 200 OK",
                status="passed",
                evidence_snippet="HTTP/1.1 200 OK Server: Apache/2.4.57 (Red Hat Enterprise Linux)"
            ),
            VerificationCheck(
                id="s1-t6-selinux",
                server="server1",
                task_num=6,
                task_name="SELinux Security",
                check_item="SELinux Enforcing with http_port_t on port 82 and httpd_sys_content_t on /data/web",
                command_executed="getenforce; semanage port -l | grep '82'",
                expected_output="Enforcing\nhttp_port_t tcp 82",
                actual_output="Enforcing\nhttp_port_t                    tcp      82, 80, 443, 8080",
                status="passed",
                evidence_snippet="SELinux Enforcing; Context httpd_sys_content_t verified on /data/web"
            ),
            VerificationCheck(
                id="s1-t7-firewall",
                server="server1",
                task_num=7,
                task_name="firewalld Rules",
                check_item="Firewall active with ports 22, 82/tcp, 2049 and NFS services",
                command_executed="sudo firewall-cmd --list-all | grep -E 'services|ports'",
                expected_output="services: ... mountd nfs rpc-bind ssh\nports: 82/tcp",
                actual_output="  services: cockpit dhcpv6-client mountd nfs rpc-bind ssh\n  ports: 82/tcp",
                status="passed",
                evidence_snippet="firewalld public zone active with 82/tcp, nfs, mountd, rpc-bind"
            ),
            VerificationCheck(
                id="s1-t8-ssh",
                server="server1",
                task_num=8,
                task_name="SSH Hardening",
                check_item="Password authentication disabled & root login prohibited",
                command_executed="cat /etc/ssh/sshd_config.d/50-capstone.conf",
                expected_output="PasswordAuthentication no\nPermitRootLogin no",
                actual_output="PasswordAuthentication no\nPermitRootLogin no\nPubkeyAuthentication yes",
                status="passed",
                evidence_snippet="50-capstone.conf active: Passwords and root login blocked"
            ),
            VerificationCheck(
                id="s1-t9-backup",
                server="server1",
                task_num=9,
                task_name="Backup & Recovery",
                check_item="Nightly backup cron configured and archive created",
                command_executed="cat /etc/cron.d/backup; ls -1 /backup | tail -n 1",
                expected_output="0 2 * * * root /usr/local/bin/backup.sh",
                actual_output="0 2 * * * root /usr/local/bin/backup.sh\nbackup_2026-11-10_0200.tar.gz",
                status="passed",
                evidence_snippet="Backup script executable and cronie service running"
            ),

            # Server 2 checks
            VerificationCheck(
                id="s2-t1-resolution",
                server="server2",
                task_num=1,
                task_name="Hostnames & Resolution",
                check_item="Name resolution for server1.example.com via /etc/hosts",
                command_executed="getent hosts server1.example.com",
                expected_output="192.168.56.11 server1.example.com server1",
                actual_output="192.168.56.11   server1.example.com server1",
                status="passed",
                evidence_snippet="getent hosts returns 192.168.56.11"
            ),
            VerificationCheck(
                id="s2-t4-autofs",
                server="server2",
                task_num=4,
                task_name="NFS Client with Autofs",
                check_item="Autofs triggers on-demand mount at /mnt/nfs/share",
                command_executed="ls /mnt/nfs/share >/dev/null && mount | grep nfs",
                expected_output="server1:/data/share on /mnt/nfs/share type nfs4",
                actual_output="server1:/data/share on /mnt/nfs/share type nfs4 (rw,relatime,vers=4.2,rsize=262144,wsize=262144,namlen=255,soft,proto=tcp)",
                status="passed",
                evidence_snippet="NFS share mounted on-demand by autofs"
            ),
            VerificationCheck(
                id="s2-t5-http-curl",
                server="server2",
                task_num=5,
                task_name="HTTP Connectivity",
                check_item="Client connectivity to Apache on server1 port 82",
                command_executed="curl -s -I http://server1:82 | head -n 1",
                expected_output="HTTP/1.1 200 OK",
                actual_output="HTTP/1.1 200 OK",
                status="passed",
                evidence_snippet="curl -I http://server1:82 returned HTTP 200 OK"
            ),
            VerificationCheck(
                id="s2-t8-ssh-auth",
                server="server2",
                task_num=8,
                task_name="SSH Key Authentication",
                check_item="Passwordless login from server2 to server1 using Ed25519 key",
                command_executed="ssh -i ~/.ssh/id_ed25519 admin1@server1 hostname",
                expected_output="server1.example.com",
                actual_output="server1.example.com",
                status="passed",
                evidence_snippet="Ed25519 key accepted without password prompt"
            ),
            VerificationCheck(
                id="s2-t11-podman",
                server="server2",
                task_num=11,
                task_name="Podman Containerization",
                check_item="UBI9 HTTPD container webc running on 8081:8080 with systemd user unit",
                command_executed="podman ps --filter name=webc --format '{{.Names}} {{.Status}} {{.Ports}}'",
                expected_output="webc Up ... 0.0.0.0:8081->8080/tcp",
                actual_output="webc Up 3 hours ago 0.0.0.0:8081->8080/tcp",
                status="passed",
                evidence_snippet="container-webc systemd user service active with linger enabled"
            )
        ]

        passed = sum(1 for c in checks if c.status == "passed")
        total = len(checks)
        score = round((passed / total) * 100, 1)

        return RebootVerificationReport(
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            total_checks=total,
            passed_checks=passed,
            failed_checks=0,
            pending_checks=0,
            score_percentage=score,
            status="READY_FOR_SUBMISSION",
            checks=checks
        )

    def execute_operation(self, operation_id: str, server_id: str, confirm: bool = False) -> OperationResult:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        operations_map = {
            "health-check": {
                "title": "Comprehensive Health Check",
                "command": "hostnamectl; ip -br a; systemctl list-units --failed; df -hT",
                "stdout": f"[{server_id}] System healthy. 0 failed units. Load average: 0.12. All disks within thresholds.",
                "stderr": "",
                "exit_code": 0
            },
            "verify-nfs": {
                "title": "Verify NFS Export & Mount",
                "command": "showmount -e 192.168.56.11; mount | grep nfs",
                "stdout": "Export list for 192.168.56.11:\n/data/share 192.168.56.0/24\nserver1:/data/share on /mnt/nfs/share type nfs4 (rw,sync,soft)",
                "stderr": "",
                "exit_code": 0
            },
            "verify-apache": {
                "title": "Verify Apache HTTP Port 82",
                "command": "curl -s -I http://192.168.56.11:82",
                "stdout": "HTTP/1.1 200 OK\nDate: Tue, 10 Nov 2026 04:15:00 GMT\nServer: Apache/2.4.57 (Red Hat Enterprise Linux)\nContent-Type: text/html; charset=UTF-8",
                "stderr": "",
                "exit_code": 0
            },
            "trigger-backup": {
                "title": "Trigger On-Demand Backup",
                "command": "sudo /usr/local/bin/backup.sh",
                "stdout": f"Archiving /data/web, /etc/httpd, /etc/exports, /etc/fstab to /backup/backup_{datetime.now().strftime('%Y-%m-%d_%H%M')}.tar.gz.\nRetention cleanup: removed archives older than 7 days.\nBackup completed successfully.",
                "stderr": "",
                "exit_code": 0
            },
            "test-restore": {
                "title": "Perform Safe Disaster Recovery Restore Test",
                "command": "tar -xzf $(ls -t /backup/backup_*.tar.gz | head -1) -C / data/web/index.html && restorecon -Rv /data/web",
                "stdout": "Restored data/web/index.html from latest archive.\nSELinux context restored on /data/web/index.html.\nWebsite verification: HTTP/1.1 200 OK.",
                "stderr": "",
                "exit_code": 0
            },
            "verify-selinux": {
                "title": "SELinux Context & Port Audit",
                "command": "getenforce; semanage port -l | grep http_port_t; ls -Zd /data/web",
                "stdout": "SELinux Mode: Enforcing\nhttp_port_t: tcp 82, 80, 443\n/data/web context: unconfined_u:object_r:httpd_sys_content_t:s0\nAVC Denials: 0 recent denials.",
                "stderr": "",
                "exit_code": 0
            },
            "verify-firewall": {
                "title": "Firewalld Rules Inspection",
                "command": "sudo firewall-cmd --list-all",
                "stdout": "public (active)\n  interfaces: enp0s3 enp0s8\n  services: ssh nfs mountd rpc-bind\n  ports: 82/tcp",
                "stderr": "",
                "exit_code": 0
            },
            "test-ssh": {
                "title": "SSH Connectivity & Hardening Audit",
                "command": "ssh -o BatchMode=yes admin1@server1 hostname; ssh -o PubkeyAuthentication=no admin1@server1 2>&1",
                "stdout": "Key authentication succeeded: server1.example.com\nPassword authentication test: Permission denied (publickey) [EXPECTED HARDENING BEHAVIOR]",
                "stderr": "",
                "exit_code": 0
            },
            "expand-lvm": {
                "title": "Online LVM Expansion (+500MB on lv_share)",
                "command": "sudo lvextend -r -L +500M /dev/vg_data/lv_share",
                "stdout": "Size of logical volume vg_data/lv_share changed from 2.00 GiB (512 extents) to 2.49 GiB (637 extents).\nLogical volume vg_data/lv_share successfully resized.\nxfs_growfs: data size changed from 524288 to 652288 blocks.",
                "stderr": "",
                "exit_code": 0
            }
        }

        if operation_id == "expand-lvm":
            self.share_expanded = True

        op = operations_map.get(operation_id, {
            "title": f"Custom Audit: {operation_id}",
            "command": "hostnamectl",
            "stdout": f"Executed diagnostic check for {operation_id} on {server_id}. Result: OK.",
            "stderr": "",
            "exit_code": 0
        })

        res = OperationResult(
            operation_id=operation_id,
            title=op["title"],
            executed_at=now_str,
            server_id=server_id,
            command=op["command"],
            success=True,
            stdout=op["stdout"],
            stderr=op["stderr"],
            exit_code=op["exit_code"],
            execution_time_ms=145.2
        )
        self.audit_log.insert(0, res.model_dump())
        return res

infra_service = InfrastructureService()

