/**
 * Facebook Webhook Routes
 * 
 * Handles two things:
 * 1. GET  /webhook - Verification (Facebook verifies your webhook URL)
 * 2. POST /webhook - Receive incoming messages from Messenger
 */

const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../services/messenger');

// ============ WEBHOOK VERIFICATION ============
// Facebook sends a GET request to verify your webhook URL
router.get('/', (req, res) => {
  // Facebook sends these query parameters
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Check if mode and token are correct
  if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    // Respond with the challenge to confirm verification
    res.status(200).send(challenge);
  } else {
    console.error('❌ Webhook verification failed. Token mismatch.');
    res.sendStatus(403);
  }
});

// ============ RECEIVE MESSAGES ============
// Facebook sends a POST request when someone messages your page
router.post('/', async (req, res) => {
  const body = req.body;

  // Verify this is a page subscription event
  if (body.object === 'page') {
    // Loop through each entry (there can be multiple)
    for (const entry of body.entry) {
      // Get the messaging events
      const messagingEvents = entry.messaging;

      if (messagingEvents) {
        for (const event of messagingEvents) {
          // Only process text messages (ignore read receipts, deliveries, etc.)
          if (event.message && event.message.text) {
            const senderId = event.sender.id;
            const messageText = event.message.text;
            const recipientId = event.recipient.id; // This is the Page ID

            console.log(`📩 Message received from ${senderId}: "${messageText}"`);

            // Process the message and send auto-reply if keyword matches
            await handleIncomingMessage(senderId, messageText, recipientId);
          }
        }
      }
    }

    // Always respond with 200 OK to acknowledge receipt
    // (Facebook will retry if you don't respond quickly)
    res.sendStatus(200);
  } else {
    // Not a page event, return 404
    res.sendStatus(404);
  }
});

module.exports = router;
