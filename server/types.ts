export type TransactionStatus = 
  | 'HELD_IN_ESCROW'
  | 'REFUNDED'
  | 'PAID_OUT'
  | 'PAYOUT_FAILED';

export interface Transaction {
  id: string;
  booking_id: string;
  paypal_order_id: string;
  paypal_capture_id: string;
  status: TransactionStatus;
  total_amount: number;
  pro_payout_amount: number;
  pro_paypal_email: string;
  platform_fee: number;
  release_date: string;
  refund_reason?: string;
  refunded_at?: string;
  payout_batch_id?: string;
  paid_out_at?: string;
  payout_error?: string;
  created_at: string;
}

export interface PayPalOrderRequest {
  amount: string;
  currency?: string;
  bookingId: string;
  proPaypalEmail: string;
  proAmount: number;
}

export interface PayPalCaptureResult {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          value: string;
          currency_code: string;
        };
      }>;
    };
  }>;
}

export interface PayoutResult {
  batch_header?: {
    payout_batch_id: string;
    batch_status: string;
  };
  links?: Array<{
    href: string;
    rel: string;
  }>;
}

export interface RefundResult {
  id: string;
  status: string;
  amount?: {
    value: string;
    currency_code: string;
  };
}
