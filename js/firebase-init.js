const firebaseConfig = {
  apiKey: "AIzaSyBbLLyHlxiLxsdZdDq5p4YphPSrOsyFzRs",
  authDomain: "arcpersonalizados-99515.firebaseapp.com",
  databaseURL: "https://arcpersonalizados-99515-default-rtdb.firebaseio.com",
  projectId: "arcpersonalizados-99515",
  storageBucket: "arcpersonalizados-99515.firebasestorage.app",
  messagingSenderId: "622886902838",
  appId: "1:622886902838:web:1ba8bfec458e7c17eacc97"
};

firebase.initializeApp(firebaseConfig);

const arcAuth = firebase.auth ? firebase.auth() : null;
const arcDb = firebase.database();
