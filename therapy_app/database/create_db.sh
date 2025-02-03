docker run --name therapy_app -p 8005:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=sirius -e POSTGRES_DB=therapy -d postgres

psql -h localhost -p 5434 -U postgres -d therapy

docker volume rm therapy_app_postgres_data
therapy_app_postgres_data

docker exec -it therapy_postgres psql -U postgres -d therapy
