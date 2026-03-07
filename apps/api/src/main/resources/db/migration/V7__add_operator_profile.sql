create table if not exists operator_profile (
    user_id uuid primary key references app_user(id) on delete cascade,
    first_name varchar(100),
    last_name varchar(100),
    phone_number varchar(50),
    profile_image_url text,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);
