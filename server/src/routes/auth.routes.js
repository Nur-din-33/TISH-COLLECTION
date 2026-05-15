const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const makeCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Safe email sender — never crashes the server if email fails
const safeEmail = async (fn) => {
  try {
    await fn();
  } catch (err) {
    console.error('Email failed (non-critical):', err.message);
  }
};

// Load email service safely
let emailService = null;
const getEmailService = () => {
  if (!emailService) {
    try {
      emailService = require('../services/email.service');
    } catch (err) {
      console.error('Email service not available:', err.message);
    }
  }
  return emailService;
};

// ── REGISTER ─────────────────────────────────────────────────────────────────
router.post('/register', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password, name, phone } = req.body;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyCode     = makeCode();
    const verifyExpiry   = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    const user = await prisma.user.create({
      data: {
        email, password: hashedPassword, name, phone,
        verifyCode, verifyExpiry, isVerified: false,
      },
    });

    // Send verification email — non-blocking, won't crash if it fails
    const svc = getEmailService();
    if (svc) {
      safeEmail(() => svc.sendVerificationEmail({ to: email, name, code: verifyCode }));
    } else {
      // No email service — auto-verify the user so they can still register
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, verifyCode: null, verifyExpiry: null },
      });
      const token = generateToken(user.id);
      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        skipVerification: true,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Account created! Check your email for a 6-digit verification code.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

// ── VERIFY EMAIL ──────────────────────────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { userId, code } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) {
      const token = generateToken(user.id);
      return res.json({ success: true, message: 'Already verified', token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }

    if (user.verifyCode !== code) {
      return res.status(400).json({ success: false, message: 'Incorrect code. Please try again.' });
    }
    if (new Date() > user.verifyExpiry) {
      return res.status(400).json({ success: false, message: 'Code expired. Please request a new one.' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true, verifyCode: null, verifyExpiry: null },
    });

    const token = generateToken(user.id);

    // Welcome email — non-blocking
    const svc = getEmailService();
    if (svc) safeEmail(() => svc.sendWelcomeEmail({ to: user.email, name: user.name }));

    // Notify admin
    req.app.get('io')?.to('admin-room').emit('user:registered', {
      name: user.name, email: user.email,
      time: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }),
    });

    res.json({
      success: true,
      message: 'Email verified! Welcome.',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// ── RESEND CODE ───────────────────────────────────────────────────────────────
router.post('/resend-code', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.json({ success: true, message: 'Already verified' });

    const verifyCode   = makeCode();
    const verifyExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.user.update({ where: { id: userId }, data: { verifyCode, verifyExpiry } });

    const svc = getEmailService();
    if (svc) {
      await safeEmail(() => svc.sendVerificationEmail({ to: user.email, name: user.name, code: verifyCode }));
      res.json({ success: true, message: 'New code sent to your email.' });
    } else {
      res.json({ success: false, message: 'Email service not configured. Contact support.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not resend code' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with that email. Please register first.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the 6-digit code.',
        userId: user.id,
        needsVerification: true,
      });
    }

    const token     = generateToken(user.id);
    const loginTime = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });

    req.app.get('io')?.to('admin-room').emit('user:loggedIn', {
      name: user.name, email: user.email, phone: user.phone, time: loginTime,
    });

    const svc = getEmailService();
    if (svc) {
      safeEmail(() => svc.sendLoginNotificationToAdmin({
        userName: user.name, userEmail: user.email, userPhone: user.phone, loginTime,
      }));
    }

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// ── GOOGLE OAUTH ──────────────────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const axios = require('axios');
    const gRes  = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const { email, name, picture, sub: googleId } = gRes.data;
    if (!email) return res.status(400).json({ success: false, message: 'Google account has no email' });

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email, name,
          password: await bcrypt.hash(googleId + process.env.JWT_SECRET, 12),
          googleId, avatar: picture, isVerified: true,
        },
      });
      const svc = getEmailService();
      if (svc) safeEmail(() => svc.sendWelcomeEmail({ to: email, name }));
      req.app.get('io')?.to('admin-room').emit('user:registered', {
        name, email, provider: 'Google',
        time: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }),
      });
    } else {
      if (!user.googleId) {
        await prisma.user.update({ where: { id: user.id }, data: { googleId, avatar: picture, isVerified: true } });
      }
      const loginTime = new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
      req.app.get('io')?.to('admin-room').emit('user:loggedIn', { name: user.name, email: user.email, provider: 'Google', time: loginTime });
      const svc = getEmailService();
      if (svc) safeEmail(() => svc.sendLoginNotificationToAdmin({ userName: user.name, userEmail: user.email, loginTime }));
    }

    const token = generateToken(user.id);
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Google auth error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Google sign-in failed' });
  }
});

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
router.post('/forgot-password', [body('email').isEmail()], async (req, res) => {
  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (!user) return;
    const resetToken  = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetExpiry } });
    const svc = getEmailService();
    if (svc) {
      await safeEmail(() => svc.sendPasswordResetEmail({
        to: user.email, name: user.name,
        resetLink: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`,
      }));
    }
  } catch (error) { console.error('Forgot password:', error); }
});

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
router.post('/reset-password', [body('token').notEmpty(), body('password').isLength({ min: 6 })], async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await prisma.user.findFirst({ where: { resetToken: token, resetExpiry: { gt: new Date() } } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(password, 12), resetToken: null, resetExpiry: null },
    });
    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch { res.status(500).json({ success: false, message: 'Password reset failed' }); }
});

// ── ME ────────────────────────────────────────────────────────────────────────
router.get('/me', require('../middleware/auth.middleware').authenticate, async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user.id, email: req.user.email, name: req.user.name, phone: req.user.phone, role: req.user.role, avatar: req.user.avatar },
  });
});

module.exports = router;
