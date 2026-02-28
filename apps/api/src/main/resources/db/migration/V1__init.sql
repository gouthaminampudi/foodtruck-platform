create table if not exists app_user (
    id uuid primary key,
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    role varchar(50) not null,
    is_active boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists customer_profile (
    user_id uuid primary key references app_user(id),
    first_name varchar(100),
    last_name varchar(100),
    phone_number varchar(50),
    preferred_cuisines text,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists truck_profile (
    id uuid primary key,
    owner_user_id uuid not null references app_user(id),
    truck_name varchar(255) not null,
    cuisine_categories text,
    is_online boolean not null default false,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists menu_item (
    id uuid primary key,
    truck_id uuid not null references truck_profile(id),
    item_name varchar(255) not null,
    description text,
    price_cents integer not null,
    is_available boolean not null default true,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists truck_location (
    truck_id uuid primary key references truck_profile(id),
    latitude double precision not null,
    longitude double precision not null,
    updated_at timestamp not null default current_timestamp
);

create table if not exists customer_order (
    id uuid primary key,
    customer_user_id uuid not null references app_user(id),
    truck_id uuid not null references truck_profile(id),
    status varchar(50) not null,
    total_cents integer not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create table if not exists order_item (
    id uuid primary key,
    order_id uuid not null references customer_order(id),
    menu_item_id uuid not null references menu_item(id),
    quantity integer not null,
    unit_price_cents integer not null
);

