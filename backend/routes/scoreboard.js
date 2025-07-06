const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Score = require("../models/Score");
const authenticateToken = require("../middlewares/authenticateToken");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const trainerId = currentUser.role === "trainer" ? currentUser._id : currentUser.trainerId;

    if (!trainerId) {
      return res.status(403).json({ message: "Trainer bilgisi eksik." });
    }

    const trainerObjectId = new mongoose.Types.ObjectId(trainerId);

    const users = await User.find({
      $or: [
        { _id: trainerObjectId },
        { trainerId: trainerObjectId }
      ]
    }).select("username _id");

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const scoreboard = await Promise.all(users.map(async user => {
      const scores = await Score.find({
        studentId: user._id,
        date: { $gte: sevenDaysAgo, $lte: now }
      });

      const totalPoints = scores.reduce((sum, s) => sum + s.score, 0);

      return {
        userId: user._id,
        username: user.username,
        totalPoints
      };
    }));

    scoreboard.sort((a, b) => b.totalPoints - a.totalPoints);
    res.json(scoreboard);

  } catch (err) {
    console.error("Scoreboard hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
