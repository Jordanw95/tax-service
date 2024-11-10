export type TaxPositionResponse = {
  date: string;
  taxPosition: number;
};

export type GenericTaxEvent = {
  date: string;
  taxPositionDelta: number;
  eventId: string;
  eventType: string;
};
