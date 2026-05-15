/**
 * FB Auto Reply SaaS - Main Server File
 * 
 * This is the entry point of the application.
 * It sets up Express server, connects to MongoDB,
 * and registers all routes.
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import route files
const webhookRoutes = require('./routes/webhook');
const rulesRoutes = require('./routes/rules');
const whatsappRoutes = require('./routes/whatsapp');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');

// Create Express app
const app = express();

// ============ MIDDLEWARE ============

// Parse JSON request bodies
app.use(express.json());

// Enable CORS (allows frontend to talk to backend)
app.use(cors());

// ============ PAGE ROUTES (before static) ============

// Landing page at root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'landing.html'));
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// How to Use / Documentation page
app.get('/how-to-use', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'how-to-use.html'));
});

// Legal pages
app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'privacy-policy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'terms.html'));
});

app.get('/refund-policy', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'refund-policy.html'));
});

// Dashboard (protected by frontend auth check)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Admin Panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============ ROUTES ============

// Facebook Webhook routes (verification + message receiving)
app.use('/webhook', webhookRoutes);

// WhatsApp Webhook routes
app.use('/whatsapp', whatsappRoutes);

// Auto-reply rules CRUD API
app.use('/api/rules', rulesRoutes);

// Settings API
app.use('/api/settings', settingsRoutes);

// Auth API (register, login, profile)
app.use('/api/auth', authRoutes);

// Admin API (manage users, subscriptions)
app.use('/api/admin', adminRoutes);

// Products/Services API
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'online',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 3000;

// Connect to MongoDB first, then start the server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📋 Dashboard: http://localhost:${PORT}`);
    console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
  });
});
