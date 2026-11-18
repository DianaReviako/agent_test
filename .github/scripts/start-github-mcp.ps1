param(
    [string]$TokenFile = ".mcp.token.example"
)

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$resolvedTokenFile = if ([System.IO.Path]::IsPathRooted($TokenFile)) {
    $TokenFile
} else {
    Join-Path $repoRoot $TokenFile
}

if (-not (Test-Path -LiteralPath $resolvedTokenFile -PathType Leaf)) {
    [Console]::Error.WriteLine("Missing $resolvedTokenFile. Create it with GITHUB_PERSONAL_ACCESS_TOKEN=your-token.")
    exit 1
}

$token = (Get-Content -LiteralPath $resolvedTokenFile -Raw).Trim()
$prefix = "GITHUB_PERSONAL_ACCESS_TOKEN="
if ($token.StartsWith($prefix, [System.StringComparison]::Ordinal)) {
    $token = $token.Substring($prefix.Length).Trim()
}

if ([string]::IsNullOrWhiteSpace($token)) {
    [Console]::Error.WriteLine("The token file is empty.")
    exit 1
}

$env:GITHUB_PERSONAL_ACCESS_TOKEN = $token
& docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
exit $LASTEXITCODE
