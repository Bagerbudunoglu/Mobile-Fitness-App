const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

// 📌 Kullanıcı Kaydı (Register)
router.post("/register", async (req, res) => {
  console.log("📌 /register route'u çalıştı!");

  try {
    const { username, email, password, role, trainerId } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tüm alanları doldurun!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta zaten kayıtlı!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "member",
      trainerId: trainerId || null,  // ✅ Trainer seçildiyse kaydet, yoksa null
    });

    await newUser.save();
    res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu!" });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 📌 Kullanıcı Girişi (Login)
router.post("/login", async (req, res) => {
  console.log("📌 /login route'u çalıştı!");

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Kullanıcı bulunamadı!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz şifre!" });
    }

    // --- SADECE BU SATIR GÜNCELLENDİ ---
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // -----------------------------------

    res.status(200).json({
      message: "Giriş başarılı!",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("Giriş hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 📌 Kullanıcı Bilgisi Getir (Profil)
router.get("/user", authenticateToken, async (req, res) => {
  try {
    // Artık userId yerine _id kullanıyoruz!
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }
    res.json(user);
  } catch (error) {
    console.error("Kullanıcı verisi getirme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 📌 Tüm trainer kullanıcılarını getir
router.get("/trainers", async (req, res) => {
  try {
    const trainers = await User.find({ role: "trainer" }).select("_id username email");
    res.status(200).json(trainers);
  } catch (error) {
    console.error("Trainer listesi çekilemedi:", error.message);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 📌 ID ile Trainer Bilgisi Getir
router.get("/trainer/:trainerId", async (req, res) => {
  try {
    const trainer = await User.findOne({ _id: req.params.trainerId, role: "trainer" }).select("_id username email");
    if (!trainer) {
      return res.status(404).json({ message: "Trainer bulunamadı." });
    }
    res.json(trainer);
  } catch (error) {
    console.error("Trainer bilgisi çekilemedi:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// 📌 Kullanıcı Profili Güncelleme
router.put("/update-profile", authenticateToken, async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    user.username = username || user.username;
    user.email = email || user.email;

    await user.save();
    res.json({ message: "Profil güncellendi!" });
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 📌 Şifre Güncelleme
router.put("/update-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mevcut şifre yanlış." });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await user.save();
    res.json({ message: "Şifre güncellendi!" });
  } catch (error) {
    console.error("Şifre güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
