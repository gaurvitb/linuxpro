"""
LINUXPULSE - REST API Routes
Enterprise Linux Infrastructure Management Platform
"""
from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.services.infrastructure_service import infra_service
from app.models.schemas import (
    ServerSummary, NetworkTopologyInfo, UserManagementData, LVMStorageData,
    NFSData, ApacheStatus, SELinuxData, FirewallData, SSHManagementData,
    BackupData, SystemLogsData, PodmanData, RebootVerificationReport,
    OperationRequest, OperationResult
)

router = APIRouter()

@router.get("/health")
def get_health():
    return {
        "status": "HEALTHY",
        "app": settings.app_name,
        "tagline": settings.tagline,
        "version": settings.version,
        "mode": settings.mode
    }

@router.get("/settings")
def get_settings():
    return {
        "app_name": settings.app_name,
        "tagline": settings.tagline,
        "version": settings.version,
        "mode": settings.mode,
        "server1": settings.server1.model_dump(),
        "server2": settings.server2.model_dump()
    }

@router.post("/settings/mode")
def set_mode(payload: Dict[str, str] = Body(...)):
    new_mode = payload.get("mode", "DEMO").upper()
    if new_mode not in ["LIVE", "DEMO"]:
        raise HTTPException(status_code=400, detail="Mode must be either 'LIVE' or 'DEMO'")
    settings.mode = new_mode
    return {"status": "SUCCESS", "mode": settings.mode}

@router.get("/system/overview")
def get_overview():
    s1 = infra_service.get_server_summary("server1")
    s2 = infra_service.get_server_summary("server2")
    reboot = infra_service.get_reboot_verification()
    backup = infra_service.get_backup_data()
    apache = infra_service.get_apache_status()
    nfs = infra_service.get_nfs_data()
    selinux = infra_service.get_selinux_data()

    total_servers = 2
    online_servers = 2 if s1.status == "online" and s2.status == "online" else 1

    return {
        "app_name": settings.app_name,
        "tagline": settings.tagline,
        "mode": settings.mode,
        "total_servers": total_servers,
        "online_servers": online_servers,
        "offline_servers": total_servers - online_servers,
        "overall_cpu_percent": round((s1.metrics.cpu_percent + s2.metrics.cpu_percent) / 2, 1),
        "overall_ram_percent": round((s1.metrics.ram_percent + s2.metrics.ram_percent) / 2, 1),
        "overall_disk_percent": round((s1.metrics.disk_percent + s2.metrics.disk_percent) / 2, 1),
        "active_services_count": len(s1.services) + len(s2.services),
        "failed_services_count": 0,
        "network_status": "NORMAL - All interfaces UP (192.168.56.0/24)",
        "last_backup_status": backup.last_backup_status,
        "reboot_verification_score": reboot.score_percentage,
        "servers": [s1, s2],
        "key_statuses": {
            "apache": "Active (Port 82 - 200 OK)" if apache.service_active else "Inactive",
            "nfs": "Exporting /data/share" if nfs.nfs_server_active else "Inactive",
            "selinux": f"{selinux.mode} (Targeted)",
            "firewall": "Active (82/tcp, NFS, SSH)",
            "podman": "Active (webc 8081:8080)"
        }
    }

@router.get("/servers", response_model=List[ServerSummary])
def get_servers():
    return [
        infra_service.get_server_summary("server1"),
        infra_service.get_server_summary("server2")
    ]

@router.get("/servers/{server_id}", response_model=ServerSummary)
def get_server_detail(server_id: str):
    if server_id not in ["server1", "server2"]:
        raise HTTPException(status_code=404, detail="Server not found")
    return infra_service.get_server_summary(server_id)

@router.get("/network/topology", response_model=NetworkTopologyInfo)
def get_network_topology():
    return infra_service.get_network_topology()

@router.get("/users", response_model=UserManagementData)
def get_users_and_groups():
    return infra_service.get_user_management()

@router.get("/storage/lvm", response_model=LVMStorageData)
def get_lvm_storage():
    return infra_service.get_lvm_storage()

@router.post("/storage/expand-share")
def expand_storage():
    return infra_service.expand_lv_share()

@router.get("/nfs/status", response_model=NFSData)
def get_nfs_status():
    return infra_service.get_nfs_data()

@router.get("/apache/status", response_model=ApacheStatus)
def get_apache_status():
    return infra_service.get_apache_status()

@router.get("/security/selinux", response_model=SELinuxData)
def get_selinux_data():
    return infra_service.get_selinux_data()

@router.get("/security/firewall", response_model=FirewallData)
def get_firewall_data():
    return infra_service.get_firewall_data()

@router.get("/security/ssh", response_model=SSHManagementData)
def get_ssh_management():
    return infra_service.get_ssh_management()

@router.get("/backup/history", response_model=BackupData)
def get_backup_history():
    return infra_service.get_backup_data()

@router.post("/backup/trigger")
def trigger_backup():
    return infra_service.execute_operation("trigger-backup", "server1")

@router.post("/backup/restore-test")
def restore_test(confirm: bool = Body(..., embed=True)):
    if not confirm:
        raise HTTPException(status_code=400, detail="Restore operation requires explicit confirmation")
    return infra_service.execute_operation("test-restore", "server1", confirm=True)

@router.get("/logs/system", response_model=SystemLogsData)
def get_system_logs(service: Optional[str] = Query(None)):
    return infra_service.get_system_logs(service_filter=service)

@router.get("/containers", response_model=PodmanData)
def get_containers():
    return infra_service.get_podman_data()

@router.get("/verification/reboot", response_model=RebootVerificationReport)
def get_reboot_verification():
    return infra_service.get_reboot_verification()

@router.post("/operations/execute", response_model=OperationResult)
def execute_operation(op: OperationRequest):
    return infra_service.execute_operation(op.operation_id, op.server_id, confirm=op.confirm)
