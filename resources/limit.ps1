$Dir     = "C:\ProgramData\LimitCzasu"
$CfgPath = Join-Path $Dir "config.json"
if (-not (Test-Path $CfgPath)) { exit }
$cfg  = Get-Content $CfgPath -Raw -Encoding UTF8 | ConvertFrom-Json
$User = $cfg.User
$File = Join-Path $Dir "$User-$(Get-Date -Format yyyy-MM-dd).txt"

$pattern = "^\s*>?" + [regex]::Escape($User) + "\s"
$line = quser 2>$null | Select-Object -Skip 1 | Where-Object { $_ -match $pattern } | Select-Object -First 1
if (-not $line) { exit }
$id = ($line.Trim().TrimStart('>') -split '\s+') | Where-Object { $_ -match '^\d+$' } | Select-Object -First 1
if (-not $id) { exit }

$now = Get-Date
$d   = [int]$now.DayOfWeek
$h   = $now.Hour
$day = $cfg.Dni[$d]

if (-not $day.Wlaczony -or $h -lt [int]$day.Od -or $h -ge [int]$day.Do) { logoff $id; exit }

$LimitMin = [int]$day.LimitMin
$min = 0
if (Test-Path $File) { $min = [int](Get-Content $File | Select-Object -First 1) }
$min++
Set-Content $File $min

if ($min -eq $LimitMin - 5) {
    try { msg $id "Za 5 minut nastąpi wylogowanie (dzienny limit czasu)." } catch {}
}
if ($min -ge $LimitMin) { logoff $id }
