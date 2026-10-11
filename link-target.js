// =====================================
// VOXY MARKET ISI TARGET JS
// =====================================



let pesananTarget = JSON.parse(

localStorage.getItem("pesananLinkTarget")

);





if(pesananTarget){



document.getElementById("kodePesanan").innerHTML =
pesananTarget.kode;



document.getElementById("namaProduk").innerHTML =
pesananTarget.namaProduk;



}








function kirimLink(){



let link = document.getElementById(
"linkTarget"
).value;





if(!link){


alert(
"Silahkan isi link target terlebih dahulu"
);


return;


}







let semuaPesanan = JSON.parse(

localStorage.getItem("pesananVoxy")

) || [];







semuaPesanan.forEach(function(item){



if(item.kode == pesananTarget.kode){



item.linkTarget = link;


item.status =
"Menunggu Verifikasi Admin";



}



});







localStorage.setItem(

"pesananVoxy",

JSON.stringify(semuaPesanan)

);







alert(

"Pesanan berhasil dikirim, tunggu verifikasi admin"

);







window.location.href =
"riwayat.html";



}