#!/bin/bash
set -e

host="$1"
shift
cmd="$@"

until PGPASSWORD="sirius" psql -h "$host" -U "postgres" -d "template1" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"

PGPASSWORD="sirius" psql -h "$host" -U "postgres" -d "therapy" -f /docker-entrypoint-initdb.d/init.sql

exec $cmd