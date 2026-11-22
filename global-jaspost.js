/* ELZKII JOKI — Jasa Post global (Firebase + local fallback). */
(function(){
  "use strict";
  const LOCAL_KEY="elzkii_jaspost";
  let db=null, ready=false, cache=[], listeners=[];
  const ADMINS=["cufflistore@gmail.com","hengkipratamaahmad@gmail.com"];
  function init(){
    if(ready) return true;
    try{
      if(typeof firebase==="undefined") return false;
      if(!firebase.apps.length && window.VoxyyOrders?.FIREBASE_CONFIG) firebase.initializeApp(window.VoxyyOrders.FIREBASE_CONFIG);
      db=firebase.database(); ready=true;
      db.ref("jaspost").on("value", snap=>{
        const val=snap.val()||{};
        cache=Object.keys(val).map(k=>({...val[k],_id:k})).sort((a,b)=>(Number(b.createdAt)||0)-(Number(a.createdAt)||0));
        saveLocal(cache); listeners.forEach(fn=>{try{fn(cache)}catch(e){}});
      });
      return true;
    }catch(e){ console.warn("[ELZKII JASPOST] init",e); return false; }
  }
  function local(){try{const a=JSON.parse(localStorage.getItem(LOCAL_KEY)||"[]");return Array.isArray(a)?a:[]}catch(e){return[]}}
  function saveLocal(a){try{localStorage.setItem(LOCAL_KEY,JSON.stringify(a||[]))}catch(e){}}
  function key(k){return String(k||"").trim().toUpperCase().replace(/[.#$\[\]]/g,"_")}
  async function add(item){
    if(!item||!item.kode) return {ok:false,error:"Data tidak lengkap"};
    const arr=local().filter(x=>x.kode!==item.kode); arr.unshift(item); saveLocal(arr);
    if(!init()||!db) return {ok:true,mode:"local"};
    try{
      const u=firebase.auth?.currentUser; const payload={...item};
      if(u){payload.uid=u.uid;payload.email=u.email||""}
      await db.ref("jaspost/"+key(item.kode)).set(payload); return {ok:true,mode:"global"};
    }catch(e){console.warn(e);return {ok:false,mode:"local",error:String(e)}}
  }
  async function getAll(){
    const l=local(); if(init()&&db){try{const s=await db.ref("jaspost").once("value"),v=s.val()||{};const a=Object.keys(v).map(k=>({...v[k],_id:k})).sort((x,y)=>(Number(y.createdAt)||0)-(Number(x.createdAt)||0));cache=a;saveLocal(a);return a}catch(e){}}
    return l.sort((a,b)=>(Number(b.createdAt)||0)-(Number(a.createdAt)||0));
  }
  async function update(k,patch){
    const a=local(),i=a.findIndex(x=>String(x.kode).toUpperCase()===String(k).toUpperCase()); if(i>=0){a[i]={...a[i],...patch,updatedAt:Date.now()};saveLocal(a)}
    if(!init()||!db)return{ok:i>=0}; try{await db.ref("jaspost/"+key(k)).update({...patch,updatedAt:Date.now()});return{ok:true}}catch(e){return{ok:i>=0,error:String(e)}}
  }
  async function remove(k){
    saveLocal(local().filter(x=>String(x.kode).toUpperCase()!==String(k).toUpperCase())); if(!init()||!db)return{ok:true}; try{await db.ref("jaspost/"+key(k)).remove();return{ok:true}}catch(e){return{ok:false,error:String(e)}}
  }
  function onChange(fn){if(typeof fn==="function")listeners.push(fn);init()}
  window.ElzkiiJaspost={add,getAll,update,remove,onChange,ADMINS,isAdmin:(u)=>!!u&&ADMINS.includes(String(u.email||"").toLowerCase())};
  document.addEventListener("DOMContentLoaded",init);
})();
