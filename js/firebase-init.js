const firebaseConfig = {
  apiKey: "AIzaSyDOQZJQiltlQKIIIiYki_JQinAV4lX0m3E",
  authDomain: "fb-general-stores.firebaseapp.com",
  projectId: "fb-general-stores",
  storageBucket: "fb-general-stores.firebasestorage.app",
  messagingSenderId: "780236289961",
  appId: "1:780236289961:web:c4d6ce274d49645d84b6b8"
};

firebase.initializeApp(firebaseConfig);

const arcAuth = firebase.auth ? firebase.auth() : null;
const arcDb = firebase.firestore();
