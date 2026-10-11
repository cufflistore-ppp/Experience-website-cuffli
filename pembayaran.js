// =====================================
// VOXY MARKET PAYMENT SYSTEM
// =====================================



function konfirmasiPembayaran(){



let produk = JSON.parse(

localStorage.getItem("produkDipilih")

);





if(!produk){


alert("Produk tidak ditemukan");


return;


}





let bukti = document.getElementById(
"buktiPembayaran"
);





if(!bukti.files.length){


alert(
"Silahkan upload bukti pembayaran terlebih dahulu"
);


return;


}







let transaksi = {


kode:
"VX" + Math.floor(Math.random()*900000+100000),


namaProduk:
produk.nama,


harga:
produk.harga,


gambar:
produk.gambar,


kategori:
produk.kategori,


status:
"Menunggu Verifikasi",


linkTarget:"",


tanggal:
new Date().toLocaleDateString("id-ID")



};









// SIMPAN RIWAYAT USER


let riwayat = JSON.parse(

localStorage.getItem("riwayatTransaksi")

) || [];






riwayat.push(transaksi);






localStorage.setItem(

"riwayatTransaksi",

JSON.stringify(riwayat)

);









// SIMPAN UNTUK ADMIN


let pesanan = JSON.parse(

localStorage.getItem("pesananVoxy")

) || [];






pesanan.push(transaksi);






localStorage.setItem(

"pesananVoxy",

JSON.stringify(pesanan)

);









// KHUSUS JASA SUNTIK


if(produk.kategori == "Jasa Suntik"){



localStorage.setItem(

"pesananLinkTarget",

JSON.stringify(transaksi)

);






window.location.href =
"isi-target.html";



return;


}









alert(

"Pembayaran berhasil dikirim. Menunggu verifikasi admin."

);






window.location.href =
"riwayat.html";



}