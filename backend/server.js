// ✅ GÜNCELLENMİŞ: server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const messagesRoutes = require("./routes/messages");
const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/food");
const trainerRoutes = require("./routes/trainer");
const exerciseRoutes = require("./routes/exercise");
const exerciseLogRoutes = require("./routes/exerciseLog");
const scoreboardRoutes = require("./routes/scoreboard");
const caloriesRoutes = require("./routes/calories");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/videos", express.static(path.join(__dirname, "videos")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB'ye bağlantı sağlandı"))
  .catch((err) => {
    console.error("❌ MongoDB bağlantı hatası:", err);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/exerciselogs", exerciseLogRoutes);
app.use("/api/scoreboard", scoreboardRoutes);
app.use("/api/calories", caloriesRoutes);
app.use("/api/messages", messagesRoutes);

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const Message = require("./models/Message");
const User = require("./models/User");
const connectedUsers = {};

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    connectedUsers[userId] = socket.id;
  });

  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    try {
      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);

      if (!sender || !receiver) return;

      if (sender.role === "member") {
        if (!sender.trainerId || sender.trainerId.toString() !== receiver._id.toString()) return;
      }

      if (sender.role === "trainer") {
        const isStudent = await User.findOne({ _id: receiver._id, trainerId: sender._id });
        if (!isStudent) return;
      }

      const message = await Message.create({ senderId, receiverId, text });
      [receiverId, senderId].forEach(id => {
        const sockId = connectedUsers[id];
        if (sockId) io.to(sockId).emit("newMessage", message);
      });
    } catch (error) {
      console.error("❌ Mesaj gönderme hatası:", error);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, sockId] of Object.entries(connectedUsers)) {
      if (sockId === socket.id) {
        delete connectedUsers[userId];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda Socket.io ile çalışıyor...`);
});
