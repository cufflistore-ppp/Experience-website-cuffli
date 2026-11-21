/* ELZKII JOKI authentication + role guard. Firebase compat SDK must load first. */
(function(){
 const ADMINS=['cufflistore@gmail.com','hengkipratamahmad@gmail.com'];
 const CONFIG={apiKey:'AIzaSyB4b_vR90K80f5UcpWWS_m3euHn_X3xT7w',authDomain:'elzikiijoki.firebaseapp.com',databaseURL:'https://elzikiijoki-default-rtdb.asia-southeast1.firebasedatabase.app',projectId:'elzikiijoki',storageBucket:'elzikiijoki.firebasestorage.app',messagingSenderId:'226591865660',appId:'1:226591865660:web:08f67a832338500a237c39',measurementId:'G-VL9RXPECJR'};
 const GOOGLE_CLIENT_ID='728120154992-eji5q980k5dbn6ucqri7op334uv7cj01.apps.googleusercontent.com';
 if(typeof firebase==='undefined') return;
 if(!firebase.apps.length) firebase.initializeApp(CONFIG);
 const auth=firebase.auth(), db=firebase.database();
 const isAdmin=u=>!!u&&u.emailVerified===true&&ADMINS.includes(String(u.email||'').toLowerCase());
 window.EJ={auth,db,ADMINS,GOOGLE_CLIENT_ID,isAdmin,CONFIG};
 window.EJ.signInGoogle=()=>auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
 window.EJ.signInEmail=(email,password)=>auth.signInWithEmailAndPassword(email,password);
 window.EJ.registerEmail=(email,password)=>auth.createUserWithEmailAndPassword(email,password);
 window.EJ.signOut=()=>auth.signOut().then(()=>location.replace('index.html'));
 const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
 if(page==='index.html'||page==='') return;
 auth.onAuthStateChanged(user=>{
   if(!user){location.replace('index.html');return;}
   try{const k=btoa(String(user.email||'').toLowerCase()).replace(/[.#$\[\]/]/g,'_');db.ref('userIndex/'+k).set({uid:user.uid,email:String(user.email||'')});}catch(e){}
   if(page==='admin.html'&&!isAdmin(user)){alert('Akses panel admin hanya untuk admin resmi ELZKII JOKI.');location.replace('home.html');return;}
   document.documentElement.classList.add('ej-authenticated');
 });
})();
