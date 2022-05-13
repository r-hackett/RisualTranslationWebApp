const firebaseConfig = {
    apiKey: "AIzaSyCaBo-Vvhn43LscGAaoxDt-rD0ZNLK0g0s",
    authDomain: "translate-app-5.firebaseapp.com",
    projectId: "translate-app-5",
    storageBucket: "translate-app-5.appspot.com",
    messagingSenderId: "21403966236",
    appId: "1:21403966236:web:b4b90da189ce016054f8d9"
  };

const app = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const mailField = document.getElementById('mail');
const passwordField = document.getElementById('password');
const signInWithMail = document.getElementById('signInWithMail');
const errorMsg = document.getElementById('errorMsg');

const signInWithEmailFunction = () => {
    const email = mailField.value;
    const password = passwordField.value;
  
    //Built in firebase function responsible for authentication
    auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      //Signed in successfully
      window.location.assign('./translate')
    })
    .catch(error => {
      //Something went wrong
      console.error(error);
      errorMsg.innerText="Error: Incorrect credentials"
    })
}


signInWithMail.addEventListener('click', signInWithEmailFunction);