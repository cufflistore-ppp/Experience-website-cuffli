(function(){
  "use strict";
  const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const attr=esc;
  function dataUrlToFile(dataUrl,name,type){
    const parts=dataUrl.split(","); const mime=(type||parts[0].match(/:(.*?);/)?.[1]||"image/jpeg");
    const bin=atob(parts[1]||""); const arr=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
    return new File([arr],name||"jaspost.jpg",{type:mime});
  }
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);alert("✅ Format Jasa Post berhasil disalin!");}
    catch(e){const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();alert("✅ Format Jasa Post berhasil disalin!")}
  }
  function downloadPhoto(item){
    if(!item.photoData)return alert("Foto tidak tersedia.");
    const a=document.createElement("a");a.href=item.photoData;a.download=item.photoName||`jaspost-${item.kode}.jpg`;document.body.appendChild(a);a.click();a.remove();
  }
  async function shareItem(item){
    const text=item.format||"";
    if(!navigator.share){ await copyText(text); return alert("Browser ini belum mendukung tombol Share. Format sudah disalin; foto bisa di-download."); }
    try{
      const payload={title:`Jasa Post ${item.kode}`,text};
      if(item.photoData && navigator.canShare){
        const file=dataUrlToFile(item.photoData,item.photoName,item.photoType);
        if(navigator.canShare({files:[file]})){payload.files=[file];}
      }
      await navigator.share(payload);
    }catch(e){ if(e?.name!=="AbortError") alert("Gagal membagikan Jasa Post."); }
  }
  async function updateStatus(kode,status){try{await window.ElzkiiJaspost.update(kode,{status});await load();}catch(e){alert("Gagal mengubah status.")}}
  async function removeItem(kode){if(!confirm("Hapus Jasa Post ini dari Panel Admin?"))return;try{await window.ElzkiiJaspost.remove(kode);await load()}catch(e){alert("Gagal menghapus Jasa Post.")}}
  function render(list){
    const box=document.getElementById("adminJaspostList"),count=document.getElementById("adminJaspostCount"); if(!box)return;
    const filter=document.getElementById("adminJaspostFilter")?.value||"all";
    const arr=(list||[]).filter(x=>filter==="all"||String(x.status||"Menunggu")===filter);
    if(count)count.textContent=`${arr.length} jasa post`;
    if(!arr.length){box.innerHTML='<div class="empty-history" style="min-height:220px;font-size:18px;">Belum ada Jasa Post.</div>';return;}
    box.innerHTML=arr.map(item=>{
      const status=item.status||"Menunggu";
      const bg=status==="Selesai"?"#e9f8ef":status==="Proses"?"#fff5dd":"#fff0f7";
      const color=status==="Selesai"?"#177245":status==="Proses"?"#996b00":"#a52c68";
      const photo=item.photoData?`<div style="margin-top:10px"><img src="${attr(item.photoData)}" alt="Foto Jasa Post" style="width:100%;max-width:320px;max-height:300px;object-fit:contain;background:#f8f3f6;border-radius:10px;border:1px solid #ead9e1;display:block"></div>`:"<div style='margin-top:10px;color:#aaa;font-size:12px;'>❌ Foto tidak tersedia</div>";
      const id=attr(item.kode||"");
      return `<article class="admin-report-card jaspost-admin-card">\n        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:9px;">\n          <div><strong style="color:#a52c68;font-size:14px;">${esc(item.kode||"-")}</strong><div style="font-size:11px;color:#9b9199;margin-top:3px;">${esc(item.waktu|| (item.createdAt?new Date(item.createdAt).toLocaleString("id-ID"):"-"))}</div></div>\n          <span style="font-size:11px;padding:5px 8px;border-radius:8px;white-space:nowrap;background:${bg};color:${color};">${esc(status)}</span>\n        </div>\n        <div style="font-size:13px;line-height:1.65;color:#68616a;">\n          <div>👜 <b>Nama Barang:</b> ${esc(item.namaBarang||"-")}</div>\n          <div>💰 <b>Harga:</b> ${esc(item.harga||"-")}</div>\n          <div>🔁 <b>Jual/Beli:</b> ${esc(item.jualBeli||"-")}</div>\n          <div>🏷️ <b>MC:</b> ${esc(item.mc||"ELZKII STR")}</div>\n          <div>📱 <b>No Penjual:</b> ${esc(item.noPenjual||"-")}</div>\n          <div style="margin-top:10px;background:#fff8fb;border:1px solid #f0d5e2;border-radius:9px;padding:10px;">\n            <div style="font-size:11px;color:#a52c68;font-weight:800;margin-bottom:6px;">FORMAT JASPOST</div>\n            <pre style="white-space:pre-wrap;font-family:inherit;margin:0;color:#5f5962;font-size:13px;">${esc(item.format||"")}</pre>\n          </div>\n          ${photo}\n        </div>\n        <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px;">\n          <button type="button" class="status-btn btn-proses" onclick="window.ejCopyJaspost('${id}')"><i class="fa-solid fa-copy"></i> Salin Format</button>\n          <button type="button" class="status-btn btn-paid" onclick="window.ejDownloadJaspost('${id}')"><i class="fa-solid fa-download"></i> Download Foto</button>\n          <button type="button" class="status-btn" style="background:#7048a8;color:#fff" onclick="window.ejShareJaspost('${id}')"><i class="fa-solid fa-share-nodes"></i> Bagikan</button>\n          <button type="button" class="status-btn btn-proses" onclick="window.ejStatusJaspost('${id}','Proses')">Proses</button>\n          <button type="button" class="status-btn btn-paid" onclick="window.ejStatusJaspost('${id}','Selesai')">Selesai</button>\n          <button type="button" class="status-btn btn-delete" onclick="window.ejDeleteJaspost('${id}')">Hapus</button>\n        </div>\n      </article>`;
    }).join("");
  }
  async function load(){const box=document.getElementById("adminJaspostList");if(!box)return;box.innerHTML='<p style="color:#aaa;text-align:center;padding:20px;">Memuat Jasa Post...</p>';const list=await window.ElzkiiJaspost.getAll();window._elzkiiJaspostCache=list;render(list)}
  window.ejLoadJaspost=load;
  window.ejCopyJaspost=kode=>{const x=(window._elzkiiJaspostCache||[]).find(a=>String(a.kode)===String(kode));if(x)copyText(x.format||"")};
  window.ejDownloadJaspost=kode=>{const x=(window._elzkiiJaspostCache||[]).find(a=>String(a.kode)===String(kode));if(x)downloadPhoto(x)};
  window.ejShareJaspost=kode=>{const x=(window._elzkiiJaspostCache||[]).find(a=>String(a.kode)===String(kode));if(x)shareItem(x)};
  window.ejStatusJaspost=(kode,status)=>updateStatus(kode,status);
  window.ejDeleteJaspost=kode=>removeItem(kode);
  document.addEventListener("DOMContentLoaded",()=>{
    document.getElementById("adminJaspostFilter")?.addEventListener("change",()=>render(window._elzkiiJaspostCache||[]));
    if(window.ElzkiiJaspost)window.ElzkiiJaspost.onChange(list=>{window._elzkiiJaspostCache=list;if(!document.getElementById("view-jaspost")?.hidden)render(list)});
  });
})();
