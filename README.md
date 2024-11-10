# Novabook Tax Service

A simple tax service for calculating tax position based on sales and tax payment
events.

The service operates around the idea that any transaction that is added creates
a new tax position, as depicted in the following diagram:

```
TaxPositionEntry:     +15            -35            -15            +15
                      |              |              |              |
                      ↑              ↑              ↑              ↑
Timeline:     --------S--------------P--------------S--------------S--------
                     ↑              ↑              ↑              ↑
Events:          SalesEvent    TaxPayment     SalesEvent     SalesEvent
                (tax: +15)    (amount: -50)    (tax: +20)    (tax: +30)
```

This makes querying the tax position at any point in time fast as we can simply
query the closest tax position to the provided date.

When a new transaction occurs, we can check the most recent tax position behind
it to determine the new tax position. We can then update all future tax
positions relatively quickly by running through them chronologically and using
the taxDelta value to update. This allows us to update in one bulk operation.

In future work, this process should be done asynchronously by a worker process,
to prevent blocking the main thread.

The required endpoint functions are all tested, as per the task technical
document. The tests can be found at src/test. There are instructions below on
how to run the tests.

The following routes are available in the API:

- GET /api/tax-position?date={date} - Get the tax position at a given date

- POST /api/transactions - Create a new sales event (SalesEvent or TaxPayment)

- PATCH /api/sales - Update the SalesItem of a SalesEvent (Before or after the
  SalesEvent has been created)

The types/requests.ts file contains the expected request bodies for each route.

# Running the service

The local.env file is included in the repo to allow for easy running of the app
locally. Run the following command to start the app

```
docker compose up --build
```

The service should then be available at http://localhost:3000, you can test it
with the the following curl command:

```
curl http://localhost:3000/api/tax-position?date=2024-01-01
```

# Running tests

On first run, you will need to create and migrate the test database:

```
./create_test_db.sh
./migrate_test_db.sh
```

After doing this, you can run the tests with the following command:

```
docker-compose exec novabook-api npm test
```

# Ambiguity notes

## Sales Event Price Ammendments

When we ammend a price, we are not ammending the SalesEventItem, but instead
creating a new SalesItemUpdate. We then use the latest SalesItemUpdate to
determine the price of the item for the SalesEvent and calculate the impact of
the update to that SalesEvent has on all tax positions from that point onwards.

When a sale event is created, the price of the item is determined by finding the
most recent SalesEventItem for each itemId in the event. This means that the
'lastest' ammendment will always be respected and allows a SalesItemUpdate to be
created before the actual SalesEvent.

## Penny Discrepancies

To maintain consistency and prevent rounding discrepancies in tax calculations,
any calculated values (e.g., tax amounts) are immediately rounded to the nearest
penny before storage. This approach eliminates floating-point arithmetic issues
and ensures that line items will always sum perfectly to their totals, providing
a reliable audit trail.
