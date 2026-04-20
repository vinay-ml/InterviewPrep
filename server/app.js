const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./database/connectDB');
const { updateAccessCodes } = require('./controllers/authController');
const authRoutes = require('./routes/authRoutes');
const QuestionRoutes = require('./routes/QuestionRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Socket.IO Setup with frontend CORS
const io = new Server(server, {
  cors: {
    origin: ['https://inter-view-prep.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Connect Database
connectDB();

// ✅ Update access codes on server start
updateAccessCodes();

// ✅ Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', QuestionRoutes);

// ✅ Deployment logic
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === 'PRODUCTION') {
  app.use(express.static(path.join(__dirname1, '/client/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname1, 'client', 'build', 'index.html'))
  );
} else {
  app.get('/api/test', (req, res) => {
    res.send('API is running..');
  });
}

// ✅ Socket.IO logic for tracking online users
let onlineUsers = {};

// io.on("connection", (socket) => {
//   console.log("🟢 New client connected:", socket.id);

//   socket.on("user-online", ({ username }) => {
//     if (username) {
//       onlineUsers[socket.id] = username;
//       io.emit("online-users", Object.values(onlineUsers));
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 Client disconnected:", socket.id);
//     delete onlineUsers[socket.id];
//     io.emit("online-users", Object.values(onlineUsers));
//   });
// });

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
