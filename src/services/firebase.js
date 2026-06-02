const admin = require('firebase-admin');

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    try {
      const serviceAccount = require('../../firebase-service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (e) {
      console.warn('Firebase service account file not found. Push notifications disabled.');
    }
  }
}

module.exports = admin;

if (require.main === module) {
  const dummyToken = 'dummy-device-token';
  admin.messaging().send({
    notification: { title: 'SplashWash Test', body: 'Push notifications are working!' },
    token: dummyToken,
  })
    .then((result) => console.log('Notification sent:', result))
    .catch((err) => console.error('Firebase error:', err.message));
}
