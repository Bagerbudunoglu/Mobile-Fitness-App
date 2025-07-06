const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true, 
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["member", "trainer"],
    default: "member",
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Aynı User modeline referans (bir trainer'ın id'si)
    default: null,
  },
  points: {
    type: Number,
    default: 0, // Puan sistemi için başlangıç 0
  },
  exercisesLog: [
    {
      date: { type: Date, default: Date.now },
      exercises: [
        {
          name: String,
          sets: Number,
          reps: Number,
        },
      ],
    },
  ],
  caloriesLog: [
    {
      date: { type: Date, default: Date.now },
      foods: [
        {
          name: String,
          grams: Number,
          calories: Number,
        },
      ],
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
