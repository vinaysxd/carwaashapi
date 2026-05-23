require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function sendPushNotification(deviceToken, title, body) {
  const message = {
    notification: { title, body },
    token: deviceToken,
  };
  const response = await admin.messaging().send(message);
  return response;
}

module.exports = sendPushNotification;

if (require.main === module) {
  const dummyToken = 'dummy-device-token';
  sendPushNotification(dummyToken, 'SplashWash Test', 'Push notifications are working!')
    .then((result) => console.log('Notification sent:', result))
    .catch((err) => console.error('Firebase error:', err.message));
}
