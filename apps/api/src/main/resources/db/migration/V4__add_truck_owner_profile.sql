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

create index if not exists idx_truck_profile_owner_user_id
    on truck_profile (owner_user_id);
