-- PayPal Transactions with Escrow Logic
-- Run this in your Supabase SQL editor

-- Create transaction status enum
CREATE TYPE transaction_status AS ENUM (
  'HELD_IN_ESCROW',
  'REFUNDED',
  'PAID_OUT',
  'PAYOUT_FAILED'
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) NOT NULL,
  
  -- PayPal IDs
  paypal_order_id TEXT NOT NULL,
  paypal_capture_id TEXT NOT NULL,
  
  -- Status
  status transaction_status DEFAULT 'HELD_IN_ESCROW',
  
  -- Amounts (all in ILS)
  total_amount DECIMAL(10,2) NOT NULL,
  pro_payout_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  
  -- Pro info
  pro_paypal_email TEXT NOT NULL,
  
  -- Escrow timing
  release_date TIMESTAMPTZ NOT NULL,
  
  -- Refund info
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  
  -- Payout info
  payout_batch_id TEXT,
  paid_out_at TIMESTAMPTZ,
  payout_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cron job queries (finding eligible payouts)
CREATE INDEX idx_transactions_escrow ON transactions(status, release_date) 
  WHERE status = 'HELD_IN_ESCROW';

-- Index for looking up by PayPal order ID
CREATE INDEX idx_transactions_paypal_order ON transactions(paypal_order_id);

-- Index for booking lookups
CREATE INDEX idx_transactions_booking ON transactions(booking_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_modtime
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE PROCEDURE update_transactions_updated_at();

-- Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins can manage all transactions" ON transactions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'admin'
        )
    );

-- Clients can view their own transactions
CREATE POLICY "Clients can view own transactions" ON transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = transactions.booking_id
            AND b.client_id = auth.uid()
        )
    );

-- Providers can view transactions for their bookings
CREATE POLICY "Providers can view their booking transactions" ON transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = transactions.booking_id
            AND b.provider_id = auth.uid()
        )
    );
