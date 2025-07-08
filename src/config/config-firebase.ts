import admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}');

if (!serviceAccount) {
  throw new Error('FIREBASE_CREDENTIALS no está definida');
}

//Corregir error de railway

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: 'barktiva-b35a6.firebasestorage.app'
  });
}

export const bucket = admin.storage().bucket();