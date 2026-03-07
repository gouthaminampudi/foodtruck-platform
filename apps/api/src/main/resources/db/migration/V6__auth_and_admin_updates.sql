alter table app_user
    add column if not exists username varchar(100);

update app_user
set username = lower(split_part(email, '@', 1))
where username is null;

alter table app_user
    alter column username set not null;

do $$
begin
    if not exists (select 1 from pg_indexes where indexname = 'uq_app_user_username') then
        create unique index uq_app_user_username on app_user (lower(username));
    end if;
end $$;

alter table truck_profile
    add column if not exists is_active boolean not null default true;

alter table customer_profile
    add column if not exists profile_image_url text;
