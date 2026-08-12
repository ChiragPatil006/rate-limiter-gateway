const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const weatherService = require('./services/weatherService');
const quotesService = require('./services/quotesService');
const redisClient = require('./config/redisClient');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/services/weather', weatherService);
app.use('/services/quotes', quotesService);

app.get('/', (req, res) => {
  res.json({ message: 'Gateway server is alive' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));