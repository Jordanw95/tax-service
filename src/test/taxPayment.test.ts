import {
  getTaxPosition,
  createDate,
  createTestTaxPaymentEvent,
  createTaxPaymentEvent,
} from './helpers';
import { prisma } from '../utils/db';

describe('Tax Payment API', () => {
  it('should create a tax payment event', async () => {
    const dateOne = createDate('01/01/2023');
    const taxPaymentEventDataOne = createTestTaxPaymentEvent(dateOne);

    await createTaxPaymentEvent(taxPaymentEventDataOne);

    const taxPaymentEvent = await prisma.taxPaymentEvent.findFirst({
      where: { date: dateOne },
    });

    expect(taxPaymentEvent).toBeTruthy();
    expect(taxPaymentEvent?.amount).toBe(100);
  });

  it('should create the first tax position', async () => {
    const dateOne = createDate('01/01/2023');
    const taxPaymentEventDataOne = createTestTaxPaymentEvent(dateOne);

    await createTaxPaymentEvent(taxPaymentEventDataOne);

    const taxCheckDate = createDate('02/01/2023');
    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(-100);
  });

  it('should create calculate accumulated tax position', async () => {
    const days = ['01', '02', '03', '04', '05'];
    for (const day of days) {
      const date = createDate(`${day}/01/2023`);
      const taxPaymentEventData = createTestTaxPaymentEvent(date);

      await createTaxPaymentEvent(taxPaymentEventData);
    }

    const taxCheckDate = createDate('06/01/2023');
    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(-500);
  });

  it('should create calculate accumulated tax position when payments are made in reverse', async () => {
    const days = ['05', '04', '03', '02', '01'];
    for (const day of days) {
      const date = createDate(`${day}/01/2023`);
      const taxPaymentEventData = createTestTaxPaymentEvent(date);

      await createTaxPaymentEvent(taxPaymentEventData);
    }

    const taxCheckDate = createDate('06/01/2023');
    const response = await getTaxPosition(taxCheckDate.toISOString());
    const taxPosition = response.body;

    expect(taxPosition.taxPosition).toBe(-500);
  });
});
