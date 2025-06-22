require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const noteRoutes = require('./routes/notes');
const adminBatch = require("./routes/adminBatch");
const reportRoutes = require("./routes/reportRoutes");
const adminEvaluation = require("./routes/adminEvaluation");


const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Admin DB Connected'))
  .catch(console.error);

// Static route to access uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🟢 Assignment Upload for Admin (question.pdf)
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { batch, module, title } = req.query;
    const dir = path.join(__dirname, 'uploads', batch, module, title, 'assignment');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, 'question.pdf')
});
const assignmentUpload = multer({ storage: assignmentStorage });

app.post('/upload-assignment', assignmentUpload.single('file'), (req, res) => {
  res.json({ message: 'Assignment uploaded successfully' });
});

// 🟢 Answer Upload by Student (answer.pdf)
const answerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { batch, module, title, student } = req.params;
    const dir = path.join(__dirname, 'uploads', batch, module, title, 'assignment', student);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, 'answer.pdf')
});
const answerUpload = multer({ storage: answerStorage });

app.post('/notes/upload/:batch/:module/:title/:student', answerUpload.single('file'), (req, res) => {
  res.json({ message: 'Answer uploaded successfully' });
});

app.use('/notes', noteRoutes);
app.use("/api/admin-batches", adminBatch);
app.use("/api/reports", reportRoutes);
app.use("/api/evaluation", adminEvaluation);

app.listen(5002, () => console.log('Admin server on 5002'));
