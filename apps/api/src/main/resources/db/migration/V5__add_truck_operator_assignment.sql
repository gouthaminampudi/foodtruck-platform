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

create index if not exists idx_truck_operator_assignment_truck_id
    on truck_operator_assignment (truck_id);

create index if not exists idx_truck_operator_assignment_user_id
    on truck_operator_assignment (user_id);
