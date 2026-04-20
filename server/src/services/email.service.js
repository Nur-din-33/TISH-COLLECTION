const nodemailer = require('nodemailer');

const COMPANY = process.env.COMPANY_NAME  || 'DropKE';
const FROM    = process.env.EMAIL_USER    || 'noreply@dropke.co.ke';

const getTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const baseStyle = `font-family:sans-serif;max-width:520px;margin:auto;padding:28px;border:1px solid #eee;border-radius:10px`;
const logo      = `<div style="margin-bottom:16px"><span style="font-size:26px;font-weight:800;color:#bb0000">Drop</span><span style="font-size:26px;font-weight:800;color:#006600">KE</span></div>`;
const footer    = `<hr style="border:none;border-top:1px solid #eee;margin:20px 0"/><p style="color:#aaa;font-size:11px">${COMPANY} · ${process.env.COMPANY_ADDRESS||'Nairobi, Kenya'} · <a href="mailto:${process.env.COMPANY_EMAIL||FROM}" style="color:#aaa">${process.env.COMPANY_EMAIL||FROM}</a></p>`;

// ── Email verification code ────────────────────────────────────────────────
const sendVerificationEmail = async ({ to, name, code }) => {
  await getTransporter().sendMail({
    from: `"${COMPANY}" <${FROM}>`,
    to,
    subject: `${code} — Verify your ${COMPANY} account`,
    html: `<div style="${baseStyle}">${logo}
      <h2 style="color:#222;margin-bottom:4px">Verify your email</h2>
      <p style="color:#555">Hi <strong>${name}</strong>, use the code below to complete your registration:</p>
      <div style="margin:24px 0;text-align:center">
        <span style="display:inline-block;font-size:40px;font-weight:800;letter-spacing:12px;color:#bb0000;background:#fff5f5;padding:16px 32px;border-radius:10px;border:2px dashed #bb0000">${code}</span>
      </div>
      <p style="color:#888;font-size:13px;text-align:center">This code expires in <strong>15 minutes</strong>. Do not share it with anyone.</p>
      ${footer}</div>`,
  });
};

// ── Password reset ─────────────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ to, name, resetLink }) => {
  await getTransporter().sendMail({
    from: `"${COMPANY} Support" <${FROM}>`,
    to,
    subject: `Reset your ${COMPANY} password`,
    html: `<div style="${baseStyle}">${logo}
      <h2 style="color:#bb0000">Password Reset</h2>
      <p>Hi <strong>${name}</strong>, click below to set a new password:</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${resetLink}" style="display:inline-block;padding:14px 28px;background:#bb0000;color:white;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Reset My Password</a>
      </div>
      <p style="color:#888;font-size:12px;text-align:center">Link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
      ${footer}</div>`,
  });
};

// ── Admin login alert ──────────────────────────────────────────────────────
const sendLoginNotificationToAdmin = async ({ userName, userEmail, userPhone, loginTime }) => {
  await getTransporter().sendMail({
    from: `"${COMPANY} System" <${FROM}>`,
    to: process.env.ADMIN_EMAIL || FROM,
    subject: `🔔 Login alert: ${userName}`,
    html: `<div style="${baseStyle}">${logo}
      <h2 style="color:#006600">👤 User Login</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px;color:#666;width:110px">Name</td><td style="padding:8px;font-weight:700">${userName}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Email</td><td style="padding:8px">${userEmail}</td></tr>
        <tr><td style="padding:8px;color:#666">Phone</td><td style="padding:8px">${userPhone||'—'}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Time</td><td style="padding:8px">${loginTime}</td></tr>
      </table>
      <div style="margin-top:16px"><a href="${process.env.CLIENT_URL}/admin" style="display:inline-block;padding:10px 20px;background:#006600;color:white;border-radius:6px;text-decoration:none;font-size:13px">View Dashboard</a></div>
      ${footer}</div>`,
  });
};

// ── Welcome email ──────────────────────────────────────────────────────────
const sendWelcomeEmail = async ({ to, name }) => {
  await getTransporter().sendMail({
    from: `"${COMPANY}" <${FROM}>`,
    to,
    subject: `Welcome to ${COMPANY}! 🎉`,
    html: `<div style="${baseStyle}">${logo}
      <h2 style="color:#bb0000">Welcome, ${name}! 🇰🇪</h2>
      <p>Your account is verified. You can now shop, pay with M-Pesa, and track orders.</p>
      <div style="text-align:center;margin:20px 0"><a href="${process.env.CLIENT_URL}/products" style="display:inline-block;padding:14px 28px;background:#bb0000;color:white;border-radius:8px;text-decoration:none;font-weight:700">Start Shopping</a></div>
      <p style="color:#888;font-size:12px">Questions? Contact us at <a href="mailto:${process.env.COMPANY_EMAIL||FROM}">${process.env.COMPANY_EMAIL||FROM}</a> or WhatsApp ${process.env.COMPANY_WHATSAPP||''}</p>
      ${footer}</div>`,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendLoginNotificationToAdmin, sendWelcomeEmail };
