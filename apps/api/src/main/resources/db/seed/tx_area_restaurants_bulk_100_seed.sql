-- Bulk seed: 100 additional restaurants across
-- Keller, North Richland Hills, Southlake, Roanoke, Hurst, Grapevine.
--
-- Inserts:
-- - 100 truck_profile rows
-- - 100 truck_location rows
-- - 100 menu_item rows
--
-- IDs are deterministic UUIDs derived from md5 hash keys.

insert into truck_profile (
    id, owner_user_id, truck_name, cuisine_categories, is_online
)
with generated as (
    select
        gs as seq,
        case mod(gs, 6)
            when 0 then 'Keller'
            when 1 then 'North Richland Hills'
            when 2 then 'Southlake'
            when 3 then 'Roanoke'
            when 4 then 'Hurst'
            else 'Grapevine'
        end as city,
        case mod(gs, 6)
            when 0 then array['American', 'Breakfast']::text[]
            when 1 then array['Mexican', 'Tacos']::text[]
            when 2 then array['Seafood', 'Steakhouse']::text[]
            when 3 then array['American', 'Bar']::text[]
            when 4 then array['American', 'Cafe']::text[]
            else array['Pizza', 'Burgers']::text[]
        end as cuisines
    from generate_series(1001, 1100) gs
),
ids as (
    select
        seq,
        city,
        cuisines,
        (
            substr(md5('tx-bulk-truck-' || seq::text), 1, 8) || '-' ||
            substr(md5('tx-bulk-truck-' || seq::text), 9, 4) || '-' ||
            substr(md5('tx-bulk-truck-' || seq::text), 13, 4) || '-' ||
            substr(md5('tx-bulk-truck-' || seq::text), 17, 4) || '-' ||
            substr(md5('tx-bulk-truck-' || seq::text), 21, 12)
        )::uuid as truck_id
    from generated
)
select
    truck_id,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid as owner_user_id,
    'TX Area Kitchen #' || seq::text || ' (' || city || ')' as truck_name,
    cuisines,
    true
from ids
on conflict (id) do nothing;

insert into truck_location (
    truck_id, latitude, longitude
)
with generated as (
    select
        gs as seq,
        case mod(gs, 6)
            when 0 then 32.9343 -- Keller
            when 1 then 32.8343 -- North Richland Hills
            when 2 then 32.9412 -- Southlake
            when 3 then 33.0040 -- Roanoke
            when 4 then 32.8235 -- Hurst
            else 32.9343        -- Grapevine
        end as base_lat,
        case mod(gs, 6)
            when 0 then -97.2517 -- Keller
            when 1 then -97.2289 -- North Richland Hills
            when 2 then -97.1342 -- Southlake
            when 3 then -97.2250 -- Roanoke
            when 4 then -97.1706 -- Hurst
            else -97.0781        -- Grapevine
        end as base_lon
    from generate_series(1001, 1100) gs
),
ids as (
    select
        seq,
        (
            substr(md5('tx-bulk-truck-' || seq::text), 1, 8) || '-' ||
            substr(md5('tx-bulk-truck-' || seq::text), 9, 4) || '-' ||
            substr(md5('tx-bulk-truck-' || seq::text), 13, 4) || '-' ||
            substr(md5('tx-bulk-truck-' || seq::text), 17, 4) || '-' ||
            substr(md5('tx-bulk-truck-' || seq::text), 21, 12)
        )::uuid as truck_id,
        base_lat,
        base_lon
    from generated
)
select
    truck_id,
    base_lat + ((mod(seq, 10) - 5)::double precision * 0.0015) as latitude,
    base_lon + ((mod(seq, 8) - 4)::double precision * 0.0015) as longitude
from ids
on conflict (truck_id) do nothing;

insert into menu_item (
    id, truck_id, item_name, description, price_cents, is_available
)
with generated as (
    select
        gs as seq,
        (
            substr(md5('tx-bulk-truck-' || gs::text), 1, 8) || '-' ||
            substr(md5('tx-bulk-truck-' || gs::text), 9, 4) || '-' ||
            substr(md5('tx-bulk-truck-' || gs::text), 13, 4) || '-' ||
            substr(md5('tx-bulk-truck-' || gs::text), 17, 4) || '-' ||
            substr(md5('tx-bulk-truck-' || gs::text), 21, 12)
        )::uuid as truck_id,
        (
            substr(md5('tx-bulk-menu-' || gs::text), 1, 8) || '-' ||
            substr(md5('tx-bulk-menu-' || gs::text), 9, 4) || '-' ||
            substr(md5('tx-bulk-menu-' || gs::text), 13, 4) || '-' ||
            substr(md5('tx-bulk-menu-' || gs::text), 17, 4) || '-' ||
            substr(md5('tx-bulk-menu-' || gs::text), 21, 12)
        )::uuid as menu_id
    from generate_series(1001, 1100) gs
)
select
    menu_id,
    truck_id,
    'Signature Plate #' || seq::text as item_name,
    'Chef special from TX Area Kitchen #' || seq::text,
    899 + (mod(seq, 8) * 100),
    true
from generated
on conflict (id) do nothing;
