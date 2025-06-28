//utils//firebaseAdmin.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      require("../config/multivendor-6fc02-firebase-adminsdk-fbsvc-7d0ff03d86.json")
    ),
  });
}

module.exports = admin;
