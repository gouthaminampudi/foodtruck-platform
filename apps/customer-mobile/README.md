# Customer Mobile App

Customer-facing Expo app for nearby truck discovery and customer self-service profile management.

## What This App Is Built For

- Let unauthenticated users discover nearby food trucks
- Support customer signup/signin
- Support authenticated customer profile view/edit
- Keep customer role isolated from admin/operator management features

## Core UX

- Home:
  - current location shown above map
  - nearby truck map and nearby list
  - quick menu view action
- Auth:
  - Sign Up
  - Sign In
- Authenticated profile experience:
  - profile icon/menu (view profile, edit profile, logout)
  - own profile updates only
- Notifications:
  - success, error, and validation feedback messages

## Route-Style Screen States

- `/`
- `/signin`
- `/signup`
- `/home`
- `/profile`
- `/profile/edit`

## Restrictions

- No customer directory
- No all-customer listing
- No admin routes/screens
- No operator management flows

## Run

```bash
cd apps/customer-mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web -- --port 8081
```

Web URL: `http://localhost:8081`

Native:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run ios
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run android
```
