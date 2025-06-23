const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const RoomModel = require('./models/Room');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://rigrunner23:1234@cluster0.1xtsq.mongodb.net/Code')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Room data structure to store code and users
const rooms = new Map();
const saveTimeouts = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Join room
  socket.on('join-room', async ({ roomId, username }) => {
    socket.join(roomId);
    let dbRoom = await RoomModel.findOne({ roomId });
    if (!rooms.has(roomId)) {
      if (dbRoom) {
        const filesMap = new Map(dbRoom.files.map(f => [f.name, f.content]));
        rooms.set(roomId, {
          code: filesMap.get('index.js') || '',
          users: new Map(),
          files: filesMap
        });
      } else {
        rooms.set(roomId, {
          code: '',
          users: new Map(),
          files: new Map([['index.js', '']])
        });
        dbRoom = new RoomModel({ roomId, files: [{ name: 'index.js', content: '' }] });
        await dbRoom.save();
      }
    }
    const room = rooms.get(roomId);
    room.users.set(socket.id, {
      username,
      cursor: { line: 0, ch: 0 }
    });
    // Send current room state to the new user
    socket.emit('room-state', {
      code: room.code,
      files: Array.from(room.files.entries()),
      users: Array.from(room.users.values())
    });
    // Broadcast user joined to others in the room
    io.to(roomId).emit('user-joined', {
      users: Array.from(room.users.values())
    });
  });

  // Handle code changes
  socket.on('code-change', async ({ roomId, code, file = 'index.js', sender }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.files.set(file, code);
      room.code = code;
      socket.to(roomId).emit('code-update', { code, file, sender });

      // Debounce DB save: clear previous timeout and set a new one
      if (saveTimeouts.has(roomId)) {
        clearTimeout(saveTimeouts.get(roomId));
      }
      const timeout = setTimeout(async () => {
        let dbRoom = await RoomModel.findOne({ roomId });
        if (dbRoom) {
          const fileObj = dbRoom.files.find(f => f.name === file);
          if (fileObj) {
            fileObj.content = code;
            fileObj.lastModified = new Date();
          } else {
            dbRoom.files.push({ name: file, content: code });
          }
          await dbRoom.save();
        } else {
          dbRoom = new RoomModel({ roomId, files: [{ name: file, content: code }] });
          await dbRoom.save();
        }
        saveTimeouts.delete(roomId);
      }, 2000); // 2 seconds
      saveTimeouts.set(roomId, timeout);
    }
  });

  // Handle cursor position updates
  socket.on('cursor-move', ({ roomId, cursor }) => {
    const room = rooms.get(roomId);
    if (room && room.users.has(socket.id)) {
      const user = room.users.get(socket.id);
      user.cursor = cursor;
      socket.to(roomId).emit('cursor-update', {
        userId: socket.id,
        cursor,
        username: user.username
      });
    }
  });

  // Handle chat messages
  socket.on('send-message', ({ roomId, message, username }) => {
    io.to(roomId).emit('new-message', {
      message,
      username,
      timestamp: new Date()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        io.to(roomId).emit('user-left', {
          users: Array.from(room.users.values())
        });
      }
    });
    console.log('Client disconnected');
  });

  socket.on('code-update', ({ code }) => {
    if (viewRef.current) {
      const current = viewRef.current.state.doc.toString();
      if (current !== code) {
        // Save cursor position
        const selection = viewRef.current.state.selection.main;
        viewRef.current.dispatch({
          changes: { from: 0, to: current.length, insert: code },
          selection: { anchor: selection.anchor, head: selection.head }
        });
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema); 