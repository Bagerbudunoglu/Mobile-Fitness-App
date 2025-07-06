const jwt = require("jsonwebtoken");

const verifyTrainer = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token bulunamadı." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== "trainer") {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok (Sadece Trainer)." });
    }

    // ✅ Kullanıcı bilgilerini request'e ekle
    req.user = decoded;
    req.userId = decoded._id;


    next();
  } catch (error) {
    console.error("Token doğrulama hatası:", error);
    return res.status(403).json({ message: "Geçersiz veya süresi dolmuş token." });
  }
};

module.exports = verifyTrainer;
