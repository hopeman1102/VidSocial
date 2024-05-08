import Firebase from 'firebase';


const firebaseConfig = {
  apiKey: "AIzaSyBsMKIBs3auP4CrqBA8wclR0__Dybx_mDQ",
  authDomain: "vidsocial-27ba7.firebaseapp.com",
  databaseURL: "https://vidsocial-27ba7-default-rtdb.firebaseio.com",
  projectId: "vidsocial-27ba7",
  storageBucket: "vidsocial-27ba7.appspot.com",
  messagingSenderId: "965592363246",
  appId: "1:965592363246:web:74dffd11f000304de9c3ff",
  measurementId: "G-GJDJ5R758G"
};

export default Firebase.initializeApp(firebaseConfig);