update stats
set games_played = games_played + 1
where player_id = $1;

update stats
set money_won = money_won - $2::float8::numeric::money
where player_id = $1;