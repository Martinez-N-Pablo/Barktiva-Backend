import admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}');

console.log(serviceAccount);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: 'tu-bucket.appspot.com' // 🔁 Reemplaza con el nombre de tu bucket
  });
}

export const bucket = admin.storage().bucket();