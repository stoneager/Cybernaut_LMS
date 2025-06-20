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
  if (parts.length !== 3) {
    console.warn(`⚠️ Invalid room format: ${room}`);
    return null;
  }
  const [batch, domain, target] = parts;
  const dir = path.join(LOG_DIR, batch, domain);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${target}.txt`);
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

app.get('/chatrooms/:batch/:domain', (req, res) => {
  const { batch, domain } = req.params;
  const dirPath = path.join(LOG_DIR, batch, domain);

  if (!fs.existsSync(dirPath)) return res.json([]);

  const files = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.txt'))
    .map(file => file.replace('.txt', ''));

  res.json(files);
});

server.listen(PORT, () => {
  console.log(`✅ Chat server listening on http://localhost:${PORT}`);
});

