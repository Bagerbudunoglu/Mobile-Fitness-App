// ✅ GÜNCELLENMİŞ: routes/messages.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const authenticateToken = require("../middlewares/authenticateToken");

// Sohbet listesi
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: "Kullanıcı doğrulanamadı!" });
    const userId = req.user._id.toString();

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 }).lean();

    const convMap = {};
    messages.forEach(msg => {
      if (!msg.senderId || !msg.receiverId) return;
      const otherId = msg.senderId.toString() === userId ? msg.receiverId.toString() : msg.senderId.toString();
      if (!convMap[otherId]) {
        convMap[otherId] = {
          userId: otherId,
          lastMessage: msg.text,
          lastDate: msg.createdAt,
          unreadCount: 0
        };
      }
      if (msg.receiverId.toString() === userId && !msg.read) {
        convMap[otherId].unreadCount++;
      }
    });

    if (Object.keys(convMap).length === 0) return res.json([]);

    const users = await User.find({ _id: { $in: Object.keys(convMap) } }).select("_id username name").lean();

    const conversations = users.map(user => {
      const conv = convMap[user._id.toString()];
      if (!conv) return null;
      return {
        userId: user._id.toString(),
        username: user.username || user.name || "Kullanıcı",
        lastMessage: conv.lastMessage,
        lastDate: conv.lastDate,
        unreadCount: conv.unreadCount
      };
    }).filter(Boolean);

    conversations.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));

    res.json(conversations);
  } catch (err) {
    console.error("Sohbetler getirilirken hata:", err);
    res.status(500).json({ message: "Sohbetler getirilirken hata oluştu" });
  }
});
router.get("/available-users", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    let users = [];

    if (user.role === "member" && user.trainerId) {
      const trainer = await User.findById(user.trainerId).select("_id username name");
      if (trainer) users.push(trainer);
    }

    if (user.role === "trainer") {
      users = await User.find({ trainerId: user._id }).select("_id username name");
    }

    res.json(users);
  } catch (error) {
    console.error("Kullanıcılar getirilemedi:", error);
    res.status(500).json({ message: "Kullanıcılar getirilemedi." });
  }
});

// Birebir mesajlar
router.get("/:otherUserId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const otherId = req.params.otherUserId;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherId },
        { senderId: otherId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 }).lean();

    await Message.updateMany(
      { senderId: otherId, receiverId: userId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    console.error("Mesajlar çekilemedi:", err);
    res.status(500).json({ message: "Mesajlar getirilirken hata oluştu" });
  }
});

// 🎯 Sohbet başlatılabilecek kişiler (trainer/member)


module.exports = router;