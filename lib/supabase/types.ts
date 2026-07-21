import type { AdminUser, BankTransaction, BlockedDay, Booking, BookingTransfer, Claim, CleaningTask, Expense, GuestReview, MaintenanceLog, Message, Payment, Property, PropertyOwner } from '@/types';
type TableDefinition<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row> };
export type Contact = { id: string; name: string; phone: string; message: string; source?: string; created_at: string };
export type PaymentFulfillment = {
  booking_id: string; door_code?: string; keyboard_pwd_id?: number;
  door_status: 'pending'|'processing'|'done'|'skipped'|'failed'|'manual_review';
  door_message_status: 'pending'|'processing'|'done'|'skipped'|'failed';
  welcome_status: 'pending'|'processing'|'done'|'skipped'|'failed';
  last_error?: string; created_at: string; updated_at: string;
};
export type MyFatoorahWebhookEvent = {
  event_reference: string; event_name: string; payment_id?: string;
  status: 'processing'|'processed'|'failed'; attempts: number; last_error?: string;
  created_at: string; updated_at: string; processed_at?: string;
};
export type Database = { public: {
  Tables: {
    admin_users: TableDefinition<AdminUser>; bank_transactions: TableDefinition<BankTransaction>;
    blocked_days: TableDefinition<BlockedDay>; booking_transfers: TableDefinition<BookingTransfer>;
    bookings: TableDefinition<Booking>; claims: TableDefinition<Claim>; cleaning_tasks: TableDefinition<CleaningTask>;
    contacts: TableDefinition<Contact>; expenses: TableDefinition<Expense>; guest_reviews: TableDefinition<GuestReview>;
    maintenance_logs: TableDefinition<MaintenanceLog>; messages: TableDefinition<Message>; payments: TableDefinition<Payment>;
    payment_fulfillments: TableDefinition<PaymentFulfillment>; myfatoorah_webhook_events: TableDefinition<MyFatoorahWebhookEvent>;
    properties: TableDefinition<Property>; property_owners: TableDefinition<PropertyOwner>;
  };
  Views: Record<string, never>;
  Functions: {
    claim_myfatoorah_initialization: { Args: { p_booking_id: string }; Returns: { action: string; existing_url: string|null }[] };
    record_myfatoorah_attempt: { Args: { p_booking_id:string;p_invoice_id:string;p_method_id:number;p_gateway_method:string;p_amount:number;p_currency:string;p_environment:string;p_payment_url:string;p_provider_created_at:string|null }; Returns: void };
    record_verified_myfatoorah_state: { Args: { p_booking_id:string;p_invoice_id:string;p_payment_id:string;p_transaction_id:string;p_gateway_method:string;p_provider_status:string;p_internal_status:string;p_amount:number;p_currency:string;p_environment:string;p_event_reference:string|null;p_provider_created_at:string|null;p_transaction_created_at:string|null }; Returns: { booking_id:string;newly_paid:boolean;payment_status:string }[] };
    claim_myfatoorah_webhook_event: { Args: { p_event_reference:string;p_event_name:string;p_payment_id:string }; Returns: boolean };
    finish_myfatoorah_webhook_event: { Args: { p_event_reference:string;p_error:string|null }; Returns: void };
  };
  Enums: Record<string,string>; CompositeTypes: Record<string,never>;
} };
