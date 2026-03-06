# Customer Mobile App

Expo-based customer application for discovering nearby food trucks and placing
orders.

## Current Scope

The current app includes:

- A map-first home screen
- Live location lookup with reverse geocoding
- Google Maps on iOS and Android native builds
- A web fallback view for the map section
- Preview truck cards for nearby/recommended trucks
- Customer CRUD UI (`/api/v1/customers`)

The broader planned customer experience includes:

- Auth
- Home map
- Truck detail
- Cart
- Checkout
- Orders
- Profile

## Prerequisites

- Node.js 20
- Xcode + iOS Simulator for iOS development
- Android Studio / Android SDK for Android development

If your shell defaults to a different Node version on macOS, use:

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

## Environment

Create the app-local environment file:

```bash
cp apps/customer-mobile/.env.example apps/customer-mobile/.env
```

Set:

```bash
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EXPO_PUBLIC_API_URL=http://localhost:8080
```

This key is required for the native Google map experience on iOS and Android.

## Install Dependencies

```bash
cd apps/customer-mobile
npm install
```

## Run

### Web

```bash
cd apps/customer-mobile
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npm run web
```

Open:

```text
http://localhost:8081
```

### iOS

```bash
cd apps/customer-mobile
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npm run ios
```

### Android

```bash
cd apps/customer-mobile
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npm run android
```

## Notes

- Web does not render the native Google map implementation; it shows a fallback
  section instead.
- If Expo fails under Node 22, switch to Node 20 and retry.
