require('dotenv').config();

if (process.env.NODE_ENV === 'production' && process.env.CSRF_ENABLED !== 'false') {
  process.env.CSRF_ENABLED = 'true';
}

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
const serviceRoutes = require('./routes/serviceRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const statsRoutes = require('./routes/statsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
const uploadStaticMiddleware = require('./middlewares/uploadStaticMiddleware');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(csrfProtection);

app.use('/uploads', uploadStaticMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/administrateurs', adminRoutes);
app.use('/api/techniciens', technicianRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  const httpServer = app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
  const { initIO } = require('./config/socket');
  initIO(httpServer);
}

module.exports = app;
