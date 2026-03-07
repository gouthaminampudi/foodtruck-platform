# Admin Mobile App

Standalone Expo app for platform-level administration.

## What This App Is Built For

- Admin authentication
- Customer management operations
- Truck management operations

Admin UX is intentionally isolated from customer and operator apps.

## Core UX

- Admin Sign In screen
- Admin Home:
  - menu/navigation only
  - links to Customer Management and Truck Management
- Customer Management page:
  - list/search/update customers
  - activate/deactivate customers
- Truck Management page:
  - list/create/update trucks
  - activate/deactivate trucks
- Notifications:
  - clear success and failure messages for admin actions

## Route-Style Screen States

- `/`
- `/signin`
- `/home`
- `/customers`
- `/trucks`

## Run

```bash
cd apps/admin-mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web -- --port 8083
```

Web URL: `http://localhost:8083`

Default local admin credentials:

- Username: `admin`
- Password: `Admin1234`
