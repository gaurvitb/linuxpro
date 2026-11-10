<#
.SYNOPSIS
    Automated VirtualBox VM Provisioning for LINUXPULSE (Part B of RHEL Capstone)
.DESCRIPTION
    Creates server1 and server2 virtual machines in VirtualBox strictly adhering
    to the hardware and networking specifications in Project 10 PDF.
    Safely checks for existing VMs to avoid creating duplicate resources.
#>

param(
    [string]$IsoPath = "",
    [string]$VBoxManagePath = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  LINUXPULSE: Automated VirtualBox VM Creation (Part B)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Locate VBoxManage
if (-not $VBoxManagePath) {
    $searchPaths = @(
        "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe",
        "${env:ProgramFiles}\Oracle\VirtualBox\VBoxManage.exe",
        "${env:ProgramFiles(x86)}\Oracle\VirtualBox\VBoxManage.exe",
        "C:\VirtualBox\VBoxManage.exe"
    )
    $vboxCmd = Get-Command VBoxManage -ErrorAction SilentlyContinue
    if ($vboxCmd) {
        $VBoxManagePath = $vboxCmd.Source
    } else {
        foreach ($p in $searchPaths) {
            if (Test-Path $p) {
                $VBoxManagePath = $p
                break
            }
        }
    }
}

if (-not $VBoxManagePath -or -not (Test-Path $VBoxManagePath)) {
    Write-Host "[ERROR] VBoxManage.exe was not found." -ForegroundColor Red
    Write-Host "Please ensure Oracle VirtualBox is installed from https://www.virtualbox.org" -ForegroundColor Yellow
    Write-Host "Or specify -VBoxManagePath 'C:\Path\To\VBoxManage.exe'" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Located VirtualBox: $VBoxManagePath" -ForegroundColor Green

# 2. Check Host-Only Interface
$hostOnlyName = "VirtualBox Host-Only Ethernet Adapter"
$hostOnlyList = & "$VBoxManagePath" list hostonlyifs
if ($hostOnlyList -notmatch [regex]::Escape($hostOnlyName)) {
    Write-Host "[INFO] Creating Host-Only Network..." -ForegroundColor Yellow
    & "$VBoxManagePath" hostonlyif create
}
Write-Host "[OK] Host-Only network validated." -ForegroundColor Green

# 3. Locate RHEL ISO
if (-not $IsoPath) {
    $isoMatches = Get-ChildItem -Path "$env:USERPROFILE\Downloads", "$env:USERPROFILE\Desktop" -Filter "*rhel*.iso" -ErrorAction SilentlyContinue
    if ($isoMatches) {
        $IsoPath = $isoMatches[0].FullName
        Write-Host "[OK] Detected RHEL ISO: $IsoPath" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] No RHEL ISO found automatically in Downloads or Desktop." -ForegroundColor Yellow
        Write-Host "VMs will be created with optical drives ready. You can attach the ISO after downloading." -ForegroundColor Yellow
    }
}

# 4. Check Existing VMs to Prevent Duplicates
$existingVms = & "$VBoxManagePath" list vms
$vmFolder = "$env:USERPROFILE\VirtualBox VMs"

# --- Create server1 ---
if ($existingVms -match '"server1"') {
    Write-Host "[SKIP] VM 'server1' already exists. Skipping creation to avoid duplicates." -ForegroundColor Yellow
} else {
    Write-Host "[+] Creating VM 'server1' (2048 MB RAM, 2 vCPUs, 20GB OS Disk, 5GB Extra LVM Disk)..." -ForegroundColor Cyan
    & "$VBoxManagePath" createvm --name "server1" --ostype "RedHat_64" --register
    & "$VBoxManagePath" modifyvm "server1" --memory 2048 --cpus 2 --vram 16 --boot1 dvd --boot2 disk --boot3 none
    & "$VBoxManagePath" modifyvm "server1" --nic1 nat
    & "$VBoxManagePath" modifyvm "server1" --nic2 hostonly --hostonlyadapter2 $hostOnlyName --cableconnected2 on

    # Storage Controllers
    & "$VBoxManagePath" storagectl "server1" --name "SATA Controller" --add sata --controller IntelAHCI
    
    # Disk 1: 20 GB OS Disk
    $s1Disk1 = "$vmFolder\server1\server1_os.vdi"
    & "$VBoxManagePath" createmedium disk --filename $s1Disk1 --size 20480 --format VDI
    & "$VBoxManagePath" storageattach "server1" --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium $s1Disk1

    # Disk 2: 5 GB Extra Disk for LVM (/dev/sdb)
    $s1Disk2 = "$vmFolder\server1\server1_lvm.vdi"
    & "$VBoxManagePath" createmedium disk --filename $s1Disk2 --size 5120 --format VDI
    & "$VBoxManagePath" storageattach "server1" --storagectl "SATA Controller" --port 1 --device 0 --type hdd --medium $s1Disk2

    # Attach Optical Drive (ISO)
    if ($IsoPath -and (Test-Path $IsoPath)) {
        & "$VBoxManagePath" storageattach "server1" --storagectl "SATA Controller" --port 2 --device 0 --type dvddrive --medium $IsoPath
    } else {
        & "$VBoxManagePath" storageattach "server1" --storagectl "SATA Controller" --port 2 --device 0 --type dvddrive --medium emptydrive
    }

    Write-Host "[OK] VM 'server1' created successfully!" -ForegroundColor Green
}

# --- Create server2 ---
if ($existingVms -match '"server2"') {
    Write-Host "[SKIP] VM 'server2' already exists. Skipping creation to avoid duplicates." -ForegroundColor Yellow
} else {
    Write-Host "[+] Creating VM 'server2' (2048 MB RAM, 2 vCPUs, 20GB OS Disk)..." -ForegroundColor Cyan
    & "$VBoxManagePath" createvm --name "server2" --ostype "RedHat_64" --register
    & "$VBoxManagePath" modifyvm "server2" --memory 2048 --cpus 2 --vram 16 --boot1 dvd --boot2 disk --boot3 none
    & "$VBoxManagePath" modifyvm "server2" --nic1 nat
    & "$VBoxManagePath" modifyvm "server2" --nic2 hostonly --hostonlyadapter2 $hostOnlyName --cableconnected2 on

    # Storage Controllers
    & "$VBoxManagePath" storagectl "server2" --name "SATA Controller" --add sata --controller IntelAHCI
    
    # Disk 1: 20 GB OS Disk
    $s2Disk1 = "$vmFolder\server2\server2_os.vdi"
    & "$VBoxManagePath" createmedium disk --filename $s2Disk1 --size 20480 --format VDI
    & "$VBoxManagePath" storageattach "server2" --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium $s2Disk1

    # Attach Optical Drive (ISO)
    if ($IsoPath -and (Test-Path $IsoPath)) {
        & "$VBoxManagePath" storageattach "server2" --storagectl "SATA Controller" --port 1 --device 0 --type dvddrive --medium $IsoPath
    } else {
        & "$VBoxManagePath" storageattach "server2" --storagectl "SATA Controller" --port 1 --device 0 --type dvddrive --medium emptydrive
    }

    Write-Host "[OK] VM 'server2' created successfully!" -ForegroundColor Green
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  VM Provisioning Completed Successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
