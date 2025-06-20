require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const noteRoutes = require('./routes/notes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Admin DB Connected'))
  .catch(console.error);

app.use('/notes', noteRoutes);

app.listen(5003, () => console.log('Admin server on 5003'));
