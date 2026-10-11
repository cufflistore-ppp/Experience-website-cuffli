/* ===================================
   VOXY MARKET ADMIN JAVASCRIPT
=================================== */



// ===============================
// NAVIGASI ADMIN
// ===============================


function pindahHalaman(url){

    window.location.href = url;

}





// Dashboard

function bukaDashboard(){

    pindahHalaman("admin.html");

}



// Pesanan

function bukaPesanan(){

    pindahHalaman("pesanan.html");

}



// Produk

function bukaProduk(){

    pindahHalaman("produk.html");

}



// Pengaturan

function bukaPengaturan(){

    pindahHalaman("pengaturan.html");

}



// User

function bukaUser(){

    pindahHalaman("user.html");

}







// ===============================
// DATA DASHBOARD SEMENTARA
// NANTI DIGANTI SUPABASE
// ===============================



let dataPesanan = {

    total : 125,

    menunggu : 12,

    proses : 30,

    selesai : 83

};








// ===============================
// TAMPIL DATA DASHBOARD
// ===============================


function tampilDashboard(){


    let total = document.getElementById("totalPesanan");

    let menunggu = document.getElementById("pesananMenunggu");

    let proses = document.getElementById("pesananProses");

    let selesai = document.getElementById("pesananSelesai");



    if(total){

        total.innerHTML = dataPesanan.total;

    }


    if(menunggu){

        menunggu.innerHTML = dataPesanan.menunggu;

    }


    if(proses){

        proses.innerHTML = dataPesanan.proses;

    }


    if(selesai){

        selesai.innerHTML = dataPesanan.selesai;

    }


}








// ===============================
// NOTIFIKASI PESANAN
// ===============================


function notifikasiPesanan(){


    let jumlah = dataPesanan.menunggu;



    if(jumlah > 0){


        console.log(
            "Ada "+jumlah+" pesanan baru"
        );


    }


}








// ===============================
// LOGOUT ADMIN
// ===============================


function logoutAdmin(){


    let yakin = confirm(
        "Keluar dari panel admin?"
    );


    if(yakin){


        localStorage.removeItem(
            "adminLogin"
        );


        window.location.href =
        "login.html";


    }


}








// ===============================
// SAAT HALAMAN DIBUKA
// ===============================


document.addEventListener(
"DOMContentLoaded",
function(){


    tampilDashboard();


    notifikasiPesanan();



});