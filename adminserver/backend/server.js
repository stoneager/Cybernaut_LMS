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
const assignmentRoutes = require('./routes/assignmentRoutes');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Admin DB Connected'))
  .catch(console.error);

// Static route to access uploaded files


app.use('/notes', noteRoutes);
app.use("/api/admin-batches", adminBatch);
app.use("/api/reports", reportRoutes);
app.use("/api/evaluation", adminEvaluation);
app.use('/api/assignments', assignmentRoutes);

app.listen(5002, () => console.log('Admin server on 5002'));
