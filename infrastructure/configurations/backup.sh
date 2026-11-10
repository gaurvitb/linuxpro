#!/bin/bash
# ==============================================================================
# LINUXPULSE - Task 9: Production Automated Backup Script
# Target: /usr/local/bin/backup.sh on server1.example.com
# ==============================================================================
set -euo pipefail

DEST="/backup"
STAMP=$(date +%F_%H%M)
ARCHIVE="${DEST}/backup_${STAMP}.tar.gz"

# Ensure destination exists
mkdir -p "${DEST}"

# Create compressed archive of key service directories and configs
tar -czf "${ARCHIVE}" /data/web /etc/httpd /etc/exports /etc/fstab 2>/dev/null

# Clean up backups older than 7 days
find "${DEST}" -name 'backup_*.tar.gz' -mtime +7 -delete

# Log completion to systemd journal
logger -t backup "LINUXPULSE Backup ${STAMP} completed successfully: ${ARCHIVE}"

exit 0

