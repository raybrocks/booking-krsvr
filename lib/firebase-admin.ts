import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const apps = getApps();

if (!apps.length) {
  let credential = undefined;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = cert(serviceAccount);
      console.log('Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT_KEY');
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. It must be a valid JSON string.', e);
    }
  } else {
    console.warn('No FIREBASE_SERVICE_ACCOUNT_KEY found. Falling back to Application Default Credentials (only works in AI Studio/GCP).');
  }

  const appOptions: any = { projectId: firebaseConfig.projectId };
  if (credential) {
    appOptions.credential = credential;
  }
  
  initializeApp(appOptions);
}

export const adminDb = getFirestore(firebaseConfig.firestoreDatabaseId);

