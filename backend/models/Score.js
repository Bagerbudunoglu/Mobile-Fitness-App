const mongoose = require("mongoose");
const ScoreSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now, // Otomatik bugün kaydeder
  },
  score: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Score", ScoreSchema);
