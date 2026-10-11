let produk = JSON.parse(
localStorage.getItem("produkVoxy")
) || [];



let gambarBase64 = "";





// PREVIEW FOTO

document
.getElementById("gambarProduk")
.addEventListener(
"change",
function(e){


let file =
e.target.files[0];


if(file){


let reader =
new FileReader();



reader.onload=function(event){


gambarBase64 =
event.target.result;



document
.getElementById("previewProduk")
.src =
gambarBase64;



}



reader.readAsDataURL(file);



}


});







// SIMPAN PRODUK


document
.getElementById("btnSimpan")
.addEventListener(
"click",
function(){



let nama =
document.getElementById("namaProduk").value;


let harga =
document.getElementById("hargaProduk").value;


let kategori =
document.getElementById("kategoriProduk").value;


let tipe =
document.getElementById("tipeProduk").value;


let deskripsi =
document.getElementById("deskripsiProduk").value;






if(
nama=="" ||
harga=="" ||
gambarBase64==""

){

alert(
"Lengkapi data dan pilih gambar"
);

return;


}






let data = {


id:Date.now(),

nama:nama,

harga:harga,

kategori:kategori,

tipe:tipe,

deskripsi:deskripsi,

gambar:gambarBase64


};






produk.push(data);





localStorage.setItem(

"produkVoxy",

JSON.stringify(produk)

);






alert(
"Produk berhasil disimpan"
);






tampilkanProduk();





});









function tampilkanProduk(){



let area =
document.getElementById(
"productContainer"
);



area.innerHTML="";





produk.forEach(function(item){



area.innerHTML += `


<div class="admin-product-card">


<img src="${item.gambar}">


<div>


<h3>${item.nama}</h3>


<p>
Rp ${Number(item.harga).toLocaleString()}
</p>


<p>
${item.tipe}
</p>


</div>


</div>


`;



});



}





tampilkanProduk();