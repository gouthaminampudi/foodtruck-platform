# Operator Mobile App

Operator-facing Expo app for truck-level operations only.

## What This App Is Built For

- Operator signup/signin
- Operator own profile management
- Operator own/assigned truck management
- Operator truck status/location updates

It follows the same structural UX pattern as customer app, but with operator use cases.

## Core UX

- Auth:
  - Operator Sign Up
  - Operator Sign In
- Home:
  - operator dashboard summary
  - quick navigation to truck details/edit
- Profile:
  - profile icon/menu (view profile, edit profile, logout)
  - own profile edit flow
- Truck:
  - own truck detail page
  - own truck edit page
  - optional location update
- Notifications:
  - success, error, validation feedback
- Empty state:
  - clear message when operator has no truck assignment

## Route-Style Screen States

- `/`
- `/signin`
- `/signup`
- `/home`
- `/profile`
- `/profile/edit`
- `/truck`
- `/truck/edit`

## Restrictions

- No admin home/screens
- No customer management
- No global truck management

## Run

```bash
cd apps/operator-mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web -- --port 8082
```

Web URL: `http://localhost:8082`

Native:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run ios
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run android
```
