# Architecture Notes

## Initial Strategy

Start as a modular monolith and split services later if needed.

## Core Domains

- Auth / Identity
- Customer Profile
- Truck Profile
- Menu
- Location
- Order
- Payment
- Notification

## Deployment Progression

1. Local Docker + Spring Boot
2. Shared staging environment
3. Production with managed database and observability

## First-Release Principles

- Keep domain boundaries clear in code
- Prefer explicit DTOs and validation
- Add audit logging from the start
- Use migrations for all schema changes

