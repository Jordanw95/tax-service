import {
  createSalesEvent,
  createTestSalesEvent,
  getTaxPosition,
  amendSalesEventItem,
  createDate,
} from './helpers';
import { prisma } from '../utils/db';
import { randomUUID } from 'crypto';

describe.only('Sales API', () => {
  it('should create a sales event', async () => {
    const dateOne = createDate('01/01/2023');
    const salesEventDataOne = createTestSalesEvent(dateOne);

    await createSalesEvent(salesEventDataOne);

    const salesEvent = await prisma.salesEvent.findFirst({
      where: { invoiceId: salesEventDataOne.invoiceId },
      include: { salesItems: true },
    });

    expect(salesEvent).toBeTruthy();
    expect(salesEvent?.salesItems).toHaveLength(1);
    expect(salesEvent?.totalTaxImpact).toBe(15); // 100 * 0.15 rounded
  });

  it('should create the first tax position', async () => {
    const dateOne = createDate('01/01/2023');
    const salesEventDataOne = createTestSalesEvent(dateOne);

    await createSalesEvent(salesEventDataOne);

    await prisma.salesEvent.findFirst({
      where: { invoiceId: salesEventDataOne.invoiceId },
      include: { salesItems: true },
    });

    const taxCheckDate = createDate('02/01/2023');
    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(15);
  });

  it('should calculate tax position based on accumulated sales', async () => {
    const days = ['01', '02', '03', '04', '05'];
    for (const day of days) {
      const date = createDate(`${day}/01/2023`);
      const salesEventData = createTestSalesEvent(date);

      await createSalesEvent(salesEventData);
    }

    const taxCheckDate = createDate('06/01/2023');
    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(75);
  });

  it('should calculate tax position based on accumulated sales when sales are input in reverse', async () => {
    const days = ['05', '04', '03', '02', '01'];
    for (const day of days) {
      const date = createDate(`${day}/01/2023`);
      const salesEventData = createTestSalesEvent(date);

      await createSalesEvent(salesEventData);
    }

    const taxCheckDate = createDate('06/01/2023');
    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(75);
  });

  it('should calculate tax position based on accumulated sales when sales are not input chronologically', async () => {
    const days = ['03', '05', '01', '04', '02'];
    for (const day of days) {
      const date = createDate(`${day}/01/2023`);
      const salesEventData = createTestSalesEvent(date);

      await createSalesEvent(salesEventData);
    }

    const taxCheckDate = createDate('06/01/2023');
    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(75);
  });

  it('should calculate tax position based on mid month query', async () => {
    const days = ['07', '01', '03', '10'];
    for (const day of days) {
      const date = createDate(`${day}/01/2023`);
      const salesEventData = createTestSalesEvent(date);

      await createSalesEvent(salesEventData);
    }

    const taxCheckDate = createDate('06/01/2023');

    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(30);
  });

  it('should be able to amend an existing sales event item', async () => {
    const date = createDate(`02/01/2023`);
    const salesEventData = createTestSalesEvent(date);

    await createSalesEvent(salesEventData);

    const taxCheckDate = createDate('06/01/2023');

    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(15);

    const futureDate = createDate('08/01/2023');
    const amendData = {
      invoiceId: salesEventData.invoiceId,
      date: futureDate.toISOString(),
      itemId: salesEventData.items[0].itemId,
      cost: 1000,
      taxRate: 0.2,
    };

    await amendSalesEventItem(amendData);

    const responseAfterUpdated = await getTaxPosition(futureDate.toISOString());
    const taxPositionAfterUpdate = responseAfterUpdated.body;

    expect(taxPositionAfterUpdate.taxPosition).toBe(200);
  });

  it('should be able to amend an existing sales event item with multiple items', async () => {
    const date = createDate(`02/01/2023`);
    const salesEventData = createTestSalesEvent(date);
    salesEventData.items.push({
      itemId: randomUUID(),
      cost: 100,
      taxRate: 0.2,
    });
    await createSalesEvent(salesEventData);

    const taxCheckDate = createDate('06/01/2023');

    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(35);

    const futureDate = createDate('08/01/2023');
    const amendData = {
      invoiceId: salesEventData.invoiceId,
      date: futureDate.toISOString(),
      itemId: salesEventData.items[0].itemId,
      cost: 1000,
      taxRate: 0.2,
    };

    await amendSalesEventItem(amendData);

    const responseAfterUpdated = await getTaxPosition(futureDate.toISOString());
    const taxPositionAfterUpdate = responseAfterUpdated.body;

    expect(taxPositionAfterUpdate.taxPosition).toBe(220);
  });

  it('should be able to amend an existing sales event item with many sales events', async () => {
    const date = createDate(`02/01/2023`);
    const salesEventData = createTestSalesEvent(date);

    await createSalesEvent(salesEventData);

    const days = ['07', '01', '03', '10']; // Total tax position for these dates is 60
    for (const day of days) {
      const date = createDate(`${day}/01/2023`);
      const salesEventData = createTestSalesEvent(date);

      await createSalesEvent(salesEventData);
    }

    const taxCheckDate = createDate('20/01/2023');

    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(75);

    const futureDate = createDate('20/01/2023');
    const amendData = {
      invoiceId: salesEventData.invoiceId,
      date: futureDate.toISOString(),
      itemId: salesEventData.items[0].itemId,
      cost: 1000,
      taxRate: 0.2,
    };

    await amendSalesEventItem(amendData);

    const responseAfterUpdated = await getTaxPosition(futureDate.toISOString());
    const taxPositionAfterUpdate = responseAfterUpdated.body;

    expect(taxPositionAfterUpdate.taxPosition).toBe(260);
  });

  it('should be able to amend sales event with a new item', async () => {
    const date = createDate(`02/01/2023`);
    const salesEventData = createTestSalesEvent(date);

    await createSalesEvent(salesEventData);

    const taxCheckDate = createDate('06/01/2023');

    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(15);

    const futureDate = createDate('08/01/2023');
    const amendData = {
      invoiceId: salesEventData.invoiceId,
      date: futureDate.toISOString(),
      itemId: randomUUID(),
      cost: 1000,
      taxRate: 0.2,
    };

    await amendSalesEventItem(amendData);

    const responseAfterUpdated = await getTaxPosition(futureDate.toISOString());
    const taxPositionAfterUpdate = responseAfterUpdated.body;

    expect(taxPositionAfterUpdate.taxPosition).toBe(215);
  });

  it('should be able add an ammendment for an invoice id before sales event exists', async () => {
    const date = createDate(`02/01/2023`);
    const salesEventData = createTestSalesEvent(date);
    const futureDate = createDate('08/01/2023');
    const amendData = {
      invoiceId: salesEventData.invoiceId,
      date: futureDate.toISOString(),
      itemId: salesEventData.items[0].itemId,
      cost: 1000,
      taxRate: 0.2,
    };
    await amendSalesEventItem(amendData);

    await createSalesEvent(salesEventData);

    const taxCheckDate = createDate('06/01/2023');

    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(200);
  });

  it('should respect the date of sales event if it is dated before the amendment', async () => {
    const date = createDate(`02/01/2023`);
    const salesEventData = createTestSalesEvent(date);
    const futureDate = createDate('01/01/2023');
    const amendData = {
      invoiceId: salesEventData.invoiceId,
      date: futureDate.toISOString(),
      itemId: salesEventData.items[0].itemId,
      cost: 1000,
      taxRate: 0.2,
    };
    await amendSalesEventItem(amendData);

    await createSalesEvent(salesEventData);

    const taxCheckDate = createDate('06/01/2023');

    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(15);
  });
});
