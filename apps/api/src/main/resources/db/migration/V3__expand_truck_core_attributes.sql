alter table truck_profile
    add column if not exists description text,
    add column if not exists phone_number varchar(50),
    add column if not exists license_number varchar(100),
    add column if not exists rating_avg numeric(3, 2) not null default 0.00,
    add column if not exists rating_count integer not null default 0,
    add column if not exists opening_hours_json jsonb,
    add column if not exists service_radius_meters integer not null default 5000,
    add column if not exists is_verified boolean not null default false;

alter table truck_location
    add column if not exists heading_degrees numeric(5, 2),
    add column if not exists speed_mps numeric(6, 2),
    add column if not exists accuracy_meters numeric(8, 2),
    add column if not exists is_live boolean not null default true;

alter table menu_item
    add column if not exists category varchar(100),
    add column if not exists image_url text,
    add column if not exists is_vegetarian boolean not null default false,
    add column if not exists is_vegan boolean not null default false,
    add column if not exists is_gluten_free boolean not null default false,
    add column if not exists spice_level smallint not null default 0,
    add column if not exists prep_time_minutes integer,
    add column if not exists sort_order integer not null default 0;
