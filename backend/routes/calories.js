const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateToken = require("../middlewares/authenticateToken");

// 📌 Günlük yeme kaydı ekle (hem member hem trainer yapabilir)
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { name, grams, calories, meal } = req.body;

    if (!name || !grams || !calories || !meal) {
      return res.status(400).json({ message: "Tüm alanlar zorunludur." });
    }

    const user = await User.findById(req.user._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // sadece bugünün tarihini kontrol eder

    // 🔍 Bugünkü kayıt var mı?
    let todayLog = user.caloriesLog.find(
      (log) => new Date(log.date).getTime() === today.getTime()
    );

    const newFood = { name, grams, calories, meal };

    if (!todayLog) {
      // ❌ yoksa yeni gün oluştur
      user.caloriesLog.push({
        date: today,
        foods: [newFood],
      });
    } else {
      // ✅ varsa foods listesine ekle
      todayLog.foods.push(newFood);
    }

    await user.save();
    res.status(201).json({ message: "Yemek kaydedildi!" });
  } catch (error) {
    console.error("Yemek kaydetme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// 📌 Giriş yapan kullanıcının bugünkü yemek kayıtlarını getir
router.get("/today", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLog = user.caloriesLog.find(
      (log) => new Date(log.date).getTime() === today.getTime()
    );

    res.json(todayLog || { date: today, foods: [] });
  } catch (error) {
    console.error("Günlük yemek verisi çekme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;
