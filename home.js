// ================= AMBIL PRODUK ADMIN =================


let produkHome =
JSON.parse(
localStorage.getItem("produkVoxy")
) || [];





function tampilProdukHome(){


let container =
document.getElementById("productContainerHome");



if(!container){

return;

}





container.innerHTML="";






produkHome.forEach(function(item){



container.innerHTML += `


<div class="product-card">



<img 
src="${item.gambar}">





<h3>

${item.nama}

</h3>




<p>

${item.deskripsi || "Produk digital premium"}

</p>





<div class="product-bottom">


<b>

Rp ${Number(item.harga).toLocaleString("id-ID")}

</b>



<button onclick="beliProduk('${item.id}')">

+

</button>


</div>




</div>


`;



});



}





function beliProduk(id){



localStorage.setItem(
"produkDipilih",
id
);



window.location.href=
"detail-produk.html";


}







tampilProdukHome()


// ===============================
// LOAD PRODUK DARI ADMIN
// ===============================


window.addEventListener("load", function(){


let produk =
JSON.parse(
localStorage.getItem("produkVoxy")
) || [];



let area =
document.getElementById("produkAdmin");



if(!area){

console.log("produkAdmin tidak ada");

return;

}




area.innerHTML="";



produk.forEach(function(p){



area.innerHTML += `


<div class="product-card">


<img 
src="${p.gambar}"
onerror="this.src='assets/no-image.png'">



<h3>

${p.nama}

</h3>



<p>

${p.deskripsi || "Produk digital VOXY"}

</p>



<div class="product-bottom">


<b>

Rp${Number(p.harga).toLocaleString("id-ID")}

</b>



<button onclick="beliProdukAdmin(${p.id})">

🛒

</button>



</div>



</div>



`;



});



});







function beliProdukAdmin(id){


let produk =
JSON.parse(
localStorage.getItem("produkVoxy")
);



let pilih =
produk.find(
p=>p.id==id
);



localStorage.setItem(

"produkDipilih",

JSON.stringify(pilih)

);



window.location.href="detail-produk.html";


}