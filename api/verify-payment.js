// Vercel Serverless Function: Verify Razorpay Payment and create a ticket
// POST /api/verify-payment

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      buyer_name,
      buyer_email,
      buyer_phone,
      pass_type,
      amount,
      promo_discount,
      promo_code,
      group_members,
      ticket_serial
    } = body;

    if (
      typeof razorpay_payment_id !== 'string' ||
      !razorpay_payment_id.trim() ||
      typeof razorpay_order_id !== 'string' ||
      !razorpay_order_id.trim() ||
      typeof razorpay_signature !== 'string' ||
      !/^[a-f\d]{64}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({
        success: false,
        error: 'Valid Razorpay payment, order, and signature values are required'
      });
    }

    if (
      typeof buyer_name !== 'string' ||
      !buyer_name.trim() ||
      typeof buyer_email !== 'string' ||
      !buyer_email.trim() ||
      typeof buyer_phone !== 'string' ||
      !buyer_phone.trim() ||
      typeof pass_type !== 'string' ||
      !pass_type.trim() ||
      typeof ticket_serial !== 'string' ||
      !/^RD-PASS-2026-[A-HJ-NP-Z2-9]{6}$/.test(ticket_serial)
    ) {
      return res.status(400).json({
        success: false,
        error: 'Valid buyer, pass, and ticket serial details are required'
      });
    }

    const ticketAmount = Number(amount);
    const promoDiscount = Number(promo_discount);
    if (
      !Number.isFinite(ticketAmount) ||
      ticketAmount <= 0 ||
      !Number.isFinite(promoDiscount) ||
      promoDiscount < 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Valid ticket amount and promo discount are required'
      });
    }

    if (group_members !== undefined && !Array.isArray(group_members)) {
      return res.status(400).json({
        success: false,
        error: 'group_members must be an array'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret === 'rzp_secret_placeholder') {
      console.error('Payment verification unavailable: RAZORPAY_KEY_SECRET is not configured.');
      return res.status(500).json({
        success: false,
        error: 'Payment verification is not configured'
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest();
    const receivedSignature = Buffer.from(razorpay_signature, 'hex');

    if (
      expectedSignature.length !== receivedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      console.warn('Rejected Razorpay payment with an invalid signature.', {
        razorpay_payment_id
      });
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Invalid payment signature. Authentication failed.'
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Ticket creation unavailable: Supabase server credentials are not configured.');
      return res.status(500).json({
        success: false,
        error: 'Ticket storage is not configured'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const ticket = {
      ticket_serial,
      buyer_name: buyer_name.trim(),
      buyer_email: buyer_email.trim().toLowerCase(),
      buyer_phone: buyer_phone.trim(),
      pass_type: pass_type.trim(),
      amount: ticketAmount,
      promo_discount: promoDiscount,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      group_members: group_members || [],
      quantity: Math.max(1, (group_members || []).length),
      promo_code: typeof promo_code === 'string' ? promo_code : null,
      // Keep legacy fields populated for existing ticket administration and lookup screens.
      serial_number: ticket_serial,
      discount_amount: promoDiscount,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    };

    const { error } = await supabase.from('tickets').insert([ticket]);
    if (error) {
      console.error('Supabase ticket insert failed:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Payment verified, but ticket creation failed'
      });
    }

    console.info('Razorpay payment verified and ticket created.', {
      razorpay_payment_id,
      ticket_serial
    });
    return res.status(200).json({
      success: true,
      serial_number: ticket_serial
    });
  } catch (error) {
    console.error('Server error verifying payment or creating ticket:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error verifying payment'
    });
  }
}
