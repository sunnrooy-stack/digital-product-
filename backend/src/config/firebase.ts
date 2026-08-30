import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('⚡️[server]: Firebase Admin SDK initialized');
    } catch (error) {
      console.warn('Firebase Admin SDK initialization warning:', (error as any).message || error);
    }
  } else {
    console.log('ℹ️ Firebase environment credentials not provided; running with fallback authentication.');
  }
}

export default admin;
