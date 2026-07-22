#!/bin/bash

# ==============================================================================
# AUTOMATED DUAL DATABASE BACKUP SCRIPT: MYSQL & MONGODB
# SUPPORTS DIRECT DOCKER CONTAINER EXECUTION & DIRECT HOST EXECUTION
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

# --- DOCKER CONTAINER NAMES ---
MYSQL_CONTAINER="${MYSQL_CONTAINER:-ecp-mysql}"
MONGO_CONTAINER="${MONGO_CONTAINER:-ecp-mongodb}"

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
MYSQL_DB="${MYSQL_DB:-ecp_db}"

# --- 2. MONGODB CONFIGURATION ---
RAW_MONGO_URI="${SPRING_MONGODB_URI:-${MONGO_URI:-mongodb://localhost:27017/ecp_mongo}}"
CLEAN_MONGO_URI=$(echo "${RAW_MONGO_URI}" | tr -d '"' | tr -d "'")

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

# --- STEP 2: INITIALIZE TEMPORARY BACKUP DIRECTORY ---
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEMP_WORK_DIR="${LOCAL_BACKUP_DIR}/backup_${TIMESTAMP}"
TAR_FILENAME="full_backup_ecp_${TIMESTAMP}.tar.gz"
FINAL_TAR_PATH="${LOCAL_BACKUP_DIR}/${TAR_FILENAME}"

mkdir -p "${TEMP_WORK_DIR}"

# --- STEP 3: DUMP MYSQL DATABASE ---
log_info "1/3. Dumping MySQL Database (${MYSQL_DB})..."

MYSQL_OUT_FILE="${TEMP_WORK_DIR}/mysql_dump.sql"
MYSQL_ERR_FILE="${TEMP_WORK_DIR}/mysql_err.log"

# Check if MySQL is running inside a Docker container
if command -v docker &>/dev/null && docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${MYSQL_CONTAINER}$"; then
    log_info "Detected Docker container '${MYSQL_CONTAINER}'. Executing mysqldump via Docker..."
    docker exec "${MYSQL_CONTAINER}" mysqldump -u "${MYSQL_USER}" -p"${MYSQL_PASS}" --single-transaction --quick --lock-tables=false "${MYSQL_DB}" > "${MYSQL_OUT_FILE}" 2>"${MYSQL_ERR_FILE}"
else
    # Fallback to local mysqldump
    MYSQLDUMP_CMD="mysqldump"
    if ! command -v mysqldump &> /dev/null; then
        for path in "/c/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe" \
                    "/c/Program Files/MySQL/MySQL Server 8.1/bin/mysqldump.exe" \
                    "/c/Program Files/MySQL/MySQL Server 8.4/bin/mysqldump.exe" \
                    "/c/Program Files/MySQL/MySQL Server 9.0/bin/mysqldump.exe" \
                    "/c/xampp/mysql/bin/mysqldump.exe"; do
            if [ -f "$path" ]; then MYSQLDUMP_CMD="$path"; break; fi
        done
    fi

    if command -v "$MYSQLDUMP_CMD" &> /dev/null || [ -f "$MYSQLDUMP_CMD" ]; then
        [ "${MYSQL_HOST}" = "mysql" ] && MYSQL_HOST="127.0.0.1"
        "$MYSQLDUMP_CMD" -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" -u "${MYSQL_USER}" -p"${MYSQL_PASS}" --single-transaction --quick --lock-tables=false "${MYSQL_DB}" > "${MYSQL_OUT_FILE}" 2>"${MYSQL_ERR_FILE}"
    fi
fi

if [ -s "${MYSQL_OUT_FILE}" ]; then
    log_success "MySQL database dumped successfully!"
else
    ERR_MSG=$(cat "${MYSQL_ERR_FILE}" 2>/dev/null | tr '\n' ' ')
    log_warn "MySQL dump failed or returned empty data. Error details: ${ERR_MSG:-'No error output'}"
fi

# --- STEP 4: DUMP MONGODB DATABASE ---
log_info "2/3. Dumping MongoDB Database..."

MONGO_OUT_DIR="${TEMP_WORK_DIR}/mongo_dump"
MONGO_ERR_FILE="${TEMP_WORK_DIR}/mongo_err.log"

MASKED_MONGO_URI=$(echo "${CLEAN_MONGO_URI}" | sed -E 's/(mongodb(\+srv)?:\/\/[^:]+:)[^@]+(@.*)/\1***\3/')
log_info "MongoDB URI: ${MASKED_MONGO_URI}"

# Check if MongoDB is running inside a Docker container
if command -v docker &>/dev/null && docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${MONGO_CONTAINER}$"; then
    log_info "Detected Docker container '${MONGO_CONTAINER}'. Executing mongodump via Docker..."
    docker exec "${MONGO_CONTAINER}" mongodump --out=/tmp/mongo_dump >"${MONGO_ERR_FILE}" 2>&1
    docker cp "${MONGO_CONTAINER}:/tmp/mongo_dump" "${TEMP_WORK_DIR}/" 2>/dev/null
    docker exec "${MONGO_CONTAINER}" rm -rf /tmp/mongo_dump 2>/dev/null
else
    # Fallback to local mongodump
    MONGODUMP_CMD="mongodump"
    if ! command -v mongodump &> /dev/null; then
        for path in "/c/Program Files/MongoDB/Tools/100/bin/mongodump.exe" \
                    "/c/Program Files/MongoDB/Server/*/bin/mongodump.exe"; do
            if [ -f "$path" ]; then MONGODUMP_CMD="$path"; break; fi
        done
    fi

    if command -v "$MONGODUMP_CMD" &> /dev/null || [ -f "$MONGODUMP_CMD" ]; then
        CLEAN_MONGO_URI=$(echo "${CLEAN_MONGO_URI}" | sed -e 's/@mongodb:/@127.0.0.1:/' -e 's/\/\/mongodb:/\/\/127.0.0.1:/')
        "$MONGODUMP_CMD" --uri="${CLEAN_MONGO_URI}" --out="${MONGO_OUT_DIR}" >"${MONGO_ERR_FILE}" 2>&1
    fi
fi

if [ -d "${MONGO_OUT_DIR}" ] && [ "$(ls -A "${MONGO_OUT_DIR}")" ]; then
    log_success "MongoDB database dumped successfully!"
else
    ERR_MSG=$(cat "${MONGO_ERR_FILE}" 2>/dev/null | tr '\n' ' ')
    log_warn "MongoDB dump empty or failed. Error details: ${ERR_MSG:-'No error output'}"
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
MASKED_TARGET_URL=$(echo "${WEBDAV_URL}" | sed -E 's/(https?:\/\/[^\/]+\/remote\.php\/dav\/files\/[^\/]+\/)[^\/]+/\1***/')
log_info "Target URL: ${WEBDAV_URL}"

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
