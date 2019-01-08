-- create players table

create table players (
id serial primary key,
username text not null,
hash_value text not null,
money NUMERIC (5, 2)
)

-- register player

insert into players (username, hash_value)
values ($1, $2)
returning *;

-- find player

SELECT * FROM players
WHERE username = $1;

-- create stats table

create table stats (
games_played int,
money_won integer,
player_id int,
    foreign key (player_id) references players(id)
)

-- manually enter stats (daniel negraneau)

insert into stats (games_played, money_won player_id)
values (500, 1000000, 4);

-- register player to stats table

insert into stats (games_played, money_won, player_id)
values(0, 0, $1);

-- Join players and stats and only grab top 10 by money_won

SELECT p.id, p.username, s.games_played, s.money_won
FROM players p
INNER JOIN stats s ON p.id = s.player_id
ORDER BY money_won desc
LIMIT 10;

-- Increment number of games played by one after leaving a game

update stats
set games_played = games_played + 1
where player_id = $1;

-- Add the amount of money won to money_won

update stats
set money_won = money_won + $2
where player_id = $1;

-- convert integers to money for use in math

SELECT $1::float8::numeric::money;

-- deleting users from players and stats tables

DELETE FROM players
WHERE id = $1;

DELETE FROM stats
WHERE player_id = $1;