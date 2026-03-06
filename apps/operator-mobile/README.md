# Operator Mobile App

Expo-based operator console for truck and operator-management CRUD.

## Current Scope

- Truck profile CRUD (`/api/v1/trucks`)
- Truck operator assignment CRUD (`/api/v1/truck-operators`)
- Optional actor header support (`X-Actor-User-Id`) for role-based authz

## Install

```bash
cd apps/operator-mobile
npm install
```

## Run

```bash
cd apps/operator-mobile
npm start
```

You can override the API URL with:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080 npm start
```
