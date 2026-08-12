const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const weatherService = require('./services/weatherService');
const quotesService = require('./services/quotesService');

dotenv.config();

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