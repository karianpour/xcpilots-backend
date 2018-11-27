alter table asset add column container text;

update asset set container = 'news';
