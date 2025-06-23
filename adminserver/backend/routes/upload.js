const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🔒 Sanitize function
function sanitizeForFolderName(str) {
  return str.replace(/[:*?"<>|\\\/]/g, '').replace(/\s+/g, '_'); // remove illegal chars, spaces -> _
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { batch, module, title } = req.query;

    const cleanBatch = sanitizeForFolderName(batch);
    const cleanModule = sanitizeForFolderName(module);
    const cleanTitle = sanitizeForFolderName(title);

    const uploadPath = path.join(__dirname, '..', 'uploads', cleanBatch, cleanModule, cleanTitle, 'assignment');

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, 'question.pdf');
  },
});

const upload = multer({ storage });

router.post('/upload-assignment', upload.single('file'), (req, res) => {
  const { batch, module, title } = req.query;

  const cleanBatch = sanitizeForFolderName(batch);
  const cleanModule = sanitizeForFolderName(module);
  const cleanTitle = sanitizeForFolderName(title);

  const relativePath = `/uploads/${cleanBatch}/${cleanModule}/${cleanTitle}/assignment/question.pdf`;

  res.json({ message: 'Assignment uploaded successfully', path: relativePath });
});


module.exports = router;
