# ECP - Enterprise Commerce Platform

<div align="center">

![Java](https://img.shields.io/badge/Java-24-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-brightgreen?style=for-the-badge&logo=springboot)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444?style=for-the-badge&logo=turborepo)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

An enterprise-grade, scalable **Headless E-Commerce Platform** built as a monorepo featuring Event-Driven Architecture, Polyglot Persistence (MySQL, MongoDB, Redis), and modern SSR/SSG frontends powered by Next.js 16 & React 19.

[Features](#key-features) • [Architecture](#system-architecture) • [Quick Start](#quick-start) • [API Documentation](#api-documentation)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Automated Database Backup](#automated-database-backup)
- [Production Deployment](#production-deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**ECP (Enterprise Commerce Platform)** is engineered to meet high-concurrency, enterprise-level retail and commerce needs. By decoupling the core business domain logic from frontend presentation layers (Headless architecture), ECP delivers seamless scalability across omni-channel touchpoints.

---

## Key Features

### Catalog & Product Operations
- **Complex Catalog Management**: Hierarchical categories, dynamic product variants, and SKU management.
- **Promotional Engine**: Custom discounts, voucher codes, and automated rule evaluation.
- **Bulk Data Interchange**: High-performance Excel import/export powered by `EasyExcel` & `ExcelJS`.

### Multi-Warehouse & Inventory Ledger
- **Stock Tracking & Warehousing**: Multi-warehouse stock management with real-time availability updates.
- **Goods Receipt & Purchase Orders**: Complete inbound logistics and supplier tracking.
- **Barcode Operations**: Integrated barcode generation and scanning support.
- **Audit Ledger**: Complete inventory movement audit trails.

### Sales & Checkout Pipeline
- **Order Management System (OMS)**: Full lifecycle tracking (Pending, Processing, Shipped, Delivered, Cancelled).
- **Customer CRM**: Customer profiles, order histories, and delivery address management.
- **Payment Gateway Ready**: Flexible abstraction for payment integrations.

### Security & RBAC
- **Stateless Auth Flow**: JWT (Access + Refresh Tokens) with Spring Security 6 integration.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions across Admin operations.

### Infrastructure & Maintenance
- **Automated Cloud Backup**: Daily automated database snapshots uploaded directly to Nextcloud via WebDAV.
- **Media Asset Storage**: Cloudinary integration for scalable, CDN-backed image asset delivery.
- **Monorepo DX**: Unified development workspace powered by Turborepo and pnpm.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Load Balancer / Nginx                            │
└──────────────────┬──────────────────────┬───────────────────────────────────┘
                   │                      │
       ┌───────────┴────────────┐  ┌──────┴──────────────────┐
       │   Admin Dashboard      │  │    Customer Storefront   │
       │   (Next.js 16 App)     │  │    (Next.js 16 App)      │
       │   Port 8081 / 3001     │  │    Port 3000 / 3002      │
       └───────────┬────────────┘  └──────┬───────────────────┘
                   │                      │
                   └───────────┬──────────┘
                               │ (REST API / JSON / JWT)
                               ▼
        ┌─────────────────────────────────────────────────────────────┐
        │                 Spring Boot 3.5 API Service                 │
        │                 (Port 9091 Prod / 9090 Dev)                 │
        └──────┬──────────────────────┬──────────────────────┬────────┘
               │                      │                      │
               ▼                      ▼                      ▼
      ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
      │   MySQL 8.0      │  │     MongoDB      │  │     Redis        │
      │  Relational DB   │  │ Document Store   │  │ Cache & Sessions │
      │   (Port 3307)    │  │  (Port 27017)    │  │   (Port 6379)    │
      └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Tech Stack

| Domain | Technology | Key Modules / Libraries |
|---|---|---|
| **Backend Core** | Java 24 / Spring Boot 3.5 | Spring Security, Spring Data JPA, MapStruct, Lombok |
| **Databases** | Polyglot Persistence | MySQL 8.0, MongoDB, Redis Cache |
| **Admin Panel** | Next.js 16 + React 19 | Tailwind CSS 4, Radix UI, TanStack Query v5, Zustand v5, React Hook Form, Zod |
| **Storefront** | Next.js 16 + React 19 | Tailwind CSS 4, Axios, TypeScript 5 |
| **Media & Storage** | Cloud Services | Cloudinary (Images), Nextcloud WebDAV (Backups) |
| **API Docs** | OpenAPI 3.0 | SpringDoc OpenAPI, Swagger UI |
| **Monorepo & Infra** | Dev Ops | Turborepo, pnpm workspaces, Docker & Docker Compose |

---

## Project Structure

```
ecp/
├── apps/
│   ├── admin/                  # Enterprise Admin Dashboard (Next.js 16)
│   │   ├── app/(admin)/        # Route groups: catalog, inventory, sales, system
│   │   ├── src/features/       # Modular feature domains (API, hooks, types)
│   │   └── components/common/  # Shared design system components
│   │
│   └── storefront/             # Customer Shopping Application (Next.js 16)
│       ├── app/                # Public store routes & customer profile
│       ├── components/         # Product showcases & checkout UI
│       └── services/           # Backend API integration layer
│
├── services/
│   └── ecp_api/                # Spring Boot REST Service (Java 24)
│       ├── src/                # Controller, Service, Domain, Repository layers
│       ├── Dockerfile          # Multi-stage optimized container build
│       ├── docker-compose.yml  # Isolated dev infrastructure setup
│       └── scripts/
│           └── backup_db.sh    # Database WebDAV backup strategy script
│
├── .github/workflows/          # CI/CD deployment automation pipelines
├── docker-compose.yml          # Master orchestration for production services
├── pnpm-workspace.yaml         # Monorepo package workspace configuration
└── turbo.json                  # Turborepo task pipeline graph
```

---

## Quick Start

### Prerequisites
- **Node.js** >= 22.x
- **pnpm** >= 9.x
- **JDK** 24 (or use repository `./mvnw`)
- **Docker** & **Docker Compose**

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/thanhnguyenhoang171/ecp.git
cd ecp
pnpm install
```

### 2. Launch Infrastructure Services
Spin up local MySQL, MongoDB, and Redis instances:
```bash
docker-compose up -d
```

### 3. Start Backend API
```bash
cd services/ecp_api
./mvnw spring-boot:run
```
- API Base Endpoint: `http://localhost:9091/api`
- Swagger UI Documentation: `http://localhost:9091/api/swagger-ui/index.html`

### 4. Start Frontend Applications
From the monorepo root directory:
```bash
# Start all applications via Turborepo
pnpm dev

# Or run specific applications:
pnpm dev --filter admin        # Admin Dashboard -> http://localhost:3001
pnpm dev --filter storefront   # Customer Store -> http://localhost:3002
```

---

## Environment Variables

### Backend Service (`services/ecp_api/.env`)

| Variable | Description | Default / Example |
|---|---|---|
| `SPRING_DATASOURCE_URL` | MySQL JDBC Connection URL | `jdbc:mysql://mysql:3306/ecp_db` |
| `SPRING_DATASOURCE_USERNAME` | Database User | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Database Password | `142857` |
| `SPRING_MONGODB_URI` | MongoDB Connection URI | `mongodb://admin:142857@mongodb:27017/ecp_mongo` |
| `SPRING_REDIS_HOST` | Redis Cache Host | `redis` |
| `JWT_SECRET` | Secret key for JWT signing | *(Required)* |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Name | *(Required)* |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | *(Required)* |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | *(Required)* |

### Admin Dashboard (`apps/admin/.env.development`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend Gateway API URL | `http://localhost:9091/api` |

### Customer Storefront (`apps/storefront/.env.development`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend Gateway API URL | `http://localhost:9091/api` |

---

## Available Scripts

| Scope | Command | Description |
|---|---|---|
| **Monorepo Root** | `pnpm dev` | Runs all frontend apps concurrently with hot reload |
| | `pnpm build` | Compiles all monorepo applications for production |
| | `pnpm lint` | Executes ESLint checks across all apps |
| **Admin (`apps/admin`)** | `pnpm dev` | Starts admin dev server on port `3001` |
| | `pnpm build` | Creates production build |
| **Storefront (`apps/storefront`)** | `pnpm dev` | Starts storefront dev server on port `3002` |
| | `pnpm build` | Creates production build |
| **Backend (`services/ecp_api`)** | `./mvnw spring-boot:run` | Runs Spring Boot API service locally |
| | `./mvnw clean package` | Compiles target JAR file |

---

## Automated Database Backup

ECP features an automated database backup mechanism that compresses MySQL and MongoDB dumps and securely transmits them to **Nextcloud** via WebDAV.

### Script Execution & Configuration
Configure environment variables in `/opt/scripts/.env` on your deployment host, then execute:
```bash
chmod +x /opt/scripts/backup_db.sh
/opt/scripts/backup_db.sh
```

### Automated Cron Schedule
To schedule nightly automated backups at 02:00 AM:
```cron
0 2 * * * /opt/scripts/backup_db.sh >> /var/log/db_backup.log 2>&1
```

---

## Production Deployment

Pre-built Docker images are published to the **GitHub Container Registry (GHCR)**:

- `ghcr.io/thanhnguyenhoang171/ecp/ecp-api:latest`
- `ghcr.io/thanhnguyenhoang171/ecp/ecp-admin:latest`
- `ghcr.io/thanhnguyenhoang171/ecp/ecp-storefront:latest`

Deploy the full stack with Docker Compose:
```bash
docker-compose up -d
```

### Service Network Mapping

| Container Service | Exposed Port | Container Image |
|---|---|---|
| **MySQL** | `3307` | `mysql:8.0` |
| **MongoDB** | `27017` | `mongo:latest` |
| **Redis** | `6379` | `redis:alpine` |
| **ECP API** | `9091` | `ghcr.io/thanhnguyenhoang171/ecp/ecp-api:latest` |
| **ECP Admin** | `8081` | `ghcr.io/thanhnguyenhoang171/ecp/ecp-admin:latest` |
| **ECP Storefront** | `3000` | `ghcr.io/thanhnguyenhoang171/ecp/ecp-storefront:latest` |

---

## API Documentation

Interactive API documentation powered by OpenAPI 3.0 is built into the backend service:

- **Swagger UI Interface**: `http://localhost:9091/api/swagger-ui/index.html`
- **OpenAPI JSON Spec**: `http://localhost:9091/api/v3/api-docs`

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
