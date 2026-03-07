# Admin Mobile App

Standalone admin app for platform management.

Routes (screen states):

- `/` (AdminSignIn)
- `/home` (AdminHome menu only)
- `/customers` (CustomerManagementPage)
- `/trucks` (TruckManagementPage)

Run:

```bash
cd apps/admin-mobile
npm install
EXPO_PUBLIC_API_URL=http://localhost:8080 npm run web -- --port 8083
```

Default local admin credentials:

- Username: `admin`
- Password: `Admin1234`
