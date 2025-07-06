const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Score = require("../models/Score");
const ExerciseLog = require("../models/ExerciseLog");
const verifyTrainer = require("../middlewares/verifyTrainer");

// Öğrencinin geçmiş puanlarını getir
router.get("/student/:studentId/scores", verifyTrainer, async (req, res) => {
  try {
    const scores = await Score.find({ studentId: req.params.studentId }).sort({ date: -1 });
    res.json(scores);
  } catch (error) {
    console.error("❌ Puanları çekerken hata:", error.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Haftalık Puan Sıralaması (Leaderboard)
router.get("/leaderboard", verifyTrainer, async (req, res) => {
  try {
    const students = await User.find({ trainerId: req.userId, role: "member" }).select("-password");

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const leaderboard = await Promise.all(
      students.map(async (student) => {
        const scores = await Score.find({
          studentId: student._id,
          date: { $gte: sevenDaysAgo, $lte: now },
        });

        const totalPoints = scores.reduce((sum, item) => sum + item.score, 0);

        return {
          id: student._id,
          username: student.username,
          totalPoints,
        };
      })
    );

    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    res.json(leaderboard);
  } catch (error) {
    console.error("❌ Leaderboard verisi çekilemedi:", error.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Trainer kendi öğrencilerini listeler
router.get("/students", verifyTrainer, async (req, res) => {
  try {
    const students = await User.find({ trainerId: req.userId, role: "member" }).select("-password");
    res.json(students);
  } catch (error) {
    console.error("Öğrencileri çekerken hata:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// Öğrencinin bugünkü yemek kayıtlarını getirir
router.get("/student/:studentId/today-calories", verifyTrainer, async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.studentId, trainerId: req.userId });

    if (!student) {
      return res.status(404).json({ message: "Öğrenci bulunamadı veya yetkiniz yok." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLog = student.caloriesLog.find(
      (log) => new Date(log.date).setHours(0,0,0,0) === today.getTime()
    );

    res.json(todayLog || { date: today, foods: [] });
  } catch (error) {
    console.error("❌ Öğrencinin yemek kayıtlarını çekme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// Öğrencinin bugünkü egzersiz kayıtlarını getirir
router.get("/student/:studentId/today-exercises", verifyTrainer, async (req, res) => {
  try {
    const logs = await ExerciseLog.find({
      userId: req.params.studentId,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }).populate("exerciseId", "name");

    res.json(logs);
  } catch (error) {
    console.error("❌ Öğrencinin egzersiz kayıtlarını çekme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// Trainer öğrencisine puan verir
router.post("/student/:studentId/score", verifyTrainer, async (req, res) => {
  try {
    const { score } = req.body;

    if (typeof score !== "number" || score < 0) {
      return res.status(400).json({ message: "Geçerli bir puan girin." });
    }

    const student = await User.findOne({ _id: req.params.studentId, trainerId: req.userId });

    if (!student) {
      return res.status(404).json({ message: "Öğrenci bulunamadı veya yetkiniz yok." });
    }

    student.points += score;
    await student.save();

    const newScore = new Score({
      trainerId: req.userId,
      studentId: student._id,
      score,
    });
    await newScore.save();

    res.json({ message: "Puan başarıyla verildi.", totalPoints: student.points });
  } catch (error) {
    console.error("Puan verirken hata:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;
