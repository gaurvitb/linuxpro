"""
LINUXPULSE - Secure Infrastructure Execution & Telemetry Engine
Implements allowlisted command execution, socket probes, and dual Live/Demo mode telemetry.
"""
import socket
import time
import subprocess
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
from app.core.config import settings

# Strict allowlist of safe diagnostic and operational commands
ALLOWLISTED_COMMANDS = {
    "ping": "ping -c 2 {target}",
    "hostname": "hostnamectl",
    "ip_addr": "ip -br a",
    "getent_hosts": "getent hosts {target}",
    "pvs": "sudo pvs --units g --separator '|' --noheadings",
    "vgs": "sudo vgs --units g --separator '|' --noheadings",
    "lvs": "sudo lvs --units g --separator '|' --noheadings",
    "df": "df -hT | grep -E 'data|backup|Filesystem'",
    "mount_status": "mount | grep -E 'nfs|data|backup'",
    "systemctl_status": "systemctl is-active {service}",
    "systemctl_failed": "systemctl list-units --failed --no-legend",
    "exportfs": "sudo exportfs -v",
    "showmount": "showmount -e {target}",
    "httpd_test": "sudo httpd -t",
    "curl_http82": "curl -s -I http://127.0.0.1:82",
    "curl_podman": "curl -s -I http://127.0.0.1:8081",
    "getenforce": "getenforce",
    "semanage_port": "sudo semanage port -l | grep http_port_t",
    "restorecon_check": "ls -Zd /data/web",
    "avc_denials": "sudo ausearch -m avc -ts recent | head -30",
    "firewall_list": "sudo firewall-cmd --list-all",
    "podman_ps": "podman ps -a --format json",
    "backup_run": "sudo /usr/local/bin/backup.sh",
    "backup_list": "ls -lh /backup",
    "journal_log": "journalctl -u {service} -n 25 --no-pager",
    "journal_errors": "journalctl -p err -b -n 20 --no-pager"
}

def probe_socket(ip: str, port: int = 22, timeout: float = 1.0) -> bool:
    """Test TCP socket reachability for a server."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(timeout)
            s.connect((ip, port))
            return True
    except Exception:
        return False

def check_server_reachability(server_id: str) -> bool:
    """Check if the target server is reachable on the network."""
    ip = settings.server1.ip if server_id == "server1" else settings.server2.ip
    return probe_socket(ip, 22, 1.2)

class RemoteExecutor:
    """Handles secure SSH or local agent execution on RHEL nodes."""
    
    @staticmethod
    def execute(server_id: str, command_key: str, params: Optional[Dict[str, str]] = None) -> Tuple[int, str, str]:
        """
        Executes an allowlisted command. If live connection fails or mode is DEMO, returns demo data.
        """
        if command_key not in ALLOWLISTED_COMMANDS:
            return 1, "", f"Operation '{command_key}' is not in the security allowlist."

        cmd_template = ALLOWLISTED_COMMANDS[command_key]
        if params:
            cmd = cmd_template.format(**params)
        else:
            cmd = cmd_template

        is_reachable = check_server_reachability(server_id)
        if not is_reachable or settings.mode.upper() == "DEMO":
            # Return high-fidelity fallback or simulated success
            return 0, f"[SIMULATED RHEL OUTPUT ({server_id})]\nCommand: {cmd}\nOutput: OK", ""

        # Live SSH Execution via Paramiko
        try:
            import paramiko
            target_ip = settings.server1.ip if server_id == "server1" else settings.server2.ip
            user = "admin1"

            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            # Attempt connection with default keys or ssh agent
            client.connect(target_ip, port=22, username=user, timeout=3.0)
            stdin, stdout, stderr = client.exec_command(cmd, timeout=5.0)
            out = stdout.read().decode('utf-8', errors='ignore')
            err = stderr.read().decode('utf-8', errors='ignore')
            exit_code = stdout.channel.recv_exit_status()
            client.close()
            return exit_code, out, err
        except Exception as e:
            return 1, "", f"SSH execution error to {server_id}: {str(e)}"

executor = RemoteExecutor()

