# ECP - Enterprise Commerce Platform

An enterprise-grade, scalable **Headless E-Commerce Platform** built as a monorepo. Features Event-Driven Architecture, Polyglot Persistence (MySQL, MongoDB, Redis), and a modern frontend stack with Next.js 16 & React 19.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Load Balancer / Nginx               │
├──────────┬──────────┬──────────────────────────────┤
│  Admin   │ Storefront│        API (Spring Boot)     │
│ :8081    │  :3000   │         :9091                │
│ Next.js  │ Next.js  │   REST + JWT Auth            │
└──────────┴──────────┴──────────┬───────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
         ┌────┴────┐         ┌────┴────┐         ┌───┴───┐
         │ MySQL   │         │ MongoDB │         │ Redis │
         │ :3307   │         │ :27017  │         │ :6379 │
         └─────────┘         └─────────┘         └───────┘
```

## Tech Stack

### Backend
- **Spring Boot 3.5** with **Java 24**
- Spring Security + **JWT** authentication (jjwt)
- Spring Data JPA (MySQL) + Spring Data MongoDB + Spring Data Redis
- **MapStruct** for DTO mapping, **Lombok** for boilerplate
- **SpringDoc OpenAPI** (Swagger UI)
- **Cloudinary** for image storage, **EasyExcel** for import/export

### Admin Panel (`apps/admin`)
- **Next.js 16** + **React 19** + **TypeScript 5**
- **Tailwind CSS 4**, **Radix UI**, shadcn/ui patterns
- **TanStack React Query v5** for server state, **Zustand v5** for client state
- **React Hook Form** + **Zod** for validation
- **ExcelJS** for export, **Sonner** for toasts, **date-fns** for dates

### Storefront (`apps/storefront`)
- **Next.js 16** + **React 19** + **TypeScript 5**
- **Tailwind CSS 4**, **Axios** for API calls

### Infrastructure
- **Docker Compose** for orchestration
- **Turborepo** + **pnpm** monorepo management

## Project Structure

```
ecp/
├── apps/
│   ├── admin/                  # Admin dashboard (port 8081 prod / 3001 dev)
│   │   ├── app/(admin)/
│   │   │   ├── (catalog)/      # Products, Categories, SKUs, Promotions
│   │   │   ├── (inventory)/    # Warehouses, Stock, Goods Receipt, Suppliers, Barcode
│   │   │   ├── (sales)/        # Orders, Customers, Payments
│   │   │   ├── (system)/       # Users, Audit Logs, Settings
│   │   │   └── (dashboard)/    # Dashboard overview
│   │   ├── src/features/       # Feature-based modules (api, components, hooks, types)
│   │   └── components/common/  # Shared UI components
│   │
│   └── storefront/             # Customer-facing store (port 3000 prod / 3002 dev)
│       ├── app/
│       │   ├── (auth)/         # Login, Register
│       │   └── profile/        # User profile
│       ├── components/         # Homepage & product display
│       └── services/           # API service layer
│
├── services/
│   └── ecp_api/                # Spring Boot backend (port 9091 prod / 9090 dev)
│       ├── src/                # Java source
│       ├── Dockerfile          # Multi-stage Maven build
│       ├── docker-compose.yml  # Local dev (with healthchecks)
│       └── scripts/
│           └── backup_db.sh    # Automated DB backup to Nextcloud
│
├── docker-compose.yml          # Production stack
├── pnpm-workspace.yaml         # Monorepo workspace
└── turbo.json                  # Turborepo pipeline
```

## Quick Start

### Prerequisites

- **Node.js** >= 22
- **pnpm** >= 9
- **Java** 24 + Maven (or use `./mvnw`)
- **Docker** & Docker Compose

### 1. Clone & Install

```bash
git clone https://github.com/thanhnguyenhoang171/ecp.git
cd ecp
pnpm install
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

This starts MySQL (3307), MongoDB (27017), and Redis (6379).

### 3. Run Backend

```bash
cd services/ecp_api
./mvnw spring-boot:run
```

API available at `http://localhost:9091/api`.

Swagger UI: `http://localhost:9091/api/swagger-ui/index.html`

### 4. Run Frontend Apps

```bash
# From project root - runs all apps via Turborepo
pnpm dev

# Or run individually:
pnpm dev --filter admin     # http://localhost:3001
pnpm dev --filter storefront # http://localhost:3002
```

## Environment Variables

### Backend (`services/ecp_api/.env`)

| Variable | Description | Default |
|---|---|---|
| `SPRING_DATASOURCE_URL` | MySQL JDBC URL | `jdbc:mysql://mysql:3306/ecp_db` |
| `SPRING_DATASOURCE_USERNAME` | MySQL username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | MySQL password | `142857` |
| `SPRING_MONGODB_URI` | MongoDB connection URI | `mongodb://admin:142857@mongodb:27017/ecp_mongo` |
| `SPRING_REDIS_HOST` | Redis host | `redis` |
| `JWT_SECRET` | JWT signing secret | *(required)* |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | *(required)* |
| `CLOUDINARY_API_KEY` | Cloudinary API key | *(required)* |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | *(required)* |

### Admin (`apps/admin/.env.development`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:9091/api` |

### Storefront (`apps/storefront/.env.development`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:9091/api` |

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run all apps (admin + storefront + turbo pipeline) |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |

### Admin (`apps/admin/`)
| Command | Description |
|---|---|
| `pnpm dev` | Start dev server on port 3001 |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

### Storefront (`apps/storefront/`)
| Command | Description |
|---|---|
| `pnpm dev` | Start dev server on port 3002 |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

### Backend (`services/ecp_api/`)
| Command | Description |
|---|---|
| `./mvnw spring-boot:run` | Run in dev mode |
| `./mvnw clean package` | Build JAR |
| `docker-compose -f docker-compose.yml up` | Run with Docker |

## Database Backup

Automated MySQL + MongoDB backup script that uploads compressed archives to **Nextcloud** via WebDAV.

### Setup

Create `/opt/scripts/.env` on the production server:

```env
MYSQL_CONTAINER=ecp_mysql
MONGO_CONTAINER=ecp_mongodb
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASS=YourProductionMySQLPassword
MYSQL_DB=ecp_db
SPRING_MONGODB_URI=mongodb://admin:YourProductionMongoPassword@mongodb:27017/ecp_mongo?authSource=admin
NEXTCLOUD_DOMAIN=your-domain
NEXTCLOUD_USER=your-user
NEXTCLOUD_APP_PASS=xxxx-xxxx-xxxx-xxxx
NEXTCLOUD_TARGET_DIR=backups
LOCAL_BACKUP_DIR=/tmp/ecp_backups
```

### Manual Execution

```bash
chmod +x /opt/scripts/backup_db.sh
/opt/scripts/backup_db.sh
```

### Automated Cron Job

```cron
0 2 * * * /opt/scripts/backup_db.sh >> /var/log/db_backup.log 2>&1
```

Runs daily at 2:00 AM.

## Production Deployment

Production images are published to GitHub Container Registry:

- `ghcr.io/thanhnguyenhoang171/ecp/ecp-api:latest`
- `ghcr.io/thanhnguyenhoang171/ecp/ecp-admin:latest`
- `ghcr.io/thanhnguyenhoang171/ecp/ecp-storefront:latest`

```bash
docker-compose up -d
```

| Service | Port | Image |
|---|---|---|
| MySQL | 3307 | `mysql:8.0` |
| MongoDB | 27017 | `mongo:latest` |
| Redis | 6379 | `redis:alpine` |
| API | 9091 | `ghcr.io/.../ecp-api:latest` |
| Admin | 8081 | `ghcr.io/.../ecp-admin:latest` |
| Storefront | 3000 | `ghcr.io/thanhnguyenhoang171/ecp/ecp-storefront:latest` |

## Key Features

- **Catalog Management** - Products, SKUs, categories, promotions with Excel import/export
- **Inventory Management** - Warehouses, stock tracking, goods receipts, suppliers, barcode scanning, inventory ledger
- **Sales Operations** - Orders, customers, payments
- **System Management** - User management, audit logs, settings, dark/light theme
- **JWT Authentication** - Access + refresh token flow with protected routes
- **File Management** - Cloudinary integration for product images
- **Audit Logging** - Full activity tracking
