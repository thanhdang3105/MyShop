const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const app = initializeApp({
    credential: cert({
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.CLIENT_EMAIL,
        privateKey: `-----BEGIN PRIVATE KEY-----${process.env.PRIVATE_KEY}-----END PRIVATE KEY-----\n`
      }),
    databaseURL: 'https://MyShop.firebaseio.com'
});

const auth = getAuth(app);

module.exports = {auth}

