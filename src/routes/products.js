/**
 * Products/Services API Routes
 * 
 * GET    /api/products       - Get user's products
 * POST   /api/products       - Add product
 * PUT    /api/products/:id   - Update product
 * DELETE /api/products/:id   - Delete product
 */

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Product name is required' });

    const product = await Product.create({
      userId: req.user._id,
      name, description, price, category
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, userId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const { name, description, price, category, isAvailable } = req.body;
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;

    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
