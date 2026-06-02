
const admin = require('firebase-admin');

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} else {
  const serviceAccount = require('../../firebase-service-account.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

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
