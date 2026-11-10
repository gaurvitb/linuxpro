# LINUXPULSE
### Enterprise Linux Server Administration & Infrastructure Monitoring Platform

![Status](https://img.shields.io/badge/RHEL-9%20%2F%2010-red?style=for-the-badge&logo=redhat)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18%20%2F%2019-61DAFB?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

> **LINUXPULSE** transforms the classic dual-server Red Hat Enterprise Linux (RHEL 9 / 10) Capstone project into a modern, enterprise-grade infrastructure management and observability platform.

---

## 🌟 Highlights & Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │          LINUXPULSE Web Management           │
                  │   React 18 + TypeScript + Tailwind CSS v4    │
                  └──────────────────────┬───────────────────────┘
                                         │ REST API
                  ┌──────────────────────▼───────────────────────┐
                  │           FastAPI Telemetry Engine           │
                  │       Dual Mode: LIVE (SSH) | DEMO           │
                  └──────────────┬────────────────┬──────────────┘
                    SSH / Probes │                │ SSH / Probes
         ┌───────────────────────▼──────┐  ┌──────▼───────────────────────┐
         │     server1.example.com      │  │     server2.example.com      │
         │        192.168.56.11         │  │        192.168.56.12         │
         │  • LVM Storage (vg_data)     │  │  • NFS Client (autofs)       │
         │  • NFS Server (/data/share)  │  │  • Ed25519 SSH Client        │
         │  • Apache HTTPD (Port 82)    │  │  • Podman UBI9 Container     │
         │  • SELinux Enforcing         │  │    (Port 8081:8080)          │
         │  • firewalld Packet Filter   │  │  • Systemd User Units        │
         │  • Nightly Backups & Cron    │  │  • Network Verification      │
         └──────────────────────────────┘  └──────────────────────────────┘
```

---

## 📋 Complete 12 RHEL Tasks Implemented

1. **Task 1: Hostnames, Static IPs & Resolution:** `nmcli con add`, `hostnamectl`, `/etc/hosts` mapping `192.168.56.11` and `.12`, bidirectional ping.
2. **Task 2: Users, Groups & Delegated Sudo:** Accounts `alice`, `bob`, `admin1`; groups `sales`, `it`; `/srv/sales` with `chmod 2770` (setgid); `/etc/sudoers.d/it-admins` (`httpd` management only).
3. **Task 3: LVM Storage Management:** Secondary disk `/dev/sdb` (5 GB) -> `vg_data` -> `lv_share` (2G), `lv_web` (1G), `lv_backup` (1G); XFS; `/etc/fstab` persistent mounts; online growth `+500M`.
4. **Task 4: NFS Server & Autofs Client:** `/data/share` exported to `192.168.56.0/24(rw,sync)`; client on-demand automount to `/mnt/nfs/share` via `autofs` (60s timeout).
5. **Task 5: Apache Web Server:** Custom port 82, `/etc/httpd/conf.d/capstone.conf`, `DocumentRoot /data/web`, custom branded website.
6. **Task 6: SELinux Contexts & Port Labels:** Enforcing mode, `httpd_sys_content_t` context, `http_port_t:82` port label, `restorecon -Rv`, AVC denial monitoring.
7. **Task 7: firewalld Packet Filtering:** Open ports 22, 82/tcp, 2049; services `ssh`, `nfs`, `mountd`, `rpc-bind`.
8. **Task 8: SSH Key Hardening:** Ed25519 keypair for `admin1`; server1 hardened with `PasswordAuthentication no` and `PermitRootLogin no`.
9. **Task 9: Backup Script, Cron & Restore Test:** Automated tar.gz backup script, nightly cron (`0 2 * * *`), 7-day retention cleanup, disaster recovery restore procedure.
10. **Task 10: Systemctl & Journald Logging:** Service telemetry (`httpd`, `nfs-server`, `firewalld`, `sshd`, `crond`, `autofs`), persistent `/var/log/journal`.
11. **Task 11: Podman Containerization:** Rootless `ubi9/httpd-24` container `webc` on port `8081:8080`, systemd user unit with `loginctl enable-linger`.
12. **Task 12: Reboot & Final Verification:** 12-point comprehensive reboot audit checklist, real-time verification runner, downloadable JSON report.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22.19.0)
- **Python** 3.10+ (tested on Python 3.14.2)
- **Git**

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (Runs on http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```
Open **API Documentation / Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
```bash
# Open a second terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start Vite development server
npm run dev
```
Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🖥️ Running on RHEL Virtual Machines

To provision your live RHEL 9 / 10 VMs in VirtualBox:

### Server 1 (`server1.example.com` - `192.168.56.11`):
```bash
# Copy setup scripts to server1
scp -r infrastructure/server1 admin1@192.168.56.11:~/
# Run turnkey setup script
sudo bash ~/server1/setup_all_server1.sh
```

### Server 2 (`server2.example.com` - `192.168.56.12`):
```bash
# Copy setup scripts to server2
scp -r infrastructure/server2 admin1@192.168.56.12:~/
# Run turnkey setup script
sudo bash ~/server2/setup_all_server2.sh
```

### Run Task 12 Reboot Audit:
```bash
# Execute verification on either server
sudo bash infrastructure/scripts/verify_all.sh
```

---

## 🛡️ Security & Zero-Trust Design

- **Strict Read-Only Dashboard by Default:** Normal telemetry sampling never modifies VM state.
- **Interactive Guardrails:** Any write operation (such as Disaster Recovery Restore Test or LVM Online Expansion) requires explicit user confirmation in a dedicated security modal.
- **No Arbitrary Shell Execution:** The backend only executes strict allowlisted commands with pre-validated parameters.
- **Least-Privilege RBAC:** Delegated sudoers rule `%it ALL=(ALL) /usr/bin/systemctl restart httpd, /usr/bin/systemctl status httpd` ensures the `it` group cannot access root or other system services.

---

## 📂 Project Structure

```
linuxpulse/
├── frontend/                 # React 18, TypeScript, Tailwind CSS v4, Lucide, Recharts
│   ├── src/
│   │   ├── components/       # Sidebar, Topbar, LVMVisualizer, TopologyCanvas, TerminalView
│   │   ├── pages/            # 17 Dedicated Enterprise Pages
│   │   ├── services/         # API Client & Telemetry fetchers
│   │   └── types/            # TypeScript schema interfaces
│   └── package.json
│
├── backend/                  # FastAPI REST Service & Telemetry Layer
│   ├── app/
│   │   ├── api/              # API Route definitions
│   │   ├── core/             # Allowlisted execution engine & Live/Demo switcher
│   │   ├── models/           # Pydantic schemas
│   │   ├── services/         # Telemetry aggregation & verification logic
│   │   └── main.py           # FastAPI entrypoint
│   └── requirements.txt
│
├── infrastructure/           # Automated shell scripts & configs for VMs
│   ├── server1/              # Turnkey scripts for Server 1
│   ├── server2/              # Turnkey scripts for Server 2
│   ├── configurations/       # Golden configs (fstab, exports, auto.nfs, capstone.conf, sshd)
│   └── scripts/              # Verification & backup scripts
│
├── docs/                     # Capstone documentation & comprehensive report
│   ├── LINUXPULSE_MASTER_PROJECT_REPORT.md
│   └── architecture/
└── README.md
```

---

## 📄 License
This project is open-source and available under the **MIT License**.

