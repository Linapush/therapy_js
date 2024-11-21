docker run --name therapy_js -p 8005:5432 -e POSTGRES_USER=linapush -e POSTGRES_PASSWORD=password123 -e POSTGRES_DB=therapy@ -d postgres

psql -h 127.0.0.1 -p 8005 -d therapy_js -U linapush -f fill_db.sql