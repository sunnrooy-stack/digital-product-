import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Usually, you should use a service account key JSON file
// For demo purposes, we can initialize without credentials if running on GCP
// or use env vars

const serviceAccountParams = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Fix for newline parsing in private key
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountParams),
    });
    console.log('⚡️[server]: Firebase Admin SDK initialized');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error', error);
  }
}

export default admin;
