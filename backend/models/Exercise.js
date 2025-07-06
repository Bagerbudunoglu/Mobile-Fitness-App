const mongoose = require("mongoose");

const ExerciseSchema = new mongoose.Schema({
  muscle: { type: String, required: true },      // Örn: Biceps
  name: { type: String, required: true },        // Örn: Barbell Curl
  videoLocal: { type: String },                    // Video bağlantısı
  description: { type: String },                 // Açıklama
  equipment: { type: String },                   // Dumbbell, Barbell, vs.
});

module.exports = mongoose.model("Exercise", ExerciseSchema);
