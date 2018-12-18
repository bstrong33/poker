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
money_won NUMERIC(7, 2),
money_per_game NUMERIC(5, 2),
player_id int,
    foreign key (player_id) references players(id)
)

-- manually enter stats (daniel negraneau)

insert into stats (games_played, money_won, money_per_game, player_id)
values (500, 10000, 20, 4);

-- Join players and stats and only grab top 10 by money_won

SELECT p.id, p.username, s.games_played, s.money_won, s.money_per_game
FROM players p
INNER JOIN stats s ON p.id = s.player_id
ORDER BY money_won desc
LIMIT 10;