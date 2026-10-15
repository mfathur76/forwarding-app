# Blueprint Fase 1 - Aplikasi Forwarding

## 1. Tujuan Fase 1
Membangun MVP operasional internal untuk perusahaan forwarding agar proses master data, pembuatan pengiriman, penagihan faktur, dan monitoring dasar berjalan end-to-end.

Output utama fase ini:
- CRUD data master: Pelanggan, Pengemudi, Kendaraan.
- CRUD transaksi: Pengiriman, Faktur.
- Dasbor ringkasan operasional.
- Alur status pengiriman dan status pembayaran faktur.
- Pencarian dan filter dasar di setiap list.

Di luar fase 1 (ditunda):
- Integrasi GPS/tracking real-time.
- Notifikasi WhatsApp/email otomatis.
- Multi-cabang dan multi-gudang.
- Akuntansi lanjutan (jurnal, rekonsiliasi bank).
- Mobile app.

## 2. Persona dan Role
Role minimum fase 1:
- Admin Operasional: kelola semua modul.

Opsional (jika ingin dipisah sejak awal):
- Billing: fokus faktur dan pembayaran.
- Dispatcher: fokus pengiriman.

Rekomendasi fase 1: gunakan satu role dulu (Admin Operasional) agar delivery cepat.

## 3. Scope Fitur per Modul

### 3.1 Dasbor
Fitur:
- Menampilkan KPI:
  - Total pengiriman.
  - Total pelanggan.
  - Total pengemudi.
  - Total kendaraan.
  - Pendapatan lunas.
  - Tagihan terutang.
- Menampilkan 5 pengiriman terbaru (no lacak, rute, status).
- Menampilkan ringkasan status pengiriman.

Acceptance criteria:
- KPI sinkron dengan data transaksi aktual.
- Data dashboard memuat <= 2 detik untuk data <= 10.000 record.

### 3.2 Pelanggan
Fitur:
- List, cari, tambah, ubah, hapus pelanggan.
- Field: nama, perusahaan, telepon, email, NPWP, alamat.

Validasi:
- Nama wajib.
- Email format valid (jika diisi).
- Telepon hanya angka/simbol yang diizinkan.

Acceptance criteria:
- CRUD pelanggan berjalan tanpa reload halaman penuh (jika SPA) atau dengan redirect konsisten (jika SSR).

### 3.3 Pengemudi
Fitur:
- List, cari, tambah, ubah, hapus pengemudi.
- Field: nama, telepon, no SIM, status, alamat.
- Status: Tersedia, Bertugas, Nonaktif.

Validasi:
- Nama wajib.
- No SIM unik (minimal pada pengemudi aktif).

### 3.4 Kendaraan
Fitur:
- List, cari, tambah, ubah, hapus kendaraan.
- Field: plat nomor, tipe, merek, kapasitas (kg), tahun, status.
- Status: Tersedia, Bertugas, Perawatan, Nonaktif.

Validasi:
- Plat nomor wajib dan unik.
- Kapasitas angka >= 0.

### 3.5 Pengiriman
Fitur:
- List, cari, filter status, tambah, ubah, hapus pengiriman.
- Field:
  - No lacak (auto-generate).
  - Pelanggan (wajib).
  - Asal (wajib).
  - Tujuan (wajib).
  - Pengemudi.
  - Kendaraan.
  - Berat (kg).
  - Harga (Rp).
  - Tanggal pickup.
  - Tanggal antar.
  - Deskripsi muatan.
  - Catatan.
  - Status.
- Status pengiriman: Menunggu, Dalam Perjalanan, Terkirim, Dibatalkan.

Aturan bisnis inti:
- Saat status jadi Dalam Perjalanan, pengemudi/kendaraan terkait otomatis menjadi Bertugas.
- Saat status jadi Terkirim atau Dibatalkan, pengemudi/kendaraan bisa dikembalikan ke Tersedia.

Acceptance criteria:
- Perubahan status tercatat dengan timestamp (minimal updated_at).
- No lacak unik dan terbentuk otomatis.

### 3.6 Faktur
Fitur:
- List, cari, filter status, tambah, ubah, hapus faktur.
- Field:
  - No faktur (auto-generate).
  - Pelanggan (wajib).
  - Terkait pengiriman (wajib).
  - Tanggal terbit.
  - Jatuh tempo.
  - Jumlah/subtotal (Rp).
  - Pajak (Rp).
  - Total tagihan (otomatis).
  - Status pembayaran.
  - Catatan.
- Status pembayaran: Belum Bayar, Sebagian, Lunas, Lewat Jatuh Tempo.

Aturan bisnis inti:
- Total = jumlah + pajak.
- Bila tanggal hari ini > jatuh tempo dan status belum Lunas, tampilkan sebagai Lewat Jatuh Tempo.

Acceptance criteria:
- Perhitungan total selalu konsisten di UI dan backend.
- Filter status pembayaran bekerja akurat.

## 4. Data Model Awal (ERD Konseptual)
Tabel inti (PostgreSQL):
- users
- customers
- drivers
- vehicles
- shipments
- invoices
- document_sequences

Relasi fase 1 (simple):
- shipments.customer_id -> customers.id
- shipments.driver_id -> drivers.id (nullable)
- shipments.vehicle_id -> vehicles.id (nullable)
- invoices.customer_id -> customers.id
- invoices.shipment_id -> shipments.id (wajib, one-to-one di fase 1)

Rekomendasi MVP:
- Keputusan terkunci: 1 faktur hanya untuk 1 pengiriman.
- Tambahkan unique index pada invoices.shipment_id agar satu shipment tidak bisa ditagih lebih dari satu faktur.

Catatan implementasi PostgreSQL:
- Gunakan foreign key untuk menjaga integritas relasi antar tabel.
- Gunakan transaction saat create shipment/invoice dan saat generate nomor dokumen.
- Simpan sequence global di tabel document_sequences agar nomor dokumen tidak bentrok.

## 5. Standar Penomoran Dokumen
No lacak (shipment):
- Format: RAT-YYMMDD-XXXXX
- Contoh: RAT-260611-00001

No faktur (invoice):
- Format: INV-YYMMDD-XXXXX
- Contoh: INV-260611-00001

Catatan:
- Keputusan terkunci: counter nomor dokumen bersifat global (tidak reset harian).
- Simpan sequence secara transaksional untuk menghindari duplikasi.

## 6. API Kontrak Minimum (Backend)
Prefix: /api/v1

Endpoint inti:
- Auth:
  - POST /auth/login
  - POST /auth/logout
- Dashboard:
  - GET /dashboard/summary
- Customers:
  - GET /customers
  - POST /customers
  - GET /customers/{id}
  - PUT /customers/{id}
  - DELETE /customers/{id}
- Drivers:
  - GET /drivers
  - POST /drivers
  - PUT /drivers/{id}
  - DELETE /drivers/{id}
- Vehicles:
  - GET /vehicles
  - POST /vehicles
  - PUT /vehicles/{id}
  - DELETE /vehicles/{id}
- Shipments:
  - GET /shipments
  - POST /shipments
  - GET /shipments/{id}
  - PUT /shipments/{id}
  - DELETE /shipments/{id}
  - PATCH /shipments/{id}/status
- Invoices:
  - GET /invoices
  - POST /invoices
  - GET /invoices/{id}
  - PUT /invoices/{id}
  - DELETE /invoices/{id}
  - PATCH /invoices/{id}/status

Response standard:
- JSON konsisten: success, message, data, meta (pagination).
- Error validasi: code 422 dengan detail field-level.

## 7. Aturan Validasi dan Integritas Data
- Hard delete di fase 1 boleh, tapi lebih aman soft delete untuk master data.
- Tidak boleh menghapus pelanggan jika masih dipakai transaksi aktif (opsional: blokir delete).
- Tanggal antar tidak boleh lebih kecil dari tanggal pickup.
- Harga, jumlah, pajak tidak boleh negatif.
- Status enum wajib sesuai daftar.

## 8. UI/UX Implementation Notes
- Pertahankan gaya UI dari desain: sidebar gelap + aksen oranye.
- Komponen wajib:
  - Tabel dengan search dan filter status.
  - Modal form tambah/ubah.
  - Badge status dengan warna berbeda.
  - Date picker untuk field tanggal.
  - Currency formatting untuk Rupiah.
- Responsif:
  - Desktop prioritas utama.
  - Mobile minimal tetap bisa list + tambah data.

## 9. Security dan Audit Minimum
- Login wajib sebelum akses modul.
- Password di-hash kuat (bcrypt/argon2).
- Semua endpoint divalidasi server-side.
- Log aktivitas minimum:
  - create/update/delete pada shipments dan invoices.
  - actor, waktu, entity, perubahan ringkas.

## 10. Rencana Implementasi (Sprint Fase 1)
Sprint 1 (minggu 1):
- Setup project, auth, layout, komponen dasar (tabel, modal, form).
- CRUD customers, drivers, vehicles.

Sprint 2 (minggu 2):
- Modul shipments end-to-end.
- Auto nomor lacak.
- Logika sinkron status pengemudi/kendaraan.

Sprint 3 (minggu 3):
- Modul invoices end-to-end.
- Auto nomor faktur.
- Kalkulasi total, filter status pembayaran.
- Dashboard summary.

Sprint 4 (minggu 4):
- Hardening: validasi, bugfix, audit log minimal.
- UAT internal + perbaikan.
- Persiapan deploy.

## 11. Definisi Selesai (Definition of Done)
Satu fitur dianggap selesai jika:
- Acceptance criteria terpenuhi.
- Sudah lolos test manual end-to-end.
- Error handling dan validasi backend aktif.
- UI sesuai desain inti.
- Tidak ada bug blocker/high di modul tersebut.

## 12. Test Scenario Prioritas
- Buat pelanggan -> buat pengiriman -> ubah status pengiriman -> buat faktur -> ubah status pembayaran -> cek dashboard.
- Coba input invalid (tanggal terbalik, nilai negatif, field wajib kosong).
- Coba delete data yang masih direlasikan.
- Cek filter status di list pengiriman dan faktur.
- Cek konsistensi perhitungan total invoice.

## 13. Keputusan yang Perlu Dikunci Sebelum Coding
- Keputusan terkunci: Node.js (backend utama).
- Keputusan terkunci: satu faktur untuk satu pengiriman.
- Apakah butuh soft delete sejak awal.
- Keputusan terkunci: counter nomor dokumen global.
- Scope role: satu role dulu atau dipisah.
- Keputusan terkunci: database menggunakan PostgreSQL.
- Keputusan terkunci: development lokal menggunakan Docker.

## 14. Rekomendasi Deploy (MacBook Pro vs AWS)
Rekomendasi praktis:
- Development di MacBook Pro menggunakan Docker Compose (node app + postgresql + adminer) agar setup lokal cepat dan konsisten.
- Production di AWS agar stabil, dapat diakses tim, dan mudah backup/scale.

Opsi AWS untuk fase 1:
- Opsi hemat (awal): 1 EC2/Lightsail kecil untuk Node.js API + PostgreSQL self-hosted.
- Opsi stabil (disarankan saat mulai dipakai tim): Node.js API di EC2 + Amazon RDS PostgreSQL.

Topologi minimum produksi:
- Nginx + aplikasi (container/proses) di compute instance.
- Database di PostgreSQL (self-hosted atau RDS PostgreSQL).
- S3 untuk penyimpanan berkas (jika nanti ada upload dokumen).
- CloudWatch untuk log dan alert dasar.

Checklist produksi minimum:
- Domain + HTTPS (ACM/Let's Encrypt).
- Backup otomatis database harian (snapshot RDS atau backup job PostgreSQL).
- Environment terpisah: dev, staging, production.
- Secret disimpan aman (Parameter Store/Secrets Manager).
- Firewall/security group hanya membuka port yang dibutuhkan.

Catatan biaya Free Tier:
- PostgreSQL di AWS bisa memanfaatkan free tier terbatas (umumnya 12 bulan untuk akun baru), setelah itu ada biaya bulanan tetap.
- Aktifkan AWS Budgets dengan notifikasi email agar tidak lewat kuota gratis.

---
Dokumen ini menjadi baseline fase 1. Setelah keputusan pada bagian 13 dikunci, blueprint bisa diturunkan ke task breakdown teknis per modul.