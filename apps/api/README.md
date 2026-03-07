# FoodTruck API

Spring Boot backend for the FoodTruck platform.  
This service enforces role boundaries across Customer, Operator, and Admin experiences.

## What This Service Handles

- Authentication and role-specific sign-in
- Public truck discovery data for customer home map/list
- Customer self-profile APIs
- Operator self-profile and own-truck APIs
- Admin customer/truck management APIs
- Data persistence and migrations

## Technology

- Java 21
- Spring Boot 3.3
- Spring Security (HTTP Basic + role guards)
- Spring Data JPA
- Flyway migrations
- PostgreSQL
- OpenAPI/Swagger

## Module Overview

- `modules/auth`:
  - customer/operator signup
  - customer/operator/admin signin
- `modules/customer`:
  - customer own profile read/update
- `modules/operator`:
  - operator own profile read/update
  - operator own/assigned truck read/update
  - operator truck location read/update
- `modules/admin`:
  - customer management
  - truck management
- `modules/truck`:
  - truck/menu/location domain services + public nearby endpoints

## Security Model

- Public:
  - `/api/v1/health`
  - `/api/v1/auth/**`
  - `/api/v1/public/**`
- Customer-only:
  - `/api/v1/customer/**`
- Operator-only:
  - `/api/v1/operator/**`
- Admin-only:
  - `/api/v1/admin/**`

Global truck CRUD endpoints are restricted to Admin role in current config.

## Data and Migrations

Key migrations:

- `V6__auth_and_admin_updates.sql`
  - username support
  - truck `is_active`
  - customer `profile_image_url`
- `V7__add_operator_profile.sql`
  - `operator_profile` table

## Run Locally

1. Start DB (from repo root):

```bash
docker compose up -d
```

2. Start API:

```bash
cd apps/api
gradle bootRun
```

Service URL: `http://localhost:8080`

Health:

```bash
curl http://localhost:8080/api/v1/health
```

Swagger:

- `http://localhost:8080/swagger-ui/index.html`
- `http://localhost:8080/v3/api-docs`

## Local Admin Bootstrap

Auto-created at startup if missing:

- Username: `admin`
- Password: `Admin1234`

Configurable via:

- `APP_ADMIN_USERNAME`
- `APP_ADMIN_PASSWORD`
- `APP_ADMIN_EMAIL`
