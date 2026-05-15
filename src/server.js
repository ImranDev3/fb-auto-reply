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

// Create Express app
const app = express();

// ============ MIDDLEWARE ============

// Parse JSON request bodies
app.use(express.json());

// Enable CORS (allows frontend to talk to backend)
app.use(cors());

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

// Serve the dashboard at root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
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
