require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const http    = require('http');
const { Server } = require('socket.io');
const rateLimit  = require('express-rate-limit');

const authRoutes    = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes   = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes   = require('./routes/admin.routes');
const uploadRoutes  = require('./routes/upload.routes');

const app    = express();
const server = http.createServer(app);

// ── IMPORTANT: Trust proxy — required for Render, Railway, Vercel, etc.
// Without this, express-rate-limit crashes with X-Forwarded-For error
app.set('trust proxy', 1);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', process.env.CLIENT_URL].filter(Boolean),
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in routes
app.set('io', io);

// Allowed origins
const allowedOrigins = ['http://localhost:3000', process.env.CLIENT_URL].filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/upload',   uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Tish Collection API running' });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log('Admin joined admin-room');
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready`);
  console.log(`🌍 Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = { io };
