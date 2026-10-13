// Vercel Serverless Function: Create Razorpay Order
// POST /api/create-order

export default async function handler(req, res) {
  // Set CORS headers
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
    const { amount, currency = 'INR', receipt, notes } = req.body || {};

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Valid amount in paise is required' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Graceful mock fallback if keys are missing or placeholders (for test/staging)
    if (!keyId || !keySecret || keyId === 'rzp_test_placeholder' || keySecret === 'rzp_secret_placeholder') {
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return res.status(200).json({
        success: true,
        mock: true,
        order: {
          id: mockOrderId,
          amount: Math.round(amount),
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          status: 'created'
        }
      });
    }

    // Call Razorpay API securely with Basic Auth
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: Math.round(amount), // in paise
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {}
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay API error:', data);
      return res.status(response.status).json({
        success: false,
        error: data.error?.description || 'Failed to create Razorpay order'
      });
    }

    return res.status(200).json({
      success: true,
      order: data
    });
  } catch (error) {
    console.error('Server error creating order:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error creating order'
    });
  }
}
