# Test Cases

## App Separation

### TC-APP-001 Admin app is standalone

- Verify `apps/admin-mobile` exists and runs independently.
- Verify admin pages are not in `apps/operator-mobile`.

### TC-APP-002 Operator app has no admin routes

- Verify operator app only exposes operator routes:
  - `/`, `/signin`, `/signup`, `/home`, `/profile`, `/profile/edit`, `/truck`, `/truck/edit`
- Verify no customer-management or admin-truck-management screens exist.

### TC-APP-003 Customer app has no customer directory

- Verify no all-customer listing UI exists in customer app.
- Verify no customer app call to `/api/v1/admin/customers`.

## Backend Authorization

### TC-AUTHZ-001 Customer cannot access admin endpoints

- Sign in as customer.
- Call `GET /api/v1/admin/customers`.
- Expect `403`.

### TC-AUTHZ-002 Operator cannot access admin endpoints

- Sign in as operator.
- Call `GET /api/v1/admin/trucks`.
- Expect `403`.

### TC-AUTHZ-003 Admin cannot use customer/operator-only pages in UI

- Admin app only exposes `/home`, `/customers`, `/trucks`.
- No customer or operator app screens rendered in admin app.

## Customer Flows

### TC-CUST-001 Customer signup/signin

- Validate required fields, email format, password strength, confirmation match.
- Expect success notification on valid signup/signin.

### TC-CUST-002 Customer home map + nearby list

- Grant location permission.
- Verify map and nearby list render.
- Deny location permission and verify error notification.

### TC-CUST-003 Customer own profile only

- Fetch/update `/api/v1/customer/profile`.
- Verify user can only view/update own record.

## Operator Flows

### TC-OP-001 Operator signup/signin

- Validate signup fields and password rules.
- Verify operator sign in works only for `OPERATOR` role.

### TC-OP-002 Operator profile management

- View and update own profile via `/api/v1/operator/profile`.
- Verify success/error notifications.

### TC-OP-003 Operator own truck management

- Load `/api/v1/operator/truck`.
- Update truck via `/api/v1/operator/truck`.
- Update location via `/api/v1/operator/truck/location`.
- Verify operator cannot manage global truck list.

## Admin Flows

### TC-ADMIN-001 Admin Home menu-only behavior

- Admin Home must show navigation only:
  - Customer Management
  - Truck Management
- No management tables/forms rendered directly on home before navigation.

### TC-ADMIN-002 Customer Management page

- List/search customers.
- Update customer.
- Activate/deactivate customer.
- Verify success and error notifications.

### TC-ADMIN-003 Truck Management page

- List trucks.
- Create/update truck.
- Activate/deactivate truck.
- Verify success and error notifications.
