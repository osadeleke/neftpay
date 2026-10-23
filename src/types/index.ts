export type SubscriptionTier = 'free' | 'starter' | 'pro';

export interface Merchant {
  id: string; // UUID
  business_name: string;
  phone_number: string;
  email: string;
  subscription_tier: SubscriptionTier;
  currency?: string;
  created_at?: string;
}

export interface Client {
  id: string;
  merchant_id: string;
  full_name: string;
  phone_number: string;
  email?: string | null;
  created_at?: string;
}

export type AgreementStatus = 'active' | 'completed' | 'overdue' | 'cancelled';

export interface Agreement {
  id: string;
  merchant_id: string;
  client_id: string;
  title: string;
  total_amount: number; // Stored as integer in Kobo (e.g. ₦50,000 = 5000000)
  magic_link_slug: string; // UNIQUE 8-char slug
  status: AgreementStatus;
  due_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export type PaymentMethod = 'Bank Transfer' | 'Cash' | 'POS' | 'USSD' | 'Online Card';

export interface Payment {
  id: string;
  agreement_id: string;
  amount: number; // Stored as integer in Kobo
  payment_method: PaymentMethod | string;
  reference_note?: string | null;
  receipt_sent: number; // 0 or 1
  created_at: string;
}

export interface AgreementWithDetails extends Agreement {
  client_name: string;
  client_phone: string;
  client_email?: string | null;
  total_paid: number; // in kobo
  balance_remaining: number; // in kobo
  percent_paid: number;
  payments_count: number;
  last_payment_date?: string | null;
}

export interface DashboardStats {
  totalOutstandingBalanceKobo: number;
  collectedThisMonthKobo: number;
  activeClientsCount: number;
  activeAgreementsCount: number;
  completedAgreementsCount: number;
  overdueAgreements: AgreementWithDetails[];
  recentAgreements: AgreementWithDetails[];
}

export interface MagicLinkData {
  agreement: Agreement;
  client: {
    full_name: string;
    phone_number: string;
    email?: string | null;
  };
  merchant: {
    id: string;
    business_name: string;
    phone_number: string;
    email: string;
  };
  payments: Payment[];
  totalPaidKobo: number;
  balanceRemainingKobo: number;
  percentPaid: number;
  isCompleted: boolean;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  business_name: string;
  phone_number: string;
}

export interface AdminMerchantMetric {
  id: string;
  business_name: string;
  phone_number: string;
  email: string;
  subscription_tier: string;
  created_at: string;
  agreements_count: number;
  clients_count: number;
  total_tracked_kobo: number;
  total_collected_kobo: number;
  total_outstanding_kobo: number;
}

export interface AdminGlobalPayment {
  id: string;
  amount: number;
  payment_method: string;
  reference_note?: string | null;
  created_at: string;
  agreement_title: string;
  client_name: string;
  merchant_business_name: string;
}

export interface AdminPlatformMetrics {
  totalVolumeTrackedKobo: number;
  totalCollectedKobo: number;
  totalOutstandingKobo: number;
  totalMerchantsCount: number;
  totalClientsCount: number;
  totalAgreementsCount: number;
  totalPaymentsCount: number;
  merchants: AdminMerchantMetric[];
  recentPayments: AdminGlobalPayment[];
}

