# Forwarding App - Frontend

React + TypeScript + Vite frontend untuk aplikasi manajemen forwarding.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Buka http://localhost:5173

### Akun Demo:
- Email: `admin@forwarding.local`
- Password: `admin123`

## Build

```bash
npm run build
```

## API Integration

Frontend berkomunikasi dengan backend di `http://localhost:3000/api/v1` (configurable via `VITE_API_URL`)

### Login
- Email: admin@forwarding.local
- Password: admin123

## Pages

- **Login** (`/login`) - Authentication
- **Dashboard** (`/dashboard`) - KPI & ringkasan operasional
- **Customers** (`/customers`) - CRUD pelanggan (TODO)
- **Drivers** (`/drivers`) - CRUD pengemudi (TODO)
- **Vehicles** (`/vehicles`) - CRUD kendaraan (TODO)
- **Shipments** (`/shipments`) - CRUD pengiriman (TODO)
- **Invoices** (`/invoices`) - CRUD faktur (TODO)

## Architecture

- `src/lib/api.ts` - API client dengan Axios
- `src/context/AuthContext.tsx` - Authentication context
- `src/components/` - Reusable components
- `src/pages/` - Page components

## Styling

Menggunakan Tailwind CSS dengan custom components di `src/index.css`
