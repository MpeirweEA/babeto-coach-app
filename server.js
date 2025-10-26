const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();

const authRoutes = require('./auth');

app.use(express.json());
app.use('/api', authRoutes);
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));