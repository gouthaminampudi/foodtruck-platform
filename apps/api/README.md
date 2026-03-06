# API App

Spring Boot backend for the FoodTruck platform.

## Current Scope

The API currently provides the backend foundation for:

- Spring Boot application startup
- PostgreSQL connectivity
- Flyway database migrations
- Health endpoint at `/api/v1/health`
- Base security and application configuration
- Truck core CRUD APIs (`truck_profile`, `truck_location`, `menu_item`)
- Customer CRUD APIs (`customer_profile` + `app_user`)
- Truck owner profile and operator-role assignments
- Swagger/OpenAPI docs
- CORS enabled for browser/mobile clients

Planned modules in this app include:

- auth
- customer
- truck
- menu
- location
- order
- payment
- notification

## Prerequisites

- Java 21
- Gradle 8+
- Docker Desktop with `docker compose`

## Environment

From the repository root:

```bash
cp .env.example .env
docker compose up -d
```

The API reads database configuration from the root `.env` file.

Default local values:

- Host: `localhost`
- Port: `5432`
- Database: `foodtruck`
- Username: `foodtruck`
- Password: `foodtruck`

## Run

Optional setup helper from repo root:

```bash
source scripts/dev-java21.sh
```

```bash
cd apps/api
gradle bootRun
```

The API listens on:

```text
http://localhost:8080
```

## Health Check

```bash
curl http://localhost:8080/api/v1/health
```

Expected response:

```json
{"status":"ok"}
```

## Truck Operator Roles

The schema supports one owner and multiple operators per truck:

- `truck_owner_profile` stores owner business profile
- `truck_profile.owner_user_id` links each truck to its owner
- `truck_operator_assignment` stores active operators per truck and role (`CHEF`, `CASHIER`, `DRIVER`)

Role-based write authorization is available through:

- Property: `app.authz.enforce-operator-permissions` (default `false`)
- Request header when enabled: `X-Actor-User-Id: <app_user_uuid>`

Current write permissions:

- Owner: full truck/menu/location/operator management
- Chef: menu write operations
- Driver: location write operations
- Cashier: reserved for order/payment flows (not wired yet in current module)

## Endpoints

- `GET /api/v1/health`
- `GET/POST/PUT/DELETE /api/v1/customers`
- `GET/POST/PUT/DELETE /api/v1/trucks`
- `GET/POST/PUT/DELETE /api/v1/truck-locations`
- `GET/POST/PUT/DELETE /api/v1/menu-items`
- `GET/POST/PUT/DELETE /api/v1/truck-operators`

## API Docs

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
