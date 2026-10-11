// ===============================
// DETAIL PRODUK VOXY MARKET
// ===============================


function beliSekarang(){


    let produk = JSON.parse(
        localStorage.getItem("produkDipilih")
    );


    if(!produk){

        alert("Produk tidak ditemukan");

        return;

    }



    window.location.href =
    "pembayaran.html";


}