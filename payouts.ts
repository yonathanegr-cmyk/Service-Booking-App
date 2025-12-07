import cron from 'node-cron';
import { createPayout } from './paypal';
import { supabase } from './db';

cron.schedule('0 2 * * *', async () => {
  console.log('[Payouts Cron] Starting automatic payouts...');

  try {
    const { data: eligibleTransactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'HELD_IN_ESCROW')
      .lte('release_date', new Date().toISOString());

    if (error) {
      console.error('[Payouts Cron] Database error:', error);
      return;
    }

    if (!eligibleTransactions?.length) {
      console.log('[Payouts Cron] No eligible transactions found');
      return;
    }

    console.log(`[Payouts Cron] Found ${eligibleTransactions.length} eligible transactions`);

    for (const tx of eligibleTransactions) {
      try {
        const senderBatchId = `BEED_PAYOUT_${tx.id}_${Date.now()}`;

        const payoutResult = await createPayout(
          tx.pro_paypal_email,
          tx.pro_payout_amount,
          `תשלום עבור משימה #${tx.booking_id.substring(0, 8)}`,
          senderBatchId
        );

        await supabase
          .from('transactions')
          .update({
            status: 'PAID_OUT',
            payout_batch_id: payoutResult.batch_header?.payout_batch_id,
            paid_out_at: new Date().toISOString()
          })
          .eq('id', tx.id);

        console.log(`[Payouts Cron] Payout successful for transaction ${tx.id}`);
      } catch (error) {
        console.error(`[Payouts Cron] Failed to payout transaction ${tx.id}:`, error);

        await supabase
          .from('transactions')
          .update({
            status: 'PAYOUT_FAILED',
            payout_error: String(error)
          })
          .eq('id', tx.id);
      }
    }

    console.log('[Payouts Cron] Completed');
  } catch (error) {
    console.error('[Payouts Cron] Fatal error:', error);
  }
});

export function startPayoutsCron(): void {
  console.log('[Payouts Cron] Scheduled for 2:00 AM daily');
}

export async function processManualPayout(transactionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: tx, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error || !tx) {
      return { success: false, error: 'Transaction not found' };
    }

    if (tx.status !== 'HELD_IN_ESCROW') {
      return { success: false, error: 'Transaction is not in escrow status' };
    }

    const senderBatchId = `BEED_MANUAL_PAYOUT_${tx.id}_${Date.now()}`;

    const payoutResult = await createPayout(
      tx.pro_paypal_email,
      tx.pro_payout_amount,
      `תשלום עבור משימה #${tx.booking_id.substring(0, 8)}`,
      senderBatchId
    );

    await supabase
      .from('transactions')
      .update({
        status: 'PAID_OUT',
        payout_batch_id: payoutResult.batch_header?.payout_batch_id,
        paid_out_at: new Date().toISOString()
      })
      .eq('id', tx.id);

    return { success: true };
  } catch (error) {
    console.error(`[Manual Payout] Failed for transaction ${transactionId}:`, error);
    return { success: false, error: String(error) };
  }
}
