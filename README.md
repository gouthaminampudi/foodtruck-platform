# FoodTruck

Monorepo with separated role-based apps and API:

- `apps/customer-mobile` (customer-only UX)
- `apps/operator-mobile` (operator-only UX)
- `apps/admin-mobile` (admin-only management UX)
- `apps/api` (Spring Boot backend)

## Role Boundaries

- Customer app:
  - nearby map + nearby trucks
  - customer sign up/sign in
  - own profile view/edit
  - no all-customer visibility
- Operator app:
  - operator sign up/sign in
  - own profile view/edit
  - own truck details/edit and status/location updates
  - no admin screens
- Admin app:
  - admin sign in
  - Admin Home menu only
  - separate Customer Management page
  - separate Truck Management page

## Run

1. Start Postgres:

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
- Swagger: `http://localhost:8080/swagger-ui/index.html`
- Customer Web: `http://localhost:8081`
- Operator Web: `http://localhost:8082`
- Admin Web: `http://localhost:8083` (run admin app on this port if needed)

## Default Admin Credentials

- Username: `admin`
- Password: `Admin1234`

Configured by:

- `APP_ADMIN_USERNAME`
- `APP_ADMIN_PASSWORD`
- `APP_ADMIN_EMAIL`

## Core API Surface

- Auth:
  - `POST /api/v1/auth/customer/signup`
  - `POST /api/v1/auth/customer/signin`
  - `POST /api/v1/auth/operator/signup`
  - `POST /api/v1/auth/operator/signin`
  - `POST /api/v1/auth/admin/signin`
- Public:
  - `GET /api/v1/public/trucks/nearby`
  - `GET /api/v1/public/trucks/{truckId}/menu`
- Customer:
  - `GET /api/v1/customer/profile`
  - `PUT /api/v1/customer/profile`
- Operator:
  - `GET /api/v1/operator/profile`
  - `PUT /api/v1/operator/profile`
  - `GET /api/v1/operator/truck`
  - `PUT /api/v1/operator/truck`
  - `GET /api/v1/operator/truck/location`
  - `PUT /api/v1/operator/truck/location`
- Admin:
  - `GET /api/v1/admin/customers`
  - `PUT /api/v1/admin/customers/{userId}`
  - `PATCH /api/v1/admin/customers/{userId}/activate`
  - `PATCH /api/v1/admin/customers/{userId}/deactivate`
  - `GET /api/v1/admin/trucks`
  - `POST /api/v1/admin/trucks`
  - `PUT /api/v1/admin/trucks/{truckId}`
  - `PATCH /api/v1/admin/trucks/{truckId}/activate`
  - `PATCH /api/v1/admin/trucks/{truckId}/deactivate`

## Tests

Manual coverage checklist: `docs/test-cases.md`.

## UI Notes

- Customer Home shows current location above the map.
- Customer and Operator apps include a profile menu and explicit `Back to Home`.
- Operator app returns a clean empty state when no truck is assigned (no hard 404 UI failure).
