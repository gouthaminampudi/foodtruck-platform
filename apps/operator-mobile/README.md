# Operator Mobile App

Standalone operator app.

## Screen Flow

- `/` + `/signin` + `/signup`
- `/home` (operator dashboard)
- `/profile`
- `/profile/edit`
- `/truck`
- `/truck/edit`

## Features

- Operator sign up / sign in
- Profile icon menu (view profile, edit profile, logout)
- Operator-only profile update
- Operator-only own truck detail/update
- Truck location/status update
- Success/failure notifications
- Empty state when no truck is assigned to operator
- `Back to Home` navigation from sub-pages

## Run

```bash
cd apps/operator-mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web -- --port 8082
```
