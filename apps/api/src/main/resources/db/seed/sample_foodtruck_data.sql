-- Sample seed data for local development.
-- Run after base schema migrations.

insert into app_user (
    id, email, password_hash, role, is_active
) values (
    '11111111-1111-1111-1111-111111111111',
    'owner@foodtruck.local',
    '$2a$10$dummyhashforlocalonly',
    'OPERATOR',
    true
) on conflict (id) do nothing;

insert into truck_profile (
    id, owner_user_id, truck_name, cuisine_categories, is_online
) values (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Taco Transit',
    array['Mexican', 'Street Food'],
    true
) on conflict (id) do nothing;

insert into truck_location (
    truck_id, latitude, longitude
) values (
    '22222222-2222-2222-2222-222222222222',
    41.87810,
    -87.62980
) on conflict (truck_id) do nothing;

insert into menu_item (
    id, truck_id, item_name, description, price_cents, is_available
) values
(
    '33333333-3333-3333-3333-333333333331',
    '22222222-2222-2222-2222-222222222222',
    'Chicken Tacos',
    'Three street-style tacos with salsa verde',
    1199,
    true
),
(
    '33333333-3333-3333-3333-333333333332',
    '22222222-2222-2222-2222-222222222222',
    'Carne Asada Burrito',
    'Grilled steak, rice, beans, pico de gallo',
    1399,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'Horchata',
    'Cinnamon rice milk drink',
    399,
    true
) on conflict (id) do nothing;
