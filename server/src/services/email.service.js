// Email service using Resend (https://resend.com)
// Works on Render free tier — uses HTTPS not SMTP
// Render blocks SMTP (Gmail), but Resend uses HTTP API
// Free plan: 3,000 emails/month

const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL    = process.env.EMAIL_FROM || 'onboarding@resend.dev'; // Use your domain once verified
const COMPANY       = process.env.COMPANY_NAME || 'DropKE';
const CLIENT_URL    = process.env.CLIENT_URL || 'http://localhost:3000';

// Send email via Resend HTTP API
const sendEmail = ({ to, subject, html }) => {
  return new Promise((resolve, reject) => {
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set — skipping email');
      return resolve({ skipped: true });
    }

    const body = JSON.stringify({
      from: `${COMPANY} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Resend API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('Email request timeout'));
    });
    req.write(body);
    req.end();
  });
};

const baseStyle = `font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;border:1px solid #eee;border-radius:10px`;
const logo      = `<div style="margin-bottom:16px"><span style="font-size:26px;font-weight:800;color:#bb0000">${COMPANY.slice(0, 4)}</span><span style="font-size:26px;font-weight:800;color:#006600">${COMPANY.slice(4)}</span></div>`;
const footer    = `<hr style="border:none;border-top:1px solid #eee;margin:20px 0"/><p style="color:#aaa;font-size:11px">${COMPANY} · ${process.env.COMPANY_ADDRESS || 'Nairobi, Kenya'}</p>`;

// ── Email verification code ──────────────────────────────────────────────────
const sendVerificationEmail = async ({ to, name, code }) => {
  return sendEmail({
    to,
    subject: `${code} — Verify your ${COMPANY} account`,
    html: `<div style="${baseStyle}">${logo}
      <h2 style="color:#222;margin-bottom:4px">Verify your email</h2>
      <p style="color:#555">Hi <strong>${name}</strong>, use this code to complete your registration:</p>
      <div style="margin:24px 0;text-align:center">
        <span style="display:inline-block;font-size:40px;font-weight:800;letter-spacing:12px;color:#bb0000;background:#fff5f5;padding:16px 32px;border-radius:10px;border:2px dashed #bb0000">${code}</span>
      </div>
      <p style="color:#888;font-size:13px;text-align:center">This code expires in <strong>15 minutes</strong>.</p>
      ${footer}</div>`,
  });
};

// ── Welcome email ────────────────────────────────────────────────────────────
const sendWelcomeEmail = async ({ to, name }) => {
  return sendEmail({
    to,
    subject: `Welcome to ${COMPANY}! 🎉`,
    html: `<div style="${baseStyle}">${logo}
      <h2 style="color:#bb0000">Welcome, ${name}! 🇰🇪</h2>
      <p>Your account is ready. Shop, pay with M-Pesa, and track your orders.</p>
      <div style="text-align:center;margin:20px 0">
        <a href="${CLIENT_URL}/products" style="display:inline-block;padding:14px 28px;background:#bb0000;color:white;border-radius:8px;text-decoration:none;font-weight:700">Start Shopping</a>
      </div>
      ${footer}</div>`,
  });
};

// ── Admin login alert ────────────────────────────────────────────────────────
const sendLoginNotificationToAdmin = async ({ userName, userEmail, userPhone, loginTime }) => {
  const adminEmail = process.env.ADMIN_EMAIL_NOTIFY || process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  return sendEmail({
    to: adminEmail,
    subject: `🔔 Login: ${userName}`,
    html: `<div style="${baseStyle}">${logo}
      <h2 style="color:#006600">👤 User Login</h2>
      <table style="width:100%;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:8px;color:#666;width:110px">Name</td><td style="padding:8px;font-weight:700">${userName}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Email</td><td style="padding:8px">${userEmail}</td></tr>
        <tr><td style="padding:8px;color:#666">Phone</td><td style="padding:8px">${userPhone || '—'}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Time</td><td style="padding:8px">${loginTime}</td></tr>
      </table>
      <div style="margin-top:16px">
        <a href="${CLIENT_URL}/admin" style="display:inline-block;padding:10px 20px;background:#006600;color:white;border-radius:6px;text-decoration:none;font-size:13px">View Dashboard</a>
      </div>
      ${footer}</div>`,
  });
};

// ── Password reset ───────────────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ to, name, resetLink }) => {
  return sendEmail({
    to,
    subject: `Reset your ${COMPANY} password`,
    html: `<div style="${baseStyle}">${logo}
      <h2 style="color:#bb0000">Password Reset</h2>
      <p>Hi <strong>${name}</strong>, click below to set a new password:</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${resetLink}" style="display:inline-block;padding:14px 28px;background:#bb0000;color:white;border-radius:8px;text-decoration:none;font-weight:700">Reset My Password</a>
      </div>
      <p style="color:#888;font-size:12px;text-align:center">Link expires in <strong>1 hour</strong>.</p>
      ${footer}</div>`,
  });
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendLoginNotificationToAdmin,
  sendPasswordResetEmail,
};
