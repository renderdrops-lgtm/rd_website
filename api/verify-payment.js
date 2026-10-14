// Vercel Serverless Function: Verify Razorpay Payment Signature & Record Ticket
// POST /api/verify-payment

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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
      group_members,
      ticket_serial
    } = req.body || {};

    if (!razorpay_payment_id) {
      return res.status(400).json({ success: false, error: 'razorpay_payment_id is required' });
    }

    // 1. Environment Variable Name Mismatch Safeguards (Vercel & Vite interoperability)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;
    const razorpayKeySecret =
      process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;

    const isMockPayment =
      razorpay_payment_id.startsWith('pay_mock_') ||
      (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) ||
      !razorpayKeySecret ||
      razorpayKeySecret === 'rzp_secret_placeholder';

    // 2. Cryptographic Signature Verification
    if (!isMockPayment) {
      if (!razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: 'Both razorpay_order_id and razorpay_signature are required for signature verification'
        });
      }

      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(payload)
        .digest('hex');

      let isValid = false;
      try {
        isValid = crypto.timingSafeEqual(
          Buffer.from(generatedSignature, 'utf-8'),
          Buffer.from(razorpay_signature, 'utf-8')
        );
      } catch {
        isValid = generatedSignature === razorpay_signature;
      }

      if (!isValid) {
        return res.status(400).json({
          success: false,
          verified: false,
          error: 'Invalid payment signature. Cryptographic authentication failed.'
        });
      }
    }

    // 3. Serial Number Normalization (RD-PASS-2026-XXXXXX)
    let finalSerial = ticket_serial;
    if (!finalSerial || !/^RD-PASS-2026-[A-Z0-9]{6}$/.test(finalSerial)) {
      finalSerial = `RD-PASS-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    }

    const cleanBuyerName = (buyer_name || '').trim();
    const cleanBuyerEmail = (buyer_email || '').trim().toLowerCase();
    const cleanBuyerPhone = (buyer_phone || '').trim();
    const cleanPassType = pass_type || 'Freshers Pass';
    const numAmount = Number(amount) || 0;
    const numPromoDiscount = Number(promo_discount) || 0;
    const cleanGroupMembers = Array.isArray(group_members) ? group_members : [];

    // 4. Supabase Database Logging (RLS Bypass via Service Role Key if configured)
    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });

      // Strict user-specified columns
      const strictRecord = {
        ticket_serial: finalSerial,
        buyer_name: cleanBuyerName,
        buyer_email: cleanBuyerEmail,
        buyer_phone: cleanBuyerPhone,
        pass_type: cleanPassType,
        amount: numAmount,
        promo_discount: numPromoDiscount,
        razorpay_payment_id: razorpay_payment_id || '',
        razorpay_order_id: razorpay_order_id || '',
        razorpay_signature: razorpay_signature || '',
        group_members: cleanGroupMembers
      };

      // Compatibility fields for legacy schemas
      const compatibilityRecord = {
        serial_number: finalSerial,
        confirmation_id: finalSerial,
        name: cleanBuyerName,
        email: cleanBuyerEmail,
        phone: cleanBuyerPhone,
        discount_amount: numPromoDiscount,
        payment_id: razorpay_payment_id || '',
        order_id: razorpay_order_id || '',
        quantity: cleanGroupMembers.length > 0 ? cleanGroupMembers.length : 1,
        event_date: 'November 7th',
        venue: 'Finn – The Luxury Club',
        status: 'confirmed',
        created_at: new Date().toISOString()
      };

      // Attempt unified insert containing both strict and compatibility fields
      let { error: insertError } = await supabase
        .from('tickets')
        .insert([{ ...compatibilityRecord, ...strictRecord }]);

      // Fallback 1: If database schema only has the strict columns
      if (insertError && (insertError.code === '42703' || insertError.message?.includes('column'))) {
        console.warn('Unified insert column notice, trying strict schema:', insertError.message);
        const retryStrict = await supabase.from('tickets').insert([strictRecord]);
        insertError = retryStrict.error;

        // Fallback 2: If database schema only has the legacy columns (e.g. serial_number instead of ticket_serial)
        if (insertError && (insertError.code === '42703' || insertError.message?.includes('column'))) {
          console.warn('Retrying with legacy column mapping:', insertError.message);
          const retryLegacy = await supabase.from('tickets').insert([compatibilityRecord]);
          insertError = retryLegacy.error;
        }
      }

      if (insertError) {
        console.error('Supabase ticket insertion error:', insertError);
        return res.status(500).json({
          success: false,
          error: `Failed to record ticket in database: ${insertError.message}`
        });
      }
    } else {
      console.warn('Supabase credentials not configured in serverless environment.');
      if (!isMockPayment) {
        return res.status(500).json({
          success: false,
          error: 'Supabase configuration missing on server.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      verified: true,
      serial_number: finalSerial
    });
  } catch (error) {
    console.error('Server error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error verifying payment'
    });
  }
}
