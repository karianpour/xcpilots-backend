create table content (
	id uuid primary key,
	section text collate "fa_IR",
	title text collate "fa_IR",
	file json,
	created_at timestamp not null,
	updated_at timestamp
);
