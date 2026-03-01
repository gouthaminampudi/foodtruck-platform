# FoodTruck

Monorepo scaffold for the FoodTruck platform.

## Phase 0 Scope

This repository contains the baseline project setup for:

- `apps/api`: Spring Boot backend
- `apps/customer-mobile`: customer mobile app placeholder
- `apps/operator-mobile`: operator mobile app placeholder
- `packages/shared-types`: shared TypeScript contracts
- `docs`: architecture and delivery notes

## Tech Stack

- Backend: Spring Boot, Java 21, Gradle
- Database: PostgreSQL
- Mobile: React Native / Expo placeholders
- Local infrastructure: Docker Compose

## Repository Layout

```text
apps/
  api/
  customer-mobile/
  operator-mobile/
packages/
  shared-types/
docs/
docker-compose.yml
```

## Local Setup

### 1. Start Postgres

```bash
docker compose up -d
```

### 2. Backend

Requirements:

- Java 21
- Gradle 8+

Run:

```bash
cd apps/api
gradle bootRun
```

### 3. Mobile Apps

The mobile apps are placeholders with a clean folder structure. Install dependencies after choosing the exact React Native/Expo version strategy.

## Immediate Next Steps

1. Add Gradle wrapper in `apps/api`
2. Install mobile app dependencies
3. Implement auth and profile modules
4. Expand the initial database migration

