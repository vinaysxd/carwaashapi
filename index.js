require('./src/config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const corsOptions = require('./src/config/cors');
const swaggerSpec = require('./src/config/swagger');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth');
const usersRoutes = require('./src/routes/users');
const bookingsRoutes = require('./src/routes/bookings');
const jobsRoutes = require('./src/routes/jobs');
const adminRoutes = require('./src/routes/admin');
const notificationsRoutes = require('./src/routes/notifications');
const profileRoutes = require('./src/services/profile/routes');
const buildingRoutes = require('./src/services/building/routes');
const staffRoutes = require('./src/services/staff/routes');
const vehicleRoutes = require('./src/services/vehicle/routes');
const subscriptionRoutes = require('./src/services/subscription/routes');
const presenceRoutes = require('./src/services/presence/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.use('/api/v1/buildings', buildingRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/presence', presenceRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`splashwash-api running on port ${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/api/docs`);
});
