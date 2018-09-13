create database xcpilots encoding = 'utf8' lc_collate = 'fa_IR.utf8' template template0;

create table news (
	id uuid primary key,
	title text collate "fa_IR",
	description text collate "fa_IR",
	body text collate "fa_IR",
	pictures json,
	created_at timestamp not null,
	updated_at timestamp,
	expiration timestamp
);

create table asset (
  id bigserial primary key,
  title text,
  filename text,
  type text,
  size int,
  src text,
  created_at timestamp not null,
  updated_at timestamp
);

