#!/usr/bin/env python3
"""NVIDIA-powered build/improve agent for Merge & Bloom.

Reads the repo docs + game source, asks an NVIDIA NIM model (via the OpenAI-compatible
endpoint) for ONE concrete improvement as a JSON edit set, applies it, and runs the tests.

The API key is read from the NVIDIA_API_KEY environment variable ONLY (a GitHub Secret).
It is never written to disk, logs, or commits.

Env:
  NVIDIA_API_KEY   (required)  secret
  MODEL            (optional)  default: meta/llama-3.3-70b-instruct
  TASK             (optional)  what to improve
  BASE_URL         (optional)  default: https://integrate.api.nvidia.com/v1
"""
import json
import os
import subprocess
import sys
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_URL = os.environ.get("BASE_URL", "https://integrate.api.nvidia.com/v1")
MODEL = os.environ.get("MODEL", "meta/llama-3.3-70b-instruct")
TASK = os.environ.get("TASK", "Improve gameplay polish and fix any bug you can find. Keep changes small and safe.")
KEY = os.environ.get("NVIDIA_API_KEY", "")

CONTEXT_FILES = [
    "AGENTS.md", "docs/GAME_PRD.md", "docs/GAME_BIBLE.md",
    "docs/ART_STYLE.md", "docs/TECH_REQUIREMENTS.md", "docs/QA_REQUIREMENTS.md",
    "js/config.js", "js/model.js", "js/game.js", "js/platform.js", "index.html",
]

def read(path):
    try:
        with open(os.path.join(ROOT, path), "r", encoding="utf-8") as f:
            return f.read()
    except OSError:
        return ""

def build_prompt():
    ctx = "\n\n".join(f"===== {p} =====\n{read(p)}" for p in CONTEXT_FILES)
    return (
        "You are the lead autonomous game developer for 'Merge & Bloom', a portrait HTML5 merge game.\n"
        "Follow AGENTS.md rules strictly: keep js/model.js pure (no DOM), keep tests passing, "
        "never add ad networks, keep the build small.\n\n"
        f"TASK: {TASK}\n\n"
        "Return ONLY valid JSON of this exact shape (no markdown, no prose):\n"
        '{"summary": "<one line>", "edits": [{"path": "<relative path>", "content": "<full new file content>"}]}\n'
        "Only edit existing files. Prefer a single small, safe, high-value edit.\n\n"
        "REPOSITORY CONTEXT:\n" + ctx
    )

def call_nvidia(prompt):
    if not KEY:
        print("ERROR: NVIDIA_API_KEY is not set (add it as a repository secret)."); sys.exit(2)
    body = json.dumps({
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 8000,
    }).encode()
    req = urllib.request.Request(
        f"{BASE_URL}/chat/completions", data=body,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            data = json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()[:400]}"); sys.exit(3)
    return data["choices"][0]["message"]["content"]

def extract_json(text):
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[4:]
    start, end = text.find("{"), text.rfind("}")
    return json.loads(text[start:end + 1])

def run(cmd):
    return subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)

def main():
    print(f"Model: {MODEL}\nTask: {TASK}\n")
    raw = call_nvidia(build_prompt())
    try:
        plan = extract_json(raw)
    except Exception as e:
        print("Could not parse model output as JSON:", e); print(raw[:800]); sys.exit(4)

    print("Summary:", plan.get("summary", "(none)"))
    backups = {}
    changed = []
    for edit in plan.get("edits", []):
        path = edit.get("path", "")
        if not path or path.startswith("/") or ".." in path:
            print("Skipping unsafe path:", path); continue
        full = os.path.join(ROOT, path)
        if not os.path.exists(full):
            print("Skipping non-existent file:", path); continue
        backups[path] = read(path)
        with open(full, "w", encoding="utf-8") as f:
            f.write(edit.get("content", ""))
        changed.append(path)
        print("Edited:", path)

    if not changed:
        print("No changes produced."); return

    # gate on tests + syntax
    tests = run(["node", "test.mjs"])
    print(tests.stdout[-1500:], tests.stderr[-800:])
    checks = run(["node", "--check", "js/config.js", "js/model.js", "js/platform.js", "js/game.js"])
    ok = tests.returncode == 0 and checks.returncode == 0

    if not ok:
        print("\nTests/syntax failed -> reverting AI edits.")
        for path, content in backups.items():
            with open(os.path.join(ROOT, path), "w", encoding="utf-8") as f:
                f.write(content)
        sys.exit(5)

    print("\nAll checks passed. Changes kept:", ", ".join(changed))

if __name__ == "__main__":
    main()
