DROP TABLE IF EXISTS counrty;

CREATE TABLE counrty(
    id serial primary key,
    country varchar(255),
    totalconfirmed varchar(255),
    totaldeaths varchar(255),
    totalrecovered varchar(255),
    date varchar(255)
)

 