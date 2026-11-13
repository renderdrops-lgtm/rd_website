// Vercel Serverless Function: Short Film Crew & Cast Application
// POST /api/send-application
//
// Emails the application to the RenderDrops inbox. Nothing is stored anywhere else.
//
// Required Vercel environment variables:
//   GMAIL_USER          the Gmail account that sends the email (e.g. renderdrops@gmail.com)
//   GMAIL_APP_PASSWORD  a Google "App password" for that account (not the normal password)
// Optional:
//   APPLICATION_INBOX   where applications are sent (defaults to renderdrops@gmail.com)

import nodemailer from 'nodemailer';

const ROLES = ['Actor / Actress', 'Director / Assistant Director', 'Spot Corrector'];
const LANGUAGES = ['Tamil', 'Telugu', 'Kannada', 'English', 'Hindi', 'Malayalam'];
const AVAILABILITY = ['Weekdays', 'Weekends', 'Both'];
const MAX_TEXT = 2000;

/* ─── Input checks ──────────────────────────────────────────────────────── */

const str = (v, max = MAX_TEXT) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const pickList = (v, allowed) => (Array.isArray(v) ? allowed.filter((a) => v.includes(a)) : []);

export function cleanApplication(body = {}) {
  const app = {
    fullName: str(body.fullName, 120),
    srn: str(body.srn, 40).toUpperCase().replace(/\s+/g, ''),
    whatsapp: str(body.whatsapp, 20),
    branch: str(body.branch, 120),
    roles: pickList(body.roles, ROLES),
    languages: pickList(body.languages, LANGUAGES),
    experience: str(body.experience),
    workLink: str(body.workLink, 500),
    whyJoin: str(body.whyJoin),
    availability: AVAILABILITY.includes(body.availability) ? body.availability : '',
    canTravel: body.canTravel === 'Yes' || body.canTravel === 'No' ? body.canTravel : '',
  };

  const missing = [];
  if (!app.fullName) missing.push('full name');
  if (!app.srn) missing.push('SRN');
  if (!/^\+91[6-9]\d{9}$/.test(app.whatsapp)) missing.push('WhatsApp number');
  if (!app.branch) missing.push('branch');
  if (!app.roles.length) missing.push('role');
  if (!app.languages.length) missing.push('language');
  if (!app.experience) missing.push('experience');
  if (!app.workLink && !app.whyJoin) missing.push('work link or reason to join');
  if (!app.availability) missing.push('availability');
  if (!app.canTravel) missing.push('travel');

  return { app, missing };
}

/* ─── Email ─────────────────────────────────────────────────────────────── */

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function buildApplicationEmail(app, submittedAt = new Date()) {
  const submitted = submittedAt.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const sections = [
    [
      'Basic details',
      [
        ['Full name', app.fullName],
        ['SRN', app.srn],
        ['WhatsApp number', app.whatsapp],
        ['Branch', app.branch],
      ],
    ],
    [
      'Role and languages',
      [
        ['Applying for', app.roles.join(', ')],
        ['Languages', app.languages.join(', ')],
      ],
    ],
    [
      'Experience and work',
      [
        ['Experience', app.experience],
        ['Work link', app.workLink],
        ['Why they want to join', app.whyJoin],
      ],
    ],
    [
      'Availability',
      [
        ['Available on', app.availability],
        ['Can travel to locations', app.canTravel],
      ],
    ],
  ];

  const waDigits = app.whatsapp.replace(/\D/g, '');

  const valueHtml = (label, value) => {
    if (!value) return '<span style="color:#9a9a9a;">-</span>';
    if (label === 'Work link' && /^https?:\/\//i.test(value)) {
      return `<a href="${escapeHtml(value)}" style="color:#E31B2E;word-break:break-all;">${escapeHtml(value)}</a>`;
    }
    if (label === 'WhatsApp number') {
      return `<a href="https://wa.me/${waDigits}" style="color:#141414;">${escapeHtml(value)}</a>`;
    }
    return escapeHtml(value).replace(/\n/g, '<br>');
  };

  const sectionHtml = sections
    .map(
      ([title, rows]) => `
      <tr><td colspan="2" style="padding:22px 0 8px;border-bottom:1px solid #e2dfda;font:700 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#E31B2E;">${escapeHtml(title)}</td></tr>
      ${rows
        .map(
          ([label, value]) => `
      <tr>
        <td valign="top" style="padding:10px 16px 10px 0;width:170px;font:700 13px Arial,sans-serif;color:#777;">${escapeHtml(label)}</td>
        <td valign="top" style="padding:10px 0;font:14px/1.5 Arial,sans-serif;color:#141414;">${valueHtml(label, value)}</td>
      </tr>`
        )
        .join('')}`
    )
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px 12px;background:#f4f1ec;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;">
    <tr><td style="background:#141414;padding:22px 28px;border-bottom:4px solid #E31B2E;">
      <div style="font:700 12px Arial,sans-serif;letter-spacing:2px;color:#E31B2E;">RENDERDROPS</div>
      <div style="font:700 22px Arial,sans-serif;color:#f4f1ec;margin-top:6px;">Short film: crew &amp; cast application</div>
      <div style="font:12px Arial,sans-serif;color:#aaaaaa;margin-top:6px;">Received ${escapeHtml(submitted)} IST</div>
    </td></tr>
    <tr><td style="padding:4px 28px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${sectionHtml}
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `Short film: crew & cast application`,
    `Received ${submitted} IST`,
    ...sections.flatMap(([title, rows]) => [
      '',
      title.toUpperCase(),
      ...rows.map(([label, value]) => `${label}: ${value || '-'}`),
    ]),
  ].join('\n');

  return {
    subject: `Short film application: ${app.fullName} (${app.roles.join(', ')})`,
    html,
    text,
  };
}

/* ─── Handler ───────────────────────────────────────────────────────────── */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Hidden field real people never fill in; bots usually do
  if (body.website) {
    return res.status(200).json({ success: true });
  }

  const { app, missing } = cleanApplication(body);
  if (missing.length) {
    return res.status(400).json({ success: false, error: `Missing or invalid: ${missing.join(', ')}` });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error('send-application: GMAIL_USER / GMAIL_APP_PASSWORD are not set');
    return res.status(500).json({ success: false, error: 'Email is not configured on the server' });
  }

  try {
    const { subject, html, text } = buildApplicationEmail(app);
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    await transporter.sendMail({
      from: `"RenderDrops Website" <${user}>`,
      to: process.env.APPLICATION_INBOX || 'renderdrops@gmail.com',
      subject,
      text,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('send-application failed:', err);
    return res.status(502).json({ success: false, error: 'Could not send the application email' });
  }
}
