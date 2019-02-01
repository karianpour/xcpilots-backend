create table flights (
	id uuid primary key,
  flight_id text collate "fa_IR" not null unique,
  scope text collate "fa_IR" not null,
  flight_date timestamp with time zone not null,
  utcOffset int not null,
  pilot_country text collate "fa_IR" not null,
  pilot_name text collate "fa_IR" not null,
  site_country text collate "fa_IR" not null,
  site_name text collate "fa_IR" not null,
  flight_type text collate "fa_IR" not null,
  flight_length float not null,
  flight_length_unit text collate "fa_IR" not null,
  flight_points float not null,
  flight_url text collate "fa_IR" not null,
  glider text collate "fa_IR" not null,
  glider_class text collate "fa_IR" not null,
	created_at timestamp with time zone not null
);


copy (select
  date_part('year', flight_date) as year, 
  count(*) as flight_qty, count(distinct pilot_name) as pilots_qty, 
  max(flight_length), round((avg(flight_length)::numeric), 2) as avg, min(flight_length)
from flights
where glider ilike '%skywalk%'
group by 1
order by 1) to '/home/kayvan/sql/flight_stat_skywalk.txt' with csv header delimiter E'\t';

copy (select
  date_part('year', flight_date) as year, 
  count(*) as flight_qty, count(distinct pilot_name) as pilots_qty, 
  max(flight_length), round((avg(flight_length)::numeric), 2) as avg, min(flight_length)
from flights
where glider ilike '%gin%'
group by 1
order by 1) to '/home/kayvan/sql/flight_stat_gin.txt' with csv header delimiter E'\t';

copy (select
  date_part('year', flight_date) as year, 
  count(*) as flight_qty, count(distinct pilot_name) as pilots_qty, 
  max(flight_length), round((avg(flight_length)::numeric), 2) as avg, min(flight_length)
from flights
where glider ilike '%ozone%'
group by 1
order by 1) to '/home/kayvan/sql/flight_stat_ozone.txt' with csv header delimiter E'\t';

copy (select
  date_part('year', flight_date) as year, 
  count(*) as flight_qty, count(distinct pilot_name) as pilots_qty, 
  max(flight_length), round((avg(flight_length)::numeric), 2) as avg, min(flight_length)
from flights
where 
  not glider ilike '%gin%'
  and not glider ilike '%skywalk%'
  and not glider ilike '%ozone%'
group by 1
order by 1) to '/home/kayvan/sql/flight_stat_rest.txt' with csv header delimiter E'\t';

copy (
select site_name, count(*), 
  sum(case when glider ilike 'skywalk%' then 1 else 0 end) as skywalk_qty,
  sum(case when glider ilike 'gin%' then 1 else 0 end) as gin_gliders_qty,
  sum(case when glider ilike 'ozone%' then 1 else 0 end) as ozone_qty,
  sum(case when glider ilike 'niviuk%' then 1 else 0 end) as niviuk_qty,
  sum(case when glider ilike 'up%' then 1 else 0 end) as up_qty,
  sum(case when glider ilike 'nova%' then 1 else 0 end) as nova_qty,
  sum(case when glider ilike 'AIRDESIGN%' then 1 else 0 end) as AIRDESIGN_qty,
  sum(case when
        glider not ilike 'skywalk%'
    and glider not ilike 'gin%'
    and glider not ilike 'ozone%'
    and glider not ilike 'niviuk%'
    and glider not ilike 'up%'
    and glider not ilike 'nova%'
    and glider not ilike 'AIRDESIGN%'
    then 1 else 0 end) as rest_qty

from flights
where date_part('year', flight_date) > 2016
group by 1
order by 2 desc
) to '/home/kayvan/sql/flight_stat_sites.txt' with csv header delimiter E'\t';


start transaction;

delete from flights_gliders_convert where flight_id in (
  select f.flight_id
  from flights_gliders_convert c
  inner join flights f on f.flight_id = c.flight_id
  where c.glider = f.glider
);


update flights_gliders_convert c
  set bad_glider = f.glider
from flights f
where f.flight_id = c.flight_id;

update flights f
  set glider = c.glider
from flights_gliders_convert c
where f.flight_id = c.flight_id;

/*
pg_dump -U postgres xcpilots -t flights > flights.sql

scp flights.sql kayvan@xcpilots:~/

psql -h 127.0.0.1 -W -U xcpilots xcpilots < flights.sql
*/

select row_to_json(t)
from (select
  (select array_to_json(array_agg(row_to_json(t))) as the_best_all
  from (
    select *
    from flights
    order by flight_points desc
    limit 3
  ) t),
  (select array_to_json(array_agg(row_to_json(t))) as the_best_all_30
  from (
    select *
    from flights
    where flight_date > (now() - interval '30 days')
    order by flight_points desc
    limit 3
  ) t),
  (select array_to_json(array_agg(row_to_json(t))) as the_best_all_7
  from (
    select *
    from flights
    where flight_date > (now() - interval '7 days')
    order by flight_points desc
    limit 3
  ) t),
  (select array_to_json(array_agg(row_to_json(t))) as the_best_ir
  from (
    select *
    from flights
    where scope like 'IR%'
    order by flight_points desc
    limit 3
  ) t),
  (select array_to_json(array_agg(row_to_json(t))) as the_best_ir_30
  from (
    select *
    from flights
    where scope like 'IR%' and flight_date > (now() - interval '30 days')
    order by flight_points desc
    limit 3
  ) t),
  (select array_to_json(array_agg(row_to_json(t))) as the_best_ir_7
  from (
    select *
    from flights
    where scope like 'IR%' and flight_date > (now() - interval '7 days')
    order by flight_points desc
    limit 3
  ) t)
) t;

