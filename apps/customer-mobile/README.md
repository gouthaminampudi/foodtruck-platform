# Customer Mobile App

Standalone customer app.

## Screen Flow

- `/` + `/signin` + `/signup`
- `/home` (map + nearby food trucks)
- `/profile`
- `/profile/edit`

## Features

- Nearby truck map and nearby list based on current location
- Current location summary displayed above map
- Customer sign up / sign in
- Profile icon menu (view profile, edit profile, logout)
- Self-profile update only
- Success/failure/validation notifications
- No customer-directory or all-customer visibility
- `Back to Home` navigation from sub-pages

## Run

```bash
cd apps/customer-mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web -- --port 8081
```
