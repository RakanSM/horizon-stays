// ============ STATUS UNIONS ============
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'transferred';
export type ClaimStatus = 'pending' | 'paid' | 'forgiven' | 'extension_requested' | 'approved_extension';
export type ExpenseTab = 'purchases' | 'services' | 'salaries';
export type PropertyStatus = 'available' | 'occupied' | 'maintenance' | 'blocked';
export type PropertyType = 'owned' | 'third_party_managed';
export type Platform = 'airbnb' | 'booking' | 'gatherin' | 'expedia' | 'direct' | 'manual';
export type PaymentMethod = 'myfatoorah' | 'bank_transfer' | 'card';
export type PaymentStatus = 'pending' | 'pending_review' | 'paid' | 'canceled' | 'expired' | 'failed' | 'refunded';
export type UserRole = 'admin' | 'operations' | 'cleaning';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved';
export type BlockedDayStatus = 'pending' | 'approved' | 'rejected';
export type MessageDirection = 'inbound' | 'outbound';
export type LockStatus = 'locked' | 'unlocked' | 'offline' | 'unknown';

// ============ ENTITY INTERFACES ============
export interface PropertyOwner {
  id: string;
  owner_name: string;
  owner_phone?: string;
  owner_email?: string;
  bank_iban?: string;
  bank_name?: string;
  management_fee_pct: number;
  balance_due: number;
  notes?: string;
  created_at: string;
}

export interface Property {
  id: string;
  internal_name: string;
  type: 'penthouse' | 'suite' | 'loft' | 'studio';
  area_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  status: PropertyStatus;
  base_price_night: number;
  images: string[];
  platform_names: Record<string, { name: string; url: string }>;
  airbnb_ical_url?: string;
  gatherin_ical_url?: string;
  description?: string;
  lock_id?: string;
  lock_status: LockStatus;
  owner_id?: string;
  property_type: PropertyType;
  cost_center_id?: string;
  created_at: string;
  // Joins
  owner?: PropertyOwner;
}

export interface Booking {
  id: string;
  property_id: string;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  platform: Platform;
  platform_booking_id?: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests_count: number;
  amount_sar: number;
  source?: string;
  confirmation_code?: string;
  status: BookingStatus;
  payment_method?: PaymentMethod;
  payment_status: PaymentStatus;
  payment_method_id?: number;
  payment_invoice_id?: string;
  payment_id?: string;
  payment_environment?: 'test' | 'live';
  payment_url?: string;
  payment_initiated_at?: string;
  payment_updated_at?: string;
  payment_completed_at?: string;
  door_code?: string;
  door_code_expires?: string;
  odoo_invoice_id?: number;
  zatca_invoice_id?: string;
  zatca_qr?: string;
  notes?: string;
  created_at: string;
  // Joins
  property?: Property;
}

export interface BookingTransfer {
  id: string;
  original_booking_id: string;
  new_booking_id: string;
  from_property_id?: string;
  to_property_id?: string;
  transfer_reason: string;
  transferred_by?: string;
  revenue_impact: number;
  created_at: string;
}

export interface Claim {
  id: string;
  booking_id?: string;
  property_id?: string;
  description: string;
  amount_sar: number;
  status: ClaimStatus;
  due_date?: string;
  extended_due_date?: string;
  evidence_urls: string[];
  maintenance_log_id?: string;
  created_by?: string;
  created_at: string;
  // Joins
  booking?: Booking;
  property?: Property;
}

export interface Expense {
  id: string;
  property_id?: string;
  tab: ExpenseTab;
  category: string;
  description: string;
  amount_sar: number;
  expense_date: string;
  receipt_url?: string;
  note?: string;
  odoo_journal_entry_id?: number;
  created_at: string;
  // Joins
  property?: Property;
}

export interface BlockedDay {
  id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: BlockedDayStatus;
  requested_by?: string;
  created_at: string;
}

export interface MaintenanceLog {
  id: string;
  property_id: string;
  issue: string;
  severity: Severity;
  status: MaintenanceStatus;
  notes?: string;
  resolved_at?: string;
  created_at: string;
  // Joins
  property?: Property;
}

export interface CleaningTask {
  id: string;
  property_id: string;
  booking_id?: string;
  assigned_to?: string;
  status: 'pending' | 'in_progress' | 'done';
  scheduled_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

export interface Message {
  id: string;
  booking_id?: string;
  direction: MessageDirection;
  channel: string;
  content: string;
  woztell_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  method: PaymentMethod;
  amount_sar: number;
  status: PaymentStatus;
  gateway_ref?: string;
  invoice_id?: string;
  payment_id?: string;
  provider_transaction_id?: string;
  gateway_method?: string;
  provider_status?: string;
  currency?: string;
  environment?: 'test' | 'live';
  event_reference?: string;
  provider_created_at?: string;
  receipt_url?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export interface GuestReview {
  id: string;
  property_id?: string;
  booking_id?: string;
  guest_name?: string;
  rating: number;
  review_text?: string;
  created_at: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  description?: string;
  amount: number;
  reference?: string;
  reconciled: boolean;
  payment_id?: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  auth_id?: string;
  role: UserRole;
  name: string;
  phone?: string;
  created_at: string;
}

// ============ API RESPONSE TYPES ============
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

// ============ KPI TYPES ============
export interface DashboardKPIs {
  activeBookings: number;
  occupancyRate: number;
  todayRevenue: number;
  monthRevenue: number;
  pendingApprovals: number;
  unbookedDaysThisMonth: number;
  cleaningTasksPending: number;
  maintenanceAlerts: number;
  revpar: number;
  adr: number;
  avgRevenuePerProperty: number;
  totalOutstandingOwnerDues: number;
}
