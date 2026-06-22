require('dotenv').config();

const requiredEnv = ['JWT_SECRET', 'CLIENT_URL'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`FATAL: Variable d'environnement manquante: ${key}`);
    if (process.env.NODE_ENV !== 'test') process.exit(1);
  }
}

if (process.env.JWT_SECRET === 'your-super-secret-key-change-in-production') {
  console.error('FATAL: JWT_SECRET utilise la valeur par défaut. Changez-la immédiatement.');
  if (process.env.NODE_ENV !== 'test') process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const csrfProtection = require('./middlewares/csrfMiddleware');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
const path = require('path');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(csrfProtection);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/administrateurs', adminRoutes);
app.use('/api/techniciens', technicianRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

module.exports = app;
