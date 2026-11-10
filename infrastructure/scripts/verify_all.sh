#!/bin/bash
# ==============================================================================
# LINUXPULSE - Task 12: Comprehensive Reboot & Final Verification Suite
# Verifies all 12 Tasks across Server 1 and Server 2
# ==============================================================================
set -u

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PASSED_COUNT=0
FAILED_COUNT=0

log_check() {
    local task_name="$1"
    local check_desc="$2"
    local result="$3"
    local details="$4"

    if [[ "$result" -eq 0 ]]; then
        echo -e "${GREEN}[PASS]${NC} [${CYAN}${task_name}${NC}] ${check_desc}"
        ((PASSED_COUNT++))
    else
        echo -e "${RED}[FAIL]${NC} [${CYAN}${task_name}${NC}] ${check_desc}"
        echo -e "       ${YELLOW}Details: ${details}${NC}"
        ((FAILED_COUNT++))
    fi
}

echo "=========================================================="
echo "  LINUXPULSE: Task 12 Infrastructure Reboot Audit"
echo "  Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================================="

CURRENT_HOST=$(hostname -s)

if [[ "$CURRENT_HOST" == "server1" ]]; then
    echo -e "\n--- Auditing Server 1 (Storage & Web Server) ---"

    # Task 1: Hostname & IP
    [[ "$(hostname -f)" == "server1.example.com" ]]
    log_check "Task 1" "Hostname matches server1.example.com" $? "$(hostname -f)"

    ip -br a show enp0s8 | grep -q "192.168.56.11"
    log_check "Task 1" "Interface enp0s8 has static IP 192.168.56.11/24" $? "$(ip -br a show enp0s8)"

    # Task 2: Users & Sudo
    id alice &>/dev/null && id admin1 &>/dev/null
    log_check "Task 2" "Users alice and admin1 exist" $? "Users checked"

    [[ "$(stat -c '%a %G' /srv/sales 2>/dev/null)" == "2770 sales" ]]
    log_check "Task 2" "Directory /srv/sales permissions are 2770 sales (setgid)" $? "$(stat -c '%a %G' /srv/sales 2>/dev/null)"

    visudo -cf /etc/sudoers.d/it-admins &>/dev/null
    log_check "Task 2" "Delegated sudoers configuration /etc/sudoers.d/it-admins valid" $? "visudo check"

    # Task 3: LVM Mounts
    df -hT /data/share | grep -q "lv_share"
    log_check "Task 3" "LVM mount /data/share mounted via /etc/fstab" $? "$(df -hT /data/share)"

    df -hT /data/web | grep -q "lv_web"
    log_check "Task 3" "LVM mount /data/web mounted via /etc/fstab" $? "$(df -hT /data/web)"

    df -hT /backup | grep -q "lv_backup"
    log_check "Task 3" "LVM mount /backup mounted via /etc/fstab" $? "$(df -hT /backup)"

    # Task 4: NFS Server
    systemctl is-active nfs-server &>/dev/null
    log_check "Task 4" "NFS Server service is active" $? "$(systemctl is-active nfs-server)"

    exportfs -v | grep -q "/data/share"
    log_check "Task 4" "/data/share is exported to network" $? "$(exportfs -v)"

    # Task 5: Apache Port 82
    systemctl is-active httpd &>/dev/null
    log_check "Task 5" "Apache HTTPD service is active" $? "$(systemctl is-active httpd)"

    curl -s -I http://127.0.0.1:82 | grep -q "200 OK"
    log_check "Task 5" "Apache responds 200 OK on Port 82" $? "$(curl -s -I http://127.0.0.1:82 | head -n 1)"

    # Task 6: SELinux
    [[ "$(getenforce)" == "Enforcing" ]]
    log_check "Task 6" "SELinux status is Enforcing" $? "$(getenforce)"

    semanage port -l | grep http_port_t | grep -q "82"
    log_check "Task 6" "SELinux port label http_port_t assigned to TCP 82" $? "Port 82 label checked"

    ls -Zd /data/web | grep -q "httpd_sys_content_t"
    log_check "Task 6" "SELinux context on /data/web is httpd_sys_content_t" $? "$(ls -Zd /data/web)"

    # Task 7: Firewalld
    systemctl is-active firewalld &>/dev/null
    log_check "Task 7" "firewalld daemon is active" $? "$(systemctl is-active firewalld)"

    firewall-cmd --list-ports | grep -q "82/tcp"
    log_check "Task 7" "Firewall port 82/tcp is open" $? "$(firewall-cmd --list-ports)"

    # Task 8: SSH Hardening
    grep -q "PasswordAuthentication no" /etc/ssh/sshd_config.d/50-capstone.conf 2>/dev/null
    log_check "Task 8" "Password authentication disabled in 50-capstone.conf" $? "sshd config checked"

    # Task 9: Backup Cron
    [[ -f /etc/cron.d/backup ]] && systemctl is-active crond &>/dev/null
    log_check "Task 9" "Backup cron job and crond service active" $? "crond check"

    # Task 10: Journal persistence
    [[ -d /var/log/journal ]]
    log_check "Task 10" "Systemd journal directory /var/log/journal exists" $? "journald check"

elif [[ "$CURRENT_HOST" == "server2" ]]; then
    echo -e "\n--- Auditing Server 2 (Client & Podman Host) ---"

    # Task 1: Name resolution
    getent hosts server1.example.com | grep -q "192.168.56.11"
    log_check "Task 1" "DNS /etc/hosts resolves server1.example.com to 192.168.56.11" $? "$(getent hosts server1.example.com)"

    # Task 4: Autofs
    systemctl is-active autofs &>/dev/null
    log_check "Task 4" "autofs service is active" $? "$(systemctl is-active autofs)"

    ls /mnt/nfs/share &>/dev/null && mount | grep -q "nfs"
    log_check "Task 4" "Accessing /mnt/nfs/share triggers on-demand NFS mount" $? "$(mount | grep nfs)"

    # Task 5: HTTP curl to server1
    curl -s -I http://server1:82 | grep -q "200 OK"
    log_check "Task 5" "Remote curl to http://server1:82 returns 200 OK" $? "$(curl -s -I http://server1:82 | head -n 1)"

    # Task 8: SSH Key Auth
    su - admin1 -c "ssh -o BatchMode=yes -o StrictHostKeyChecking=no admin1@server1 hostname" | grep -q "server1"
    log_check "Task 8" "Passwordless SSH key authentication to server1 succeeds" $? "SSH key check"

    # Task 11: Podman Container
    podman ps --filter name=webc --format '{{.Status}}' | grep -q "Up"
    log_check "Task 11" "Podman container webc is running" $? "$(podman ps --filter name=webc)"

    curl -s -I http://localhost:8081 | grep -q "200 OK"
    log_check "Task 11" "Podman web service responds on port 8081" $? "$(curl -s -I http://localhost:8081 | head -n 1)"

else
    echo -e "${YELLOW}[NOTE] Running verification in standalone / management mode.${NC}"
fi

echo "=========================================================="
echo -e "  Summary: ${GREEN}${PASSED_COUNT} Passed${NC} | ${RED}${FAILED_COUNT} Failed${NC}"
echo "=========================================================="
