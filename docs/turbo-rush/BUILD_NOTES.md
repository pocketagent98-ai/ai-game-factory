# Turbo Rush — Build Notes (Owner Directives)

These directives override or extend AGENTS.md for the current build.

## 1. The full spec is the GDD — Gate 1 already satisfied
The complete design for this game is in this folder (01_PRD ... 06_Implementation_Plan): PRD, TRD, App Flow, UI/UX brief, save schema, implementation plan. The Owner supplied and approved this spec. Do NOT wait for an "approved" comment for Gate 1 — treat the spec series as the approved GDD and start at Phase 1 (task plan).

## 2. LOCAL-ONLY — no backend, no cloud (temporary, by design)
- The Owner has explicitly removed the backend/cloud service for launch.
- ALL state (progression, currencies, upgrades, cars, cosmetics, settings, ad caps, consent) must live on-device, per 05_Backend_Save_Schema.md ("Local Backend Services"), saved under user:// with atomic JSON writes.
- NO Unity Gaming Services cloud features, NO remote config, NO accounts, NO server-dependent leaderboards. Local-only.
- The save system MUST sit behind a clean interface (SaveService) so a cloud sync layer can be added in about 2-3 months without refactoring.
- Offline-first: the game must be fully playable in airplane mode (except ads).

## 3. Unity Ads (monetization)
- Unity Ads Game ID: Android `6195678`, iOS `6195678` (Unity project "MyFirstGame...").
- Formats: Rewarded (revive, bonus coins), Interstitial, Banner — per PRD.
- Implement behind a MonetizationService abstraction (per TRD). Rewarded ads must NEVER grant Diamonds (PRD rule).
- If the Godot Unity Ads plugin is impractical to wire headlessly, stub the service cleanly so it can be enabled with config only.
- Ad-frequency caps and privacy consent per 05_Backend_Save_Schema.md.

## 4. Build order (from 06_Implementation_Plan.md)
M0 setup -> M1 core driving prototype -> M2 race-loop vertical slice -> M3 procedural difficulty -> M4 progression/economy -> M5 UI/UX -> M6 monetization + platform -> M7 optimization/QA/release.
Deliver in milestone order; each milestone ends with a working build. M2 is the first "feel" gate for the Owner.

## 5. Scope discipline
The spec is ambitious ("powerful" per Owner). Stay faithful to the spec, but milestone order first: a complete, polished, 2-3 minute race loop beats half-built everything. Difficulty must scale via the D formula, never longer races.

## 6. Verify continuously
After every milestone: headless import + unit tests + autoplay bot racing to the finish line; export a debug APK via the export workflow.
