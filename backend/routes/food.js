const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// Yeni yiyecek ekleme
router.post('/add', async (req, res) => {
  try {
    const { name, caloriesPer100g, type } = req.body;

    const newFood = new Food({ name, caloriesPer100g, type });
    await newFood.save();

    res.status(201).json({ message: 'Yiyecek başarıyla eklendi!' });
  } catch (error) {
    console.error('Yiyecek ekleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Tüm yiyecekleri listeleme
router.get('/', async (req, res) => {
  try {
    const foods = await Food.find();
    res.status(200).json(foods);
  } catch (error) {
    console.error('Yiyecekleri getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
