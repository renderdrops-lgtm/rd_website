import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Lock, 
  Share2, 
  Users, 
  PartyPopper,
  Music,
  Wine,
  Camera,
  QrCode,
  Tag,
  Check,
  X,
  Phone,
  User,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import CustomCursor from './CustomCursor';
import logoImg from '../assets/logo.png';

// Official Partner and Venue Logos from Supabase Storage
const PARTNER_LOGOS = [
  {
    name: 'RenderDrops',
    role: 'Official Digital Partner',
    url: 'https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rdddd/rd_new.webp'
  },
  {
    name: 'Velvet Vault',
    role: 'Official Presenter',
    url: 'https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rdddd/velvet%20vault.webp'
  },
  {
    name: 'AR Events',
    role: 'Event Partner',
    url: 'https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rdddd/ar%20events.webp'
  },
  {
    name: 'Finn (The Luxury Club)',
    role: 'Official Venue',
    url: 'https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rdddd/finn%20the%20luxury%20club.webp'
  }
];

// Official Event Poster from Supabase Storage
const SUPABASE_POSTER_STORAGE_URL = "https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rdddd/official%20poster%20.webp";

// Official Promo Code Specification
const VALID_PROMO_CODE = 'TXJAS.AFTDARK7';

// Exact Pricing Tiers with Promo Discounts
const PRICING_TIERS = [
  {
    id: 'early-bird',
    title: 'Early Bird',
    badge: 'LIMITED ALLOCATION',
    badgeColor: 'amber',
    price: 449,
    promoDiscount: 50,
    discountedPrice: 399,
    admits: 1,
    perPerson: '₹449 / person',
    description: 'Single entry for early risers. Limited allocation available.',
    perks: [
      '1x General Admission',
      'Access to Main Dancefloor',
      'RenderDrops Aftermovie Feature',
      'Official Entry Wristband'
    ]
  },
  {
    id: 'stag',
    title: 'Stag Entry',
    badge: 'POPULAR',
    badgeColor: 'zinc',
    price: 549,
    promoDiscount: 50,
    discountedPrice: 499,
    admits: 1,
    perPerson: '₹549 / person',
    description: 'Individual general access pass for guys or girls ready to party.',
    perks: [
      '1x General Entry',
      'Access to All Club Floors',
      'Photo Booth & Media Wall Access',
      'Official Aftermovie Tag'
    ]
  },
  {
    id: 'couple',
    title: 'Couple Pass',
    badge: 'BEST VALUE',
    badgeColor: 'red',
    price: 899,
    promoDiscount: 50,
    discountedPrice: 849,
    admits: 2,
    perPerson: '₹450 / person',
    description: 'One pass valid for 2 guests (1 Male + 1 Female or Pair).',
    perks: [
      'Entry for 2 Attendees',
      'Priority Couple Queue Lane',
      'Welcome Drink Shooters',
      'Access to VIP Lounge Photo Spots'
    ]
  },
  {
    id: 'group-5',
    title: 'Group of 5',
    badge: 'CREW SAVINGS',
    badgeColor: 'amber',
    price: 2700,
    promoDiscount: 150,
    discountedPrice: 2550,
    admits: 5,
    perPerson: '₹540 / person',
    description: 'Squad pass for a group of 5. Save big together with expedited entry.',
    perks: [
      'Entry for 5 Friends',
      'Expedited Group Entry Lane',
      'Dedicated Table Allocation Priority',
      'Special Crew Reel Shoutout'
    ]
  },
  {
    id: 'group-10',
    title: 'Group of 10',
    badge: 'VIP CREW',
    badgeColor: 'amber',
    price: 5299,
    promoDiscount: 349,
    discountedPrice: 4950,
    admits: 10,
    perPerson: '₹530 / person',
    description: 'The ultimate crew pack. Bring the whole squad for maximum energy.',
    perks: [
      'Entry for 10 Attendees',
      'Exclusive Fast-Track VIP Lane',
      'Priority Seating & Section Access',
      'Dedicated Photographer Coverage Slot'
    ]
  }
];

// Dynamically load Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Generate unique serial number formatted as RD-PASS-2026-XXXXXX
const generateSerialNumber = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RD-PASS-2026-${rand}`;
};

export default function FreshersPass({ onBackToHome }) {
  const [selectedTier, setSelectedTier] = useState(PRICING_TIERS[0]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  
  // Group members array for multi-attendee tiers (Couple, Group of 5, Group of 10)
  const [groupMembers, setGroupMembers] = useState([]);
  
  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [posterError, setPosterError] = useState(false);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update group members array whenever selectedTier changes
  useEffect(() => {
    if (selectedTier.admits > 1) {
      setGroupMembers(prev => {
        const next = [];
        for (let i = 0; i < selectedTier.admits; i++) {
          if (i === 0) {
            next.push({
              name: prev[0]?.name || formData.name,
              phone: prev[0]?.phone || formData.phone
            });
          } else {
            next.push({
              name: prev[i]?.name || '',
              phone: prev[i]?.phone || ''
            });
          }
        }
        return next;
      });
    } else {
      setGroupMembers([]);
    }
  }, [selectedTier.admits]);

  // Synchronize Guest 1 with primary buyer details
  useEffect(() => {
    if (selectedTier.admits > 1) {
      setGroupMembers(prev => {
        if (!prev.length) return prev;
        const copy = [...prev];
        copy[0] = {
          name: formData.name,
          phone: formData.phone
        };
        return copy;
      });
    }
  }, [formData.name, formData.phone, selectedTier.admits]);

  // Calculate pricing & discount
  const isPromoApplied = appliedPromo === VALID_PROMO_CODE;
  const currentDiscount = isPromoApplied ? selectedTier.promoDiscount : 0;
  const finalPrice = Math.max(0, selectedTier.price - currentDiscount);

  // Promo code submission handler
  const handleApplyPromo = (e) => {
    e?.preventDefault();
    setPromoError('');
    const cleanCode = promoInput.trim().toUpperCase();

    if (!cleanCode) {
      setPromoError('Please enter a promo code');
      return;
    }

    if (cleanCode === VALID_PROMO_CODE) {
      setAppliedPromo(cleanCode);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Please check your code and try again.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  // Group member change handler
  const handleGroupMemberChange = (index, field, value) => {
    setGroupMembers(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: field === 'phone' ? value.replace(/[^0-9]/g, '') : value
      };
      return copy;
    });
  };

  // Comprehensive validation
  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please enter primary attendee name';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email address';
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = 'Valid 10-digit WhatsApp phone number is required';
    }

    // Validate group members for Group of 5 and Group of 10
    if (selectedTier.admits > 1) {
      const groupErrs = [];
      groupMembers.forEach((member, i) => {
        if (i === 0) return; // Primary buyer is already validated
        const mErr = {};
        if (!member.name || !member.name.trim()) {
          mErr.name = `Guest ${i + 1} name is required`;
        }
        const mPhone = (member.phone || '').replace(/[^0-9]/g, '');
        if (!mPhone || mPhone.length < 10) {
          mErr.phone = `Valid 10-digit phone is required for Guest ${i + 1}`;
        }
        if (Object.keys(mErr).length > 0) {
          groupErrs[i] = mErr;
        }
      });
      if (groupErrs.length > 0) {
        errs.groupMembers = groupErrs;
      }
    }

    return errs;
  };

  // Complete ticket fulfillment logic (Supabase backend ONLY - no local storage!)
  const fulfillTicket = async (paymentId, orderId = null) => {
    const serialNumber = generateSerialNumber();

    // Prepare complete guest list
    const finalGuestList = (selectedTier.admits > 1)
      ? groupMembers.map((m, idx) => ({
          guest_number: idx + 1,
          name: idx === 0 ? formData.name.trim() : (m.name || '').trim(),
          phone: idx === 0 ? formData.phone.trim() : (m.phone || '').trim()
        }))
      : [
          {
            guest_number: 1,
            name: formData.name.trim(),
            phone: formData.phone.trim()
          }
        ];

    const ticketRecord = {
      serial_number: serialNumber,
      confirmation_id: serialNumber,
      buyer_name: formData.name.trim(),
      name: formData.name.trim(),
      buyer_email: formData.email.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      buyer_phone: formData.phone.trim(),
      phone: formData.phone.trim(),
      pass_type: selectedTier.title,
      quantity: selectedTier.admits,
      original_amount: selectedTier.price,
      amount: finalPrice,
      discount_amount: currentDiscount,
      promo_code: isPromoApplied ? VALID_PROMO_CODE : null,
      payment_id: paymentId,
      order_id: orderId,
      group_members: finalGuestList,
      event_date: 'November 7th',
      venue: 'Finn – The Luxury Club',
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    // Store securely directly in Supabase tickets table (no local storage!)
    try {
      const { error } = await supabase.from('tickets').insert([ticketRecord]);
      if (error) {
        console.warn('Note on Supabase tickets table insert:', error.message);
      }
    } catch (dbErr) {
      console.warn('Supabase insert note:', dbErr);
    }

    // Display the digital pass view
    setConfirmedTicket(ticketRecord);
    setIsProcessing(false);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setPaymentError(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const el = document.getElementById('checkout-form');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setErrors({});
    setIsProcessing(true);

    // 1. Load Razorpay script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setPaymentError('Failed to load Razorpay checkout. Please check your network connection.');
      setIsProcessing(false);
      return;
    }

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const amountInPaise = Math.round(finalPrice * 100);

    // 2. Call Vercel serverless order creation endpoint
    let serverOrderId = null;
    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            pass_tier: selectedTier.title,
            promo_code: isPromoApplied ? VALID_PROMO_CODE : 'none',
            buyer_phone: formData.phone
          }
        })
      });

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData.success && orderData.order?.id) {
          serverOrderId = orderData.order.id;
        }
      }
    } catch (apiErr) {
      console.warn('Serverless order creation notice (will proceed with client checkout fallback):', apiErr);
    }

    // 3. Fallback for mock/test keys in local development
    const isMockKey = !keyId || keyId === 'rzp_test_placeholder' || keyId.startsWith('rzp_test_mock');

    if (isMockKey) {
      const confirmSim = window.confirm(
        `[TEST MODE]\nRazorpay Merchant Key is currently set to placeholder (${keyId}).\n\nOrder Amount: ₹${finalPrice} (${amountInPaise} paise)\nPromo Code: ${isPromoApplied ? VALID_PROMO_CODE + ' (Applied)' : 'None'}\n\nProceed to simulate successful payment and generate your Digital Pass?`
      );

      if (confirmSim) {
        setTimeout(async () => {
          const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await fulfillTicket(mockPaymentId, serverOrderId || `order_mock_${Date.now()}`);
        }, 1000);
        return;
      } else {
        setIsProcessing(false);
        setPaymentError('Payment simulation cancelled. Live Razorpay key needed for live gateway.');
        return;
      }
    }

    // 4. Configure Razorpay modal options
    const options = {
      key: keyId,
      amount: amountInPaise,
      currency: 'INR',
      name: 'RenderDrops Presents',
      description: `Freshers Party Pass - ${selectedTier.title}${isPromoApplied ? ' (Promo Applied)' : ''}`,
      image: 'https://drslbdiwzpfsgzmishhq.supabase.co/storage/v1/object/public/rdddd/renderdrops.webp',
      order_id: serverOrderId || undefined,
      handler: async function (response) {
        if (response.razorpay_payment_id) {
          // Verify signature via serverless endpoint if present
          if (response.razorpay_signature && serverOrderId) {
            try {
              await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id || serverOrderId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
            } catch (vErr) {
              console.warn('Payment verification endpoint warning:', vErr);
            }
          }
          await fulfillTicket(response.razorpay_payment_id, response.razorpay_order_id || serverOrderId);
        } else {
          setPaymentError('Payment completed but verification ID is missing.');
          setIsProcessing(false);
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      notes: {
        pass_tier: selectedTier.title,
        venue: 'Finn – The Luxury Club',
        date: 'November 7th',
        admits: selectedTier.admits,
        promo_code: isPromoApplied ? VALID_PROMO_CODE : 'NONE'
      },
      theme: {
        color: '#E31B2E',
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        }
      }
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (resp) {
        console.error('Razorpay payment failed:', resp.error);
        setPaymentError(resp.error?.description || 'Payment was unsuccessful or cancelled.');
        setIsProcessing(false);
      });
      rzpInstance.open();
    } catch (initErr) {
      console.error('Razorpay launch error:', initErr);
      setPaymentError('Could not initialize Razorpay modal: ' + initErr.message);
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReturnHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.href = '/';
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. DIGITAL PASS SCREEN (On Successful Payment)
  // ─────────────────────────────────────────────────────────────────────────────
  if (confirmedTicket) {
    const attendees = Array.isArray(confirmedTicket.group_members) ? confirmedTicket.group_members : [];

    return (
      <div className="min-h-screen bg-zinc-950 text-white py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-amber-500 selection:text-black">
        <CustomCursor />

        {/* Ambient luxury lighting */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl h-[250px] bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-2xl mx-auto relative z-10">
          
          {/* Header Action */}
          <div className="flex items-center justify-between mb-8 print:hidden">
            <button
              onClick={handleReturnHome}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Homepage</span>
            </button>
            <span className="text-[11px] font-mono uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>BOOKING CONFIRMED & VERIFIED</span>
            </span>
          </div>

          {/* Ticket Card Container */}
          <div 
            id="digital-pass-card"
            className="bg-zinc-900/95 border-2 border-amber-500/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(245,158,11,0.2)] overflow-hidden relative backdrop-blur-xl"
          >
            {/* Holographic Header Bar */}
            <div className="bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 p-4 text-black flex items-center justify-between font-mono text-xs font-black tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>OFFICIAL ADMIT PASS</span>
              </div>
              <span>RENDERDROPS EXCLUSIVE</span>
            </div>

            {/* Ticket Main Content */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Event Name & Tag */}
              <div className="text-center pb-6 border-b border-white/10">
                <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-amber-400 block mb-1">
                  // FINN LUXURY CLUB PRESENTATION
                </span>
                <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white leading-none">
                  FRESHERS PARTY <span className="text-amber-400">2026</span>
                </h1>
                <p className="text-xs text-zinc-400 font-mono mt-2">
                  BANGALORE'S PREMIER DAY PARTY EXPERIENCE
                </p>
              </div>

              {/* Event Quick Specs */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-950/70 p-4 rounded-2xl border border-white/5 font-mono text-xs">
                <div>
                  <span className="text-zinc-500 text-[10px] block mb-0.5">DATE & TIME</span>
                  <span className="text-amber-300 font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> November 7th
                  </span>
                  <span className="text-zinc-400 text-[11px] block mt-0.5">1 PM onwards · Day Party</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block mb-0.5">VENUE</span>
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> Finn – The Luxury Club
                  </span>
                  <span className="text-zinc-400 text-[11px] block mt-0.5">Bangalore, Karnataka</span>
                </div>
              </div>

              {/* Pass Tier & Attendee Information */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-400">Pass Category:</span>
                  <span className="text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                    {confirmedTicket.pass_type} (Admits {confirmedTicket.quantity || 1})
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-400">Primary Buyer:</span>
                  <span className="text-white font-bold">{confirmedTicket.buyer_name || confirmedTicket.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-400">Registered Phone:</span>
                  <span className="text-zinc-200">+{confirmedTicket.buyer_phone || confirmedTicket.phone}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-400">Email Confirmation:</span>
                  <span className="text-zinc-200">{confirmedTicket.buyer_email || confirmedTicket.email}</span>
                </div>
                
                {confirmedTicket.promo_code && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-400">Promo Code Applied:</span>
                    <span className="text-emerald-400 font-bold">{confirmedTicket.promo_code} (-₹{confirmedTicket.discount_amount})</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-400">Total Paid:</span>
                  <span className="text-emerald-400 font-black text-base">₹{confirmedTicket.amount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-400">Transaction ID:</span>
                  <span className="text-zinc-400 text-[10px] select-all">{confirmedTicket.payment_id}</span>
                </div>
              </div>

              {/* Group Guest List Breakdown */}
              {attendees.length > 0 && (
                <div className="bg-zinc-950/70 p-4 rounded-2xl border border-white/5 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                    <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Group Guest List Breakdown
                    </span>
                    <span className="text-zinc-400 text-[11px]">{attendees.length} Verified Guests</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {attendees.map((guest, idx) => (
                      <div key={idx} className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-500 block">GUEST #{guest.guest_number || idx + 1}</span>
                          <span className="font-bold text-white text-[11px]">{guest.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">+{guest.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Perforated Divider */}
              <div className="relative py-2">
                <div className="border-t-2 border-dashed border-white/15 w-full" />
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-950 border-r-2 border-amber-500/40" />
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-950 border-l-2 border-amber-500/40" />
              </div>

              {/* QR Code & Serial Number Section */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
                <div className="p-3 bg-white rounded-xl shadow-lg flex items-center justify-center shrink-0">
                  <div className="w-28 h-28 relative flex items-center justify-center bg-zinc-950 text-white rounded">
                    <QrCode className="w-24 h-24 text-amber-400" />
                  </div>
                </div>

                <div className="text-center sm:text-left space-y-1 flex-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                    UNIQUE PASS SERIAL NUMBER (KEEP HANDY)
                  </span>
                  <div className="font-mono text-xl font-black text-amber-400 tracking-wider select-all bg-zinc-950 px-3.5 py-2 rounded-xl border border-amber-500/40 inline-block">
                    {confirmedTicket.serial_number}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                    Present this digital pass or serial at the Finn reception counter on <strong>November 7th</strong> for wristband redemption.
                  </p>
                </div>
              </div>

              {/* Partner Badges Strip on Ticket */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-5">
                {PARTNER_LOGOS.map((partner) => (
                  <div key={partner.name} className="flex flex-col items-center gap-1.5 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
                    <img 
                      src={partner.url} 
                      alt={partner.name} 
                      className="h-6 w-auto object-contain max-w-[90px]" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="text-center">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-amber-400 block leading-none">{partner.role}</span>
                      <span className="text-[8px] font-mono uppercase tracking-wide text-zinc-500 block leading-none mt-0.5">{partner.name}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom Security Footer */}
            <div className="bg-zinc-950 p-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                VERIFIED CRYPTOGRAPHIC PASS
              </span>
              <span>RENDERDROPS X FINN</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download / Print Digital Pass</span>
            </button>
            <button
              onClick={() => {
                setConfirmedTicket(null);
                setFormData({ name: '', email: '', phone: '' });
                setGroupMembers([]);
                setAppliedPromo(null);
              }}
              className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-colors cursor-pointer"
            >
              Book Another Pass
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. MAIN FRESHERS PASS SUBPAGE
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500 selection:text-black relative overflow-x-clip">
      <CustomCursor />

      {/* Luxury Ambient Lighting Layers */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] bg-gradient-to-b from-amber-500/10 via-red-600/8 to-transparent blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-[600px] -right-20 w-[450px] h-[450px] bg-amber-500/6 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-[1200px] -left-20 w-[450px] h-[450px] bg-red-600/6 blur-[150px] pointer-events-none rounded-full" />

      {/* Top Navbar Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-xl border-b border-white/10 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleReturnHome}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors p-1.5 -ml-1 rounded hover:bg-white/5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Studio</span>
            </button>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <a href="/" onClick={(e) => { e.preventDefault(); handleReturnHome(); }} className="flex items-center gap-2">
              <img src={logoImg} alt="RenderDrops" className="h-8 w-auto object-contain" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              OFFICIAL FRESHERS PASS
            </span>
            <a
              href="#passes"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black tracking-widest uppercase rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              BOOK PASSES
            </a>
            <a
              href="/admin/passes"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/admin/passes');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="p-2 bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-zinc-500 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
              title="Organizers Gate Console"
              aria-label="Organizers Gate Console"
            >
              <Lock className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-24 relative z-10 space-y-20">
        
        {/* ── Section 1: Hero Showcase & Event Presentation ── */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-red-600/10 to-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-[0.25em] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>RENDERDROPS PRESENTS</span>
          </div>

          <h1 className="font-display uppercase tracking-tight text-white leading-[0.9] text-5xl sm:text-7xl lg:text-8xl">
            THE FRESHERS <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-amber-200 bg-clip-text text-transparent">
              PARTY PASS
            </span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Bangalore's biggest freshers day party. A high-energy afternoon celebration with state-of-the-art sound, kinetic laser fixtures, signature red carpet entrance, commercial hip-hop sets, and official RenderDrops cinematic after-movie shoot.
          </p>

          {/* Key Event Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-amber-500/20 backdrop-blur-md flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">EVENT DATE</span>
                <span className="text-base font-bold text-white block">November 7th</span>
                <span className="text-[11px] text-amber-400 font-mono">Day Party Special</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-red-500/20 backdrop-blur-md flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-600/10 text-red-500 border border-red-600/20 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">VENUE</span>
                <span className="text-base font-bold text-white block">Finn – Luxury Club</span>
                <span className="text-[11px] text-zinc-400 font-mono">Bangalore</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 text-zinc-300 border border-white/10 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">TIMINGS</span>
                <span className="text-base font-bold text-white block">1 PM Onwards</span>
                <span className="text-[11px] text-zinc-400 font-mono">Afternoon Day Party</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Partner & Venue Brand Integration ── */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-zinc-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="text-center mb-6 space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-amber-400 block font-bold">
                // OFFICIAL PARTNERS & HOST VENUE
              </span>
              <h3 className="font-display text-xl sm:text-2xl uppercase tracking-tight text-white">
                COLLABORATIVE LUXURY EXPERIENCE
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center">
              {PARTNER_LOGOS.map((partner) => (
                <div 
                  key={partner.name}
                  className="bg-zinc-950/80 border border-white/10 hover:border-amber-400/50 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 hover:scale-[1.03] group shadow-lg"
                >
                  <div className="h-14 sm:h-16 w-full flex items-center justify-center p-1">
                    <img
                      src={partner.url}
                      alt={partner.name}
                      className="max-h-full max-w-[130px] object-contain transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold block">
                      {partner.role}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white tracking-tight block mt-0.5">
                      {partner.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 3: Poster Showcase Container ── */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.1)] relative overflow-hidden">
            
            {/* Header tag */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  OFFICIAL EVENT POSTER & FLYER
                </div>
                <h3 className="font-display text-2xl uppercase tracking-tight text-white mt-1">
                  FINN – THE LUXURY CLUB x RENDERDROPS
                </h3>
              </div>
              <div className="text-xs font-mono text-zinc-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg shrink-0">
                STRICT ENTRY BY PASS ONLY
              </div>
            </div>

            {/* Poster Media Frame */}
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 group flex items-center justify-center">
              
              {!posterError && (
                <img
                  src={SUPABASE_POSTER_STORAGE_URL}
                  alt="Freshers Party Finn The Luxury Club Poster"
                  className={`w-full h-full object-cover transition-opacity duration-700 ${posterLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setPosterLoaded(true)}
                  onError={() => setPosterError(true)}
                />
              )}

              {/* Graphic Placeholder fallback */}
              {(!posterLoaded || posterError) && (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 p-8 flex flex-col justify-between items-center text-center">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="flex items-center justify-between w-full relative z-10">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                      [ SUPABASE STORAGE: rd_media/freshers_party_poster.png ]
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      NOVEMBER 7TH • BANGALORE
                    </span>
                  </div>

                  <div className="space-y-3 relative z-10 max-w-lg my-auto">
                    <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                      <Wine className="w-6 h-6" />
                    </div>
                    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-tight">
                      FINN — THE LUXURY CLUB
                    </h2>
                    <p className="text-zinc-400 text-xs sm:text-sm font-mono">
                      State-of-the-Art Sound • Kinetic Laser Fixtures • Red Carpet Entrance
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-500 font-mono text-[11px] relative z-10 border-t border-white/5 pt-4 w-full">
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <Music className="w-3.5 h-3.5 text-amber-400" /> Commercial & Hip-Hop Sets
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <Camera className="w-3.5 h-3.5 text-red-500" /> Live After-Movie Shoot
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <PartyPopper className="w-3.5 h-3.5 text-amber-400" /> Freshers Day Party Special
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── Section 4: Pricing Tiers Grid with Promo Code ── */}
        <div id="passes">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400">
              // SELECT YOUR ACCESS LEVEL
            </span>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
              PRICING TIERS & PASSES
            </h2>
            <p className="text-zinc-400 text-sm">
              All passes include entrance, wristband, club floor privileges, and digital confirmation pass.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {PRICING_TIERS.map((tier) => {
              const isSelected = selectedTier.id === tier.id;
              const hasDiscount = isPromoApplied;
              const displayPrice = hasDiscount ? tier.discountedPrice : tier.price;

              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`cursor-pointer rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden backdrop-blur-xl border ${
                    isSelected
                      ? 'bg-zinc-900 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.25)] scale-[1.02]'
                      : 'bg-zinc-900/50 border-white/10 hover:border-white/30 hover:bg-zinc-900/80'
                  }`}
                >
                  {/* Selected glow */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 blur-xl rounded-full pointer-events-none" />
                  )}

                  <div>
                    {/* Header: Title and Badge */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="font-display text-2xl uppercase tracking-tight text-white">
                        {tier.title}
                      </span>
                      <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        tier.badgeColor === 'amber'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : tier.badgeColor === 'red'
                          ? 'bg-red-600/10 border-red-600/30 text-red-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                      }`}>
                        {tier.badge}
                      </span>
                    </div>

                    {/* Price Display */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        {hasDiscount && (
                          <span className="text-zinc-500 text-xl font-mono line-through">
                            ₹{tier.price}
                          </span>
                        )}
                        <span className="font-display text-4xl sm:text-5xl text-white tracking-tight">
                          ₹{displayPrice}
                        </span>
                        <span className="text-zinc-500 text-xs font-mono">/ pass</span>
                      </div>

                      {hasDiscount ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                            SAVE ₹{tier.promoDiscount} WITH CODE
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            Admits: {tier.admits}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-400/90 block mt-0.5">
                          {tier.perPerson} • Admits: {tier.admits}
                        </span>
                      )}
                    </div>

                    <p className="text-zinc-400 text-xs leading-relaxed mb-6 border-b border-white/5 pb-4">
                      {tier.description}
                    </p>

                    {/* Inclusions list */}
                    <ul className="space-y-2.5 mb-8">
                      {tier.perks.map((perk, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Select CTA */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTier(tier);
                      const el = document.getElementById('checkout-form');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full py-3.5 rounded-xl font-extrabold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    <span>{isSelected ? 'Pass Selected ✓' : 'Select This Pass'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 5: Checkout & Booking Form with Razorpay & Group Guest Lists ── */}
        <div id="checkout-form" className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            
            <div className="text-center mb-8 space-y-2">
              <span className="text-xs uppercase tracking-[0.3em] font-mono text-amber-400 block">
                // SECURE CHECKOUT
              </span>
              <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-white">
                CONFIRM YOUR BOOKING
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Enter your attendee details. Passes will be generated instantly upon Razorpay payment verification.
              </p>
            </div>

            {/* Selected Tier Summary Strip */}
            <div className="bg-zinc-950/80 p-4 sm:p-5 rounded-2xl border border-white/10 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">SELECTED PASS</span>
                <span className="font-display text-xl text-white uppercase">{selectedTier.title}</span>
                <span className="text-xs text-amber-400 font-mono block mt-0.5">Admits {selectedTier.admits} Guest(s)</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">TOTAL AMOUNT</span>
                <div className="flex items-baseline gap-2 justify-end">
                  {isPromoApplied && (
                    <span className="text-zinc-500 text-sm font-mono line-through">₹{selectedTier.price}</span>
                  )}
                  <span className="font-display text-2xl sm:text-3xl text-white">₹{finalPrice}</span>
                </div>
                <span className="text-[10px] text-zinc-500 block">All taxes included</span>
              </div>
            </div>

            {/* Promo Code Input Box */}
            <div className="mb-8 p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800">
              <label className="block text-xs uppercase font-mono text-zinc-400 mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Have a Promo Code?</span>
              </label>

              {isPromoApplied ? (
                <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Code <strong>{VALID_PROMO_CODE}</strong> Applied! (-₹{currentDiscount} off)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-zinc-400 hover:text-white text-xs underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder=""
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoError('');
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 text-xs font-mono focus:outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-red-400 text-xs mt-2 font-mono">{promoError}</p>
              )}
            </div>

            {paymentError && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{paymentError}</p>
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-6">
              
              {/* Primary Buyer Details */}
              <div className="space-y-4">
                <div className="border-b border-zinc-800 pb-2">
                  <span className="text-xs uppercase font-mono text-amber-400 font-bold block">
                    01. PRIMARY BUYER DETAILS
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Ticket dispatch and payment confirmation will be sent here.
                  </span>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">
                    Primary Attendee Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder=""
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full bg-zinc-950 border rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 text-base sm:text-sm focus:outline-none transition-colors ${
                      errors.name ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-amber-400'
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1.5 font-mono">{errors.name}</p>}
                </div>

                {/* Email ID */}
                <div>
                  <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">
                    Email Address (For Digital Pass Confirmation) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder=""
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-zinc-950 border rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 text-base sm:text-sm focus:outline-none transition-colors ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-amber-400'
                    }`}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1.5 font-mono">{errors.email}</p>}
                </div>

                {/* Mandatory Phone Number */}
                <div>
                  <label className="block text-xs uppercase font-mono text-zinc-400 mb-2">
                    WhatsApp Phone Number (Entry Gate Verification) *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm pointer-events-none">
                      +91
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder=""
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                      className={`w-full bg-zinc-950 border rounded-xl pl-14 pr-4 py-3.5 text-white placeholder-zinc-600 text-base sm:text-sm focus:outline-none transition-colors ${
                        errors.phone ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-amber-400'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-xs mt-1.5 font-mono">{errors.phone}</p>}
                </div>
              </div>

              {/* Group Guest List Dynamic Input Fields (Group of 5, Group of 10, Couple) */}
              {selectedTier.admits > 1 && (
                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-mono text-amber-400 font-bold block">
                        02. GROUP GUEST LIST ({selectedTier.admits} ATTENDEES)
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Required for entry wristband assignment at the venue door.
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2 py-1 rounded">
                      Admits {selectedTier.admits}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {groupMembers.map((member, index) => {
                      if (index === 0) {
                        return (
                          <div key={index} className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between text-xs font-mono">
                            <div>
                              <span className="text-[10px] text-zinc-500 block">GUEST 1 (PRIMARY ATTENDEE)</span>
                              <span className="font-bold text-white">{formData.name || 'Primary Attendee'}</span>
                            </div>
                            <span className="text-zinc-400">+{formData.phone || 'Phone entered above'}</span>
                          </div>
                        );
                      }

                      const memberErr = errors.groupMembers?.[index] || {};

                      return (
                        <div key={index} className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-2xl space-y-3">
                          <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                            GUEST {index + 1} OF {selectedTier.admits} *
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder={`Guest ${index + 1} Name`}
                                value={member.name}
                                onChange={(e) => handleGroupMemberChange(index, 'name', e.target.value)}
                                className={`w-full bg-zinc-900 border rounded-xl px-3 py-2.5 text-white placeholder-zinc-600 text-xs focus:outline-none ${
                                  memberErr.name ? 'border-red-500' : 'border-zinc-800 focus:border-amber-400'
                                }`}
                              />
                              {memberErr.name && (
                                <p className="text-red-400 text-[10px] mt-1 font-mono">{memberErr.name}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                                Phone Number *
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs pointer-events-none">
                                  +91
                                </div>
                                <input
                                  type="tel"
                                  required
                                  maxLength={10}
                                  placeholder=""
                                  value={member.phone}
                                  onChange={(e) => handleGroupMemberChange(index, 'phone', e.target.value)}
                                  className={`w-full bg-zinc-900 border rounded-xl pl-11 pr-3 py-2.5 text-white placeholder-zinc-600 text-xs focus:outline-none ${
                                    memberErr.phone ? 'border-red-500' : 'border-zinc-800 focus:border-amber-400'
                                  }`}
                                />
                              </div>
                              {memberErr.phone && (
                                <p className="text-red-400 text-[10px] mt-1 font-mono">{memberErr.phone}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Security reassurance */}
              <div className="pt-2 flex items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-bit Secure Razorpay Payment Gateway (UPI / Cards / NetBanking)</span>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold uppercase tracking-widest rounded-xl text-sm transition-all shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Connecting Razorpay...</span>
                  </>
                ) : (
                  <>
                    <span>PAY ₹{finalPrice} & GET PASS</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

      </main>

      {/* Footer minimal with discreet organizer access */}
      <footer className="border-t border-white/10 py-8 px-4 text-center text-xs font-mono text-zinc-600 space-y-2">
        <p>© 2026 RenderDrops Creative Studio. Event hosted at Finn – The Luxury Club. Strictly 18+ entry.</p>
        <div className="pt-1">
          <a
            href="/admin/passes"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/admin/passes');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 opacity-40 hover:opacity-100 text-[11px]"
            title="Organizer Door Access Console"
          >
            <Lock className="w-3 h-3 text-zinc-600" />
            <span>Organizers Door Console</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
