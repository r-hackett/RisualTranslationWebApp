drop table if exists `user`;

create table user (
    id int not null auto_increment,
    username varchar(16) not null,
    password varchar(16) not null,
    primary key(id)
);

insert into user (username, password) values ('ryan', 'password');
insert into user (username, password) values ('filip', 'password');
insert into user (username, password) values ('adam', 'password');
insert into user (username, password) values ('david', 'password');
insert into user (username, password) values ('james', 'password'); 