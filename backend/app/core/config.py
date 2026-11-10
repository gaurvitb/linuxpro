"""
LINUXPULSE - Configuration Settings
Enterprise Linux Infrastructure Management Platform
"""
from pydantic import BaseModel
import os

class ServerConfig(BaseModel):
    id: str
    hostname: str
    ip: str
    role_description: str
    default_user: str = "admin1"
    ssh_port: int = 22
    ssh_key_path: str = ""
    is_live: bool = False

class Settings(BaseModel):
    app_name: str = "LINUXPULSE"
    tagline: str = "Enterprise Linux Infrastructure Management Platform"
    version: str = "1.0.0"
    mode: str = os.getenv("LINUXPULSE_MODE", "DEMO") # "LIVE" or "DEMO"
    api_prefix: str = "/api"
    server1: ServerConfig = ServerConfig(
        id="server1",
        hostname="server1.example.com",
        ip="192.168.56.11",
        role_description="Storage, NFS Server, Apache HTTPD (Port 82), Backups, SELinux, Firewalld",
        default_user="admin1"
    )
    server2: ServerConfig = ServerConfig(
        id="server2",
        hostname="server2.example.com",
        ip="192.168.56.12",
        role_description="NFS Client (autofs), SSH Client, Podman UBI9 Container",
        default_user="admin1"
    )

settings = Settings()

