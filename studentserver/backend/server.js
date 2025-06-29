require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Course = require('./models/Course');
const noteRoutes = require('./routes/notes');
const studentRoutes = require('./routes/student');
const settingsRoutes = require('./routes/settings');
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Student DB Connected'))
  .catch(console.error);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use('/notes', noteRoutes);
app.use('/student', studentRoutes);
app.use('/api/settings',settingsRoutes);
app.listen(5003, () => console.log('Student server on 5003'));