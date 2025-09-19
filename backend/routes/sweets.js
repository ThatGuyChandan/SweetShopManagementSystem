const express = require('express');
const router = express.Router();
const Sweet = require('../models/Sweet');
const { auth, admin } = require('../middleware/auth');

// @route   POST /api/sweets
// @desc    Add a new sweet
// @access  Private (Admin only)
router.post('/', auth, admin, async (req, res) => {
  const { name, category, price, quantity } = req.body;

  try {
    const newSweet = new Sweet({
      name,
      category,
      price,
      quantity,
    });

    const sweet = await newSweet.save();
    res.json(sweet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sweets
// @desc    Get all sweets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const sweets = await Sweet.find();
    res.json(sweets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/sweets/search
// @desc    Search for sweets by name, category, or price range
// @access  Private
router.get('/search', auth, async (req, res) => {
  const { name, category, minPrice, maxPrice } = req.query;
  const query = {};

  if (name) {
    query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
  }
  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      query.price.$lte = parseFloat(maxPrice);
    }
  }

  try {
    const sweets = await Sweet.find(query);
    res.json(sweets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/sweets/:id
// @desc    Update a sweet
// @access  Private (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
  const { name, category, price, quantity } = req.body;

  // Build sweet object
  const sweetFields = {};
  if (name) sweetFields.name = name;
  if (category) sweetFields.category = category;
  if (price) sweetFields.price = price;
  if (quantity) sweetFields.quantity = quantity;

  try {
    let sweet = await Sweet.findById(req.params.id);

    if (!sweet) return res.status(404).json({ msg: 'Sweet not found' });

    sweet = await Sweet.findByIdAndUpdate(
      req.params.id,
      { $set: sweetFields },
      { new: true }
    );

    res.json(sweet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/sweets/:id
// @desc    Delete a sweet
// @access  Private (Admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);

    if (!sweet) return res.status(404).json({ msg: 'Sweet not found' });

    await Sweet.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Sweet removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
