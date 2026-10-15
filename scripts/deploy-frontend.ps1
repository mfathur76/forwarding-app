# Build frontend lalu upload ke S3 dan invalidate CloudFront.
# Pemakaian: ./scripts/deploy-frontend.ps1 -StackName forwarding-app [-Region ap-southeast-1]
param(
  [Parameter(Mandatory = $true)][string]$StackName,
  [string]$Region = 'ap-southeast-1'
)

$ErrorActionPreference = 'Stop'

function Get-StackOutput($key) {
  aws cloudformation describe-stacks --stack-name $StackName --region $Region `
    --query "Stacks[0].Outputs[?OutputKey=='$key'].OutputValue" --output text
}

$bucket = Get-StackOutput 'FrontendBucketName'
$distributionId = Get-StackOutput 'DistributionId'

Push-Location (Join-Path $PSScriptRoot '..\frontend')
try {
  npm ci
  npm run build

  # Aset ber-hash di-cache lama; index.html tidak di-cache.
  aws s3 sync dist "s3://$bucket" --delete --exclude index.html --cache-control 'public,max-age=31536000,immutable'
  aws s3 cp dist/index.html "s3://$bucket/index.html" --cache-control 'no-cache'
  aws cloudfront create-invalidation --distribution-id $distributionId --paths '/index.html' | Out-Null
}
finally {
  Pop-Location
}

Write-Host "Selesai: $(Get-StackOutput 'AppUrl')"
