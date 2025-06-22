const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

function excelDateToJSDate(serial) {
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(excelEpoch.getTime() + (serial) * 86400000); // Add 1 day
  return date;
}



router.post('/upload', upload.single('file'), (req, res) => {
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  let data = xlsx.utils.sheet_to_json(sheet);
  data = data.map(stu => ({
    ...stu,
    dob: typeof stu.dob === 'number' ? excelDateToJSDate(stu.dob) : new Date(stu.dob)
  }));

  res.json({ students: data });
});
module.exports = router;
