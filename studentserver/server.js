require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Course = require('./models/Course');
const Note = require('./models/Note');
const noteRoutes = require('./routes/notes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Student DB Connected'))
  .catch(console.error);

// Get modules from course type
app.get('/student/modules/:type', async (req, res) => {
  const course = await Course.findOne({ course_type: req.params.type });
  if (!course) return res.status(404).json({ modules: [] });
  res.json({ modules: course.modules });
});

// Student note reader endpoint
app.use('/notes', noteRoutes);

app.listen(5002, () => console.log('Student server on 5002'));
