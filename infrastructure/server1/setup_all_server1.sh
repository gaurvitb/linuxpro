#!/bin/bash
# ==============================================================================
# LINUXPULSE - Complete Server 1 Automated Provisioning Script
# Target Host: server1.example.com (192.168.56.11)
# Implements Tasks 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo "  LINUXPULSE: Starting Automated Provisioning on Server 1"
echo "=========================================================="

# Check root or sudo
if [[ $EUID -ne 0 ]]; then
   echo "[ERROR] This script must be run as root or with sudo." 
   exit 1
fi

echo "[1/10] Task 1: Configuring Hostname, Static IP and Name Resolution..."
hostnamectl set-hostname server1.example.com
# Delete existing profile if present
nmcli con delete "Wired connection 2" 2>/dev/null || true
nmcli con delete labnet 2>/dev/null || true
nmcli con add type ethernet ifname enp0s8 con-name labnet \
  ipv4.method manual ipv4.addresses 192.168.56.11/24 autoconnect yes
nmcli con up labnet

# Populate /etc/hosts
cat <<'EOF' > /etc/hosts
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
192.168.56.11 server1.example.com server1
192.168.56.12 server2.example.com server2
EOF

echo "[2/10] Task 2: Configuring Users, Groups and Delegated Sudo..."
groupadd -f sales
groupadd -f it

id -u alice &>/dev/null || useradd -G sales alice
id -u bob &>/dev/null || useradd -G bob alice || useradd -G sales bob
id -u admin1 &>/dev/null || useradd -G it admin1

for u in alice bob admin1; do
  echo 'Redhat@123' | passwd --stdin "$u"
done

mkdir -p /srv/sales
chgrp sales /srv/sales
chmod 2770 /srv/sales

# Sudo delegation
cat <<'EOF' > /etc/sudoers.d/it-admins
%it ALL=(ALL) /usr/bin/systemctl restart httpd, /usr/bin/systemctl status httpd
EOF
chmod 440 /etc/sudoers.d/it-admins
visudo -cf /etc/sudoers.d/it-admins

echo "[3/10] Task 3: Configuring LVM Storage (/dev/sdb -> vg_data)..."
if ! pvs /dev/sdb &>/dev/null; then
  pvcreate /dev/sdb
fi

if ! vgs vg_data &>/dev/null; then
  vgcreate vg_data /dev/sdb
fi

if ! lvs /dev/vg_data/lv_share &>/dev/null; then
  lvcreate -n lv_share -L 2G vg_data
  mkfs.xfs /dev/vg_data/lv_share
fi

if ! lvs /dev/vg_data/lv_web &>/dev/null; then
  lvcreate -n lv_web -L 1G vg_data
  mkfs.xfs /dev/vg_data/lv_web
fi

if ! lvs /dev/vg_data/lv_backup &>/dev/null; then
  lvcreate -n lv_backup -L 1G vg_data
  mkfs.xfs /dev/vg_data/lv_backup
fi

mkdir -p /data/share /data/web /backup

# Update /etc/fstab safely
grep -q '/dev/vg_data/lv_share' /etc/fstab || cat <<'EOF' >> /etc/fstab
/dev/vg_data/lv_share /data/share xfs defaults 0 0
/dev/vg_data/lv_web /data/web xfs defaults 0 0
/dev/vg_data/lv_backup /backup xfs defaults 0 0
EOF

systemctl daemon-reload
mount -a

echo "[4/10] Task 4: Configuring NFS Server and Exports..."
dnf install -y nfs-utils
chmod 777 /data/share
cat <<'EOF' > /etc/exports
/data/share 192.168.56.0/24(rw,sync)
EOF
systemctl enable --now nfs-server
exportfs -rav

echo "[5/10] Task 5: Installing Apache HTTPD on Custom Port 82..."
dnf install -y httpd
cat <<'EOF' > /data/web/index.html
<!DOCTYPE html>
<html>
<head><title>LINUXPULSE - server1</title></head>
<body style="font-family:sans-serif; background:#0f172a; color:#f8fafc; padding:40px;">
  <h1>server1 - RHCSA Capstone Website</h1>
  <p>Status: Production Active | Managed by LINUXPULSE Platform</p>
</body>
</html>
EOF

sed -i 's/^Listen 80/Listen 82/' /etc/httpd/conf/httpd.conf
cat <<'EOF' > /etc/httpd/conf.d/capstone.conf
<VirtualHost *:82>
    ServerName server1.example.com
    DocumentRoot /data/web
    <Directory /data/web>
        Require all granted
    </Directory>
</VirtualHost>
EOF
httpd -t
systemctl enable httpd

echo "[6/10] Task 6: Configuring SELinux Contexts and Port 82..."
setenforce 1
sed -i 's/^SELINUX=.*/SELINUX=enforcing/' /etc/selinux/config
dnf install -y policycoreutils-python-utils

semanage fcontext -a -t httpd_sys_content_t "/data/web(/.*)?" || semanage fcontext -m -t httpd_sys_content_t "/data/web(/.*)?"
restorecon -Rv /data/web

semanage port -a -t http_port_t -p tcp 82 || semanage port -m -t http_port_t -p tcp 82
systemctl restart httpd

echo "[7/10] Task 7: Configuring firewalld..."
systemctl enable --now firewalld
firewall-cmd --permanent --add-service={ssh,nfs,mountd,rpc-bind}
firewall-cmd --permanent --add-port=82/tcp
firewall-cmd --reload

echo "[8/10] Task 8: Preparing SSH Hardening..."
cat <<'EOF' > /etc/ssh/sshd_config.d/50-capstone.conf
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
EOF
sshd -t
systemctl restart sshd

echo "[9/10] Task 9: Installing Backup Script and Cron Job..."
cat <<'EOF' > /usr/local/bin/backup.sh
#!/bin/bash
DEST=/backup
STAMP=$(date +%F_%H%M)
tar -czf $DEST/backup_$STAMP.tar.gz /data/web /etc/httpd /etc/exports /etc/fstab 2>/dev/null
find $DEST -name 'backup_*.tar.gz' -mtime +7 -delete
logger -t backup "Backup $STAMP completed"
EOF
chmod +x /usr/local/bin/backup.sh

dnf install -y cronie
systemctl enable --now crond
cat <<'EOF' > /etc/cron.d/backup
0 2 * * * root /usr/local/bin/backup.sh
EOF

# Execute test backup
/usr/local/bin/backup.sh

echo "[10/10] Task 10: Enabling Persistent systemd Journal..."
mkdir -p /var/log/journal
systemctl restart systemd-journald

echo "=========================================================="
echo "  LINUXPULSE: Server 1 Automated Provisioning COMPLETE!"
echo "=========================================================="
