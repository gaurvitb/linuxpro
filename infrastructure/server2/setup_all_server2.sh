#!/bin/bash
# ==============================================================================
# LINUXPULSE - Complete Server 2 Automated Provisioning Script
# Target Host: server2.example.com (192.168.56.12)
# Implements Tasks 1, 2, 4, 8, 11
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo "  LINUXPULSE: Starting Automated Provisioning on Server 2"
echo "=========================================================="

if [[ $EUID -ne 0 ]]; then
   echo "[ERROR] This script must be run as root or with sudo." 
   exit 1
fi

echo "[1/5] Task 1: Configuring Hostname, Static IP and Name Resolution..."
hostnamectl set-hostname server2.example.com
nmcli con delete "Wired connection 2" 2>/dev/null || true
nmcli con delete labnet 2>/dev/null || true
nmcli con add type ethernet ifname enp0s8 con-name labnet \
  ipv4.method manual ipv4.addresses 192.168.56.12/24 autoconnect yes
nmcli con up labnet

cat <<'EOF' > /etc/hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
192.168.56.11 server1.example.com server1
192.168.56.12 server2.example.com server2
EOF

echo "[2/5] Task 2: Creating Admin Account on Server 2..."
groupadd -f it
id -u admin1 &>/dev/null || useradd -G it admin1
echo 'Redhat@123' | passwd --stdin admin1

echo "[3/5] Task 4: Configuring NFS Client & Autofs..."
dnf install -y nfs-utils autofs

# Configure Autofs direct and master maps
mkdir -p /etc/auto.master.d /mnt/nfs
cat <<'EOF' > /etc/auto.master.d/nfs.autofs
/mnt/nfs /etc/auto.nfs --timeout=60
EOF

cat <<'EOF' > /etc/auto.nfs
share -rw,sync,soft server1:/data/share
EOF

systemctl daemon-reload
systemctl enable --now autofs

echo "[4/5] Task 8: Setting up SSH Keypair for admin1..."
su - admin1 -c "
if [ ! -f ~/.ssh/id_ed25519 ]; then
    mkdir -p ~/.ssh && chmod 700 ~/.ssh
    ssh-keygen -t ed25519 -N '' -f ~/.ssh/id_ed25519
    echo 'SSH Ed25519 Key generated successfully.'
fi
"

echo "[5/5] Task 11: Configuring Podman Container & User Systemd Unit..."
dnf install -y podman

# Run container as admin1 with linger enabled
loginctl enable-linger admin1

su - admin1 -c "
podman pull registry.access.redhat.com/ubi9/httpd-24
podman rm -f webc 2>/dev/null || true
podman run -d --name webc -p 8081:8080 registry.access.redhat.com/ubi9/httpd-24

# Setup user systemd service
mkdir -p ~/.config/systemd/user
podman generate systemd --new --name webc --files
mv -f container-webc.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now container-webc
"

echo "=========================================================="
echo "  LINUXPULSE: Server 2 Automated Provisioning COMPLETE!"
echo "=========================================================="
