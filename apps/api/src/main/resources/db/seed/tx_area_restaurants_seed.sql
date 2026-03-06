-- Seed restaurants from requested Texas areas:
-- Keller, North Richland Hills, Southlake, Roanoke, Hurst, Grapevine.
--
-- Source references (retrieved 2026-03-05):
-- 1) https://www.959theranch.com/american-restaurants/
-- 2) https://us-business.info/directory/north_richland_hills-tx/food_and_dining/
-- 3) https://www.southlakestyle.com/search/location/local-restaurants/
-- 4) https://chamber.metroportchamber.org/list/category/restaurants-110
-- 5) https://dev.heb.org/list/QL/restaurants-food-beverages-27.htm
--
-- Notes:
-- - Data is represented using the existing food-truck schema.
-- - Latitude/longitude values are approximate area-center coordinates.

insert into app_user (
    id, email, password_hash, role, is_active
) values (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'tx-seed-owner@foodtruck.local',
    '$2a$10$dummyhashforlocalonly',
    'OPERATOR',
    true
) on conflict (id) do nothing;

insert into truck_profile (
    id, owner_user_id, truck_name, cuisine_categories, is_online
) values
(
    '10000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Main Street Cafe (Keller)',
    array['American', 'Breakfast'],
    true
),
(
    '10000000-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Fuzzy''s Taco Shop (North Richland Hills)',
    array['Mexican', 'Tacos'],
    true
),
(
    '10000000-0000-0000-0000-000000000003',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Truluck''s Seafood Steak & Crabhouse (Southlake)',
    array['Seafood', 'Steakhouse'],
    true
),
(
    '10000000-0000-0000-0000-000000000004',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'The 206 (Roanoke)',
    array['American', 'Bar'],
    true
),
(
    '10000000-0000-0000-0000-000000000005',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Chicken Salad Chick (Hurst)',
    array['American', 'Cafe'],
    true
),
(
    '10000000-0000-0000-0000-000000000006',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Sauce''d Pizza & Smashburgers (Grapevine)',
    array['Pizza', 'Burgers'],
    true
) on conflict (id) do nothing;

insert into truck_location (
    truck_id, latitude, longitude
) values
('10000000-0000-0000-0000-000000000001', 32.9343, -97.2517), -- Keller
('10000000-0000-0000-0000-000000000002', 32.8343, -97.2289), -- North Richland Hills
('10000000-0000-0000-0000-000000000003', 32.9412, -97.1342), -- Southlake
('10000000-0000-0000-0000-000000000004', 33.0040, -97.2250), -- Roanoke
('10000000-0000-0000-0000-000000000005', 32.8235, -97.1706), -- Hurst
('10000000-0000-0000-0000-000000000006', 32.9343, -97.0781)  -- Grapevine
on conflict (truck_id) do nothing;

insert into menu_item (
    id, truck_id, item_name, description, price_cents, is_available
) values
(
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Keller Breakfast Plate',
    'Eggs, toast, and potatoes',
    1099,
    true
),
(
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'NRH Taco Combo',
    'Three tacos with chips and salsa',
    1199,
    true
),
(
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    'Southlake Seafood Plate',
    'Chef seafood selection',
    2499,
    true
),
(
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000004',
    'Roanoke House Burger',
    'Burger with fries',
    1399,
    true
),
(
    '20000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000005',
    'Hurst Chicken Salad Plate',
    'Chicken salad with crackers',
    999,
    true
),
(
    '20000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000006',
    'Grapevine Smashburger',
    'Single smashburger with fries',
    1299,
    true
) on conflict (id) do nothing;
