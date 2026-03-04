# FoodTruck

FoodTruck is a monorepo for a marketplace and operations platform that connects
customers with nearby food trucks and gives operators the tools to manage truck
setup, menus, location broadcasting, orders, and growth workflows.

## Product Summary

Based on the current ClickUp lists and tasks, the platform is centered on:

- Customer discovery through a map-first home screen, advanced search and
  filters, truck profiles, ratings, reviews, loyalty, and favorites
- Real-time location and discovery features such as customer map view, truck
  location broadcast, and proximity alerts when favorite trucks are nearby
- Ordering and payments flows such as order creation, scheduled pickup, Stripe
  integration, and smarter queue prioritization
- Operator workflows for truck registration, menu management, and social
  publishing

Representative ClickUp requirements used for this summary:

- Customer Mobile App:
  [Home Map: Show online food trucks filtered by customer cuisine preferences](https://app.clickup.com/t/86e031tqj),
  [Advanced Search & Filter](https://app.clickup.com/t/86e031vck),
  [Reviews & Ratings](https://app.clickup.com/t/86e031wtq),
  [Loyalty Program](https://app.clickup.com/t/86e031wt9)
- Location & Discovery:
  [Truck Location Broadcast](https://app.clickup.com/t/86dzzvgnt),
  [Geofence Detection](https://app.clickup.com/t/86e031wu0)
- Ordering & Payments:
  [Order Ahead](https://app.clickup.com/t/86e031wt7),
  [Intelligent Order Queue](https://app.clickup.com/t/86e0327r6)
- Food Truck Onboarding:
  [Operator Social Publishing Hub](https://app.clickup.com/t/86e0328az),
  [Favorite Trucks and nearby-alert preferences](https://app.clickup.com/t/86e031wtw)

## Repository Layout

```text
apps/
  api/               Spring Boot backend
  customer-mobile/   Expo customer application
  operator-mobile/   Expo operator application scaffold
packages/
  shared-types/      Shared TypeScript package
docs/
docker-compose.yml
```

## Tech Stack

- Backend: Spring Boot 3.3, Java 21, Gradle
- Database: PostgreSQL 16 via Docker Compose
- Mobile: Expo SDK 54, React Native 0.81, React 19
- Maps: Google Maps on native customer app builds

## Prerequisites

Install these before trying to run the repo:

- Docker Desktop with `docker compose`
- Java 21
- Gradle 8+
- Node.js 20
- Xcode and iOS Simulator for iOS development
- Android Studio / Android SDK for Android development

Recommended version check:

```bash
java -version
gradle -v
node -v
docker --version
docker compose version
```

`node -v` should report a Node 20 release. Expo had runtime issues under Node
22 during local setup.

## First-Time Setup

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd FoodTruck
cp .env.example .env
```

For the customer mobile app, also create the app-local environment file:

```bash
cp apps/customer-mobile/.env.example apps/customer-mobile/.env
```

Set `GOOGLE_MAPS_API_KEY` in `apps/customer-mobile/.env` before running the
native customer map.

### 2. Start Postgres

```bash
docker compose up -d
```

Postgres defaults:

- Host: `localhost`
- Port: `5432`
- Database: `foodtruck`
- Username: `foodtruck`
- Password: `foodtruck`

### 3. Start the API

The API reads its database settings from `.env` and listens on port `8080`.

```bash
cd apps/api
gradle bootRun
```

Useful check:

```bash
curl http://localhost:8080/api/v1/health
```

Expected response:

```json
{"status":"ok"}
```

### 4. Install mobile app dependencies

Customer app:

```bash
cd apps/customer-mobile
npm install
```

Operator app:

```bash
cd apps/operator-mobile
npm install
```

If you use Homebrew Node 20 on macOS and the default shell still points to a
different Node version, run commands with:

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

## Running the Customer App

### Web

```bash
cd apps/customer-mobile
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npm run web
```

Then open:

```text
http://localhost:8081
```

### iOS Simulator

Before first iOS launch on a new machine:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
sudo xcodebuild -runFirstLaunch
open -a Simulator
```

If Simulator has no devices available, install an iOS runtime in Xcode:

- `Xcode` -> `Settings` -> `Platforms`
- Install an iOS runtime
- Confirm a simulator device exists in `Window` -> `Devices and Simulators`

Run the app:

```bash
cd apps/customer-mobile
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npm run ios
```

### Android

Start an Android emulator first, then run:

```bash
cd apps/customer-mobile
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npm run android
```

## Running the Operator App

The operator app is still scaffold-level and is not runnable as a real Expo app
yet. At the moment, its package only contains placeholder scripts.

```bash
cd apps/operator-mobile
npm install
npm start
```

Current behavior:

- `npm start` prints a placeholder message
- Expo and React Native dependencies still need to be added before operator app
  development can start

## Common Issues

### Port 8081 already in use

Another Expo instance is already running. Stop the old process or free the
port:

```bash
lsof -nP -iTCP:8081 -sTCP:LISTEN
kill <pid>
```

### Expo fails under Node 22

Use Node 20:

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
node -v
```

### iOS Simulator opens but no device is available

Install an iOS runtime and create a simulator device from Xcode.

### Simulator location looks wrong

Set the Simulator location manually:

- `Features` -> `Location` -> `Custom Location...`

### Web works but native map behavior differs

The customer app uses a Google native map on iOS and Android. The web build
renders a non-native fallback instead of the full native map implementation.

## Current App Status

- `apps/api`: running Spring Boot API with health endpoint and Flyway-backed
  PostgreSQL configuration
- `apps/customer-mobile`: working Expo app with live location handling and
  Google Maps on native builds
- `apps/operator-mobile`: scaffold with package setup and screen plan, but no
  implemented runtime features yet
