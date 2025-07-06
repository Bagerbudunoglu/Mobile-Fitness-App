const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  caloriesPer100g: { type: Number, required: true },
  type: { type: String, enum: ['karbonhidrat', 'yağ', 'protein'], required: true },
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
