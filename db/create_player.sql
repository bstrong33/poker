insert into players (username, hash_value)
values ($1, $2)
returning *;