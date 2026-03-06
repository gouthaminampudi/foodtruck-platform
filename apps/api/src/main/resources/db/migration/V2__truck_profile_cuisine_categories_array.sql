alter table truck_profile
alter column cuisine_categories type text[]
using (
    case
        when cuisine_categories is null or btrim(cuisine_categories) = '' then null
        else regexp_split_to_array(
            regexp_replace(cuisine_categories, '\s*,\s*', ',', 'g'),
            ','
        )
    end
);
