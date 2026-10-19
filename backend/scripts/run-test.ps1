# End-to-end smoke test: pelanggan -> pengemudi -> kendaraan -> pengiriman -> faktur -> dasbor.
#
# Lokal (Docker):   npm run test:e2e
# API di AWS:       ./scripts/run-test.ps1 -BaseUrl https://xxxx.execute-api.ap-southeast-2.amazonaws.com -Email admin@contoh.com
#                   (password akan ditanya, atau isi env E2E_PASSWORD)
#
# Data uji memakai awalan "E2E-" dan dihapus (soft delete) di akhir, kecuali -KeepData.
# Catatan: nomor lacak/faktur yang terpakai tidak dikembalikan (counter global).
param(
  [string]$BaseUrl = 'http://localhost:3000',
  [string]$Email = 'admin@forwarding.local',
  [string]$Password = $env:E2E_PASSWORD,
  [switch]$KeepData
)

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')
$script:Token = $null
$script:Failures = 0
$script:Checks = 0

if (-not $Password) {
  if ($BaseUrl -match '^http://localhost') {
    $Password = 'admin123'
  }
  else {
    $secure = Read-Host -Prompt "Password untuk $Email" -AsSecureString
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
  }
}

function Invoke-Api {
  param([string]$Method, [string]$Path, $Body = $null, [bool]$Auth = $true)

  $headers = @{}
  if ($Auth -and $script:Token) { $headers['Authorization'] = "Bearer $($script:Token)" }

  $params = @{
    Uri             = "$BaseUrl$Path"
    Method          = $Method
    Headers         = $headers
    UseBasicParsing = $true
    ContentType     = 'application/json'
    TimeoutSec      = 60
  }
  if ($null -ne $Body) { $params['Body'] = ($Body | ConvertTo-Json -Depth 5) }

  try {
    $response = Invoke-WebRequest @params
    $status = [int]$response.StatusCode
    $text = $response.Content
  }
  catch {
    $response = $_.Exception.Response
    if ($null -eq $response) { throw }
    $status = [int]$response.StatusCode
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $text = $reader.ReadToEnd()
  }

  $json = $null
  if ($text) { try { $json = $text | ConvertFrom-Json } catch { } }
  return [pscustomobject]@{ Status = $status; Body = $json }
}

function Assert-That {
  param([string]$Name, [bool]$Condition, [string]$Detail = '')
  $script:Checks++
  if ($Condition) {
    Write-Host "  [OK]   $Name" -ForegroundColor Green
  }
  else {
    $script:Failures++
    Write-Host "  [FAIL] $Name $Detail" -ForegroundColor Red
  }
}

function Get-Metrics {
  return (Invoke-Api GET '/api/v1/dashboard/summary').Body.data.metrics
}

$today = (Get-Date).ToString('yyyy-MM-dd')
$tomorrow = (Get-Date).AddDays(1).ToString('yyyy-MM-dd')
$due = (Get-Date).AddDays(30).ToString('yyyy-MM-dd')
$suffix = [DateTime]::UtcNow.Ticks % 100000000
$created = [ordered]@{}

Write-Host "Target: $BaseUrl`n" -ForegroundColor Cyan

# ---------- 1. Endpoint publik & autentikasi ----------
Write-Host '1. Publik dan autentikasi'
$r = Invoke-Api GET '/api/v1' $null $false
Assert-That 'GET /api/v1 publik' ($r.Status -eq 200)
$r = Invoke-Api GET '/health' $null $false
Assert-That 'GET /health (koneksi database)' ($r.Status -eq 200) "status=$($r.Status)"
$r = Invoke-Api GET '/api/v1/customers' $null $false
Assert-That 'Tanpa token ditolak (401)' ($r.Status -eq 401) "status=$($r.Status)"
$script:Token = 'token.palsu.tidak.valid.xxxxxxxxxxxx'
$r = Invoke-Api GET '/api/v1/customers'
Assert-That 'Token palsu ditolak (401)' ($r.Status -eq 401) "status=$($r.Status)"
$script:Token = $null
$r = Invoke-Api POST '/api/v1/auth/login' @{ email = $Email; password = 'password-salah-xyz' } $false
Assert-That 'Login password salah ditolak (401)' ($r.Status -eq 401) "status=$($r.Status)"

$r = Invoke-Api POST '/api/v1/auth/login' @{ email = $Email; password = $Password } $false
Assert-That 'Login berhasil' ($r.Status -eq 200 -and $r.Body.data.token) "status=$($r.Status)"
if ($r.Status -ne 200) {
  Write-Host "`nLogin gagal, tes dihentikan." -ForegroundColor Red
  exit 1
}
$script:Token = $r.Body.data.token

# ---------- 2. Validasi ----------
Write-Host "`n2. Validasi input"
$r = Invoke-Api POST '/api/v1/customers' @{ company = 'E2E tanpa nama' }
Assert-That 'Pelanggan tanpa nama ditolak (422)' ($r.Status -eq 422) "status=$($r.Status)"

# ---------- 3. Alur utama ----------
Write-Host "`n3. Alur utama"
$before = Get-Metrics

$r = Invoke-Api POST '/api/v1/customers' @{ name = "E2E-Pelanggan-$suffix"; company = 'PT E2E Test'; phone = '0812-3456-7890'; email = 'e2e@example.com'; address = 'Jl. Uji No. 1' }
Assert-That 'Buat pelanggan' ($r.Status -eq 201) "status=$($r.Status)"
$customerId = $r.Body.data.id
$created['customers'] = $customerId

$r = Invoke-Api POST '/api/v1/drivers' @{ name = "E2E-Pengemudi-$suffix"; phone = '0811-0000-0000'; licenseNumber = "E2E-$suffix"; status = 'TERSEDIA' }
Assert-That 'Buat pengemudi' ($r.Status -eq 201) "status=$($r.Status)"
$driverId = $r.Body.data.id
$created['drivers'] = $driverId

$r = Invoke-Api POST '/api/v1/vehicles' @{ plateNumber = "E2E-$suffix"; vehicleType = 'BOX TRUCK'; brand = 'Isuzu'; capacityKg = 5000; year = 2022; status = 'TERSEDIA' }
Assert-That 'Buat kendaraan' ($r.Status -eq 201) "status=$($r.Status)"
$vehicleId = $r.Body.data.id
$created['vehicles'] = $vehicleId

$r = Invoke-Api POST '/api/v1/shipments' @{ customerId = $customerId; origin = 'Semarang'; destination = 'Jakarta'; weightKg = 100; price = -5 }
Assert-That 'Pengiriman dengan harga negatif ditolak (422)' ($r.Status -eq 422) "status=$($r.Status)"

$r = Invoke-Api POST '/api/v1/shipments' @{ customerId = $customerId; driverId = $driverId; vehicleId = $vehicleId; origin = 'Semarang'; destination = 'Jakarta'; weightKg = 2500; price = 500000; pickupDate = $today; deliveryDate = $tomorrow; cargoDescription = 'E2E test'; notes = 'E2E test' }
Assert-That 'Buat pengiriman' ($r.Status -eq 201) "status=$($r.Status)"
$shipmentId = $r.Body.data.id
$created['shipments'] = $shipmentId
$tracking = if ($r.Body.data.trackingNumber) { $r.Body.data.trackingNumber } else { $r.Body.data.tracking_number }
Assert-That "Format nomor lacak RAT-YYMMDD-XXXXX ($tracking)" ($tracking -match '^RAT-\d{6}-\d{5}$')

$r = Invoke-Api POST '/api/v1/invoices' @{ customerId = $customerId; shipmentId = $shipmentId; issuedDate = $today; dueDate = $due; amount = 500000; tax = 50000 }
Assert-That 'Buat faktur' ($r.Status -eq 201) "status=$($r.Status)"
$invoiceId = $r.Body.data.id
$created['invoices'] = $invoiceId
Assert-That "Format nomor faktur INV-YYMMDD-XXXXX ($($r.Body.data.invoiceNumber))" ($r.Body.data.invoiceNumber -match '^INV-\d{6}-\d{5}$')
Assert-That 'Total faktur = jumlah + pajak (550000)' ([decimal]$r.Body.data.total -eq 550000) "total=$($r.Body.data.total)"

$r = Invoke-Api POST '/api/v1/invoices' @{ customerId = $customerId; shipmentId = $shipmentId; issuedDate = $today; dueDate = $due; amount = 1; tax = 0 }
Assert-That 'Faktur kedua untuk pengiriman yang sama ditolak (4xx)' ($r.Status -ge 400 -and $r.Status -lt 500) "status=$($r.Status)"

# ---------- 4. Transisi status ----------
Write-Host "`n4. Transisi status"
$r = Invoke-Api PATCH "/api/v1/shipments/$shipmentId/status" @{ status = 'DALAM_PERJALANAN' }
Assert-That 'Pengiriman -> DALAM_PERJALANAN' ($r.Status -eq 200) "status=$($r.Status)"
$d = (Invoke-Api GET "/api/v1/drivers/$driverId").Body.data
$v = (Invoke-Api GET "/api/v1/vehicles/$vehicleId").Body.data
Assert-That 'Pengemudi otomatis BERTUGAS' ($d.status -eq 'BERTUGAS') "status=$($d.status)"
Assert-That 'Kendaraan otomatis BERTUGAS' ($v.status -eq 'BERTUGAS') "status=$($v.status)"

$r = Invoke-Api PATCH "/api/v1/shipments/$shipmentId/status" @{ status = 'TERKIRIM' }
Assert-That 'Pengiriman -> TERKIRIM' ($r.Status -eq 200) "status=$($r.Status)"
$d = (Invoke-Api GET "/api/v1/drivers/$driverId").Body.data
$v = (Invoke-Api GET "/api/v1/vehicles/$vehicleId").Body.data
Assert-That 'Pengemudi kembali TERSEDIA' ($d.status -eq 'TERSEDIA') "status=$($d.status)"
Assert-That 'Kendaraan kembali TERSEDIA' ($v.status -eq 'TERSEDIA') "status=$($v.status)"

$r = Invoke-Api PATCH "/api/v1/invoices/$invoiceId/status" @{ paymentStatus = 'LUNAS' }
Assert-That 'Faktur -> LUNAS' ($r.Status -eq 200) "status=$($r.Status)"

# ---------- 5. Dasbor ----------
Write-Host "`n5. Dasbor"
$after = Get-Metrics
Assert-That 'Total pelanggan +1' ($after.totalCustomers -eq $before.totalCustomers + 1)
Assert-That 'Total pengemudi +1' ($after.totalDrivers -eq $before.totalDrivers + 1)
Assert-That 'Total kendaraan +1' ($after.totalVehicles -eq $before.totalVehicles + 1)
Assert-That 'Total pengiriman +1' ($after.totalShipments -eq $before.totalShipments + 1)
Assert-That 'Pendapatan lunas +550000' (([decimal]$after.paidRevenue - [decimal]$before.paidRevenue) -eq 550000)

# ---------- 6. Pembersihan ----------
Write-Host "`n6. Pembersihan"
if ($KeepData) {
  Write-Host '  Dilewati (-KeepData)'
}
else {
  foreach ($item in @(@('invoices', $invoiceId), @('shipments', $shipmentId), @('vehicles', $vehicleId), @('drivers', $driverId), @('customers', $customerId))) {
    if ($item[1]) {
      $r = Invoke-Api DELETE "/api/v1/$($item[0])/$($item[1])"
      Assert-That "Hapus $($item[0])" ($r.Status -eq 200) "status=$($r.Status)"
    }
  }
  $final = Get-Metrics
  Assert-That 'Dasbor kembali seperti semula' ($final.totalCustomers -eq $before.totalCustomers -and $final.totalShipments -eq $before.totalShipments)
}

Write-Host ''
if ($script:Failures -eq 0) {
  Write-Host "SEMUA LULUS ($($script:Checks) pemeriksaan)" -ForegroundColor Green
  exit 0
}
Write-Host "$($script:Failures) dari $($script:Checks) pemeriksaan GAGAL" -ForegroundColor Red
exit 1
