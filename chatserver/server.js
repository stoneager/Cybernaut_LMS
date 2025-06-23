const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*' }
});

const PORT = 5004;
const LOG_DIR = path.join(__dirname, 'chat_logs');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

function getLogPath(room) {
  const parts = room.split('/');

  // Rule 1: Admin ↔ SuperAdmin
  if (parts.length === 2 && parts[0] === 'admins') {
    const adminName = parts[1];
    const dir = path.join(LOG_DIR, 'admins');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, `${adminName}.txt`);
  }

  // Rule 2: Admin ↔ Student
  if (parts.length === 5 && parts[3] === 'students') {
    const [course, batch, module, , studentName] = parts;
    const dir = path.join(LOG_DIR, course, batch, module, 'students');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, `${studentName}.txt`);
  }

  // Rule 3: Batch Forum
  if (parts.length === 5 && parts[2] === 'forum' && parts[4] === 'general') {
    const [course, batch, , module, ] = parts;
    const dir = path.join(LOG_DIR, course, batch, 'forum', module);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, `general.txt`);
  }

  console.warn(`⚠️ Invalid room format: ${room}`);
  return null;
}


function loadChat(room) {
  const file = getLogPath(room);
  if (!file) return [];
  return fs.existsSync(file)
    ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)
    : [];
}

function saveChat(room, message) {
  const file = getLogPath(room);
  if (!file) return;
  fs.appendFileSync(file, message + '\n');
}

io.on('connection', socket => {
  socket.on('joinRoom', ({ name, room }) => {
    socket.join(room);
    socket.emit('chatHistory', loadChat(room));
  });

  socket.on('message', ({ name, room, message }) => {
    const msg = `${name}: ${message}`;
    saveChat(room, msg);
    io.to(room).emit('message', msg);
  });

  socket.on('leaveRoom', ({ room }) => {
    socket.leave(room);
  });
});

const decodeBatch = (name) => decodeURIComponent(name);

// ✅ API to fetch chat participants (students) for a given batch/module
app.get('/chatrooms/:course/:batch/:module/students', (req, res) => {
  const { course, batch, module } = req.params;
  const dirPath = path.join(LOG_DIR, course, batch, module, 'students');

  if (!fs.existsSync(dirPath)) return res.json([]);

  const students = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.txt'))
    .map(file => file.replace('.txt', ''));

  res.json(students);
});

app.get('/chatrooms/metadata/:batch', (req, res) => {
  const raw = req.params.batch;
  const batch = decodeBatch(raw); // Decode URL-encoded string like "Full%20Stack%20Development"
  console.log("hello");
  try {
    const courseDirs = fs.readdirSync(path.join(LOG_DIR));
    for (const course of courseDirs) {
      const coursePath = path.join(LOG_DIR, course);
      if (!fs.statSync(coursePath).isDirectory()) continue;

      const batchPath = path.join(coursePath, batch);
      if (fs.existsSync(batchPath) && fs.statSync(batchPath).isDirectory()) {
        const forumPath = path.join(batchPath, 'forum');
        const modules = fs.existsSync(forumPath)
          ? fs.readdirSync(forumPath).filter(mod =>
              fs.statSync(path.join(forumPath, mod)).isDirectory()
            )
          : [];

        return res.json({ course, modules });
      }
    }

    return res.status(404).json({ message: "Batch not found" });
  } catch (err) {
    console.error("Metadata fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



app.get('/chatrooms', (req, res) => {
  if (!fs.existsSync(LOG_DIR)) return res.json([]);

  const batches = fs.readdirSync(LOG_DIR).filter(entry => {
    const fullPath = path.join(LOG_DIR, entry);
    return fs.statSync(fullPath).isDirectory();
  });

  res.json(batches);
});

app.get('/chatrooms/admins', (req, res) => {
  const dirPath = path.join(LOG_DIR, 'admins');
  if (!fs.existsSync(dirPath)) return res.json([]);

  const files = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.txt'))
    .map(file => file.replace('.txt', ''));

  res.json(files);
});




server.listen(PORT, () => {
  console.log(`✅ Chat server listening on http://localhost:${PORT}`);
});

