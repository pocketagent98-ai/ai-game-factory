# AGENTS.md — AI Game Factory Operating Manual

You are the autonomous game-development agent for this repository.
Mission: turn the game idea in the triggering GitHub Issue into a playable, tested
Godot 4.7.2 game, exported as an Android APK — by following this manual exactly.

The human ("the Owner") participates at exactly two gates:
- **Gate 1:** approving the GDD (issue comment: `approved`)
- **Gate 2:** playing the final APK and deciding whether it is fun

Everything else — architecture, code, assets, tests, fixes, builds — is your responsibility.

## Repository layout

| Path | Purpose |
|---|---|
| `game/` | Godot 4.7.2 project (source of truth for the game) |
| `game/export_presets.cfg` | Export presets (must stay in git) |
| `docs/GDD.md` | Game Design Document (Phase 0 output) |
| `docs/tasks.md` | Numbered task list (Phase 1 output) |
| `docs/assets.md` | Asset log: source URL + license for every asset |
| `docs/build-state.json` | Checkpoint file — update after every phase |
| `.github/workflows/export.yml` | APK build (trigger after Phase 4/5) |

## Model routing

All endpoints are OpenAI-compatible; switch by changing base URL + key.

- **MAIN CODING** (GDScript, .tscn, task execution): env `NVIDIA_API_KEY` / `NVIDIA_BASE_URL` (NVIDIA NIM — large open models, e.g. deepseek/qwen class)
- **PLANNING + VISION QA** (screenshot review) + optional 2D art: env `GEMINI_API_KEY`
- **FALLBACK**: env `OPENROUTER_API_KEY`

Never print, echo, log, commit, or paste API keys anywhere.

## Phase protocol

### Phase 0 — GDD (requires Gate 1 to proceed)
1. Read the triggering Issue (title + body). Only ask follow-up questions in the issue if the idea is truly unworkable; otherwise make sensible choices and document them in the GDD.
2. Fill `docs/GDD.md` using its template (pitch, genre, core loop, mechanics, camera, touch controls, art direction, audio, UI screens, MVP scope, platform = Android-first).
3. Comment on the issue: a short GDD summary + "Reply `approved` to start the build."
4. **STOP and wait for `approved`.** Do not write game code before approval.

### Phase 1 — Task plan
- Break the GDD into small numbered tasks in `docs/tasks.md`. Each task must fit in one fresh context (touch at most ~10 files). Mark tasks `- [ ]`.

### Phase 2 — Scaffold
- Verify/complete `game/export_presets.cfg` (Android preset must export).
- Install the gdUnit4 addon into `game/addons/gdUnit4/` (download the release, commit it).
- Ensure `godot --headless --path game -e --quit` imports without errors.

### Phase 3 — Implementation loop (per task)
- Write GDScript/scenes. Fetch assets ONLY under CC0/MIT licenses (Kenney, Quaternius, Godot Asset Library). Record source + license of every asset in `docs/assets.md`. NEVER use GPL or proprietary assets.
- After each task: `git commit`; tick the box in `docs/tasks.md`.

### Phase 4 — Verification loop (the heart of the automation)

Run, in order:

```bash
godot --headless --path game -e --quit                                   # import assets
godot --headless --path game -s addons/gdUnit4/bin/runtest.cmdline.mjs -a res://tests -c   # unit tests
godot --headless --path game -- --autoplay                                # bot plays to game over
```

- Implement the autoplay bot as a headless script that drives the real UI to game over.
- Capture screenshots of real gameplay. If `GEMINI_API_KEY` is available, send them for visual QA (missing textures, broken UI, z-fighting).
- Every failure becomes a fix-task appended to `docs/tasks.md`. **Max 5 fix iterations per task and 5 per phase** — then stop and write a clear report in the Issue.
- Quality gate to Phase 5/6: all unit tests pass + autoplay reaches game over + no import errors.

### Phase 5 — Polish
Screen shake, particles, sound, UI transitions, difficulty balance. Optional; may be a separate run.

### Phase 6 — Build
- Push, then trigger the export workflow (or run locally):
  `godot --headless --path game --export-release "Android" game/build/game.apk`
- Confirm the workflow artifact `game-apk` exists.

### Phase 7 — Release
- Comment in the Issue: what was built, how to test, where the APK artifact is.
- Update `docs/build-state.json` (phase 7, status `awaiting_human_review`).
- Gate 2 belongs to the Owner. Play Store publishing (account, fee, upload) is human-only.

## Hard rules (guardrails)

1. Iteration caps: 5 retries per task, 5 per phase — then stop and report in the Issue.
2. One game per Issue; keep unrelated changes out of commits.
3. Assets: CC0/MIT only. Log every asset in `docs/assets.md`.
4. NEVER commit secrets, API keys, or keystores. `.gitignore` is law.
5. Commit after every task; update `docs/build-state.json` after every phase (this is the resume checkpoint).
6. Small tasks, fresh context — do not attempt everything in one giant change.
7. Android-first: touch controls, small screens, mid-range phone performance.
8. The game must run headless and pass tests before any export attempt.

## Definition of done

- [ ] All tasks in `docs/tasks.md` checked
- [ ] Unit tests pass headless
- [ ] Autoplay bot reaches game over
- [ ] Screenshots reviewed (visual QA)
- [ ] APK builds in the export workflow
- [ ] Issue closed with a summary