import crypto from 'node:crypto';

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

/**
 * Payment gateway stub. Replace the body with a Stripe/PayPal call
 * (e.g. stripe.paymentIntents.create) when real keys are available.
 * For testing, a card number ending in 0000 is declined.
 */
export async function processPayment(
  method: 'card' | 'paypal' | 'cod',
  amount: number,
  details?: { cardNumber?: string },
): Promise<PaymentResult> {
  if (method === 'cod') return { success: true };
  if (method === 'card') {
    const digits = (details?.cardNumber ?? '').replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(digits)) return { success: false, error: 'Invalid card number' };
    if (digits.endsWith('0000')) return { success: false, error: 'Card declined' };
  }
  if (amount <= 0) return { success: false, error: 'Invalid amount' };
  return { success: true, paymentId: `sim_${crypto.randomBytes(8).toString('hex')}` };
}
