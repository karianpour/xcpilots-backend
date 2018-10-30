create table background (
	id uuid primary key,
	section text collate "fa_IR",
	pictures json,
	created_at timestamp not null,
	updated_at timestamp
);
