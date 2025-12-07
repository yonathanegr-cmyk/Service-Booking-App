import { Request, Response } from 'express';
import type { PayPalCaptureResult, PayoutResult, RefundResult } from './types';

function getPayPalBaseUrl(): string {
  return process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${JSON.stringify(data)}`);
  }
  
  return data.access_token;
}

async function getClientToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&intent=sdk_init&response_type=client_token'
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to get PayPal client token: ${JSON.stringify(data)}`);
  }
  
  return data.access_token;
}

export async function loadPaypalDefault(_req: Request, res: Response): Promise<void> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    
    if (!clientId) {
      res.status(500).json({ error: 'PayPal client ID not configured' });
      return;
    }

    const clientToken = await getClientToken();

    res.json({
      clientToken,
      clientId,
      currency: 'ILS',
      intent: 'capture'
    });
  } catch (error) {
    console.error('PayPal setup error:', error);
    res.status(500).json({ error: 'Failed to load PayPal configuration' });
  }
}

export async function createPaypalOrder(req: Request, res: Response): Promise<void> {
  try {
    const { amount, currency = 'ILS' } = req.body;

    if (!amount) {
      res.status(400).json({ error: 'Amount is required' });
      return;
    }

    const accessToken = await getAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString()
        }
      }]
    };

    const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayPal order creation failed:', data);
      res.status(response.status).json({ error: 'Failed to create PayPal order', details: data });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

export async function capturePaypalOrder(req: Request, _res: Response): Promise<PayPalCaptureResult> {
  const { orderID } = req.params;

  if (!orderID) {
    throw new Error('Order ID is required');
  }

  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${orderID}/capture`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error('PayPal capture failed:', data);
    throw new Error(`Failed to capture PayPal order: ${JSON.stringify(data)}`);
  }

  return data as PayPalCaptureResult;
}

export async function refundCapture(captureId: string, amount?: number): Promise<RefundResult> {
  const accessToken = await getAccessToken();

  const refundData = amount 
    ? { amount: { value: amount.toString(), currency_code: 'ILS' } }
    : {};

  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/payments/captures/${captureId}/refund`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(refundData)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error('PayPal refund failed:', data);
    throw new Error(`Failed to refund capture: ${JSON.stringify(data)}`);
  }

  return data as RefundResult;
}

export async function createPayout(
  recipientEmail: string,
  amount: number,
  note: string,
  senderBatchId: string
): Promise<PayoutResult> {
  const accessToken = await getAccessToken();

  const payoutData = {
    sender_batch_header: {
      sender_batch_id: senderBatchId,
      email_subject: 'תשלום עבור שירות Beed',
      email_message: note
    },
    items: [{
      recipient_type: 'EMAIL',
      amount: {
        value: amount.toFixed(2),
        currency: 'ILS'
      },
      receiver: recipientEmail,
      note: note
    }]
  };

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/payments/payouts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payoutData)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error('PayPal payout failed:', data);
    throw new Error(`Failed to create payout: ${JSON.stringify(data)}`);
  }

  return data as PayoutResult;
}

export async function getOrderDetails(orderId: string): Promise<any> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get order details: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function getPayoutDetails(payoutBatchId: string): Promise<any> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/payments/payouts/${payoutBatchId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get payout details: ${JSON.stringify(data)}`);
  }

  return data;
}
