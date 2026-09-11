# ============================================================
# info Marhaen — generator rute placeholder (Fase 0)
# Membaca scripts/routes-*.csv lalu membuat page.tsx sementara
# sesuai Sitemap blueprint.md Bagian 4.
# ============================================================
$ErrorActionPreference = "Stop"
$rows = @()
Get-ChildItem "$PSScriptRoot/routes-*.csv" | ForEach-Object {
    $rows += Import-Csv $_.FullName -Delimiter ";"
}

foreach ($row in $rows) {
    $path = Join-Path (Resolve-Path "$PSScriptRoot/..") $row.path
    $dir = Split-Path $path -Parent
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    $content = @"
import { Pembangunan } from "@/components/ui/Pembangunan";

export default function Page() {
  return <Pembangunan judul="$($row.judul)" deskripsi="$($row.deskripsi)" />;
}
"@
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
    Write-Output "OK: $($row.path)"
}

Write-Output "Selesai: $($rows.Count) rute placeholder dibuat."