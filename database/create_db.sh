docker run --name therapy_app -p 5433:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=sirius -e POSTGRES_DB=therapy -d postgres

psql -h localhost -p 5433 -d therapy -U postgres -f database/fill_db.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE users SET password = crypt(password, gen_salt('bf'));
