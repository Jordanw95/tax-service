import {
  createSalesEvent,
  createTestSalesEvent,
  getTaxPosition,
  createDate,
} from './helpers';
import { prisma } from '../utils/db';

describe('Sales API', () => {
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

    const salesEvent = await prisma.salesEvent.findFirst({
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

  it('should calculate tax position based on accumulated sales when sales are not input chronologically', async () => {
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
});
