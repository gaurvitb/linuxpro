# LINUXPULSE
### Enterprise Linux Server Administration & Infrastructure Monitoring Platform

![Status](https://img.shields.io/badge/RHEL-9%20%2F%2010-red?style=for-the-badge&logo=redhat)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Infrastructure](https://img.shields.io/badge/Infrastructure-Verification%20Pending-orange?style=for-the-badge)

> **LINUXPULSE** transforms a dual-server Red Hat Enterprise Linux (RHEL 9 / 10) capstone project into a modern, enterprise-grade infrastructure management and observability platform — inspired by Datadog, Grafana, and Vercel dashboards.

---

## ⚠️ Infrastructure Status Notice

> **CODE VERIFIED — INFRASTRUCTURE VERIFICATION PENDING**
>
> The full application (React frontend + FastAPI backend + all 12 infrastructure scripts) is complete and code-verified.
> Live RHEL VM testing requires VirtualBox + RHEL ISO installation (see [VM Setup](#-rhel-vm-setup-part-b) below).
> Until VMs are running, the platform operates in **DEMO MODE** with high-fidelity simulated telemetry,
> clearly labelled throughout the UI.

---

## 🌟 Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │          LINUXPULSE Web Management           │
                  │   React 19 + TypeScript + Tailwind CSS v4    │
                  └──────────────────────┬───────────────────────┘
                                         │ REST API  (port 8000)
                  ┌──────────────────────▼───────────────────────┐
                  │        FastAPI Telemetry Engine               │
                  │      Dual Mode: LIVE (SSH) │ DEMO            │
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
                           VirtualBox Host-Only Network: 192.168.56.0/24
```

---

## 📋 All 12 RHEL Tasks Covered

| # | Task | Server | Key Technologies |
|---|------|--------|-----------------|
| 1 | Hostname, Static IP & Name Resolution | Both | `nmcli`, `hostnamectl`, `/etc/hosts` |
| 2 | Users, Groups & Delegated Sudo | server1 | `useradd`, `groupadd`, `chmod 2770`, sudoers |
| 3 | LVM Storage Management | server1 | `pvcreate`, `vgcreate`, `lvcreate`, XFS, fstab |
| 4 | NFS Server & Autofs Client | Both | `nfs-utils`, `/etc/exports`, `autofs` |
| 5 | Apache Web Server (Port 82) | server1 | `httpd`, VirtualHost, DocumentRoot `/data/web` |
| 6 | SELinux Contexts & Port Labels | server1 | `semanage`, `restorecon`, `chcon`, AVC audit |
| 7 | firewalld Packet Filtering | server1 | `firewall-cmd`, ports 22/82/2049 |
| 8 | SSH Key Hardening | Both | Ed25519 keypair, `PasswordAuthentication no` |
| 9 | Backup Script, Cron & DR Restore | server1 | `tar`, `cron`, 7-day retention |
| 10 | Systemctl & Journald Logging | Both | `journalctl`, persistent journal |
| 11 | Podman Containerization | server2 | Rootless UBI9, systemd user units, `loginctl` |
| 12 | Reboot & Final Verification | Both | 12-point audit checklist, JSON report |

---

## 🚀 Quick Start (DEMO Mode — No VMs Required)

### Prerequisites
| Tool | Minimum Version |
|------|----------------|
| Node.js | v18+ (tested v22.19.0) |
| Python | 3.10+ (tested 3.14.2) |
| Git | any recent version |

### 1 · Clone the repository
```bash
git clone https://github.com/<your-username>/linuxpulse.git
cd linuxpulse
```

### 2 · Configure environment (optional)
```bash
# Copy the example — edit values only if connecting to real RHEL VMs
cp .env.example .env
```

### 3 · Start the backend
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI server  →  http://localhost:8000
python -m uvicorn app.main:app --reload --port 8000
```

Swagger API docs: **[http://localhost:8000/docs](http://localhost:8000/docs)**

### 4 · Start the frontend
```bash
# Open a second terminal
cd frontend

npm install --legacy-peer-deps
npm run dev
```

Dashboard: **[http://localhost:5173](http://localhost:5173)**

### 5 · One-command launch (Windows)
```bat
start_all.bat
```
or with PowerShell:
```powershell
.\start_all.ps1
```

---

## 🖥️ RHEL VM Setup (Part B)

> **Requires:** VirtualBox 7.x + RHEL 9/10 DVD ISO (~8 GB).
> Download RHEL free: https://developers.redhat.com (Red Hat Developer account required)

### A · Create VMs automatically
```powershell
# Windows — supply VBoxManage path and RHEL ISO path
.\infrastructure\scripts\create_vms.ps1 `
    -VBoxManagePath "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" `
    -IsoPath "C:\Users\<you>\Downloads\rhel-10.0-x86_64-dvd.iso"
```

### B · Provision server1
```bash
# After RHEL installation and first boot on server1:
scp -r infrastructure/server1 admin1@192.168.56.11:~/
ssh admin1@192.168.56.11 "sudo bash ~/server1/setup_all_server1.sh"
```

### C · Provision server2
```bash
scp -r infrastructure/server2 admin1@192.168.56.12:~/
ssh admin1@192.168.56.12 "sudo bash ~/server2/setup_all_server2.sh"
```

### D · Run Task 12 reboot verification
```bash
ssh admin1@192.168.56.11 "sudo bash ~/verify_all.sh"
```

### E · Switch platform to LIVE mode
In the dashboard → **Settings** → switch to **Live Infrastructure**, or:
```bash
curl -X POST http://localhost:8000/api/settings/mode \
     -H "Content-Type: application/json" \
     -d '{"mode":"LIVE"}'
```

---

## 📂 Project Structure

```
linuxpulse/
│
├── frontend/                     # React 19 · TypeScript · Tailwind CSS v4
│   ├── src/
│   │   ├── components/           # Sidebar, Topbar, LVMVisualizer, TopologyCanvas,
│   │   │                         #   TerminalView, MetricCard, ConfirmModal,
│   │   │                         #   NotificationDrawer
│   │   ├── pages/                # 17 enterprise pages (one per sidebar item)
│   │   ├── services/api.ts       # REST client for all 18 API endpoints
│   │   └── types/index.ts        # TypeScript interfaces (mirrors Pydantic schemas)
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                      # FastAPI · Pydantic v2 · Paramiko
│   ├── app/
│   │   ├── api/routes.py         # 18 REST endpoints
│   │   ├── core/
│   │   │   ├── config.py         # Pydantic settings; LIVE/DEMO mode toggle
│   │   │   └── executor.py       # Allowlisted SSH command runner + socket probes
│   │   ├── models/schemas.py     # Pydantic response schemas for all 12 tasks
│   │   ├── services/             # Telemetry aggregation service
│   │   └── main.py               # FastAPI entrypoint + CORS
│   └── requirements.txt
│
├── infrastructure/
│   ├── server1/
│   │   └── setup_all_server1.sh  # Turnkey provisioner — Tasks 1–10
│   ├── server2/
│   │   └── setup_all_server2.sh  # Turnkey provisioner — Tasks 1,2,4,8,11
│   ├── configurations/           # Golden config files
│   │   ├── capstone.conf         # Apache VirtualHost (port 82)
│   │   ├── exports               # NFS /etc/exports
│   │   ├── auto.master.d_nfs.autofs  # autofs master map
│   │   ├── auto.nfs              # autofs direct map
│   │   ├── fstab.snippet         # LVM /etc/fstab entries
│   │   ├── 50-capstone.conf      # sshd hardening drop-in
│   │   ├── it-admins             # sudoers delegation rule
│   │   ├── backup.sh             # Backup script (tar.gz + 7-day retention)
│   │   └── backup.cron           # Cron entry (02:00 nightly)
│   └── scripts/
│       ├── create_vms.ps1        # Automated VirtualBox VM creation (Windows)
│       ├── create_vms.bat        # Wrapper launcher for create_vms.ps1
│       └── verify_all.sh         # Task 12 reboot audit (colour output)
│
├── docs/
│   └── LINUXPULSE_MASTER_PROJECT_REPORT.md   # Full academic capstone report
│
├── .env.example                  # Environment template (no secrets)
├── .gitattributes                # Cross-platform line-ending rules
├── .gitignore
├── LICENSE                       # MIT
├── README.md
├── start_backend.bat / .ps1
├── start_frontend.bat / .ps1
└── start_all.bat / .ps1
```

---

## 🛡️ Security Design

| Control | Implementation |
|---------|---------------|
| No arbitrary shell execution | Backend enforces a strict `ALLOWLISTED_COMMANDS` dict; unknown keys are rejected |
| No hardcoded secrets | All credentials loaded from environment variables; `.env` excluded from git |
| Least-privilege RBAC | `%it` sudoers rule scoped to `httpd` restart/status only |
| SSH hardening | `PasswordAuthentication no`, `PermitRootLogin no` on server1 |
| Zero-trust UI | Destructive operations (DR restore, LVM expand) gated behind confirmation modal |
| SELinux Enforcing | `httpd_sys_content_t` context, `http_port_t:82` port label |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Platform health |
| `GET` | `/api/overview` | Cluster summary + server cards |
| `GET` | `/api/servers/{id}` | Per-server telemetry |
| `GET` | `/api/storage/{id}` | LVM PV/VG/LV data |
| `GET` | `/api/nfs/{id}` | NFS exports + autofs config |
| `GET` | `/api/apache/{id}` | Apache status + VirtualHost |
| `GET` | `/api/selinux/{id}` | SELinux mode, contexts, AVC |
| `GET` | `/api/firewall/{id}` | firewalld rules |
| `GET` | `/api/ssh/{id}` | SSH key & hardening config |
| `GET` | `/api/backup/{id}` | Backup archives + schedule |
| `GET` | `/api/logs/{id}` | Journald stream |
| `GET` | `/api/containers/{id}` | Podman container status |
| `GET` | `/api/users/{id}` | Users, groups, sudoers |
| `GET` | `/api/network/{id}` | Network interfaces + ping |
| `GET` | `/api/verification/{id}` | Task 12 reboot audit |
| `POST` | `/api/operations/execute` | Run allowlisted operation |
| `GET` | `/api/settings` | Current mode + endpoints |
| `POST` | `/api/settings/mode` | Switch LIVE ↔ DEMO |

Full interactive docs: **http://localhost:8000/docs**

---

## 🧪 Verification Results

### Code Verification (Completed ✅)

| Component | Status |
|-----------|--------|
| Frontend TypeScript build | ✅ `built in 1.12s` — 0 errors |
| Backend startup | ✅ Uvicorn running on port 8000 |
| All 18 API endpoints | ✅ 18/18 HTTP 200 in DEMO mode |
| `.gitignore` coverage | ✅ `venv/`, `node_modules/`, `dist/`, `.env` excluded |
| Secret scan | ✅ No hardcoded passwords, keys, or tokens found |
| Infrastructure scripts | ✅ All 7 shell/PS1 scripts present and executable |
| Golden configs | ✅ All 9 configuration files present |
| Documentation | ✅ README + master project report complete |

### Infrastructure Verification (Pending ⏳)

| Task | Requires |
|------|---------|
| RHEL ISO download | Red Hat Developer account |
| VirtualBox VM creation | `create_vms.ps1` — awaiting ISO |
| server1 provisioning | RHEL install + `setup_all_server1.sh` |
| server2 provisioning | RHEL install + `setup_all_server2.sh` |
| Task 12 reboot audit | Both VMs running |
| LIVE mode telemetry | SSH reachability to 192.168.56.11/.12 |

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| `python: command not found` | Use `python3` or install Python 3.10+ |
| `venv activate` fails on Windows | Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` first |
| Port 8000 already in use | `python -m uvicorn app.main:app --port 8001` |
| Port 5173 already in use | `npm run dev -- --port 5174` |
| npm install fails | Add `--legacy-peer-deps` flag |
| VBoxManage not found | Provide full path: `-VBoxManagePath "C:\...\VBoxManage.exe"` |
| Backend shows DEMO data | Expected until RHEL VMs are running and LIVE mode is enabled |
| CORS error in browser | Ensure backend is running on port 8000 before starting frontend |

---

## 📄 License

This project is open-source and available under the **[MIT License](LICENSE)**.

---

## 🤝 Contributing

Contributions, issues, and pull requests are welcome.
Please open an issue first to discuss what you would like to change.
