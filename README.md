# Novabook Tax Service

# Running the service

The local.env file is included in the repo to allow for easy running of the app
locally. Run the following command to start the app

```
docker compose up --build
```

The service should then be available at http://localhost:3000, you can test it
with the the following curl command:

```
curl http://localhost:3000/api/test
```

# Ambiguity notes

## Penny Discrepancies

To maintain consistency and prevent rounding discrepancies in tax calculations,
any calculated values (e.g., tax amounts) are immediately rounded to the nearest
penny before storage. This approach eliminates floating-point arithmetic issues
and ensures that line items will always sum perfectly to their totals, providing
a reliable audit trail.