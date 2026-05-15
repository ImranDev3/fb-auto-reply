/**
 * Product/Service Model
 * 
 * Each user/client can add their products or services.
 * This data is used by Gemini AI to give accurate replies
 * about the client's business to their customers.
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Which user owns this product
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Product/Service name
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  // Description
  description: {
    type: String,
    default: ''
  },
  // Price
  price: {
    type: String,
    default: ''
  },
  // Category
  category: {
    type: String,
    default: ''
  },
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
