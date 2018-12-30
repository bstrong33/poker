-- delete from stats first to satisfy the foreign key constraint stats has with players

DELETE FROM stats
WHERE player_id = $1;

DELETE FROM players
WHERE id = $1;
