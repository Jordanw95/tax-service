import {
  createSalesEvent,
  createTestSalesEvent,
  getTaxPosition,
  createDate,
  createTestTaxPaymentEvent,
  createTaxPaymentEvent,
} from './helpers';

describe('End to end tests', () => {
  it('should calculate the tax position correctly', async () => {
    const salesDays = ['26', '01', '02', '03', '07'];
    const taxPaymentDays = ['06', '14', '24', '01', '28'];

    for (const day of salesDays) {
      const date = createDate(`${day}/01/2023`);
      const salesEventData = createTestSalesEvent(date);

      await createSalesEvent(salesEventData);
    }

    for (const day of taxPaymentDays) {
      const date = createDate(`${day}/01/2023`);
      const taxPaymentEventData = createTestTaxPaymentEvent(date);

      await createTaxPaymentEvent(taxPaymentEventData);
    }

    const taxCheckDateOne = createDate('31/01/2023');
    const responseOne = await getTaxPosition(taxCheckDateOne.toISOString());
    const taxPositionOne = responseOne.body;

    expect(taxPositionOne.taxPosition).toBe(-425);
    expect(taxPositionOne.date).toBe(taxCheckDateOne.toISOString());

    const taxCheckTwo = createDate('05/01/2023');
    const responseTwo = await getTaxPosition(taxCheckTwo.toISOString());
    const taxPositionTwo = responseTwo.body;

    expect(taxPositionTwo.taxPosition).toBe(-55);
  });
});
