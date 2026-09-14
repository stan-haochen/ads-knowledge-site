param([string]$Message = 'Update ADS course website')
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Invoke-CheckedGit {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
    & git @Arguments
    if ($LASTEXITCODE -ne 0) { throw "git command failed: $($Arguments -join ' ')" }
}

if ((git branch --show-current) -ne 'main') { throw 'Publish from main. Review and merge your changes first.' }
$adsRemote = git remote get-url origin
if ($adsRemote -notin @('git@github.com:stan-haochen/ads-knowledge-site.git','https://github.com/stan-haochen/ads-knowledge-site.git')) {
    throw 'origin does not match stan-haochen/ads-knowledge-site; check the repository before publishing.'
}
if (-not [string]::IsNullOrWhiteSpace((git diff --cached --name-only | Out-String))) {
    throw 'There are already staged changes. Review and commit them before using this publishing helper.'
}

& npm test
if ($LASTEXITCODE -ne 0) { throw 'Tests failed; nothing was committed or pushed.' }
Invoke-CheckedGit diff --check
Invoke-CheckedGit fetch origin main
& git merge-base --is-ancestor origin/main HEAD
if ($LASTEXITCODE -ne 0) { throw 'Remote main has changes. Integrate them before publishing; no force push will be used.' }

# Only stage the website and its supporting project files.
$adsPaths = @('dist','tests','.github','package.json','README.md','AGENTS.md','Publish-ADS.ps1','server.mjs','Start-ADS.ps1','.gitignore')
$adsExistingPaths = @($adsPaths | Where-Object { Test-Path -LiteralPath $_ })
Invoke-CheckedGit add -- @adsExistingPaths
& git diff --cached --quiet
if ($LASTEXITCODE -eq 1) { Invoke-CheckedGit commit -m $Message }
elseif ($LASTEXITCODE -ne 0) { throw 'Could not inspect staged changes.' }
Invoke-CheckedGit push origin main
Write-Host 'Push complete. GitHub Actions now tests and publishes the website.'
Write-Host 'Deployment status: https://github.com/stan-haochen/ads-knowledge-site/actions/workflows/pages.yml'
Write-Host 'Website: https://stan-haochen.github.io/ads-knowledge-site/'
