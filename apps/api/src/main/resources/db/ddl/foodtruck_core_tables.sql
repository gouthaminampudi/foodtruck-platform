-- Core FoodTruck tables:
-- 1) truck_owner_profile (owner attributes)
-- 2) truck_profile (truck attributes)
-- 3) truck_location (current location)
-- 4) menu_item (truck menu)
-- 5) truck_operator_assignment (truck operators and role-based access)
--
-- Note: owner_user_id and truck_id reference existing parent tables.

create table if not exists truck_owner_profile (
    user_id uuid primary key references app_user(id),
    business_name varchar(255) not null,
    owner_first_name varchar(100),
    owner_last_name varchar(100),
    phone_number varchar(50),
    support_email varchar(255),
    tax_id varchar(100),
    default_service_city varchar(100),
    is_verified boolean not null default false,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists truck_profile (
    id uuid primary key,
    owner_user_id uuid not null references app_user(id),
    truck_name varchar(255) not null,
    cuisine_categories text[],
    description text,
    phone_number varchar(50),
    license_number varchar(100),
    rating_avg numeric(3, 2) not null default 0.00,
    rating_count integer not null default 0,
    opening_hours_json jsonb,
    service_radius_meters integer not null default 5000,
    is_verified boolean not null default false,
    is_online boolean not null default false,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists truck_location (
    truck_id uuid primary key references truck_profile(id),
    latitude double precision not null,
    longitude double precision not null,
    heading_degrees numeric(5, 2),
    speed_mps numeric(6, 2),
    accuracy_meters numeric(8, 2),
    is_live boolean not null default true,
    updated_at timestamp not null default current_timestamp
);

create table if not exists menu_item (
    id uuid primary key,
    truck_id uuid not null references truck_profile(id),
    item_name varchar(255) not null,
    description text,
    category varchar(100),
    image_url text,
    price_cents integer not null,
    is_vegetarian boolean not null default false,
    is_vegan boolean not null default false,
    is_gluten_free boolean not null default false,
    spice_level smallint not null default 0,
    prep_time_minutes integer,
    sort_order integer not null default 0,
    is_available boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists truck_operator_assignment (
    id uuid primary key,
    truck_id uuid not null references truck_profile(id) on delete cascade,
    user_id uuid not null references app_user(id),
    operator_role varchar(50) not null,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp,
    constraint uq_truck_operator_assignment unique (truck_id, user_id)
);

create index if not exists idx_truck_profile_owner_user_id
    on truck_profile (owner_user_id);

create index if not exists idx_truck_operator_assignment_truck_id
    on truck_operator_assignment (truck_id);

create index if not exists idx_truck_operator_assignment_user_id
    on truck_operator_assignment (user_id);
