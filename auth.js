// VOXY AUTH SYSTEM


const auth = firebase.auth();



function daftarUser(email,password){


return auth
.createUserWithEmailAndPassword(
email,
password
);


}



function loginUser(email,password){


return auth
.signInWithEmailAndPassword(
email,
password
);


}



function logoutUser(){

return auth.signOut();

}



auth.onAuthStateChanged(
(user)=>{

if(user){

console.log(
"Login:",
user.email
);

}

}
);