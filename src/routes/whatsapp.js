/**
 * WhatsApp Webhook Routes
 * 
 * Handles:
 * 1. GET  /whatsapp/webhook - Verification (Meta verifies your webhook URL)
 * 2. POST /whatsapp/webhook - Receive incoming WhatsApp messages
 */

const express = require('express');
const router = express.Router();
const { handleWhatsAppMessage } = require('../services/whatsappService');

// ============ WEBHOOK VERIFICATION ============
// Meta sends a GET request to verify your webhook URL
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
    console.log('✅ WhatsApp Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.error('❌ WhatsApp Webhook verification failed.');
    res.sendStatus(403);
  }
});

// ============ RECEIVE WHATSAPP MESSAGES ============
router.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object) {
    // Loop through entries
    if (body.entry && body.entry.length > 0) {
      for (const entry of body.entry) {
        const changes = entry.changes;

        if (changes && changes.length > 0) {
          for (const change of changes) {
            if (change.field === 'messages') {
              const value = change.value;

              // Check if there are messages
              if (value.messages && value.messages.length > 0) {
                for (const message of value.messages) {
                  // Only process text messages
                  if (message.type === 'text') {
                    const phoneNumber = message.from; // Sender's phone number
                    const messageText = message.text.body;
                    const phoneNumberId = value.metadata.phone_number_id;

                    console.log(`📩 WhatsApp message from ${phoneNumber}: "${messageText}"`);

                    // Process and send auto-reply
                    await handleWhatsAppMessage(phoneNumberId, phoneNumber, messageText);
                  }
                }
              }
            }
          }
        }
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;
