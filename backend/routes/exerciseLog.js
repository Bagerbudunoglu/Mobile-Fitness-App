const express = require("express");
const router = express.Router();
const ExerciseLog = require("../models/ExerciseLog");
const authenticateToken = require("../middlewares/authenticateToken");

// ✅ Egzersiz kaydı ekleme (her iki rol için erişilebilir)
router.post("/", authenticateToken, async (req, res) => {
  const { exerciseId, sets } = req.body;
  const userId = req.user._id;

  if (!exerciseId || !sets) {
    return res.status(400).json({ message: "Tüm alanlar zorunludur." });
  }

  try {
    const newLog = new ExerciseLog({ userId, exerciseId, sets });
    await newLog.save();
    res.status(201).json({ message: "Egzersiz başarıyla kaydedildi." });
  } catch (err) {
    console.error("❌ Egzersiz kaydetme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası.", error: err });
  }
});

// ✅ Kullanıcının egzersiz kayıtları (isteğe bağlı tarih filtresiyle)
router.get("/user", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  const { date } = req.query;

  const query = { userId };

  if (date) {
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);
    query.date = { $gte: targetDate, $lt: nextDay };
  }

  try {
    const logs = await ExerciseLog.find(query).populate("exerciseId", "name");
    res.json(logs);
  } catch (err) {
    console.error("❌ Egzersiz verisi çekme hatası:", err);
    res.status(500).json({ message: "Veri çekme hatası.", error: err });
  }
});

// ✅ Bugünkü egzersiz kayıtlarını getir
router.get("/today", authenticateToken, async (req, res) => {
  const userId = req.user._id;

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  try {
    const logs = await ExerciseLog.find({
      userId,
      date: { $gte: start, $lte: end },
    }).populate("exerciseId", "name");

    const simplified = logs.map((log) => ({
      name: log.exerciseId.name,
      sets: log.sets,
    }));

    res.json({ exercises: simplified });
  } catch (err) {
    console.error("❌ Bugünkü egzersiz verisi çekme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası.", error: err });
  }
});

module.exports = router;