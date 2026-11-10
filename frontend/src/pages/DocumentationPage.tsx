import React, { useState } from 'react';
import { BookOpen, Copy, Check, Terminal, ExternalLink, ShieldCheck, Server, HardDrive, Globe, Flame, KeyRound, Archive, Boxes } from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const [copiedTask, setCopiedTask] = useState<number | null>(null);

  const handleCopyCommands = (taskNum: number, commands: string) => {
    navigator.clipboard.writeText(commands);
    setCopiedTask(taskNum);
    setTimeout(() => setCopiedTask(null), 2000);
  };

  const tasks = [
    {
      num: 1,
      title: 'Hostnames, Static IPs and Name Resolution',
      server: 'server1 & server2',
      desc: 'Configures hostnames, static IPs on enp0s8, and local resolution via /etc/hosts.',
      commands: `# server1
sudo hostnamectl set-hostname server1.example.com
sudo nmcli con delete "Wired connection 2" 2>/dev/null || true
sudo nmcli con add type ethernet ifname enp0s8 con-name labnet ipv4.method manual ipv4.addresses 192.168.56.11/24 autoconnect yes
sudo nmcli con up labnet

# server2
sudo hostnamectl set-hostname server2.example.com
sudo nmcli con delete "Wired connection 2" 2>/dev/null || true
sudo nmcli con add type ethernet ifname enp0s8 con-name labnet ipv4.method manual ipv4.addresses 192.168.56.12/24 autoconnect yes
sudo nmcli con up labnet

# Name resolution on both servers:
sudo tee -a /etc/hosts <<'EOF'
192.168.56.11 server1.example.com server1
192.168.56.12 server2.example.com server2
EOF

# Verify:
hostnamectl; ip -br a; ping -c2 server2; getent hosts server1`,
    },
    {
      num: 2,
      title: 'Users, Groups and Delegated Sudo',
      server: 'server1 & server2',
      desc: 'Creates accounts (alice, bob, admin1), groups (sales, it), setgid directory /srv/sales, and it-admins sudoers rule.',
      commands: `# On server1:
sudo groupadd sales
sudo groupadd it
sudo useradd -G sales alice
sudo useradd -G sales bob
sudo useradd -G it admin1
for u in alice bob admin1; do echo 'Redhat@123' | sudo passwd --stdin $u; done

# Shared department directory
sudo mkdir -p /srv/sales
sudo chgrp sales /srv/sales
sudo chmod 2770 /srv/sales # setgid: new files inherit group

# Delegated sudo rule
echo '%it ALL=(ALL) /usr/bin/systemctl restart httpd, /usr/bin/systemctl status httpd' | sudo tee /etc/sudoers.d/it-admins
sudo chmod 440 /etc/sudoers.d/it-admins
sudo visudo -cf /etc/sudoers.d/it-admins

# On server2:
sudo groupadd it
sudo useradd -G it admin1
echo 'Redhat@123' | sudo passwd --stdin admin1`,
    },
    {
      num: 3,
      title: 'LVM Storage Management',
      server: 'server1',
      desc: 'Creates physical volume on /dev/sdb, volume group vg_data, 3 logical volumes, formatted XFS, mounted persistently in /etc/fstab.',
      commands: `lsblk # confirm 5GB disk is /dev/sdb
sudo pvcreate /dev/sdb
sudo vgcreate vg_data /dev/sdb
sudo lvcreate -n lv_share -L 2G vg_data
sudo lvcreate -n lv_web -L 1G vg_data
sudo lvcreate -n lv_backup -L 1G vg_data

for lv in lv_share lv_web lv_backup; do sudo mkfs.xfs /dev/vg_data/$lv; done
sudo mkdir -p /data/share /data/web /backup

sudo tee -a /etc/fstab <<'EOF'
/dev/vg_data/lv_share  /data/share  xfs  defaults  0 0
/dev/vg_data/lv_web    /data/web    xfs  defaults  0 0
/dev/vg_data/lv_backup /backup      xfs  defaults  0 0
EOF

sudo systemctl daemon-reload
sudo mount -a
pvs; vgs; lvs; df -hT | grep -E 'data|backup'

# Optional online grow demo:
sudo lvextend -r -L +500M /dev/vg_data/lv_share`,
    },
    {
      num: 4,
      title: 'NFS Server (server1) and Client with autofs (server2)',
      server: 'server1 & server2',
      desc: 'Exports /data/share over NFSv4 on server1. Client on server2 automounts on-demand to /mnt/nfs/share via autofs.',
      commands: `# server1:
sudo dnf install -y nfs-utils
sudo chmod 777 /data/share
echo '/data/share 192.168.56.0/24(rw,sync)' | sudo tee /etc/exports
sudo systemctl enable --now nfs-server
sudo exportfs -rav; sudo exportfs -v
sudo firewall-cmd --permanent --add-service={nfs,mountd,rpc-bind}
sudo firewall-cmd --reload

# server2:
sudo dnf install -y nfs-utils autofs
showmount -e server1

# Autofs on-demand mount:
echo '/mnt/nfs /etc/auto.nfs --timeout=60' | sudo tee /etc/auto.master.d/nfs.autofs
echo 'share -rw,sync,soft server1:/data/share' | sudo tee /etc/auto.nfs
sudo systemctl enable --now autofs

ls /mnt/nfs       # looks empty (expected)
ls /mnt/nfs/share # triggers mount!
mount | grep nfs`,
    },
    {
      num: 5,
      title: 'Apache Website on Custom Port 82',
      server: 'server1',
      desc: 'Installs httpd, creates VirtualHost on Port 82 with DocumentRoot /data/web.',
      commands: `sudo dnf install -y httpd
echo '<h1>server1 - RHCSA Capstone Website</h1>' | sudo tee /data/web/index.html
sudo sed -i 's/^Listen 80/Listen 82/' /etc/httpd/conf/httpd.conf

sudo tee /etc/httpd/conf.d/capstone.conf <<'EOF'
<VirtualHost *:82>
    ServerName server1.example.com
    DocumentRoot /data/web
    <Directory /data/web>
        Require all granted
    </Directory>
</VirtualHost>
EOF

sudo httpd -t
sudo systemctl enable httpd # start in Task 6 after SELinux`,
    },
    {
      num: 6,
      title: 'SELinux Contexts and Port Labels',
      server: 'server1',
      desc: 'Enforcing mode, applies httpd_sys_content_t to /data/web and assigns http_port_t label to Port 82.',
      commands: `getenforce
sudo setenforce 1
sudo sed -i 's/^SELINUX=.*/SELINUX=enforcing/' /etc/selinux/config
sudo dnf install -y policycoreutils-python-utils

# File context for web root
sudo semanage fcontext -a -t httpd_sys_content_t "/data/web(/.*)?"
sudo restorecon -Rv /data/web
ls -Zd /data/web

# Port label for port 82
sudo semanage port -a -t http_port_t -p tcp 82
semanage port -l | grep http_port_t

sudo systemctl restart httpd
sudo systemctl status httpd`,
    },
    {
      num: 7,
      title: 'Dynamic Firewall (firewalld)',
      server: 'server1',
      desc: 'Opens TCP 82, SSH, NFS, mountd, rpc-bind permanently and reloads.',
      commands: `sudo systemctl enable --now firewalld
sudo firewall-cmd --permanent --add-service={ssh,nfs,mountd,rpc-bind}
sudo firewall-cmd --permanent --add-port=82/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-all

# Test from server2:
curl http://server1:82`,
    },
    {
      num: 8,
      title: 'SSH Key Authentication & Hardening',
      server: 'server1 & server2',
      desc: 'Generates Ed25519 key on server2, copies to server1, hardens sshd to refuse password and root logins.',
      commands: `# On server2 as admin1:
su - admin1
ssh-keygen -t ed25519 -N ""
ssh-copy-id admin1@server1
ssh admin1@server1 hostname # verify key auth

# On server1: harden sshd ONLY after key login works
sudo tee /etc/ssh/sshd_config.d/50-capstone.conf <<'EOF'
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
EOF

sudo sshd -t
sudo systemctl restart sshd

# Verify password refusal from server2:
ssh -o PubkeyAuthentication=no admin1@server1`,
    },
    {
      num: 9,
      title: 'Backup Script, Cron and Restore Test',
      server: 'server1',
      desc: 'Automated tar.gz archive of /data/web, /etc/httpd, /etc/exports, /etc/fstab to /backup with 7-day retention and crond nightly execution.',
      commands: `sudo tee /usr/local/bin/backup.sh <<'EOF'
#!/bin/bash
DEST=/backup
STAMP=$(date +%F_%H%M)
tar -czf $DEST/backup_$STAMP.tar.gz /data/web /etc/httpd /etc/exports /etc/fstab 2>/dev/null
find $DEST -name 'backup_*.tar.gz' -mtime +7 -delete
logger -t backup "Backup $STAMP completed"
EOF

sudo chmod +x /usr/local/bin/backup.sh
sudo dnf install -y cronie
sudo systemctl enable --now crond
echo '0 2 * * * root /usr/local/bin/backup.sh' | sudo tee /etc/cron.d/backup

# Test run now:
sudo /usr/local/bin/backup.sh
ls -lh /backup; journalctl -t backup

# Restore verification test:
sudo rm /data/web/index.html
sudo tar -xzf "$(ls -t /backup/backup_*.tar.gz | head -1)" -C / data/web/index.html
sudo restorecon -Rv /data/web
curl http://localhost:82`,
    },
    {
      num: 10,
      title: 'Systemctl and Journald Logging',
      server: 'server1',
      desc: 'Monitors key systemd units and configures persistent journal storage in /var/log/journal.',
      commands: `systemctl status httpd nfs-server firewalld sshd crond
systemctl is-enabled httpd nfs-server firewalld sshd crond
systemctl list-units --failed

journalctl -u httpd --since "10 min ago"
journalctl -u sshd | tail -20
journalctl -p err -b

# Persistent journal across reboot
sudo mkdir -p /var/log/journal
sudo systemctl restart systemd-journald`,
    },
    {
      num: 11,
      title: 'Podman Rootless Container',
      server: 'server2',
      desc: 'Runs UBI9 httpd-24 container on port 8081:8080 with systemd user unit and lingering.',
      commands: `sudo dnf install -y podman
podman pull registry.access.redhat.com/ubi9/httpd-24
podman run -d --name webc -p 8081:8080 registry.access.redhat.com/ubi9/httpd-24
podman ps
curl http://localhost:8081

# User systemd service (auto-start at boot)
loginctl enable-linger $USER
mkdir -p ~/.config/systemd/user
podman generate systemd --new --name webc --files
mv container-webc.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now container-webc`,
    },
    {
      num: 12,
      title: 'Reboot and Final Verification',
      server: 'both',
      desc: 'Comprehensive post-reboot audit validating persistent mounts, SELinux, firewalld, Apache, NFS, autofs, SSH and Podman.',
      commands: `# Execute reboot on both servers:
sudo reboot

# After reboot on server1:
hostnamectl; ip -br a
lsblk; df -hT | grep -E 'data|backup'
getenforce
systemctl is-active httpd nfs-server firewalld sshd crond
sudo firewall-cmd --list-all
cat /etc/cron.d/backup

# After reboot on server2:
getent hosts server1
systemctl is-active autofs
ls /mnt/nfs/share; mount | grep nfs
curl -I http://server1:82
ssh admin1@server1 hostname`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Project Documentation & Command Guide</h1>
          <p className="text-xs text-slate-400 mt-1">
            Official RHCSA Capstone Lab guide detailing all 12 tasks, execution steps, and verification commands
          </p>
        </div>

        <span className="flex items-center text-xs font-medium text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/30 font-mono">
          <BookOpen className="w-4 h-4 mr-1.5" />
          RHEL 9 / 10 Specification
        </span>
      </div>

      {/* Task Documentation Cards */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.num} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  TASK {task.num}
                </span>
                <h3 className="text-base font-bold text-white">{task.title}</h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                  Target: {task.server}
                </span>
                <button
                  onClick={() => handleCopyCommands(task.num, task.commands)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors border border-slate-700"
                >
                  {copiedTask === task.num ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Commands</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">{task.desc}</p>

            <div className="mt-3 p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
              <pre className="text-slate-300 whitespace-pre-wrap">{task.commands}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
