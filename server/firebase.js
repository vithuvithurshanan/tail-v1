import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');

let db;

try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
        credential: cert(serviceAccount)
    });
    db = getFirestore();
    console.log('🔥 Firebase Firestore connected successfully!');
} catch (error) {
    console.error('❌ Error initializing Firebase. Make sure serviceAccountKey.json exists in server/ folder.');
    console.error(error.message);
    // For development, we might not want to crash the whole app immediately
}

export default db;
