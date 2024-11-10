#!/bin/bash
docker exec novabook-api sh -c "DATABASE_URL=postgresql://postgres:password@db:5432/novabook_test npx prisma migrate deploy"