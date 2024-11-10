#!/bin/bash
source local.env
docker exec novabook-api sh -c "DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy"