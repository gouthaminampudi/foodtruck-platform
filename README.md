# FoodTruck Platform

FoodTruck is a role-based platform for food-truck discovery and operations.  
It supports three user experiences built as separate apps:

- Customer app for discovery and profile self-service
- Operator app for truck-level operations
- Admin app for platform-level customer and truck management

The backend is a Spring Boot API with PostgreSQL and Flyway migrations.

## What The App Is Built For

The platform is designed to solve three connected workflows:

1. Customer discovery
   - Find nearby food trucks on a map
   - View truck menu quickly
   - Manage only personal profile data
2. Operator execution
   - Manage own operator profile
   - View/update only assigned or owned truck details
   - Update truck live location/status
3. Admin governance
   - Search/manage customers
   - Search/create/update/manage truck lifecycle
   - Keep admin workflows isolated from customer/operator apps

## Repository Structure

```text
apps/
  api/               Spring Boot backend
  customer-mobile/   Expo customer app
  operator-mobile/   Expo operator app
  admin-mobile/      Expo admin app
shared/              Shared UI/util helpers (cross-app patterns)
docs/
  test-cases.md
docker-compose.yml
```

## Technology Stack

- Backend:
  - Java 21
  - Spring Boot 3.3
  - Spring Security (role-based access)
  - Spring Data JPA
  - Flyway
  - OpenAPI/Swagger
- Database:
  - PostgreSQL 16 (Docker Compose for local)
- Frontend:
  - Expo SDK 54
  - React Native + React Native Web
  - Role-specific app shells with route-style screen states

## Role-Based App Boundaries

- `customer-mobile`
  - Can sign up/sign in as customer
  - Can view nearby trucks + menu links
  - Can view/edit only own profile
  - Cannot list all customers
  - Cannot access admin/operator management APIs

- `operator-mobile`
  - Can sign up/sign in as operator
  - Can view/edit own profile
  - Can view/edit only own/assigned truck and truck location
  - Cannot access admin pages/features
  - Shows clean empty state when no truck is assigned

- `admin-mobile`
  - Dedicated standalone app (not embedded in operator app)
  - Admin Home is menu/navigation only
  - Customer Management and Truck Management are separate pages

## Backend API Design (Current)

- Public:
  - `GET /api/v1/health`
  - `GET /api/v1/public/trucks/nearby`
  - `GET /api/v1/public/trucks/{truckId}/menu`
- Auth:
  - `POST /api/v1/auth/customer/signup`
  - `POST /api/v1/auth/customer/signin`
  - `POST /api/v1/auth/operator/signup`
  - `POST /api/v1/auth/operator/signin`
  - `POST /api/v1/auth/admin/signin`
- Customer-only:
  - `GET /api/v1/customer/profile`
  - `PUT /api/v1/customer/profile`
- Operator-only:
  - `GET /api/v1/operator/profile`
  - `PUT /api/v1/operator/profile`
  - `GET /api/v1/operator/truck`
  - `PUT /api/v1/operator/truck`
  - `GET /api/v1/operator/truck/location`
  - `PUT /api/v1/operator/truck/location`
- Admin-only:
  - `GET /api/v1/admin/customers`
  - `PUT /api/v1/admin/customers/{userId}`
  - `PATCH /api/v1/admin/customers/{userId}/activate`
  - `PATCH /api/v1/admin/customers/{userId}/deactivate`
  - `GET /api/v1/admin/trucks`
  - `POST /api/v1/admin/trucks`
  - `PUT /api/v1/admin/trucks/{truckId}`
  - `PATCH /api/v1/admin/trucks/{truckId}/activate`
  - `PATCH /api/v1/admin/trucks/{truckId}/deactivate`

Swagger UI: `http://localhost:8080/swagger-ui/index.html`

## Data Model Notes

Core tables include:

- `app_user`
- `customer_profile`
- `operator_profile`
- `truck_owner_profile`
- `truck_profile`
- `truck_location`
- `menu_item`
- `truck_operator_assignment`

Recent migration additions:

- `V6__auth_and_admin_updates.sql`
  - username support, truck active flag, customer profile image field
- `V7__add_operator_profile.sql`
  - operator profile table

## Local Development Setup

## Prerequisites

- Docker Desktop + `docker compose`
- Java 21
- Gradle 8+
- Node.js 20
- Xcode Simulator / Android SDK (for native mobile runs)

## Start Services

1. Start PostgreSQL:

```bash
docker compose up -d
```

2. Start API:

```bash
cd apps/api
gradle bootRun
```

3. Start customer app:

```bash
cd apps/customer-mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web -- --port 8081
```

4. Start operator app:

```bash
cd apps/operator-mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web -- --port 8082
```

5. Start admin app:

```bash
cd apps/admin-mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web -- --port 8083
```

## Local URLs

- API: `http://localhost:8080`
- Customer Web: `http://localhost:8081`
- Operator Web: `http://localhost:8082`
- Admin Web: `http://localhost:8083`

## Local Admin Credentials

- Username: `admin`
- Password: `Admin1234`

Configured with:

- `APP_ADMIN_USERNAME`
- `APP_ADMIN_PASSWORD`
- `APP_ADMIN_EMAIL`

## Quality and Test Coverage

Manual/integration test checklist is tracked in:

- `docs/test-cases.md`
