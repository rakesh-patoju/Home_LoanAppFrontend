$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
node .\scripts\serve.mjs
exit $LASTEXITCODE
