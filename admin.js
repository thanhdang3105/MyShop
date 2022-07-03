const { initializeApp, cert } = require('firebase-admin/app');
const admin_key = require('./myshop-f370b-firebase-adminsdk-ryxnt-7d3439f500.json')
const { getAuth } = require('firebase-admin/auth');

const app = initializeApp({
    credential: cert(admin_key),
    databaseURL: 'https://MyShop.firebaseio.com'
});

const auth = getAuth(app);

module.exports = {auth}

