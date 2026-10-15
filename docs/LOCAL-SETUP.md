# Local Setup - Node.js + PostgreSQL (Docker)

Dokumen ini dibuat agar user non-teknis tetap bisa menjalankan project lokal dengan langkah sederhana.

## 1. Prasyarat
- Install Docker Desktop.
- Pastikan Docker Desktop dalam kondisi running.

## 2. Struktur minimum project app
Saat ini docker-compose menjalankan folder backend sebagai source code Node.js.
Pastikan folder berikut tersedia:
- backend/package.json
- backend/index.js (atau entrypoint aplikasi Anda)
- backend/db/migrations/*.sql (untuk migrasi lanjutan)

Contoh script minimum di package.json:
- dev -> nodemon index.js

Starter app sudah disiapkan dengan endpoint:
- GET /health
- GET /api/v1
- POST /api/v1/auth/login
- GET /api/v1/dashboard/summary

## 3. Menjalankan project
Dari root project, jalankan:

1) Build dan start semua service
- docker compose up -d

2) Cek container
- docker compose ps

3) Jalankan migrasi lanjutan bila ada
- docker compose exec backend npm run migrate

4) Jalankan smoke test end-to-end backend
- cd backend
- npm run test:e2e

Service default:
- App Node.js: http://localhost:3000
- Adminer: http://localhost:8080
- PostgreSQL: localhost:5432

## 4. Login Adminer
Gunakan parameter berikut:
- System: PostgreSQL
- Server: db
- Username: forwarding_user
- Password: forwarding_pass
- Database: forwarding_db

## 5. Authentikasi API

### 5.1 Public endpoints (tidak butuh token)
Endpoint berikut dapat diakses tanpa Authorization header:
- GET /health
- GET /api/v1
- POST /api/v1/auth/login

### 5.2 Protected endpoints (butuh token)
Semua endpoint CRUD lainnya memerlukan Bearer token di Authorization header.

### 5.3 Cara menggunakan token

**Step 1: Login untuk mendapatkan token**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@forwarding.local",
    "password": "admin123"
  }'
```

Response akan berisi token:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "841479ba-17d4-4494-81782121249183",
    "user": {
      "id": "841479ba-17d4-4494-86f6-0c6eeeee8d0a",
      "fullName": "Admin Operasional",
      "email": "admin@forwarding.local",
      "role": "admin_operasional"
    }
  }
}
```

**Step 2: Gunakan token untuk akses endpoint yang dilindungi**

```bash
curl -H "Authorization: Bearer 841479ba-17d4-4494-81782121249183" \
  http://localhost:3000/api/v1/customers
```

### 5.4 Login default aplikasi
User seed bawaan untuk uji coba lokal:
- Email: admin@forwarding.local
- Password: admin123

## 6. Hentikan service
- docker compose down

Jika ingin hapus volume database (reset data):
- docker compose down -v

## 7. Catatan penting
- File schema awal otomatis dieksekusi dari backend/db/init/001_schema.sql saat volume database masih baru.
- Migrasi lanjutan disimpan di backend/db/migrations dan bisa dijalankan dari container backend dengan `npm run migrate`.
