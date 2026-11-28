# Doxy

## Upload video produk (maksimal 100 MB)

1. Firebase Console → Storage → Rules. Salin isi file `storage.rules` dari folder ini dan klik Publish.
2. Pastikan Firebase Storage sudah diaktifkan pada project `doxyjoki-5605a`.
3. Panel Edit Produk: pilih video dari HP/PC (maks. 100 MB), lalu klik Simpan. Jika diminta, login Google dengan email admin `cufflistore@gmail.com` atau `hengkipratamaahmad@gmail.com`.
4. Upload memakai Firebase Storage resumable; URL video disimpan otomatis pada produk.

Rules Storage membatasi ukuran secara server-side maksimal 104.857.600 byte (100 MiB), hanya file video, dan hanya dua email admin tersebut yang boleh upload atau menghapus.
