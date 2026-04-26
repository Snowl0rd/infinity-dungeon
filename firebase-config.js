// Firebase Configuration
// ЗАМЕНИТЕ НА ВАШИ КОНФИГУРАЦИОННЫЕ ДАННЫЕ ИЗ FIREBASE CONSOLE

const firebaseConfig = {
  apiKey: "AIzaSyByxVGPPz-tPgQy6-jEOEpW1SHWWDUjK9U",
  authDomain: "infinity-dungeon.firebaseapp.com",
  databaseURL: "https://infinity-dungeon-default-rtdb.firebaseio.com",
  projectId: "infinity-dungeon",
  storageBucket: "infinity-dungeon.firebasestorage.app",
  messagingSenderId: "370346213746",
  appId: "1:370346213746:web:cd5f937537be87285f1deb",
  measurementId: "G-X8TLQR543B"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Enable offline persistence (optional)
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.log('The current browser does not support persistence.');
    }
  });
