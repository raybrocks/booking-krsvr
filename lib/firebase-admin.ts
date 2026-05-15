import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const apps = getApps();

if (!apps.length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const adminDb = getFirestore(firebaseConfig.firestoreDatabaseId);

