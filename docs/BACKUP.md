# Backup dan Restore Database

Backup harian berjalan lewat GitHub Actions ([db-backup.yml](../.github/workflows/db-backup.yml)):
`pg_dump` dari Neon, lalu diunggah ke bucket S3 (disimpan 30 hari).

## Restore ke database kosong
1. Unduh berkas backup dari S3:
   `aws s3 cp s3://NAMA_BUCKET/forwarding/FILE.dump . --profile forwarding --region ap-southeast-2`
2. Buat database kosong (misalnya branch/database baru di Neon).
3. Pulihkan:
   `pg_restore --no-owner --dbname "CONNECTION_STRING_DB_KOSONG" FILE.dump`
4. Arahkan backend ke database itu dengan mengganti parameter `DbHost`, `DbName`, `DbUser`, `DbPassword` pada stack.

Uji restore minimal sekali ke database kosong sebelum aplikasi dipakai untuk data nyata.
