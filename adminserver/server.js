require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command
} = require('@aws-sdk/client-s3');

const noteRoutes = require('./routes/notes');
const Result = require('./models/Result');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded PDFs from local disk
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Admin DB Connected'))
  .catch(console.error);

// ✅ AWS S3 Client Setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.S3_BUCKET;

// ✅ Upload to memory (used for answer uploads)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Local disk storage for assignment questions
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { batch, module, title } = req.query;
    if (!batch || !module || !title) {
      return cb(new Error('Missing batch/module/title in query-string'), null);
    }
    const dir = path.join(__dirname, 'uploads', batch, module, title, 'assignment');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, _file, cb) => cb(null, 'question.pdf')
});
const assignmentUpload = multer({ storage: assignmentStorage });

// =====================================
// 📤 Upload Assignment (local + S3)
// =====================================
app.post('/upload-assignment', assignmentUpload.single('file'), async (req, res) => {
  const { batch, module, title } = req.query;

  if (!req.file || !batch || !module || !title) {
    return res.status(400).json({ error: 'Missing file or required params' });
  }

  const key = `${batch}/${module}/${title}/assignment/question.pdf`;
  const localPath = req.file.path;

  try {
    const fileBuffer = fs.readFileSync(localPath);

    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: 'application/pdf'
    }));

    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
    res.json({
      message: 'Assignment uploaded locally and to S3 successfully',
      localPath,
      s3Url
    });
  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).json({ error: 'Failed to upload to S3 after saving locally' });
  }
});

// ======================================
// 📤 Upload Student Answer to S3
// ======================================
app.post('/notes/upload/:batch/:module/:title/:student', upload.single('file'), async (req, res) => {
  const { batch, module, title, student } = req.params;

  if (!req.file) return res.status(400).json({ error: 'No file' });

  const key = `${batch}/${module}/${title}/assignment/${student}/answer.pdf`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: 'application/pdf'
    }));

    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
    res.json({ message: 'Answer uploaded', url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Answer upload failed' });
  }
});

// ======================================
// 📄 Evaluate Pending Answers from S3
// ======================================
app.get('/evaluate/:batch/:module/:title', async (req, res) => {
  const { batch, module, title } = req.params;
  const prefix = `${batch}/${module}/${title}/assignment/`;

  try {
    const list = await s3.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix
    }));

    const keys = list.Contents?.map(o => o.Key) || [];

    const students = [...new Set(
      keys.filter(k => k.endsWith('/answer.pdf'))
        .map(k => decodeURIComponent(k.split('/')[4]))
    )];

    const marked = new Set(
      (await Result.find({ batch, module, notetitle: title, type: 'assignment' }))
        .map(r => r.student)
    );

    const pending = students
      .filter(student => !marked.has(student))
      .map(student => {
        const answerKey = `${batch}/${module}/${title}/assignment/${student}/answer.pdf`;
        return {
          student,
          answerLink: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${answerKey}`
        };
      });

    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// ======================================
// ✅ Save Mark for Student Answer
// ======================================
app.post('/mark', async (req, res) => {
  const { batch, module, notetitle, student, mark, type } = req.body;
  try {
    await Result.create({ batch, module, notetitle, student, mark, type });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save mark' });
  }
});

// =======================
// 📚 Notes CRUD Endpoint
// =======================
app.use('/notes', noteRoutes);

// =======================
// 🚀 Start Server
// =======================
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`🚀 Admin server running on port ${PORT}`));
