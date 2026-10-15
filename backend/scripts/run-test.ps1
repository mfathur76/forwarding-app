powershell -Command {
$ErrorActionPreference = 'Stop'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "END-TO-END TEST: Customer -> Shipment -> Invoice" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# LOGIN
$loginResp = Invoke-WebRequest -UseBasicParsing -Method Post `
  -Uri "http://localhost:3000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@forwarding.local","password":"admin123"}'

$token = ($loginResp.Content | ConvertFrom-Json).data.token
$headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
Write-Host "[OK] Login successful`n"

# CREATE CUSTOMER
$customerJson = @{
    name = "PT Logistik Maju"
    company = "PT. Logistik Maju Jaya"
    phone = "0812-3456-7890"
    email = "contact@logistik.id"
    npwp = "01.234.567.8-901.000"
    address = "Jl. Gatot Subroto No. 123, Jakarta"
} | ConvertTo-Json

$cResp = Invoke-WebRequest -UseBasicParsing -Method Post `
  -Uri "http://localhost:3000/api/v1/customers" `
  -Headers $headers `
  -Body $customerJson

$customerId = ($cResp.Content | ConvertFrom-Json).data.id
Write-Host "[OK] Customer created: $customerId`n"

# CREATE DRIVER
$uniqueId = [DateTime]::UtcNow.Ticks % 100000000
$driverJson = @{
    name = "Budi Santoso"
    phone = "0811-9876-5432"
    licenseNumber = "AB-$uniqueId"
    status = "TERSEDIA"
    address = "Jl. Merdeka No. 456, Jakarta"
} | ConvertTo-Json

$dResp = Invoke-WebRequest -UseBasicParsing -Method Post `
  -Uri "http://localhost:3000/api/v1/drivers" `
  -Headers $headers `
  -Body $driverJson

$driverId = ($dResp.Content | ConvertFrom-Json).data.id
Write-Host "[OK] Driver created: $driverId`n"

# CREATE VEHICLE
$vehicleJson = @{
    plateNumber = "B-$uniqueId-XYZ"
    vehicleType = "BOX TRUCK"
    brand = "Isuzu"
    capacityKg = 5000
    year = 2022
    status = "TERSEDIA"
} | ConvertTo-Json

$vResp = Invoke-WebRequest -UseBasicParsing -Method Post `
  -Uri "http://localhost:3000/api/v1/vehicles" `
  -Headers $headers `
  -Body $vehicleJson

$vehicleId = ($vResp.Content | ConvertFrom-Json).data.id
Write-Host "[OK] Vehicle created: $vehicleId`n"

# CREATE SHIPMENT
$now = [DateTime]::UtcNow
$tomorrow = $now.AddDays(1)

# Build ISO 8601 date strings properly
$year = $now.Year
$month = $now.Month.ToString('00')
$day = $now.Day.ToString('00')
$hour = $now.Hour.ToString('00')
$minute = $now.Minute.ToString('00')
$second = $now.Second.ToString('00')
$pickupDate = "$year-$month-$day`T$hour`:$minute`:$second.000Z"

$year2 = $tomorrow.Year
$month2 = $tomorrow.Month.ToString('00')
$day2 = $tomorrow.Day.ToString('00')
$hour2 = $tomorrow.Hour.ToString('00')
$minute2 = $tomorrow.Minute.ToString('00')
$second2 = $tomorrow.Second.ToString('00')
$deliveryDate = "$year2-$month2-$day2`T$hour2`:$minute2`:$second2.000Z"

$shipmentJson = @{
    customerId = $customerId
    driverId = $driverId
    vehicleId = $vehicleId
    origin = "Jakarta Pusat"
    destination = "Tangerang Selatan"
    weightKg = 2500
    price = 500000
    pickupDate = $pickupDate
    deliveryDate = $deliveryDate
    cargoDescription = "Elektronik / Spare Parts"
    notes = "Handle with care"
} | ConvertTo-Json

$sResp = Invoke-WebRequest -UseBasicParsing -Method Post `
  -Uri "http://localhost:3000/api/v1/shipments" `
  -Headers $headers `
  -Body $shipmentJson

$sData = $sResp.Content | ConvertFrom-Json
$shipmentId = $sData.data.id
$trackingNumber = if ($sData.data.trackingNumber) { $sData.data.trackingNumber } else { $sData.data.tracking_number }
Write-Host "[OK] Shipment created: $shipmentId"
Write-Host "    Tracking: $trackingNumber`n"

# CREATE INVOICE
$issuedDate = "$year-$month-$day`T$hour`:$minute`:$second.000Z"
$dueDate30 = $now.AddDays(30)
$yearDue = $dueDate30.Year
$monthDue = $dueDate30.Month.ToString('00')
$dayDue = $dueDate30.Day.ToString('00')
$hourDue = $dueDate30.Hour.ToString('00')
$minuteDue = $dueDate30.Minute.ToString('00')
$secondDue = $dueDate30.Second.ToString('00')
$dueDate = "$yearDue-$monthDue-$dayDue`T$hourDue`:$minuteDue`:$secondDue.000Z"

$invoiceJson = @{
    customerId = $customerId
    shipmentId = $shipmentId
    issuedDate = $issuedDate
    dueDate = $dueDate
    amount = 500000
    tax = 50000
    notes = "Payment due in 30 days"
} | ConvertTo-Json

$iResp = Invoke-WebRequest -UseBasicParsing -Method Post `
  -Uri "http://localhost:3000/api/v1/invoices" `
  -Headers $headers `
  -Body $invoiceJson

$iData = $iResp.Content | ConvertFrom-Json
$invoiceId = $iData.data.id
$invoiceNumber = $iData.data.invoiceNumber
Write-Host "[OK] Invoice created: $invoiceId"
Write-Host "    Invoice#: $invoiceNumber`n"

# TEST STATUS TRANSITIONS
Write-Host "========== STATUS TRANSITIONS ==========`n"

# Ship
Invoke-WebRequest -UseBasicParsing -Method Patch `
  -Uri "http://localhost:3000/api/v1/shipments/$shipmentId/status" `
  -Headers $headers `
  -Body '{"status":"DALAM_PERJALANAN"}' | Out-Null

Write-Host "[OK] Shipment -> DALAM_PERJALANAN"

$dCheckResp = Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/drivers/$driverId" `
  -Headers $headers | ConvertFrom-Json

Write-Host "    Driver status: $($dCheckResp.data.status)`n"

# Complete
Invoke-WebRequest -UseBasicParsing -Method Patch `
  -Uri "http://localhost:3000/api/v1/shipments/$shipmentId/status" `
  -Headers $headers `
  -Body '{"status":"TERKIRIM"}' | Out-Null

Write-Host "[OK] Shipment -> TERKIRIM"

$dCheck2Resp = Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/drivers/$driverId" `
  -Headers $headers | ConvertFrom-Json

Write-Host "    Driver status: $($dCheck2Resp.data.status)`n"

# Pay invoice
Invoke-WebRequest -UseBasicParsing -Method Patch `
  -Uri "http://localhost:3000/api/v1/invoices/$invoiceId/status" `
  -Headers $headers `
  -Body '{"paymentStatus":"LUNAS"}' | Out-Null

Write-Host "[OK] Invoice -> LUNAS`n"

# DASHBOARD
Write-Host "========== DASHBOARD SUMMARY ==========`n"
$dashResp = Invoke-WebRequest -UseBasicParsing `
  -Uri "http://localhost:3000/api/v1/dashboard/summary" `
  -Headers $headers | ConvertFrom-Json

$m = $dashResp.data.metrics
Write-Host "Shipments:  $($m.totalShipments)"
Write-Host "Customers:  $($m.totalCustomers)"
Write-Host "Drivers:    $($m.totalDrivers)"
Write-Host "Vehicles:   $($m.totalVehicles)"
Write-Host "Paid:       Rp $('{0:N0}' -f $m.paidRevenue)"
Write-Host "Outstanding:Rp $('{0:N0}' -f $m.outstandingRevenue)`n"

Write-Host "========================================" -ForegroundColor Green
Write-Host "ALL TESTS PASSED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
}
