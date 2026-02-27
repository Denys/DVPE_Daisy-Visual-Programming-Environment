param(
    [string]$RootPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [switch]$IncludeAllowed,
    [switch]$AsJson
)

$allowedDirectories = @(
    ".agent", ".claude", ".gemini", ".git", ".github", ".kilocode", ".tmp", ".vscode",
    "archive", "directives", "docs", "dvpe_CLD", "dvpe_DESIGN", "execution",
    "PLANNING", "project_description", "prompts", "prototypes", "scripts",
    "_agentic_promts"
)

$allowedFiles = @(
    ".env.example", ".gitattributes", ".gitignore", ".kilocodemodes",
    "README.md", "LICENSE",
    "AGENTS.md", "CHATGPT.md", "CLAUDE.md", "GEMINI.md", "KILO.md", "OPENCODE.md",
    "ai_patcher_bugs.md", "dvpe_bugs.md",
    "BUGS.md", "COMPILATION_ERRORS_REPORT_1.md", "COMPILATION_ERRORS_REPORT_2.md",
    "COMPILATION_ERROR_ANALYSIS.md", "DISCREPANCY_ANALYSIS.md"
)

function Get-Suggestion {
    param([System.IO.FileSystemInfo]$Item)

    $name = $Item.Name
    $isDir = $Item.PSIsContainer
    $lower = $name.ToLowerInvariant()

    if ($isDir -and ($lower -like "*copy*" -or $lower -eq "new folder")) {
        return @{
            Status = "candidate"
            SuggestedTarget = "archive/root-cleanup-YYYY-MM-DD/$name"
            Reason = "Duplicate or temporary-looking root directory."
        }
    }

    if (-not $isDir -and $lower -eq "nul") {
        return @{
            Status = "candidate"
            SuggestedTarget = "archive/root-cleanup-YYYY-MM-DD/nul (manual move)"
            Reason = "Reserved filename on Windows; keep out of root."
        }
    }

    if (-not $isDir -and $lower -match "\.zip$|\.html$") {
        return @{
            Status = "candidate"
            SuggestedTarget = "prototypes/ui/$name"
            Reason = "UI prototype artifact belongs under prototypes/ui."
        }
    }

    if (-not $isDir -and $name -match "ARCHITECTURE|DESIGN|SPEC") {
        return @{
            Status = "candidate"
            SuggestedTarget = "docs/architecture/$name"
            Reason = "Architecture/design document should live in docs/architecture."
        }
    }

    if (-not $isDir -and $name -match "REPORT|ANALYSIS|DISCREPANCY|COMPILATION|BUGS") {
        return @{
            Status = "candidate"
            SuggestedTarget = "PLANNING/$name"
            Reason = "Planning/report artifact should live in PLANNING."
        }
    }

    if (-not $isDir -and $lower -match "\.txt$") {
        return @{
            Status = "candidate"
            SuggestedTarget = "docs/changelogs/$name"
            Reason = "Text notes/changelogs should live under docs/changelogs."
        }
    }

    return @{
        Status = "review"
        SuggestedTarget = "-"
        Reason = "Not in allowlist and no automatic target rule."
    }
}

$items = Get-ChildItem -Force -LiteralPath $RootPath
$results = @()

foreach ($item in $items) {
    $isAllowed = ($item.PSIsContainer -and $allowedDirectories -contains $item.Name) -or
                 (-not $item.PSIsContainer -and $allowedFiles -contains $item.Name)

    if ($isAllowed -and -not $IncludeAllowed) {
        continue
    }

    if ($isAllowed) {
        $results += [pscustomobject]@{
            Name = $item.Name
            Type = if ($item.PSIsContainer) { "dir" } else { "file" }
            Status = "keep"
            SuggestedTarget = "-"
            Reason = "Allowlisted root item."
        }
        continue
    }

    $suggestion = Get-Suggestion -Item $item
    $results += [pscustomobject]@{
        Name = $item.Name
        Type = if ($item.PSIsContainer) { "dir" } else { "file" }
        Status = $suggestion.Status
        SuggestedTarget = $suggestion.SuggestedTarget
        Reason = $suggestion.Reason
    }
}

if ($AsJson) {
    $results | ConvertTo-Json -Depth 3
} else {
    $results | Sort-Object Status, Type, Name | Format-Table -AutoSize
}

