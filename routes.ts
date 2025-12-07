import { Express, Request, Response } from 'express';
import {
  createPaypalOrder,
  capturePaypalOrder,
  loadPaypalDefault,
  refundCapture,
  getOrderDetails,
  getPayoutDetails
} from './paypal';
import { supabase } from './db';
import { processManualPayout } from './payouts';

export function setupRoutes(app: Express): void {
  app.get('/paypal/setup', loadPaypalDefault);

  app.post('/paypal/order', createPaypalOrder);

  app.post('/paypal/order/:orderID/capture', async (req: Request, res: Response) => {
    try {
      const captureResult = await capturePaypalOrder(req, res);

      const { bookingId, proPaypalEmail, proAmount, amount } = req.body;
      const releaseDate = new Date();
      releaseDate.setDate(releaseDate.getDate() + 14);

      const totalAmount = parseFloat(amount);
      const proPayoutAmount = parseFloat(proAmount);
      const platformFee = totalAmount - proPayoutAmount;

      const captureId = captureResult.purchase_units[0]?.payments?.captures[0]?.id;

      if (!captureId) {
        console.error('No capture ID in result:', captureResult);
        return res.status(500).json({ error: 'Failed to get capture ID' });
      }

      const { error: dbError } = await supabase.from('transactions').insert({
        booking_id: bookingId,
        paypal_order_id: req.params.orderID,
        paypal_capture_id: captureId,
        status: 'HELD_IN_ESCROW',
        total_amount: totalAmount,
        pro_payout_amount: proPayoutAmount,
        pro_paypal_email: proPaypalEmail,
        release_date: releaseDate.toISOString(),
        platform_fee: platformFee
      });

      if (dbError) {
        console.error('Database insert error:', dbError);
      }

      return res.json({ success: true, captureResult });
    } catch (error) {
      console.error('Capture error:', error);
      return res.status(500).json({ error: 'Failed to capture order' });
    }
  });

  app.post('/admin/refund/:transactionId', async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;
      const { amount, reason } = req.body;

      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError || !transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (transaction.status !== 'HELD_IN_ESCROW') {
        return res.status(400).json({ error: 'Transaction cannot be refunded' });
      }

      const refundResult = await refundCapture(
        transaction.paypal_capture_id,
        amount
      );

      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'REFUNDED',
          refund_reason: reason,
          refunded_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) {
        console.error('Database update error:', updateError);
      }

      return res.json({ success: true, refundResult });
    } catch (error) {
      console.error('Refund error:', error);
      return res.status(500).json({ error: 'Failed to process refund' });
    }
  });

  app.post('/admin/payout/:transactionId', async (req: Request, res: Response) => {
    try {
      const { transactionId } = req.params;
      const result = await processManualPayout(transactionId);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Manual payout error:', error);
      return res.status(500).json({ error: 'Failed to process payout' });
    }
  });

  app.get('/admin/transactions', async (_req: Request, res: Response) => {
    try {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch transactions' });
      }

      return res.json({ transactions });
    } catch (error) {
      console.error('Fetch transactions error:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.get('/admin/transactions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      return res.json({ transaction });
    } catch (error) {
      console.error('Fetch transaction error:', error);
      return res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  });

  app.get('/admin/transactions/:id/paypal-order', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('paypal_order_id')
        .eq('id', id)
        .single();

      if (error || !transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const orderDetails = await getOrderDetails(transaction.paypal_order_id);
      return res.json({ orderDetails });
    } catch (error) {
      console.error('Fetch PayPal order error:', error);
      return res.status(500).json({ error: 'Failed to fetch PayPal order details' });
    }
  });

  app.get('/admin/transactions/:id/payout-status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('payout_batch_id')
        .eq('id', id)
        .single();

      if (error || !transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (!transaction.payout_batch_id) {
        return res.status(400).json({ error: 'No payout associated with this transaction' });
      }

      const payoutDetails = await getPayoutDetails(transaction.payout_batch_id);
      return res.json({ payoutDetails });
    } catch (error) {
      console.error('Fetch payout status error:', error);
      return res.status(500).json({ error: 'Failed to fetch payout status' });
    }
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/debug-env', (req: Request, res: Response) => {
    const debugToken = req.headers['x-debug-token'] || req.query.token;
    const expectedToken = process.env.DEBUG_TOKEN || 'beed-debug-2024';
    const nodeEnv = process.env.NODE_ENV || 'unknown';
    
    if (nodeEnv === 'production' && debugToken !== expectedToken) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Debug endpoint requires authentication in production',
        hint: 'Add X-Debug-Token header or ?token= query param'
      });
    }

    const prodUrl = process.env.VITE_SUPABASE_URL_PROD || '';
    const devUrl = process.env.VITE_SUPABASE_URL_DEV || '';
    const fallbackUrl = process.env.VITE_SUPABASE_URL || '';
    
    const mask = (str: string) => {
      if (!str) return 'NOT_SET';
      if (str.length < 15) return 'INVALID_FORMAT';
      return `${str.substring(0, 8)}***${str.slice(-4)}`;
    };

    res.json({
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: nodeEnv,
        IS_PRODUCTION: nodeEnv === 'production'
      },
      supabase: {
        PROD_URL: mask(prodUrl),
        DEV_URL: mask(devUrl),
        FALLBACK_URL: mask(fallbackUrl),
        URLS_ARE_IDENTICAL: prodUrl === devUrl && prodUrl !== '',
        PROD_CONFIGURED: !!prodUrl,
        DEV_CONFIGURED: !!devUrl
      },
      diagnosis: {
        hasProdCredentials: !!prodUrl,
        hasDevCredentials: !!devUrl,
        potentialConflict: prodUrl === devUrl && prodUrl !== '',
        recommendation: !prodUrl 
          ? 'CRITICAL: PROD credentials missing! Set VITE_SUPABASE_URL_PROD'
          : prodUrl === devUrl 
            ? 'WARNING: PROD and DEV URLs are identical!'
            : 'OK: Separate databases configured'
      }
    });
  });

  app.get('/api/escrow-stats', async (_req: Request, res: Response) => {
    try {
      const { data: escrowTransactions, error: escrowError } = await supabase
        .from('transactions')
        .select('total_amount, pro_payout_amount, platform_fee')
        .eq('status', 'HELD_IN_ESCROW');

      const { data: paidOutTransactions, error: paidError } = await supabase
        .from('transactions')
        .select('total_amount, pro_payout_amount, platform_fee')
        .eq('status', 'PAID_OUT');

      if (escrowError || paidError) {
        return res.status(500).json({ error: 'Failed to fetch escrow stats' });
      }

      const totalInEscrow = escrowTransactions?.reduce((sum, tx) => sum + tx.total_amount, 0) || 0;
      const totalPaidOut = paidOutTransactions?.reduce((sum, tx) => sum + tx.pro_payout_amount, 0) || 0;
      const totalPlatformFees = paidOutTransactions?.reduce((sum, tx) => sum + tx.platform_fee, 0) || 0;

      return res.json({
        escrowCount: escrowTransactions?.length || 0,
        totalInEscrow,
        paidOutCount: paidOutTransactions?.length || 0,
        totalPaidOut,
        totalPlatformFees
      });
    } catch (error) {
      console.error('Fetch escrow stats error:', error);
      return res.status(500).json({ error: 'Failed to fetch escrow stats' });
    }
  });
}
