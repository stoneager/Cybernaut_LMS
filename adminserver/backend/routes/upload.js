const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const Report = require('../models/Report');
const Batch = require('../models/Batch');
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command
} = require('@aws-sdk/client-s3');
// AWS S3 config
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.S3_BUCKET;
const upload = multer({ storage: multer.memoryStorage() });
// 🔒 Sanitize function
function sanitizeForFolderName(str) {
  return str.replace(/[:*?"<>|\\\/]/g, '').replace(/\s+/g, '_'); // remove illegal chars, spaces -> _
}


router.post('/upload-assignment', upload.single('file'), async (req, res) => {
  const { batch, module, title } = req.query;

  if (!req.file || !batch || !module || !title) {
    return res.status(400).json({ error: 'Missing file or required params' });
  }

  try {
    // 🔍 Lookup batch name to sanitize folder structure
    const batchDoc = await Batch.findById(batch);
    if (!batchDoc) return res.status(404).json({ error: 'Batch not found' });

    const cleanBatch = sanitizeForFolderName(batchDoc.batchName);
    const cleanModule = sanitizeForFolderName(module);
    const cleanTitle = sanitizeForFolderName(title);

    // 🧠 Build S3 key
    const key = `${cleanBatch}/${cleanModule}/${cleanTitle}/assignment/question.pdf`;

    // 📤 Upload directly to S3 from buffer
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: req.file.buffer,
        ContentType: 'application/pdf'
      })
    );

    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log("✅ Uploaded to S3:", s3Url);

    res.json({
      message: 'Assignment uploaded directly to S3 successfully',
      s3path: s3Url
    });

  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).json({ error: 'Failed to upload assignment to S3' });
  }
});

router.get('/assignment-question/:batch/:module/:title', (req, res) => {
  const { batch, module, title } = req.params;
    const cleanBatch = sanitizeForFolderName(batch);
    const cleanModule = sanitizeForFolderName(module);
    const cleanTitle = sanitizeForFolderName(title);
  const key = `${cleanBatch}/${cleanModule}/${cleanTitle}/assignment/question.pdf`;
  const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  res.json({ url: s3Url });
});

router.post('/notes/upload/:batch/:module/:title/:student', upload.single('file'), async (req, res) => {
  const { batch, module, title, student } = req.params;
    const cleanBatch = sanitizeForFolderName(batch);
    const cleanModule = sanitizeForFolderName(module);
    const cleanTitle = sanitizeForFolderName(title);
  if (!req.file) return res.status(400).json({ error: 'No file' });

  const key = `${cleanBatch}/${cleanModule}/${cleanTitle}/assignment/${student}/answer.pdf`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: 'application/pdf'
    }));

    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    res.json({ message: 'Answer uploaded', url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Answer upload failed' });
  }
});

router.get('/evaluate/:batchId/:module/:title/:day', async (req, res) => {
  const { batchId, module, title, day } = req.params;

  try {
    // 1. Fetch the batch name from MongoDB
    const batchDoc = await Batch.findById(batchId);
    if (!batchDoc) return res.status(404).json({ error: 'Batch not found' });

    const batchName = batchDoc.batchName;
    const cleanBatch = sanitizeForFolderName(batchName);
    const cleanModule = sanitizeForFolderName(module);
    const cleanTitle = sanitizeForFolderName(title);

    const prefix = `${cleanBatch}/${cleanModule}/${cleanTitle}/assignment/`;

    // 2. List objects in S3 under that assignment folder
    const list = await s3.send(new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix
    }));

    const keys = list.Contents?.map(obj => obj.Key) || [];

    // 3. Extract unsanitized student names from folder structure
    const studentNames = [...new Set(
      keys
        .filter(k => k.endsWith('/answer.pdf'))
        .map(k => decodeURIComponent(k.split('/')[4])) // folder name = real student name
    )];

    console.log("THE STUDENTS NAME SHIT:",studentNames);

    // 4. Get corresponding student documents
    const students = await Student.find()
  .populate('user', 'name') // only fetch `name` field from user
  .then(res =>
    res.filter(stu => studentNames.includes(stu.user?.name))
  );
    console.log("THE STUDENTS SHIT:",students);
    const pending = [];

    for (const student of students) {
      const report = await Report.findOne({
        student: student._id,
        module: module,
        day: parseInt(day)
      });

      // 5. Only include those not yet evaluated (assignment = marksObtained[2])
      if (!report || report.marksObtained[2] === -1) {
        const answerKey = `${cleanBatch}/${cleanModule}/${cleanTitle}/assignment/${encodeURIComponent(student.user.name)}/answer.pdf`;

        pending.push({
          studentId: student._id,
          studentName: student.user.name,
          answerLink: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${answerKey}`
        });
      }
    }

    res.json(pending);
  } catch (err) {
console.error('❌ Evaluation error:', err.stack || err);
res.status(500).json({ error: 'Failed to fetch submissions', details: err.message });

  }
});


// POST /evaluate - Save assignment marks
router.post('/evaluate', async (req, res) => {
  const { studentId, module, day, mark } = req.body;

  if (!studentId || !module || day == null || mark == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let report = await Report.findOne({ student: studentId, module: module, day });

    if (!report) {
      // Create if not exists
      report = new Report({
        student: studentId,
        module: module,
        day,
        marksObtained: [-1, -1, -1],
      });
    }

    report.marksObtained[2] = mark;
    await report.save();

    res.json({ message: "Marks updated successfully" });
  } catch (err) {
    console.error("Error saving marks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
