require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./src/routes/auth');
const usersRoutes = require('./src/routes/users');
const bookingsRoutes = require('./src/routes/bookings');
const jobsRoutes = require('./src/routes/jobs');
const adminRoutes = require('./src/routes/admin');
const notificationsRoutes = require('./src/routes/notifications');
const profileRoutes = require('./src/services/profile/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'splashwash-api', version: '1.0.0' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/bookings', bookingsRoutes);
app.use('/api/v1/jobs', jobsRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/profile', profileRoutes);

app.listen(PORT, () => {
  console.log(`splashwash-api running on port ${PORT}`);
});
