# LINUXPULSE — Viva, Oral Defense & Technical Evaluation Guide

> **Enterprise Linux Server Administration & Infrastructure Monitoring Platform**  
> Companion reference for academic defense, professor evaluations, and technical interviews.

---

## 1. 30-Second Elevator Pitch

> *"LINUXPULSE is a full-stack Linux enterprise administration and observability platform built on top of a dual-node Red Hat Enterprise Linux (RHEL 9/10) infrastructure. It automates, monitors, and audits all 12 core system administration tasks specified in the Red Hat Server Administration Capstone. Rather than managing servers through disconnected terminal commands, LINUXPULSE provides an integrated telemetry engine powered by FastAPI and a modern React 19 dashboard that exposes real-time storage topology, SELinux enforcement, firewalld packet filtering, on-demand autofs mounting, rootless Podman containers, and an automated 12-point post-reboot verification audit."*

---

## 2. Key Architecture Decisions — "Why did you design it this way?"

| Decision | Why this was chosen over alternatives |
|---|---|
| **LVM over standard partitions** | LVM abstracts physical disks into a storage pool (`vg_data`), allowing online dynamic volume expansion (`lvextend -r`) without downtime or repartitioning. |
| **`autofs` over static `/etc/fstab` for NFS** | Static fstab mounts hang the system boot if the NFS server is unreachable. `autofs` mounts `/mnt/nfs/share` strictly on-demand and unmounts after 60 seconds of inactivity, conserving network sockets and preventing boot hangs. |
| **Port 82 for Apache + SELinux** | Standard HTTP runs on port 80. Running on port 82 proves understanding of SELinux network port labels (`semanage port -a -t http_port_t -p tcp 82`). Without this label, SELinux Enforcing mode blocks Apache even if file permissions are correct. |
| **Rootless Podman + systemd linger** | Unlike Docker, Podman does not require a root-privileged daemon. Using `loginctl enable-linger admin1` and systemd user services (`systemctl --user`) allows container services to persist across logouts securely. |
| **Allowlisted API Execution Engine** | Arbitrary shell execution from a web backend introduces remote code execution (RCE) vulnerabilities. LINUXPULSE strictly whitelists 26 diagnostic and operational commands with validated parameters. |
| **Dual LIVE / DEMO Telemetry Mode** | Allows the platform to function for demonstration and UI testing even before physical virtual machines are booted, clearly badging simulated data to maintain integrity. |

---

## 3. Top 15 Viva Questions & High-Scoring Answers

### Q1: What is the difference between Physical Volumes (PV), Volume Groups (VG), and Logical Volumes (LV)?
- **Answer:** 
  - **PV (Physical Volume):** Raw block device or partition (e.g. `/dev/sdb`) initialized with LVM metadata via `pvcreate`.
  - **VG (Volume Group):** A storage pool created by aggregating one or more PVs via `vgcreate vg_data /dev/sdb`. It divides storage into Physical Extents (PE, default 4MB).
  - **LV (Logical Volume):** The virtual partition carved out of the VG via `lvcreate -L 2G -n lv_share vg_data`, formatted with a filesystem (XFS) and mounted.

### Q2: How did you expand the LVM volume online, and what command grows the filesystem?
- **Answer:**
  We used `lvextend -L +500M -r /dev/vg_data/lv_share`. The `-r` (or `--resizefs`) flag is critical: it automatically invokes `xfs_growfs` for XFS filesystems in the same step. Unlike ext4 which uses `resize2fs`, XFS filesystems can only be expanded while mounted, and cannot be shrunk.

### Q3: Why is the `setgid` bit used on `/srv/sales`?
- **Answer:**
  `chmod 2770 /srv/sales` sets the `setgid` bit (`2`). When `setgid` is active on a directory, any new file or subdirectory created inside automatically inherits the **group ownership** of the parent directory (`sales`), rather than the primary group of the user who created it. This enables seamless collaboration between users (e.g., Alice and Bob) without manual permission resets.

### Q4: How is sudo delegation secured for the IT group?
- **Answer:**
  Instead of granting full root access (`ALL=(ALL) ALL`), we placed a drop-in rule in `/etc/sudoers.d/it-admins`:  
  `%it ALL=(ALL) /usr/bin/systemctl restart httpd, /usr/bin/systemctl status httpd`  
  This adheres to the principle of least privilege: members of the `it` group can only manage the web service, and cannot run arbitrary commands or gain an interactive root shell.

### Q5: How does `autofs` differ from an `/etc/fstab` NFS mount?
- **Answer:**
  An `/etc/fstab` NFS mount attempts to connect during system startup. If the network or NFS server is down, boot will delay or enter emergency mode. `autofs` runs as a user-space daemon: `/mnt/nfs/share` does not exist as an active mount until a process accesses it (e.g., `cd /mnt/nfs/share` or `ls`). After a period of inactivity (default 60 seconds), `autofs` automatically unmounts it.

### Q6: What SELinux context type is required for Apache DocumentRoot and why?
- **Answer:**
  `httpd_sys_content_t`. SELinux enforces mandatory access control (MAC) using type enforcement. Apache (`httpd_t` domain) is restricted by policy to only read files labelled with `httpd_sys_content_t` or similar web types. If files in `/data/web` have `default_t`, Apache returns HTTP 403 Forbidden even if standard Unix permissions are `755`. We configured this persistently via:  
  `semanage fcontext -a -t httpd_sys_content_t "/data/web(/.*)?"` followed by `restorecon -Rv /data/web`.

### Q7: If SELinux is in Enforcing mode and Apache fails to bind to port 82, what is the cause and fix?
- **Answer:**
  SELinux restricts network ports by service. By default, `http_port_t` only includes ports 80, 443, 8080, etc. Port 82 is not in that list. Apache will fail with `Permission denied: AH00072: make_sock: could not bind to address`.  
  The fix is: `semanage port -a -t http_port_t -p tcp 82`. To verify: `semanage port -l | grep http_port_t`.

### Q8: What is the difference between `--add-service` and `--permanent` in `firewalld`?
- **Answer:**
  Running `firewall-cmd --add-service=nfs` modifies the **runtime configuration** immediately, but changes are lost upon reboot or firewall reload. Adding `--permanent` writes the rule to the persistent XML configuration on disk (`/etc/firewalld/zones/public.xml`). To apply both without downtime, we run with `--permanent` and follow with `firewall-cmd --reload`.

### Q9: Why did you choose Ed25519 over RSA for SSH keys?
- **Answer:**
  Ed25519 is an elliptic curve signature scheme (Curve25519). It provides stronger cryptographic security than a 3072-bit RSA key while having much smaller key sizes (68 characters vs ~500), faster key generation, and immunity to timing attacks.

### Q10: How does the backup retention policy work in your backup script?
- **Answer:**
  In `/usr/local/bin/backup.sh`, after creating the compressed archive with timestamp (`backup_$(date +%F_%H%M).tar.gz`), we run:  
  `find /backup -name 'backup_*.tar.gz' -mtime +7 -delete`  
  This evaluates file modification timestamps and automatically prunes any backup archives older than 7 days, preventing `/backup` (which is capped at 1 GB on `lv_backup`) from filling up.

### Q11: What is container lingering in Podman, and why is it necessary?
- **Answer:**
  By default, systemd terminates rootless user processes when the user logs out of their SSH or terminal session. Running `loginctl enable-linger admin1` instructs systemd to keep the user's manager daemon running across logouts and at boot. This allows `systemctl --user enable --now container-webc.service` to start containerized services automatically without requiring root privileges.

### Q12: What does Task 12 test after system reboot?
- **Answer:**
  Task 12 verifies that the infrastructure is truly persistent and enterprise-ready. It audits:
  1. Hostname and static IP persistence via NetworkManager
  2. LVM volume automatic mounting via `/etc/fstab`
  3. NFS daemon and firewalld startup via `systemctl is-enabled`
  4. Apache listening on port 82
  5. SELinux Enforcing status (`getenforce == Enforcing`)
  6. `autofs` mounting `/mnt/nfs/share` dynamically upon access
  7. Podman container running after reboot via user systemd units

### Q13: How does LINUXPULSE prevent Remote Code Execution (RCE) from the web dashboard?
- **Answer:**
  The backend does not pass raw user strings to `subprocess` or `paramiko`. Instead, `RemoteExecutor` in `backend/app/core/executor.py` maintains an immutable `ALLOWLISTED_COMMANDS` dictionary mapping strict keys (e.g., `"pvs"`, `"df"`, `"systemctl_status"`) to predefined commands. Any requested key not present in the allowlist is rejected with HTTP 400.

### Q14: How does the platform handle the case where real VMs are offline?
- **Answer:**
  LINUXPULSE has an integrated dual-mode architecture. When the mode is set to `DEMO` or when socket probes (`probe_socket(ip, 22)`) fail, the service returns structured high-fidelity mock data. Every response schema includes an `is_mock: bool` or `mode: "DEMO"` flag, and the UI displays an explicit amber "DEMO DATA" banner to ensure full transparency.

### Q15: What tools are used to inspect persistent systemd logs?
- **Answer:**
  `journalctl`. In RHEL, by creating `/var/log/journal` and configuring `Storage=persistent` in `/etc/systemd/journald.conf`, logs persist across reboots. In our dashboard, we filter logs via:
  - `journalctl -u httpd -n 25 --no-pager` (unit logs)
  - `journalctl -p err -b --no-pager` (boot-specific errors)

---

## 4. 5-Minute Live Demonstration Walkthrough

When presenting to evaluators, open `http://localhost:5173` and follow this path:

1. **Overview Page (Home):**
   - Highlight the top KPI metric cards (Total Servers: 2, Active Services: 18, CPU/RAM charts).
   - Point out the two server cards: `server1.example.com` (192.168.56.11) and `server2.example.com` (192.168.56.12).
   - Explain the dual LIVE / DEMO badge in the top bar.

2. **Storage & LVM Page (Task 3):**
   - Show the interactive **LVM Hierarchy Visualizer**: Physical Volume (`/dev/sdb`, 5 GB) -> Volume Group (`vg_data`) -> 3 Logical Volumes (`lv_share`, `lv_web`, `lv_backup`).
   - Click "Simulate +500M Online Expansion" to demonstrate `lvextend -r` without unmounting.

3. **SELinux & Security Page (Task 6):**
   - Point out **Current Mode: Enforcing**.
   - Show the file context table (`httpd_sys_content_t` for `/data/web`).
   - Show the port labels table showing `http_port_t` bound to custom port 82.

4. **NFS & Shared Storage Page (Task 4):**
   - Explain Server 1's export `/data/share` with permissions `(rw,sync,no_root_squash)`.
   - Show Server 2's `autofs` configuration mounting to `/mnt/nfs/share`.

5. **Web Server Page (Task 5):**
   - Show the Apache VirtualHost config listening on custom port 82.
   - Show the embedded preview of the hosted RHEL enterprise landing page.

6. **Containers Page (Task 11):**
   - Show rootless Podman UBI9 container `webc` running on port 8081.
   - Highlight systemd user lingering status (`loginctl enable-linger admin1`).

7. **Reboot Verification Page (Task 12):**
   - Show the 16-point audit checklist covering all 12 tasks.
   - Click "Download Verification JSON Report" to demonstrate automated compliance reporting.

---

## 5. Troubleshooting Scenarios for Defense

| Scenario | Symptom | Immediate Diagnostic Step | Enterprise Resolution |
|---|---|---|---|
| **NFS mount times out** | `mount.nfs: Connection timed out` | `nc -zv 192.168.56.11 2049` | Ensure `firewall-cmd --add-service=nfs --add-service=rpc-bind --add-service=mountd --permanent` is applied on server1. |
| **Apache 403 Forbidden** | Client gets HTTP 403 on port 82 | `ls -Zd /data/web` | Files have wrong SELinux context. Run `restorecon -Rv /data/web`. |
| **Apache fails to start** | `AH00072: could not bind to address [::]:82` | `ausearch -m avc -ts recent` | Port 82 blocked by SELinux. Run `semanage port -a -t http_port_t -p tcp 82`. |
| **autofs directory empty** | `/mnt/nfs/share` is missing | `cd /mnt/nfs/share` then `ls` | Expected behavior of autofs. It only mounts upon direct access. If it fails, check `systemctl status autofs`. |
| **Backup volume full** | `tar: /backup: No space left on device` | `df -h /backup` | Prune backups: `find /backup -name '*.tar.gz' -mtime +7 -delete`. If needed, expand volume: `lvextend -L +500M -r /dev/vg_data/lv_backup`. |
