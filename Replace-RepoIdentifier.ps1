<#+
.SYNOPSIS
  Case-insensitive search & replace across a repo (contents, file & directory names).
  Dry-run by default. Pass -Execute to apply changes.
#>

[CmdletBinding()] param(
  [string] $Old = 'kraftvaerk.umbraco.blockfilter',
  [string] $New = 'kraftvaerk.umbraco.blockfilter',
  [string[]] $ExcludeDirs = @('.git','.vs','bin','obj','node_modules','packages','.idea','.vscode'),
  [switch] $Execute
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Console]::InputEncoding  = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Test-ExcludedPath {
  param([string]$Path,[string[]]$Exclude)
  $segs = $Path -split '[\\/]'
  $set  = $segs | ForEach-Object { $_.ToLowerInvariant() }
  foreach ($e in $Exclude) { if ($set -contains $e.ToLowerInvariant()) { return $true } }
  return $false
}

function Test-IsBinary {
  param([string]$Path)
  try {
    $buf = New-Object byte[] 4096
    $fs = [IO.File]::Open($Path,'Open','Read','ReadWrite')
    try { $read = $fs.Read($buf,0,$buf.Length) } finally { $fs.Dispose() }
    if ($read -le 0) { return $false }
    return ($buf[0..($read-1)] -contains 0)
  } catch { return $true }
}

function Get-FileEncoding {
  param([string]$Path)
  $fs = [IO.File]::Open($Path,'Open','Read','ReadWrite')
  try {
    $bom = New-Object byte[] 4
    $read = $fs.Read($bom,0,4)
    switch -regex ([BitConverter]::ToString($bom,0,$read)) {
      '^EF-BB-BF'    { return [Text.UTF8Encoding]::new($true) }
      '^FF-FE-00-00' { return [Text.UTF32Encoding]::new($false,$true) }
      '^00-00-FE-FF' { return [Text.UTF32Encoding]::new($true,$true) }
      '^FF-FE'       { return [Text.UnicodeEncoding]::new($false,$true) }
      '^FE-FF'       { return [Text.UnicodeEncoding]::new($true,$true) }
      default        { return [Text.UTF8Encoding]::new($false) }
    }
  } finally { $fs.Dispose() }
}

function Read-TextWithEncoding {
  param([string]$Path)
  $enc   = Get-FileEncoding -Path $Path
  $bytes = [IO.File]::ReadAllBytes($Path)
  $text  = $enc.GetString($bytes)
  [pscustomobject]@{ Text = $text; Encoding = $enc }
}

function Write-TextWithEncoding {
  param([string]$Path,[string]$Text,[Text.Encoding]$Encoding)
  $bytes = $Encoding.GetBytes($Text)
  [IO.File]::WriteAllBytes($Path,$bytes)
}

$regex = [Text.RegularExpressions.Regex]::new(
  [Text.RegularExpressions.Regex]::Escape($Old),
  [Text.RegularExpressions.RegexOptions]::IgnoreCase
)

$root = (Get-Location).Path
$mode = if ($Execute) { 'EXECUTE' } else { 'DRY-RUN' }

$summary = [ordered]@{
  FilesScanned        = 0
  FilesContentChanged = 0
  FileRenames         = 0
  DirRenames          = 0
  SkippedBinary       = 0
  SkippedExcluded     = 0
}

Write-Host "Root: $root"
Write-Host "Old : $Old"
Write-Host "New : $New"
Write-Host "Mode: $mode"; Write-Host

# Pass 1: contents
$files = Get-ChildItem -LiteralPath . -Recurse -Force -File -ErrorAction SilentlyContinue
foreach ($f in $files) {
  if (Test-ExcludedPath -Path $f.FullName -Exclude $ExcludeDirs) { $summary.SkippedExcluded++; continue }
  $summary.FilesScanned++
  if (Test-IsBinary -Path $f.FullName) { $summary.SkippedBinary++; continue }
  try {
    $bundle = Read-TextWithEncoding -Path $f.FullName
    if ($regex.IsMatch($bundle.Text)) {
      $newText = $regex.Replace($bundle.Text,$New)
      if ($Execute) { Write-TextWithEncoding -Path $f.FullName -Text $newText -Encoding $bundle.Encoding }
      $summary.FilesContentChanged++
      $status = if ($Execute) { 'UPDATED' } else { 'WOULD UPDATE' }
      Write-Host "$status content $($f.FullName)"
    }
  } catch { Write-Warning "Failed to process file content: $($f.FullName) - $($_.Exception.Message)" }
}

# Pass 2: file renames
$filesToRename = Get-ChildItem -LiteralPath . -Recurse -Force -File -ErrorAction SilentlyContinue |
  Where-Object { -not (Test-ExcludedPath -Path $_.FullName -Exclude $ExcludeDirs) }

foreach ($f in $filesToRename) {
  if (-not ($regex.IsMatch($f.Name))) { continue }
  $newName = $regex.Replace($f.Name,$New)
  $target  = Join-Path $f.DirectoryName $newName
  if ($Execute) {
    if (Test-Path -LiteralPath $target) { Write-Warning "Skip file rename (target exists): $($f.FullName) -> $target"; continue }
    try { Rename-Item -LiteralPath $f.FullName -NewName $newName -Force } catch { Write-Warning "Failed to rename file: $($f.FullName) - $($_.Exception.Message)"; continue }
  }
  $summary.FileRenames++
  $status = if ($Execute) { 'RENAMED' } else { 'WOULD RENAME' }
  Write-Host "$status file: $($f.Name) -> $newName"
}

# Pass 3: directory renames (deepest first)
$dirsToRename = Get-ChildItem -LiteralPath . -Recurse -Force -Directory -ErrorAction SilentlyContinue |
  Where-Object { -not (Test-ExcludedPath -Path $_.FullName -Exclude $ExcludeDirs) } |
  Sort-Object { $_.FullName.Length } -Descending

foreach ($d in $dirsToRename) {
  if (-not ($regex.IsMatch($d.Name))) { continue }
  $newName = $regex.Replace($d.Name,$New)
  $target  = Join-Path $d.Parent.FullName $newName
  if ($Execute) {
    if (Test-Path -LiteralPath $target) { Write-Warning "Skip directory rename (target exists): $($d.FullName) -> $target"; continue }
    try { Rename-Item -LiteralPath $d.FullName -NewName $newName -Force } catch { Write-Warning "Failed to rename directory: $($d.FullName) - $($_.Exception.Message)"; continue }
  }
  $summary.DirRenames++
  $status = if ($Execute) { 'RENAMED' } else { 'WOULD RENAME' }
  Write-Host "$status dir : $($d.Name) -> $newName"
}

# Summary
Write-Host
Write-Host 'Done.'
$summary.GetEnumerator() | Sort-Object Name | ForEach-Object { "{0,-22} {1}" -f $_.Key, $_.Value } | Write-Host
Write-Host
if ($Execute) { Write-Host 'Applied changes.' } else { Write-Host 'Tip: re-run with -Execute to apply changes (this run was DRY-RUN).' }
