import type {
  AdminUser,
  BankTransaction,
  BlockedDay,
  Booking,
  BookingTransfer,
  Claim,
  CleaningTask,
  Expense,
  GuestReview,
  MaintenanceLog,
  Message,
  Payment,
  Property,
  PropertyOwner,
} from '@/types';

type TableDefinition<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row> };

export type Contact = {
  id: string;
  name: string;
  phone: string;
  message: string;
  source?: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      admin_users: TableDefinition<AdminUser>;
      bank_transactions: TableDefinition<BankTransaction>;
      blocked_days: TableDefinition<BlockedDay>;
      booking_transfers: TableDefinition<BookingTransfer>;
      bookings: TableDefinition<Booking>;
      claims: TableDefinition<Claim>;
      cleaning_tasks: TableDefinition<CleaningTask>;
      contacts: TableDefinition<Contact>;
      expenses: TableDefinition<Expense>;
      guest_reviews: TableDefinition<GuestReview>;
      maintenance_logs: TableDefinition<MaintenanceLog>;
      messages: TableDefinition<Message>;
      payments: TableDefinition<Payment>;
      properties: TableDefinition<Property>;
      property_owners: TableDefinition<PropertyOwner>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, never>;
  };
};
