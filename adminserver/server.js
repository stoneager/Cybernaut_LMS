/***************************************
 *  server/index.js – Admin back‑end   *
 **************************************/
require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const multer    = require('multer');
const fs        = require('fs');
const path      = require('path');

const noteRoutes = require('./routes/notes');
const Result     = require('./models/Result');

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- MongoDB ---------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅  Admin DB Connected'))
  .catch(console.error);

/* ------------ Serve static uploads -------- */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ==========================================
   1.  Admin uploads the **question** PDF
   ==========================================*/
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { batch, module, title } = req.query;
    if (!batch || !module || !title) {
      return cb(new Error('Missing batch/module/title in query‑string'), null);
    }
    const dir = path.join(__dirname, 'uploads', batch, module, title, 'assignment');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, _file, cb) => cb(null, 'question.pdf')
});
const assignmentUpload = multer({ storage: assignmentStorage });

app.post('/upload-assignment', assignmentUpload.single('file'), (_req, res) => {
  res.json({ message: 'Assignment uploaded successfully' });
});

/* ==========================================
   2.  Student uploads the **answer** PDF
   ==========================================*/
const answerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { batch, module, title, student } = req.params;
    if (!batch || !module || !title || !student) {
      return cb(new Error('Missing batch/module/title/student in URL'), null);
    }
    const dir = path.join(
      __dirname,
      'uploads',
      batch,
      module,
      title,
      'assignment',
      student
    );
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, _file, cb) => cb(null, 'answer.pdf')
});
const answerUpload = multer({ storage: answerStorage });

app.post(
  '/notes/upload/:batch/:module/:title/:student',
  answerUpload.single('file'),
  (_req, res) => {
    res.json({ message: 'Answer uploaded successfully' });
  }
);

/* ==========================================
   3.  GET un‑marked submissions
   ==========================================*/
const safeDecode = (str) => {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
};

app.get('/evaluate/:batch/:module/:title', async (req, res) => {
  const batch  = safeDecode(req.params.batch);
  const module = safeDecode(req.params.module);
  const title  = safeDecode(req.params.title);

  const dir = path.join(__dirname, 'uploads', batch, module, title, 'assignment');
  if (!fs.existsSync(dir)) return res.json([]);               // nothing yet

  /* find every student folder with answer.pdf */
  const studentsWithPDF = fs.readdirSync(dir).filter((name) =>
    fs.existsSync(path.join(dir, name, 'answer.pdf'))
  );

  /* get already‑marked students from Mongo */
  const results = await Result.find({
    batch,
    module,
    notetitle: title,
    type: 'assignment'
  }).select('student');

  const marked = new Set(results.map((r) => r.student));

  /* pending = not yet marked */
  const pending = studentsWithPDF
    .filter((s) => !marked.has(s))
    .map((s) => ({
      student: s,
      answerLink: `http://localhost:5003/uploads/${batch}/${module}/${title}/assignment/${s}/answer.pdf`
    }));

  res.json(pending);
});

/* ==========================================
   4.  POST a mark
   ==========================================*/
app.post('/mark', async (req, res) => {
  const { batch, module, notetitle, student, mark, type } = req.body;

  try {
    await Result.create({ batch, module, notetitle, student, mark, type });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to store mark' });
  }
});

/* ============ Notes CRUD ================ */
app.use('/notes', noteRoutes);

/* ============ Start server ============== */
const PORT = 5003;
app.listen(PORT, () =>
  console.log(`🚀  Admin server running on http://localhost:${PORT}`)
);
