#!/usr/bin/env python3
"""Local one-click dashboard for DVPE, DaisyHost, and DaisyExamples.

This is intentionally stdlib-only. It serves a localhost dashboard and exposes
small whitelisted launch endpoints. The browser does not execute shell commands;
this local server does, after validating the requested action against static
allow-lists or project paths inside DaisyExamples.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import html
import json
import os
import re
import subprocess
import sys
import tempfile
import threading
import time
import urllib.parse
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

ROOT = Path("C:/Users/denko/Gemini/Antigravity/DVPE_Daisy-Visual-Programming-Environment")
DVPE_APP = ROOT / "dvpe_CLD"
DAISY = ROOT / "DaisyExamples"
DAISYHOST = DAISY / "DaisyHost"
EMA = Path("C:/Users/denko/embedded-audio-mine")
PROFILE_DVPE = "dvpe-llm"
PROFILE_AUDIO = "audio-development"
PROFILE_AUDIO_ALIAS = "audio-design"

RUNNERS: dict[str, dict[str, Any]] = {
    "dvpe-dev": {
        "title": "DVPE Vite dev server",
        "cwd": DVPE_APP,
        "command": "npm run dev",
        "kind": "console",
        "note": "Runs the browser dev server on http://localhost:5173",
    },
    "dvpe-tauri": {
        "title": "DVPE Tauri desktop dev",
        "cwd": DVPE_APP,
        "command": "npm run tauri:dev",
        "kind": "console",
        "note": "Runs the Tauri desktop app dev loop.",
    },
    "dvpe-test": {
        "title": "DVPE tests",
        "cwd": DVPE_APP,
        "command": "npm run test",
        "kind": "console",
        "note": "Runs Vitest from dvpe_CLD.",
    },
    "dvpe-build": {
        "title": "DVPE production build",
        "cwd": DVPE_APP,
        "command": "npm run build",
        "kind": "console",
        "note": "Runs TypeScript + Vite build from dvpe_CLD.",
    },
    "llm-dvpe-chat": {
        "title": "Dedicated DVPE LLM chat",
        "cwd": ROOT,
        "command": f"{PROFILE_DVPE} chat",
        "kind": "console",
        "note": "Starts the dvpe-llm Hermes profile at the DVPE root.",
    },
    "llm-dvpe-model": {
        "title": "DVPE LLM model picker",
        "cwd": ROOT,
        "command": f"{PROFILE_DVPE} model",
        "kind": "console",
        "note": "Change provider/model for the dedicated DVPE profile.",
    },
    "llm-dvpe-tools": {
        "title": "DVPE LLM tools setup",
        "cwd": ROOT,
        "command": f"{PROFILE_DVPE} tools",
        "kind": "console",
        "note": "Open tool enablement for the dedicated DVPE profile.",
    },
    "llm-audio-chat": {
        "title": "Unified DVPE + audio-design chat",
        "cwd": ROOT,
        "command": f"{PROFILE_AUDIO_ALIAS} chat",
        "kind": "console",
        "note": "Convenience alias into the broader audio-development profile for DVPE + DaisyExamples + EMA.",
    },
    "daisyhost-build": {
        "title": "DaisyHost full host gate",
        "cwd": DAISYHOST,
        "command": "build_host.cmd",
        "kind": "console",
        "note": "Runs DaisyHost's local wrapper: configure/build/CTest gate.",
    },
    "daisyhost-doctor": {
        "title": "DaisyHost CLI doctor",
        "cwd": DAISYHOST,
        "command": 'build\\Release\\DaisyHostCLI.exe doctor --json',
        "kind": "console",
        "note": "Reports source/build readiness from the native CLI.",
    },
    "daisyhost-gate-json": {
        "title": "DaisyHost gate --json",
        "cwd": DAISYHOST,
        "command": 'build\\Release\\DaisyHostCLI.exe gate --source-dir . --build-dir build --config Release --json',
        "kind": "console",
        "note": "Structured gate wrapper around DaisyHost's build/test flow.",
    },
    "daisyhost-hub-release": {
        "title": "DaisyHost Hub Release",
        "cwd": DAISYHOST,
        "command": '"build\\DaisyHostHub_artefacts\\Release\\DaisyHost Hub.exe"',
        "kind": "console",
        "note": "Launches the Release DaisyHost Hub if the built artifact exists.",
    },
    "daisyhost-hub-debug": {
        "title": "DaisyHost Hub Debug",
        "cwd": DAISYHOST,
        "command": '"build\\DaisyHostHub_artefacts\\Debug\\DaisyHost Hub.exe"',
        "kind": "console",
        "note": "Launches the Debug DaisyHost Hub if the built artifact exists.",
    },
    "ema-open": {
        "title": "Open Embedded Audio Mine",
        "cwd": EMA,
        "command": "",
        "kind": "open-folder",
        "note": "Opens the EMA workspace folder.",
    },
}

SKIP_DIR_NAMES = {
    ".git", ".tmp", ".worktrees", "build", "dist", "node_modules", "__pycache__",
    "libDaisy", "DaisySP", "cube", "resources", "pytest-cache-files-2400xh65",
}


def _native(path: Path) -> str:
    return str(path.resolve())


def _is_windows() -> bool:
    return sys.platform.startswith("win")


def _batch_escape_text(value: str) -> str:
    """Escape human text for safe display inside a generated .cmd file."""
    cleaned = value.replace("\r", " ").replace("\n", " ").replace('"', "'")
    return (
        cleaned
        .replace("^", "^^")
        .replace("%", "%%")
        .replace("&", "^&")
        .replace("|", "^|")
        .replace("<", "^<")
        .replace(">", "^>")
    )


def _copy_command(cwd: Path, command: str, kind: str = "console") -> str:
    if kind == "open-folder":
        return f'explorer "{_native(cwd)}"' if _is_windows() else f"xdg-open {sh_quote(str(cwd))}"
    if _is_windows():
        return f'cd /d "{_native(cwd)}" && {command}'
    return f"cd {sh_quote(str(cwd))} && {command}"


def _safe_under(path: Path, base: Path) -> bool:
    try:
        path.resolve().relative_to(base.resolve())
        return True
    except ValueError:
        return False


def _write_windows_launcher(title: str, cwd: Path, command: str) -> Path:
    runs_dir = Path(tempfile.gettempdir()) / "audio-dev-dashboard-runs"
    runs_dir.mkdir(parents=True, exist_ok=True)
    safe_name = re.sub(r"[^A-Za-z0-9_.-]+", "-", title).strip("-")[:48] or "run"
    script = runs_dir / f"{safe_name}-{os.getpid()}-{int(time.time() * 1000)}.cmd"
    display_cwd = _batch_escape_text(_native(cwd))
    display_command = _batch_escape_text(command)
    script.write_text(
        "\n".join([
            "@echo off",
            f"title {_batch_escape_text(title)}",
            f'cd /d "{_native(cwd)}"',
            "if errorlevel 1 goto cwd_failed",
            "echo cwd: %CD%",
            f"echo command: {display_command}",
            "echo ------",
            command,
            "set \"__exit=%ERRORLEVEL%\"",
            "echo.",
            "echo [exit %__exit%] Press any key to close this window.",
            "pause >nul",
            "exit /b %__exit%",
            ":cwd_failed",
            f"echo Failed to enter cwd: {display_cwd}",
            "echo.",
            "pause",
            "exit /b 1",
            "",
        ]),
        encoding="utf-8",
    )
    return script


def _console_launch(title: str, cwd: Path, command: str) -> dict[str, Any]:
    if not cwd.exists():
        raise FileNotFoundError(f"cwd does not exist: {cwd}")
    if _is_windows():
        # Do not pass `cd /d "..." && command` as a cmd.exe argument from Python.
        # Python's Windows list2cmdline escaping leaves embedded quotes in a shape
        # cmd.exe misparses, producing "The filename, directory name, or volume
        # label syntax is incorrect" and running commands from the dashboard root.
        # A tiny generated .cmd file lets cmd.exe parse quoting natively.
        script = _write_windows_launcher(title, cwd, command)
        flags = getattr(subprocess, "CREATE_NEW_CONSOLE", 0)
        proc = subprocess.Popen(["cmd.exe", "/d", "/k", str(script)], creationflags=flags)
    else:
        shell_cmd = f'cd {sh_quote(str(cwd))} && {command}; echo; echo "[done] press Enter"; read _'
        term = os.environ.get("TERMINAL") or "xterm"
        proc = subprocess.Popen([term, "-e", "sh", "-lc", shell_cmd])
    return {"ok": True, "pid": proc.pid, "title": title, "cwd": str(cwd), "command": command}


def sh_quote(value: str) -> str:
    return "'" + value.replace("'", "'\\''") + "'"


def launch_runner(runner_id: str) -> dict[str, Any]:
    runner = RUNNERS.get(runner_id)
    if not runner:
        raise KeyError(f"unknown runner: {runner_id}")
    kind = runner.get("kind", "console")
    cwd = Path(runner["cwd"])
    if kind == "open-folder":
        open_path(cwd)
        return {"ok": True, "title": runner["title"], "opened": str(cwd)}
    return _console_launch(runner["title"], cwd, runner["command"])


def open_path(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(str(path))
    if _is_windows():
        os.startfile(str(path))  # type: ignore[attr-defined]
    elif sys.platform == "darwin":
        subprocess.Popen(["open", str(path)])
    else:
        subprocess.Popen(["xdg-open", str(path)])


def read_summary(path: Path) -> str:
    for doc_name in ("README.md", "CHECKPOINT.md", "CONTROLS.md"):
        doc = path / doc_name
        if not doc.exists():
            continue
        try:
            text = doc.read_text(encoding="utf-8", errors="ignore")[:2400]
        except OSError:
            continue
        for line in text.splitlines():
            cleaned = line.strip().strip("#*-` ")
            if len(cleaned) >= 32 and not cleaned.lower().startswith(("read local", "if you", "usage")):
                return cleaned[:220]
    return "No compact local summary found; inspect README/CHECKPOINT before editing."


def board_for(path: Path) -> str:
    rel = "/".join(path.relative_to(DAISY).parts).lower() if _safe_under(path, DAISY) else path.name.lower()
    name = path.name.lower()
    if path == DAISYHOST:
        return "Host"
    if rel.startswith("field/") or name.startswith("field") or "_field" in name or "field_" in name:
        return "Field"
    if rel.startswith("pod/") or name.startswith("pod") or "_pod" in name or "pod_" in name:
        return "Pod"
    if rel.startswith("pedal/") or name.startswith("pedal"):
        return "Pedal"
    if rel.startswith("patch/") or name.startswith("patch"):
        return "Patch"
    if name.startswith("seed") or "_seed" in name:
        return "Seed"
    return "Daisy"


def project_docs(path: Path) -> list[dict[str, str]]:
    docs = []
    for doc_name in ("README.md", "CHECKPOINT.md", "CONTROLS.md", "HARDWARE_TESTPLAN.md"):
        doc = path / doc_name
        if doc.exists():
            docs.append({"name": doc_name, "rel": str(doc.relative_to(DAISY)).replace("\\", "/")})
    return docs


def newest_file_mtime(path: Path) -> float:
    newest = path.stat().st_mtime
    try:
        for child in path.iterdir():
            if child.name in SKIP_DIR_NAMES:
                continue
            if child.is_file():
                newest = max(newest, child.stat().st_mtime)
    except OSError:
        pass
    return newest


def scan_projects() -> list[dict[str, Any]]:
    candidates: list[Path] = [DAISYHOST]
    search_roots = [DAISY / "MyProjects" / "_projects", DAISY / "field", DAISY / "pedal", DAISY / "patch", DAISY / "DaisyDAFX"]
    for search_root in search_roots:
        if not search_root.exists():
            continue
        for makefile in search_root.rglob("Makefile"):
            if any(part in SKIP_DIR_NAMES for part in makefile.parts):
                continue
            parent = makefile.parent
            if _safe_under(parent, DAISY) and parent not in candidates:
                candidates.append(parent)
    projects: list[dict[str, Any]] = []
    for path in candidates:
        if not path.exists() or not _safe_under(path, DAISY):
            continue
        rel = str(path.relative_to(DAISY)).replace("\\", "/")
        docs = project_docs(path)
        dvpe_files = sorted(path.glob("*.dvpe"))
        cpp_count = len(list(path.glob("*.cpp"))) + len(list(path.glob("src/**/*.cpp")))
        h_count = len(list(path.glob("*.h"))) + len(list(path.glob("include/**/*.h")))
        mtime = newest_file_mtime(path)
        projects.append({
            "id": re.sub(r"[^a-zA-Z0-9_-]+", "-", rel).strip("-") or "DaisyHost",
            "name": path.name,
            "rel": rel,
            "board": board_for(path),
            "summary": read_summary(path),
            "docs": docs,
            "hasMakefile": (path / "Makefile").exists(),
            "hasCMake": (path / "CMakeLists.txt").exists(),
            "dvpeFiles": [str(p.relative_to(DAISY)).replace("\\", "/") for p in dvpe_files[:5]],
            "cppCount": cpp_count,
            "headerCount": h_count,
            "mtime": mtime,
            "updated": _dt.datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M"),
        })
    projects.sort(key=lambda p: p["mtime"], reverse=True)
    return projects


def runner_payload() -> list[dict[str, str]]:
    payload = []
    for runner_id, runner in RUNNERS.items():
        cwd = Path(runner["cwd"])
        exists = cwd.exists()
        command = runner.get("command", "")
        payload.append({
            "id": runner_id,
            "title": runner["title"],
            "cwd": str(cwd).replace("\\", "/"),
            "command": command,
            "copyCommand": _copy_command(cwd, command, runner.get("kind", "console")),
            "note": runner.get("note", ""),
            "kind": runner.get("kind", "console"),
            "exists": "yes" if exists else "no",
        })
    return payload


def command_for_project(rel: str, target: str = "make") -> dict[str, Any]:
    project = (DAISY / rel).resolve()
    if not _safe_under(project, DAISY):
        raise PermissionError("project path escapes DaisyExamples")
    if not project.exists():
        raise FileNotFoundError(str(project))
    if not (project / "Makefile").exists():
        raise FileNotFoundError(f"No Makefile in {project}")
    if target not in {"make", "clean", "program", "program-dfu"}:
        raise PermissionError(f"Unsupported target: {target}")
    cmd = "make" if target == "make" else f"make {target}"
    title = f"{project.name} :: {cmd}"
    return _console_launch(title, project, cmd)


PAGE_TEMPLATE = r'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DVPE / Daisy Mission Control</title>
<style>
:root{--bg:#050608;--panel:#10151b;--ink:#eef7ff;--muted:#91a4b7;--line:rgba(255,255,255,.12);--cyan:#00e5ff;--amber:#ffb000;--lime:#65ff9d;--red:#ff5572;--violet:#b58cff;--blue:#6aa9ff;--shadow:0 24px 80px rgba(0,0,0,.42)}
*{box-sizing:border-box} html{scroll-behavior:smooth} body{margin:0;background:radial-gradient(circle at 20% 8%,rgba(0,229,255,.18),transparent 32%),radial-gradient(circle at 80% 12%,rgba(181,140,255,.16),transparent 34%),linear-gradient(135deg,#06090d,#0d1117 48%,#14090c);color:var(--ink);font:14px/1.45 ui-sans-serif,system-ui,Segoe UI,Arial,sans-serif;min-height:100vh} body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.13;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:34px 34px;mask-image:linear-gradient(180deg,#000,transparent 82%)}
a{color:inherit}.page{width:min(1500px,100%);margin:auto;padding:26px}.top{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(340px,.8fr);gap:18px;align-items:stretch}.hero,.card,.rail{background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.03));border:1px solid var(--line);border-radius:24px;box-shadow:var(--shadow);backdrop-filter:blur(14px)}.hero{padding:28px;position:relative;overflow:hidden}.hero:after{content:"DVPE";position:absolute;right:22px;bottom:-25px;font-size:128px;font-weight:900;letter-spacing:-.08em;color:rgba(0,229,255,.055)}.eyebrow{display:inline-flex;gap:8px;align-items:center;color:var(--cyan);font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.eyebrow:before{content:"";width:9px;height:9px;border-radius:50%;background:currentColor;box-shadow:0 0 18px currentColor}h1{font-family:Georgia,serif;font-size:clamp(38px,5vw,74px);line-height:.92;margin:12px 0;color:#fff7e8;letter-spacing:-.04em}h2{font-size:18px;margin:0 0 12px;color:#fff7e8}h3{font-size:15px;margin:0 0 7px}.lede{max-width:820px;color:#bfd0de;font-size:15px}.rail{padding:18px}.status{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pill{border:1px solid var(--line);border-radius:14px;padding:11px;background:rgba(0,0,0,.22)}.pill b{display:block;color:#fff;font-size:18px}.pill span{color:var(--muted);font-size:12px}.nav{position:sticky;top:0;z-index:10;display:flex;gap:8px;flex-wrap:wrap;margin:18px 0;padding:10px;border:1px solid var(--line);border-radius:18px;background:rgba(5,6,8,.78);backdrop-filter:blur(16px)}.nav a,.btn{border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.07);color:var(--ink);padding:9px 12px;text-decoration:none;cursor:pointer;transition:.16s ease}.btn:hover,.nav a:hover{transform:translateY(-1px);border-color:rgba(0,229,255,.55);box-shadow:0 0 0 3px rgba(0,229,255,.08)}.btn.primary{background:linear-gradient(135deg,rgba(0,229,255,.25),rgba(101,255,157,.16));border-color:rgba(0,229,255,.42)}.btn.amber{background:linear-gradient(135deg,rgba(255,176,0,.25),rgba(255,85,114,.12));border-color:rgba(255,176,0,.4)}.btn.violet{background:linear-gradient(135deg,rgba(181,140,255,.24),rgba(0,229,255,.08));border-color:rgba(181,140,255,.38)}.grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px}.grid>*{min-width:0}.card{padding:18px}.span4{grid-column:span 4}.span6{grid-column:span 6}.span8{grid-column:span 8}.span12{grid-column:1/-1}.cmd{max-width:100%;font-family:Consolas,ui-monospace,monospace;font-size:12px;color:#c9f7ff;background:rgba(0,0,0,.34);border:1px solid rgba(0,229,255,.18);border-radius:12px;padding:10px;overflow:auto}.muted{color:var(--muted)}.tiny{font-size:12px}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.section{margin:18px 0}.projectToolbar{display:grid;grid-template-columns:1fr auto auto;gap:10px;margin-bottom:12px}.input,.select{width:100%;border:1px solid var(--line);background:rgba(0,0,0,.3);color:var(--ink);border-radius:12px;padding:10px}.projectGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:12px}.project{min-width:0;overflow-wrap:anywhere;border:1px solid var(--line);border-radius:18px;padding:14px;background:linear-gradient(145deg,rgba(255,255,255,.065),rgba(255,255,255,.025))}.tag{display:inline-flex;align-items:center;border-radius:999px;padding:4px 8px;border:1px solid var(--line);font-size:11px;color:#dcecff;background:rgba(255,255,255,.06);margin-right:5px}.tag.Field{color:#bdfbd4;border-color:rgba(101,255,157,.35)}.tag.Host{color:#fbdc9a;border-color:rgba(255,176,0,.38)}.tag.Pod{color:#adcfff;border-color:rgba(106,169,255,.4)}.tag.Patch{color:#fda4b6;border-color:rgba(255,85,114,.36)}.docs{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.toast{position:fixed;right:18px;bottom:18px;z-index:50;max-width:520px;padding:13px 15px;border-radius:16px;border:1px solid var(--line);background:rgba(10,14,18,.94);box-shadow:var(--shadow);display:none}.toast.ok{border-color:rgba(101,255,157,.45)}.toast.err{border-color:rgba(255,85,114,.55)}@media(max-width:900px){.top{grid-template-columns:minmax(0,1fr)}.span4,.span6,.span8{grid-column:1/-1}.projectToolbar{grid-template-columns:1fr}.page{padding:14px}}
</style>
</head>
<body>
<div class="page">
  <section class="top">
    <div class="hero">
      <div class="eyebrow">audio development mission control</div>
      <h1>DVPE / Daisy one-click bench</h1>
      <p class="lede">Local launcher for DVPE, the dedicated DVPE LLM profile, DaisyHost, and the DaisyExamples project map. Buttons open real console windows via a localhost Python allow-list. Browser command execution remains as illegal as it should be.</p>
    </div>
    <aside class="rail">
      <h2>Live roots</h2>
      <div class="status">
        <div class="pill"><b id="projectCount">—</b><span>Daisy projects indexed</span></div>
        <div class="pill"><b>dvpe-llm</b><span>dedicated profile</span></div>
        <div class="pill"><b>5173</b><span>DVPE Vite default</span></div>
        <div class="pill"><b>local</b><span>launcher scope</span></div>
      </div>
    </aside>
  </section>
  <nav class="nav"><a href="#dvpe">DVPE</a><a href="#llm">DVPE LLM</a><a href="#daisyhost">DaisyHost</a><a href="#projects">DaisyExamples projects</a><a href="#paths">Paths</a></nav>

  <section id="dvpe" class="section grid">
    <div class="card span12"><div class="eyebrow">dvpe visual app</div><h2>One-click runs</h2><p class="muted">Run from <code>dvpe_CLD/</code>; local instructions say this is the correct root for dev, test, build, and Tauri.</p></div>
    <div id="dvpeCards" class="span12 grid"></div>
  </section>

  <section id="llm" class="section grid">
    <div class="card span12"><div class="eyebrow">dedicated llm setup</div><h2>DVPE profile controls</h2><p class="muted">The profile <code>dvpe-llm</code> is configured with the DVPE root cwd and DVPE-specific SOUL instructions. Use the broader <code>audio-development</code> profile when firmware/DaisyExamples is the primary target.</p></div>
    <div id="llmCards" class="span12 grid"></div>
  </section>

  <section id="daisyhost" class="section grid">
    <div class="card span12"><div class="eyebrow">daisyhost</div><h2>Host-side Daisy Patch workspace</h2><p class="muted">DaisyHost is treated as a first-party JUCE/CMake workspace. The full gate goes through <code>build_host.cmd</code>; doctor/gate buttons use the built Release CLI when present.</p></div>
    <div id="hostCards" class="span12 grid"></div>
  </section>

  <section id="projects" class="section">
    <div class="card span12">
      <div class="eyebrow">subdashboard</div>
      <h2>DaisyExamples projects + details</h2>
      <div class="projectToolbar"><input id="search" class="input" placeholder="filter by name, board, path, summary…"><select id="board" class="select"><option value="">All boards</option></select><button class="btn" onclick="renderProjects()">Refresh view</button></div>
      <div id="projectGrid" class="projectGrid"></div>
    </div>
  </section>

  <section id="paths" class="section grid">
    <div class="card span4"><h3>DVPE root</h3><div class="cmd">__ROOT__</div></div>
    <div class="card span4"><h3>DaisyExamples</h3><div class="cmd">__DAISY__</div></div>
    <div class="card span4"><h3>EMA</h3><div class="cmd">__EMA__</div></div>
  </section>
</div>
<div id="toast" class="toast"></div>
<script>
const RUNNERS = __RUNNERS_JSON__;
const PROJECTS = __PROJECTS_JSON__;
const groups = {
  dvpeCards: ['dvpe-dev','dvpe-tauri','dvpe-test','dvpe-build'],
  llmCards: ['llm-dvpe-chat','llm-dvpe-model','llm-dvpe-tools','llm-audio-chat'],
  hostCards: ['daisyhost-build','daisyhost-doctor','daisyhost-gate-json','daisyhost-hub-release','daisyhost-hub-debug']
};
function esc(s){return String(s ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function toast(msg, ok=true){const t=document.getElementById('toast'); t.textContent=msg; t.className='toast '+(ok?'ok':'err'); t.style.display='block'; clearTimeout(window.__toast); window.__toast=setTimeout(()=>t.style.display='none',5200);}
async function run(id){try{const r=await fetch('/api/run?id='+encodeURIComponent(id)); const j=await r.json(); if(!j.ok) throw new Error(j.error||'failed'); toast('Launched: '+(j.title||id)+' pid '+(j.pid||''));}catch(e){toast('Launch failed: '+e.message,false)}}
async function projectAction(rel,target){try{const r=await fetch('/api/project?rel='+encodeURIComponent(rel)+'&target='+encodeURIComponent(target)); const j=await r.json(); if(!j.ok) throw new Error(j.error||'failed'); toast('Started '+target+' for '+rel+' pid '+(j.pid||''));}catch(e){toast('Project action failed: '+e.message,false)}}
async function openRel(rel){try{const r=await fetch('/api/open?rel='+encodeURIComponent(rel)); const j=await r.json(); if(!j.ok) throw new Error(j.error||'failed'); toast('Opened '+rel);}catch(e){toast('Open failed: '+e.message,false)}}
function copyCmd(id){const r=RUNNERS.find(x=>x.id===id); navigator.clipboard.writeText(r.copyCommand || ((r.command||'open folder')+'  # cwd: '+r.cwd)); toast('Copied command for '+r.title)}
function card(r){const style=r.id.includes('llm')?'violet':(r.id.includes('daisyhost')?'amber':'primary');return `<div class="card span4"><h3>${esc(r.title)}</h3><p class="muted tiny">${esc(r.note)}</p><div class="cmd">${esc(r.command||'open folder')}<br><span class="muted">cwd: ${esc(r.cwd)}</span></div><div class="actions"><button class="btn ${style}" onclick="run('${esc(r.id)}')">Run</button><button class="btn" onclick="copyCmd('${esc(r.id)}')">Copy</button></div></div>`}
for(const [target,ids] of Object.entries(groups)){document.getElementById(target).innerHTML=ids.map(id=>card(RUNNERS.find(r=>r.id===id))).join('')}
document.getElementById('projectCount').textContent=PROJECTS.length;
const boards=[...new Set(PROJECTS.map(p=>p.board))].sort(); document.getElementById('board').innerHTML += boards.map(b=>`<option>${esc(b)}</option>`).join('');
document.getElementById('search').addEventListener('input', renderProjects); document.getElementById('board').addEventListener('change', renderProjects);
function renderProjects(){const q=document.getElementById('search').value.toLowerCase(); const b=document.getElementById('board').value; const rows=PROJECTS.filter(p=>(!b||p.board===b)&&(!q||[p.name,p.rel,p.board,p.summary].join(' ').toLowerCase().includes(q))).slice(0,160); document.getElementById('projectGrid').innerHTML=rows.map(p=>`<article class="project"><div><span class="tag ${esc(p.board)}">${esc(p.board)}</span><span class="tag">${p.hasCMake?'CMake':p.hasMakefile?'Make':'Docs'}</span><span class="tag">${esc(p.updated)}</span></div><h3>${esc(p.name)}</h3><p class="muted tiny">${esc(p.rel)}</p><p>${esc(p.summary)}</p><div class="docs">${p.docs.map(d=>`<button class="btn" onclick="openRel('${esc(d.rel)}')">${esc(d.name)}</button>`).join('')} ${p.dvpeFiles.map(d=>`<button class="btn violet" onclick="openRel('${esc(d)}')">DVPE</button>`).join('')}</div><div class="actions"><button class="btn primary" onclick="openRel('${esc(p.rel)}')">Open folder</button>${p.hasMakefile?`<button class="btn amber" onclick="projectAction('${esc(p.rel)}','make')">make</button><button class="btn" onclick="projectAction('${esc(p.rel)}','clean')">clean</button>`:''}</div><p class="muted tiny">C++ ${p.cppCount} · headers ${p.headerCount}</p></article>`).join('') || '<p class="muted">No matches.</p>'}
renderProjects();
</script>
</body>
</html>'''


def render_page() -> bytes:
    projects = scan_projects()
    page = PAGE_TEMPLATE
    page = page.replace("__RUNNERS_JSON__", json.dumps(runner_payload(), ensure_ascii=False))
    page = page.replace("__PROJECTS_JSON__", json.dumps(projects, ensure_ascii=False))
    page = page.replace("__ROOT__", html.escape(str(ROOT).replace("\\", "/")))
    page = page.replace("__DAISY__", html.escape(str(DAISY).replace("\\", "/")))
    page = page.replace("__EMA__", html.escape(str(EMA).replace("\\", "/")))
    return page.encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    server_version = "AudioDevDashboard/1.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        print(f"[{time.strftime('%H:%M:%S')}] {self.address_string()} {fmt % args}")

    def _send(self, status: int, body: bytes, content_type: str = "text/html; charset=utf-8") -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _json(self, obj: dict[str, Any], status: int = 200) -> None:
        self._send(status, json.dumps(obj, indent=2, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")

    def do_GET(self) -> None:  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed.query)
        try:
            if parsed.path == "/":
                self._send(200, render_page())
            elif parsed.path == "/api/projects":
                self._json({"ok": True, "projects": scan_projects()})
            elif parsed.path == "/api/runners":
                self._json({"ok": True, "runners": runner_payload()})
            elif parsed.path == "/api/run":
                runner_id = query.get("id", [""])[0]
                self._json(launch_runner(runner_id))
            elif parsed.path == "/api/project":
                rel = query.get("rel", [""])[0]
                target = query.get("target", ["make"])[0]
                self._json(command_for_project(rel, target))
            elif parsed.path == "/api/open":
                rel = query.get("rel", [""])[0]
                target = (DAISY / rel).resolve()
                if not _safe_under(target, DAISY):
                    raise PermissionError("open path escapes DaisyExamples")
                open_path(target)
                self._json({"ok": True, "opened": str(target)})
            else:
                self._json({"ok": False, "error": "not found"}, 404)
        except Exception as exc:  # intentionally report launch errors to UI
            self._json({"ok": False, "error": str(exc)}, 500)


def main() -> int:
    parser = argparse.ArgumentParser(description="DVPE / Daisy local dashboard")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8766)
    parser.add_argument("--no-open", action="store_true")
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    url = f"http://{args.host}:{args.port}/"
    print(f"Audio dev dashboard ready: {url}", flush=True)
    if not args.no_open:
        threading.Timer(0.7, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping dashboard.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
