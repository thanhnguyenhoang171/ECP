#!/bin/bash

# ==============================================================================
# AUTOMATED DUAL DATABASE BACKUP SCRIPT: MYSQL & MONGODB
# UPLOAD TO NEXTCLOUD VIA WEBDAV (PUT)
# ==============================================================================

# --- AUTO-LOAD LOCAL .env FILE (IF PRESENT) ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [ -f "${PROJECT_ROOT}/.env" ]; then
    echo "[INFO] Loading environment variables from: ${PROJECT_ROOT}/.env"
    set -o allexport
    eval $(grep -v '^#' "${PROJECT_ROOT}/.env" | grep -v '^[[:space:]]*$' | sed -e 's/=\(.*\)/="\1"/' -e 's/=""\([^"]*\)""/="\1"/') 2>/dev/null || source "${PROJECT_ROOT}/.env"
    set +o allexport
elif [ -f ".env" ]; then
    echo "[INFO] Loading environment variables from current directory .env..."
    set -o allexport
    eval $(grep -v '^#' .env | grep -v '^[[:space:]]*$' | sed -e 's/=\(.*\)/="\1"/' -e 's/=""\([^"]*\)""/="\1"/') 2>/dev/null || source .env
    set +o allexport
fi

# --- 1. PARSE MYSQL CONFIGURATION FROM SPRING_DATASOURCE_URL IF PRESENT ---
if [ -n "${SPRING_DATASOURCE_URL}" ]; then
    CLEAN_URL=$(echo "${SPRING_DATASOURCE_URL}" | sed -e 's/jdbc:mysql:\/\///' -e 's/\?.*//')
    HOST_PORT=$(echo "${CLEAN_URL}" | cut -d'/' -f1)
    EXTRACT_DB=$(echo "${CLEAN_URL}" | cut -d'/' -f2)
    
    if [ -n "${HOST_PORT}" ]; then
        PARSED_HOST=$(echo "${HOST_PORT}" | cut -d':' -f1)
        PARSED_PORT=$(echo "${HOST_PORT}" | cut -d':' -f2 -s)
        MYSQL_HOST="${PARSED_HOST:-127.0.0.1}"
        MYSQL_PORT="${PARSED_PORT:-3306}"
    fi
    if [ -n "${EXTRACT_DB}" ]; then
        MYSQL_DB="${EXTRACT_DB}"
    fi
fi

MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${SPRING_DATASOURCE_USERNAME:-${MYSQL_USER:-root}}"
MYSQL_PASS="${SPRING_DATASOURCE_PASSWORD:-${MYSQL_PASS:-}}"
MYSQL_DB="${MYSQL_DB:-ecp_local}"

# Fallback Docker service host 'mysql' -> '127.0.0.1' when running outside container
if [ "${MYSQL_HOST}" = "mysql" ]; then
    if ! ping -c 1 mysql &>/dev/null && ! grep -q "mysql" /etc/hosts 2>/dev/null; then
        echo "[INFO] Auto-replacing Docker MySQL host 'mysql' with '127.0.0.1' when running outside container..."
        MYSQL_HOST="127.0.0.1"
    fi
fi

# --- 2. MONGODB CONFIGURATION & DOCKER HOST REPLACEMENT ---
RAW_MONGO_URI="${SPRING_MONGODB_URI:-${MONGO_URI:-mongodb://localhost:27017/ecp_mongo}}"
CLEAN_MONGO_URI=$(echo "${RAW_MONGO_URI}" | tr -d '"' | tr -d "'")

# Fallback Docker service host 'mongodb' -> '127.0.0.1' when running outside container
if [[ "$CLEAN_MONGO_URI" == *"@mongodb:"* ]] || [[ "$CLEAN_MONGO_URI" == *"//mongodb:"* ]]; then
    if ! ping -c 1 mongodb &>/dev/null && ! grep -q "mongodb" /etc/hosts 2>/dev/null; then
        echo "[INFO] Auto-replacing Docker Mongo host 'mongodb' with '127.0.0.1' when running outside container..."
        CLEAN_MONGO_URI=$(echo "${CLEAN_MONGO_URI}" | sed -e 's/@mongodb:/@127.0.0.1:/' -e 's/\/\/mongodb:/\/\/127.0.0.1:/')
    fi
fi

# --- 3. NEXTCLOUD WEBDAV CONFIGURATION ---
NEXTCLOUD_DOMAIN="${NEXTCLOUD_DOMAIN:-cloud.example.com}"
NEXTCLOUD_USER="${NEXTCLOUD_USER:-your_username}"
NEXTCLOUD_APP_PASS="${NEXTCLOUD_APP_PASS:-}"
NEXTCLOUD_TARGET_DIR="${NEXTCLOUD_TARGET_DIR:-backups}"

# --- 4. LOCAL TEMPORARY WORKING DIRECTORY ---
LOCAL_BACKUP_DIR="${LOCAL_BACKUP_DIR:-/tmp/ecp_backups}"

# --- COLOR LOGGING FORMAT ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO] [$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
log_success() { echo -e "${GREEN}[SUCCESS] [$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
log_warn()    { echo -e "${YELLOW}[WARN] [$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
log_error()   { echo -e "${RED}[ERROR] [$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }

# --- STEP 1: VALIDATE REQUIRED ENVIRONMENT VARIABLES ---
if [ -z "${NEXTCLOUD_APP_PASS}" ]; then
    log_error "Missing required environment variable: NEXTCLOUD_APP_PASS! Please check your .env or GitHub Secrets."
    exit 1
fi

# --- AUTO-DETECT TOOLS PATH ON WINDOWS IF NOT IN PATH ---
MYSQLDUMP_CMD="mysqldump"
if ! command -v mysqldump &> /dev/null; then
    for path in "/c/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe" \
                "/c/Program Files/MySQL/MySQL Server 8.1/bin/mysqldump.exe" \
                "/c/Program Files/MySQL/MySQL Server 8.4/bin/mysqldump.exe" \
                "/c/Program Files/MySQL/MySQL Server 9.0/bin/mysqldump.exe" \
                "/c/xampp/mysql/bin/mysqldump.exe" \
                "/c/wamp64/bin/mysql/mysql*/bin/mysqldump.exe"; do
        if [ -f "$path" ]; then
            MYSQLDUMP_CMD="$path"
            break
        fi
    done
fi

MONGODUMP_CMD="mongodump"
if ! command -v mongodump &> /dev/null; then
    for path in "/c/Program Files/MongoDB/Tools/100/bin/mongodump.exe" \
                "/c/Program Files/MongoDB/Server/*/bin/mongodump.exe"; do
        if [ -f "$path" ]; then
            MONGODUMP_CMD="$path"
            break
        fi
    done
fi

# --- STEP 2: INITIALIZE TEMPORARY BACKUP DIRECTORY ---
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEMP_WORK_DIR="${LOCAL_BACKUP_DIR}/backup_${TIMESTAMP}"
TAR_FILENAME="full_backup_ecp_${TIMESTAMP}.tar.gz"
FINAL_TAR_PATH="${LOCAL_BACKUP_DIR}/${TAR_FILENAME}"

mkdir -p "${TEMP_WORK_DIR}"

# --- STEP 3: DUMP MYSQL DATABASE ---
log_info "1/3. Dumping MySQL Database (${MYSQL_DB}) at Host ${MYSQL_HOST}:${MYSQL_PORT}..."

if command -v "$MYSQLDUMP_CMD" &> /dev/null || [ -f "$MYSQLDUMP_CMD" ]; then
    MYSQL_OUT_FILE="${TEMP_WORK_DIR}/mysql_dump.sql"
    
    if [ -n "${MYSQL_PASS}" ]; then
        DUMP_ERR=$("$MYSQLDUMP_CMD" -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" -u "${MYSQL_USER}" -p"${MYSQL_PASS}" \
                  --single-transaction --quick --lock-tables=false "${MYSQL_DB}" > "${MYSQL_OUT_FILE}" 2>&1)
    else
        DUMP_ERR=$("$MYSQLDUMP_CMD" -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" -u "${MYSQL_USER}" \
                  --single-transaction --quick --lock-tables=false "${MYSQL_DB}" > "${MYSQL_OUT_FILE}" 2>&1)
    fi

    if [ -s "${MYSQL_OUT_FILE}" ]; then
        log_success "MySQL database dumped successfully!"
    else
        log_warn "MySQL dump failed! Error details: ${DUMP_ERR}"
    fi
else
    log_warn "mysqldump command not found. Skipping MySQL backup."
fi

# --- STEP 4: DUMP MONGODB DATABASE ---
log_info "2/3. Dumping MongoDB Database..."

if command -v "$MONGODUMP_CMD" &> /dev/null || [ -f "$MONGODUMP_CMD" ]; then
    MONGO_OUT_DIR="${TEMP_WORK_DIR}/mongo_dump"
    log_info "MongoDB URI: ${CLEAN_MONGO_URI}"
    
    MONGO_ERR=$("$MONGODUMP_CMD" --uri="${CLEAN_MONGO_URI}" --out="${MONGO_OUT_DIR}" 2>&1)
    
    if [ -d "${MONGO_OUT_DIR}" ] && [ "$(ls -A "${MONGO_OUT_DIR}")" ]; then
        log_success "MongoDB database dumped successfully!"
    else
        log_warn "MongoDB dump empty or failed. Details: ${MONGO_ERR}"
    fi
else
    log_warn "mongodump command not found. Skipping MongoDB backup."
fi

# --- STEP 5: COMPRESS ALL DUMP DATA INTO A SINGLE TAR.GZ ARCHIVE ---
log_info "Creating compressed backup archive..."
tar --force-local -czf "${FINAL_TAR_PATH}" -C "${LOCAL_BACKUP_DIR}" "backup_${TIMESTAMP}" 2>/dev/null || \
tar -czf "${FINAL_TAR_PATH}" -C "${LOCAL_BACKUP_DIR}" "backup_${TIMESTAMP}"

if [ ! -s "${FINAL_TAR_PATH}" ]; then
    log_error "Failed to create compressed backup archive!"
    rm -rf "${TEMP_WORK_DIR}" "${FINAL_TAR_PATH}"
    exit 1
fi

FILE_SIZE=$(du -h "${FINAL_TAR_PATH}" | cut -f1)
log_success "Archive created successfully: ${TAR_FILENAME} (${FILE_SIZE})"

# --- STEP 6: UPLOAD TO NEXTCLOUD VIA WEBDAV PUT ---
WEBDAV_URL="https://${NEXTCLOUD_DOMAIN}/remote.php/dav/files/${NEXTCLOUD_USER}/${NEXTCLOUD_TARGET_DIR}/${TAR_FILENAME}"

log_info "3/3. Uploading backup archive to Nextcloud WebDAV..."
log_info "Target URL: https://${NEXTCLOUD_DOMAIN}/remote.php/dav/files/${NEXTCLOUD_USER}/${NEXTCLOUD_TARGET_DIR}/${TAR_FILENAME}"

HTTP_CODE=$(curl -s -o /tmp/webdav_curl_resp.txt -w "%{http_code}" \
    -u "${NEXTCLOUD_USER}:${NEXTCLOUD_APP_PASS}" \
    -X PUT \
    --data-binary @"${FINAL_TAR_PATH}" \
    "${WEBDAV_URL}")

# WebDAV PUT successful status codes: 201 (Created) or 204 (No Content)
if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 204 ]; then
    log_success "Uploaded successfully to Nextcloud server! (HTTP Status: ${HTTP_CODE})"
else
    log_error "Upload failed! HTTP Status Code: ${HTTP_CODE}"
    if [ -f /tmp/webdav_curl_resp.txt ]; then
        log_error "Response details: $(cat /tmp/webdav_curl_resp.txt)"
    fi
    log_warn "Temporary archive retained at: ${FINAL_TAR_PATH}"
    rm -rf "${TEMP_WORK_DIR}" /tmp/webdav_curl_resp.txt
    exit 1
fi

# --- STEP 7: CLEANUP LOCAL TEMPORARY FILES ---
rm -rf "${TEMP_WORK_DIR}" "${FINAL_TAR_PATH}" /tmp/webdav_curl_resp.txt
log_info "Cleaned up local temporary directory."
log_success "=== DUAL DATABASE AUTO BACKUP COMPLETED (MYSQL + MONGODB) ==="
