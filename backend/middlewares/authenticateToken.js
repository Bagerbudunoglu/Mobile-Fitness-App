const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Bearer token yapısından token'ı al
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Erişim reddedildi! Token bulunamadı." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT doğrulama hatası:", err);
      return res.status(403).json({ message: "Geçersiz veya süresi dolmuş token." });
    }

    // Kullanıcı objesini her durumda _id ve role ile sağlam şekilde ayarla
    req.user = {
      _id: user.userId || user._id,
      role: user.role
    };

    next();
  });
};

module.exports = authenticateToken;
