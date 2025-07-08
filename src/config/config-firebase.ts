import admin from 'firebase-admin';

const rawCredentials = JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}');

if (!rawCredentials) {
  throw new Error('FIREBASE_CREDENTIALS no está definida');
}

console.log("serviceAccount");
console.log(rawCredentials);

//Corregir error de railway
const serviceAccount = JSON.parse(
  rawCredentials.replace(/\\n/g, '\n')
);


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: 'barktiva-b35a6.firebasestorage.app'
  });
}

export const bucket = admin.storage().bucket();