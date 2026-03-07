# API App

Spring Boot backend for FoodTruck with strict role boundaries.

## Modules

- `auth`: customer/operator signup + all role sign-in
- `customer`: customer self profile APIs
- `operator`: operator self profile + own truck APIs
- `admin`: customer/truck management APIs
- `truck`: truck/menu/location domain services
- `health`

## Security

- Public:
  - `/api/v1/health`
  - `/api/v1/auth/**`
  - `/api/v1/public/**`
  - Swagger/OpenAPI
- Customer-only: `/api/v1/customer/**`
- Operator-only: `/api/v1/operator/**`
- Admin-only: `/api/v1/admin/**`

Global truck CRUD routes (`/api/v1/trucks`, `/api/v1/menu-items`, etc.) are admin-restricted.

## Data Model Changes

- `V6__auth_and_admin_updates.sql`
  - username on `app_user`
  - truck `is_active`
  - customer `profile_image_url`
- `V7__add_operator_profile.sql`
  - `operator_profile` table

## Run

```bash
cd apps/api
gradle bootRun
```

## API Docs

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Local Default Admin

- Username: `admin`
- Password: `Admin1234`
