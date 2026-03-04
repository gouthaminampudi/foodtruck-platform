# API App

Spring Boot backend for the FoodTruck platform.

## Current Scope

The API currently provides the backend foundation for:

- Spring Boot application startup
- PostgreSQL connectivity
- Flyway database migrations
- Health endpoint at `/api/v1/health`
- Base security and application configuration

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
