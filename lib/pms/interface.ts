export interface PMSAdapter {
  fetchBookings(since: Date): Promise<Array<{ id: string; guestName: string; checkIn: string; checkOut: string; amount: number; }>>;
  pushAvailability(propertyId: string, dates: Date[]): Promise<void>;
  syncRates(propertyId: string, rateMap: Record<string, number>): Promise<void>;
}

export class NoopPMSAdapter implements PMSAdapter {
  async fetchBookings(_since: Date) { console.log('[PMS] fetchBookings called (noop)'); return []; }
  async pushAvailability(_propertyId: string, _dates: Date[]) { console.log('[PMS] pushAvailability called (noop)'); }
  async syncRates(_propertyId: string, _rateMap: Record<string, number>) { console.log('[PMS] syncRates called (noop)'); }
}
