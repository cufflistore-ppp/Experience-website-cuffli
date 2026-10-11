// =====================================
// VOXY MARKET ADMIN PESANAN
// =====================================


function tampilPesanan(){


let data = JSON.parse(

localStorage.getItem("pesananVoxy")

) || [];




let area =
document.getElementById("listPesanan");




if(!area){

return;

}



area.innerHTML="";





data.forEach(function(pesanan){



area.innerHTML += `


<div class="order-card">


<h3>
Detail Pesanan
</h3>



<p>

Kode Pesanan:

<b>

${pesanan.kode}

</b>

</p>


<img 
src="${pesanan.gambar || 'assets/no-image.png'}"
style="
width:120px;
height:120px;
object-fit:cover;
border-radius:20px;
"
onerror="this.src='assets/no-image.png'"
>


<p>

Produk:

<b>

${pesanan.namaProduk}

</b>

</p>


<p>

Produk:

<b>

${pesanan.namaProduk}

</b>

</p>






<p>

Harga:

Rp${Number(pesanan.harga)
.toLocaleString("id-ID")}

</p>







<p>

Kategori:

${pesanan.kategori}

</p>







<p>

Status:

<span>

${pesanan.status}

</span>

</p>






<p>

Tanggal:

${pesanan.tanggal}

</p>






<button onclick="prosesPesanan('${pesanan.kode}')">

Proses

</button>






<button onclick="selesaiPesanan('${pesanan.kode}')">

Selesai

</button>






</div>



`;



});



}








function prosesPesanan(kode){


ubahStatus(
kode,
"Sedang Diproses"
);


}





function selesaiPesanan(kode){


ubahStatus(
kode,
"Selesai"
);


}







function ubahStatus(
kode,
statusBaru
){



let data = JSON.parse(

localStorage.getItem("pesananVoxy")

) || [];




data = data.map(item=>{


if(item.kode == kode){

item.status=statusBaru;

}


return item;


});





localStorage.setItem(

"pesananVoxy",

JSON.stringify(data)

);





tampilPesanan();


}







tampilPesanan();