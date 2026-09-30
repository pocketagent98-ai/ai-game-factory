> Turbo Rush specification series — extracted text of the original design document. Tables are flattened with | separators.

TURBO RUSH
Mobile 3D Arcade Racing Game — Complete Specification Series
Document 6 of 6 — Implementation Plan
Engine: Godot 4.x   •   Platform: Android + iOS   •   Offline-first
Extracted and formatted from the Turbo Rush specification conversation — 30 September 2026
1. Purpose
This Implementation Plan defines how to build Turbo Rush from project setup to release candidate.
It includes:
Production milestones
System implementation order
Task breakdown
Technical dependencies
Godot project setup checklist
Feature implementation checklists
Balancing plan
QA and testing plan
Performance plan
Release checklist
Risk mitigation
This document is intended to allow a Godot team or AI coding agent to execute the full specification without guessing what to build next.
2. Delivery Principles
3. Team Assumption
This plan assumes a small mobile game team:
A solo developer can follow the same plan, but timeline estimates should be expanded.
4. Milestone Overview
Estimated total:
20–29 weeks for a small team.
A solo developer should expect a longer timeline, but the order of work remains valid.
5. Production Gates
Each milestone ends with a gate review.
6. M0 — Project Setup
6.1 Objectives
Create Godot 4.x project.
Configure mobile renderer and orientation.
Establish directory structure.
Create autoload service skeletons.
Create debug tools foundation.
Establish build pipeline for Android and iOS.
6.2 Tasks
6.3 Deliverables
Project compiles.
Mobile test build launches.
All autoloads exist.
Debug overlay works.
Landscape orientation locked.
7. M1 — Core Driving Prototype
7.1 Objectives
Build the basic driving feel before full race systems.
7.2 Tasks
7.3 Acceptance Criteria
Car is responsive on touch devices.
Boost works with canonical duration and drain.
Collisions reduce speed and add damage.
Car can complete a simple test track.
Frame rate is stable on mid-range device.
8. M2 — Race Loop Vertical Slice
8.1 Objectives
Create a playable race from countdown to results.
8.2 Tasks
8.3 Acceptance Criteria
Player can start Level 1.
Countdown works.
Five AI cars race.
Live position displays as X/6.
Finish line ends race.
Results screen shows position and stars.
Top 5 unlock logic works.
6th place does not unlock next level.
9. M3 — Procedural Difficulty Systems
9.1 Objectives
Implement deterministic level generation and difficulty scaling.
9.2 Tasks
9.3 Canonical Track Generation Formula
Use:
expected_top_speed_kmh = min(
    190.0,
    140.0 + 2.5 * recommended_upgrade_level(level) + min(30.0, floor(level / 10.0) * 2.0)
)
expected_speed_mps = expected_top_speed_kmh / 3.6 * 0.66
track_length = target_time * expected_speed_mps
9.4 Acceptance Criteria
Same level number always generates same layout.
Level 1, 10, 15, 20, 27, 30, 50, 100 generate valid race types.
Traffic and obstacle counts respect caps.
Elite levels always contain one Diamond pickup.
No generated track fails fairness validation in a 10,000-level test.
10. M4 — Progression and Economy
10.1 Objectives
Implement the full progression loop.
10.2 Tasks
10.3 Economy Constants to Implement
10.4 Acceptance Criteria
Rewards match formulas exactly.
Diamonds remain rare.
First clear rewards cannot be repeated.
Star milestones grant once.
Save survives app restart.
Corrupt save recovery works.
Upgrade costs and requirements match PRD.
11. M5 — Full UI/UX and Content
11.1 Objectives
Implement all screens and content progression.
11.2 Screens to Implement
11.3 UI Tasks
11.4 Content Tasks
11.5 Acceptance Criteria
All screens from App Flow exist.
UI is fully usable offline.
Results screen displays all mandatory reward elements.
Garage upgrades display requirements and costs.
Shop displays real prices and disables IAP offline.
Banner ads only appear in allowed screens.
12. M6 — Monetization and Platform Integration
12.1 Objectives
Integrate ads, IAP, consent, and store requirements safely.
12.2 Tasks
12.3 Canonical Monetization Values
12.4 Acceptance Criteria
No ad appears during race.
No ad appears before countdown.
Rewarded ads never grant Diamonds.
Double Coins ad doubles only Rank Reward and Chest Coins.
Offline mode disables ads and IAP without errors.
Remove Ads persists after restart.
Restore Purchases works on iOS.
13. M7 — Optimization, QA, and Release
13.1 Objectives
Stabilize performance, balance, and platform compliance.
13.2 Optimization Tasks
13.3 QA Tasks
13.4 Release Checklist
Store icons and screenshots ready.
Privacy policy accessible.
Consent flows compliant.
Ads certified by platform where required.
IAP products tested.
Save migration tested.
Crash-free rate target verified.
First-time user experience verified.
Offline mode verified.
Release build has debug tools disabled.
14. System Implementation Order
This is the recommended dependency order.
15. Godot Project Setup Checklist
16. Feature Implementation Checklists
16.1 Race Checklist
Countdown starts correctly.
Player can steer and boost.
AI cars follow track.
Traffic spawns within cap.
Obstacles spawn fairly.
Position displays X/6.
Finish line triggers results.
Wreck triggers revive flow.
Assist activates after two failures.
Pause works and stops simulation.
16.2 Progression Checklist
Top 5 finish unlocks next level.
6th finish blocks unlock.
Stars save best value.
Total stars update correctly.
Star milestones grant once.
Player Level equals highest completed level.
Upgrade gates enforce Player Level.
Cars unlock by Player Level and Coin cost.
Boost abilities unlock at correct levels.
16.3 Economy Checklist
Rank reward formula exact.
Chest tier exact.
Elite chest bump works.
Random bonus table exact.
Track Coins awarded only on completion.
Diamond pickup awarded only once per completed race.
First clear rewards grant once.
Rewarded ad double affects only Rank and Chest Coins.
Bonus Coins ad grants 200 Coins.
Revive Diamond cost is 5.
16.4 Save Checklist
Save creates default correctly.
Backup works.
Checksum validates.
Corrupt save does not crash.
Migration path exists.
Currency clamps work.
Invalid equipped cosmetics reset.
Remove Ads persists.
Daily ad caps reset correctly.
17. Balancing Plan
17.1 Balance Tools Required
17.2 Balance Simulation
Run automated simulation for:
10,000 generated levels.
1,000 simulated player sessions.
Expected Coin income per level range.
Expected Diamond income per 50 races.
Upgrade purchase pacing.
Failure rate by level range.
17.3 Target Pacing
18. Testing Plan
18.1 Unit Tests
Test formulas for:
Difficulty.
Race type.
Recommended upgrade level.
Expected top speed.
Target time.
Track length.
Traffic count.
Obstacle count.
Jump count.
Coin count.
Boost pickup count.
Rank reward.
Chest tier.
Chest probability expected value.
Random bonus expected value.
First clear rewards.
Star milestones.
Assist trigger.
18.2 Integration Tests
Full race to reward commit.
Retry after 6th place.
Revive with ad and Diamonds.
Double Coins ad.
Purchase and restore.
Offline startup.
Corrupt save recovery.
App background and resume.
18.3 Device Matrix
Minimum recommended matrix:
Test:
FPS
Memory
Safe areas
Touch responsiveness
Audio
Haptics
Ads
IAP
Save persistence
19. Performance Plan
19.1 Budgets
19.2 Profiling Cadence
20. Risk Management
21. Definition of Done
Turbo Rush is ready for release candidate when:
All six documents are implemented.
Core race loop is stable.
100+ levels are playable and fair.
Save system passes corruption tests.
Economy matches canonical formulas.
Monetization is optional, capped, and offline-safe.
UI is safe-area compliant.
Performance targets are met on target devices.
No known crashers remain.
Store compliance checks pass.
22. Final Implementation Amendments
During implementation, the following small canonical additions must be applied to unify all documents:
These additions are compatible with all previous documents and must be treated as canonical.
End of Document 6 — IMPLEMENTATION PLAN.
FINAL CROSS-DOCUMENT CONSISTENCY CHECK
This final check validates that Documents 1–6 function as one unified specification.
A. Core Gameplay Rules
No inconsistency detected.
B. Race Duration
No inconsistency detected.
C. Difficulty Progression
No inconsistency detected.
D. AI Scaling
No inconsistency detected.
E. Car Statistics
No inconsistency detected.
F. Upgrade Progression
No inconsistency detected.
G. Unlock Progression
Minor gap resolved:
Default starter cosmetics were not named in PRD.
Save Document defined canonical defaults.
Resolution: Adopt Save Document defaults as canonical.
Resolved.
H. Currency Economy
Minor gap resolved:
App Flow introduced a one-time onboarding bonus.
Original PRD did not define it.
Resolution: Canonical one-time onboarding_bonus of 120 Coins added.
Resolved.
I. Reward Probabilities
No inconsistency detected.
J. Diamond Rarity
No inconsistency detected.
K. Monetization Rules
Minor gap resolved:
Bonus Coins ad amount was not originally fixed.
UI Document mentioned +200 Coins.
Resolution: Canonical Bonus Coins ad reward is 200 Coins.
Resolved.
L. Level Generation
Minor gap resolved:
PRD did not define exact expected speed for track length.
TRD defined canonical expected top speed formula.
Resolution: Adopt TRD formula as canonical.
Resolved.
M. Save Structure
Minor gap resolved:
Economy ledger reasons did not include onboarding bonus.
Resolution: Add onboarding_bonus as valid Coins reason.
Resolved.
N. UI Flows
No inconsistency detected.
O. Godot Architecture
No inconsistency detected.
P. Offline-First Behavior
No inconsistency detected.
Q. Dependencies Between Systems
No inconsistency detected.
R. Naming Consistency
No inconsistency detected.
S. Numerical Consistency
No unresolved inconsistency detected.
FINAL CONSISTENCY RESOLUTION SUMMARY
The following minor gaps were identified and resolved canonically:
All resolved additions are compatible with the original design and do not violate fairness, rarity, or offline-first requirements.
FINAL SPECIFICATION STATUS
The six documents now form a unified, developer-ready specification for Turbo Rush:
PRD — Product vision, rules, progression, economy, monetization.
TRD — Godot architecture, systems, formulas, performance rules.
App Flow — Screen flow, user journeys, edge cases.
UI/UX Design Brief — Visual direction, wireframes, components, accessibility.
Backend / Local Save Schema — Local offline persistence, validation, monetization entitlements.
Implementation Plan — Milestones, tasks, testing, optimization, release plan.
No blocking inconsistencies remain.
--- TABLE ---
Version: | 1.0
--- TABLE ---
Engine: | Godot 4.x
--- TABLE ---
Platform: | Android + iOS
--- TABLE ---
Mode: | Offline-first
--- TABLE ---
Dependency: | Final implementation plan based on Documents 1–5.
--- TABLE ---
Principle | Requirement
Gameplay first | Core racing must feel good before meta systems are polished
Offline-first | No feature may depend on server availability for core play
Deterministic progression | Level generation and unlock logic must be reproducible
Service-based code | Economy, progression, rewards, ads, and IAP go through services
Mobile performance | Pooling, streaming, and low draw calls are mandatory
Ethical monetization | Ads and IAP must be integrated late enough to avoid corrupting core UX
Data safety | Save commits must be atomic and recoverable
Balancing through tools | Debug tools and simulations are required, not optional
--- TABLE ---
Role | Responsibility
Game developer / Godot engineer | Core systems, race logic, UI implementation
Technical artist / 3D artist | Cars, tracks, environments, VFX
UI/UX designer | Menus, HUD, flow polish, wireframes
Producer / product manager | Scope, milestones, economy approval
QA tester | Device testing, progression testing, regression
Optional backend/analytics support | Ads/IAP/analytics integration
--- TABLE ---
Milestone | Name | Goal | Recommended Duration
M0 | Project Setup | Engine, structure, services, debug tools | 1–2 weeks
M1 | Core Driving Prototype | Car controller, camera, test track, basic HUD | 2–3 weeks
M2 | Race Loop Vertical Slice | Countdown, AI, position, finish, results stub | 3–4 weeks
M3 | Procedural Difficulty Systems | Level generation, traffic, obstacles, modifiers | 3–4 weeks
M4 | Progression and Economy | Rewards, upgrades, cars, unlocks, save system | 3–4 weeks
M5 | Full UI/UX and Content | Garage, Shop, Results polish, environments | 3–5 weeks
M6 | Monetization and Platform | Ads, IAP, consent, stores, offline behavior | 2–3 weeks
M7 | Optimization, QA, Release | Performance, device tests, balancing, launch build | 3–4 weeks
--- TABLE ---
Gate | Requirement
Gate 0 | Project builds for Android/iOS, autoloads working
Gate 1 | Driving feels responsive and stable on mobile
Gate 2 | A full race loop is playable from start to results
Gate 3 | 100 generated levels pass validation without unfair layouts
Gate 4 | Economy and save system are stable and deterministic
Gate 5 | Full UI flow is usable and offline-safe
Gate 6 | Ads/IAP are functional, compliant, and offline-safe
Gate 7 | Release candidate passes device matrix and performance tests
--- TABLE ---
Task | Details
Create project | Godot 4.x, GDScript
Renderer | Set Mobile renderer
Orientation | Lock landscape
Input map | Add steer, brake, boost, pause actions
Directory structure | Create autoload, scenes, resources, scripts, assets folders
Autoloads | EventBus, GameConfig, SaveSystem, EconomyService, ProgressionService, RewardService, DifficultyService, LevelGenerator, RaceSession, AdsManager, IAPManager, AudioSystem, HapticsSystem, AnalyticsService, ObjectPoolManager
Config constants | Add canonical values from PRD/TRD
Debug overlay | FPS, draw calls, level seed
Build targets | Android and iOS test builds
--- TABLE ---
Task | Details
Car controller | CharacterBody3D-based arcade controller
Stats component | Runtime stats derived from base + upgrades
Steering | Touch steer input with sensitivity setting
Auto-acceleration | Enabled by default
Brake input | Optional manual brake
Boost prototype | Energy, drain, duration, speed bonus
Camera | Chase camera with speed FOV and collision avoidance
Test track | Simple modular loop or point-to-point test track
Collision response | Light/heavy collision classification
Damage prototype | Damage bar, wreck threshold
HUD stub | Speed, boost, position placeholder
--- TABLE ---
Task | Details
Race scene | Build RaceWorld scene structure
Race state machine | Loading, Ready, Countdown, Racing, Paused, Finished, Wrecked, Results
Countdown | 3-second countdown
AI cars | 5 AI opponents with path following
Position tracker | Progress-based ranking for 6 racers
Finish line | Detect player finish
Results stub | Show position and basic reward text
Pause menu | Resume, restart, quit
Wreck state | Damage 100 triggers wreck prompt
Clean Score | Track collisions, off-track, revive penalty
Star logic | Implement 1–3 star rules
Assist stub | Failure count tracking
--- TABLE ---
Task | Details
Level seed | Deterministic seed from level number
DifficultyService | D formula, spawn D, race type
Race type rules | Standard, Sprint, Endurance, Elite
Environment selection | Environment tiers by level
Condition selection | Weather/condition chance and effects
Modifier selection | Modifier chance and effects
Module system | Straight, curve, hairpin, chicane, jump, narrow, boost lane, traffic zone
Track path | Sampled center path every 3m
Track length | Use canonical expected top speed formula
Traffic system | Traffic count, speed fraction, lane behavior
Obstacle system | Obstacles, oil slicks, ramps, barriers
Coin placement | Track coin lines/arcs
Boost pickups | Count and placement
Diamond pickup | Eligibility and risky placement
Streaming | Activate track chunks near player
Object pooling | Traffic, obstacles, Coins, boost pickups, effects
Fairness validator | Ensure passable gaps, start/finish safety, no impossible walls
--- TABLE ---
Task | Details
SaveSystem | JSON save, backup, checksum, migration
Profile data | Player level, highest completed/unlocked level, selected level
Campaign records | Best position, stars, failure count, first clear
Currency service | Coins and Diamonds grant/spend
RewardService | Rank reward, chest, random bonus, track Coins, first clear, milestones
Chest logic | Bronze/Silver/Gold and Elite bump
Random bonus | Exact PRD probability table
Star milestones | 30/100/250/500/1000
Upgrade system | Seven stats, levels 0–10, costs, Player Level gates
Car ownership | Car unlock, purchase, selected car
Boost abilities | Unlock at 35/38/68, enabled toggles
Assist Mode | Activate after two failures
Onboarding bonus | One-time 120 Coin tutorial bonus
Results commit | Rewards committed before UI animation
Debug economy tools | Add currency, force chest, force finish position
--- TABLE ---
System | Value
Upgrade max level | 10
Total upgrade cost all stats | 198,940 Coins
Rank reward base | min(500, 60 + 18 * (Tier - 1))
Elite rank multiplier | 1.5
Chest max Coins | 500
Random bonus max Coins | 250
Random bonus Diamond chance | 0.25% for 1, 0.05% for 2
Revive Diamond cost | 5
Bonus Coins ad reward | 200 Coins
--- TABLE ---
Screen | Priority
Splash | High
Onboarding | High
Main Menu | High
Level Select | High
Pre-Race | High
Loading | High
Race HUD | High
Pause | High
Wreck/Revive | High
Results | High
Unlock Popup | High
Garage | High
Shop | High
Settings | High
Consent Dialog | High
Error/Offline popups | High
--- TABLE ---
Task | Details
Theme system | Colors, fonts, buttons, panels
Safe area system | Anchors and margins for notched devices
Currency chips | Coin/Diamond display and animation
HUD components | Position, progress ribbon, boost meter, damage indicator
Results sequence | Position, rank reward, chest, bonus, total, stars, unlock
Garage UI | Car list, stats, upgrades, cosmetics
Shop UI | Diamond packs, Remove Ads, bundles, free rewards
Settings UI | Audio, controls, graphics, haptics, privacy
Toasts/popups | Error, insufficient funds, offline, purchase success
Unlock popups | Cars, environments, abilities, race types
Accessibility | Text scale, contrast, colorblind-safe badges
--- TABLE ---
Task | Details
Six cars | Rookie GT, Street King, Turbo Viper, Canyon Falcon, Circuit Phantom, Hyper Nova
Environments | Eight base environments plus variants
Wheels | Stock plus unlockable wheels
Paints/materials | Basic and premium cosmetics
Decals/underglow/skins | Optional cosmetic set
Audio | Engine, UI, race events, chest, rewards
Haptics | Countdown, boost, collisions, rare rewards
--- TABLE ---
Task | Details
Ads abstraction | Mock, Disabled, and production providers
Rewarded ads | Revive, Double Coins, Bonus Coins
Ad caps | Revive 5, Double 10, Bonus 3
Interstitials | Return to Main Menu from Results only
Frequency caps | First 10 minutes disabled, then max 1 per 5 minutes
Banner ads | Garage, Shop, Settings, Cosmetics only
Remove Ads | Entitlement handling
IAP products | Diamond packs and Remove Ads
Restore purchases | Required on iOS
Pending grants | Save pending IAP grants
Consent flow | GDPR/ATT where required
Offline behavior | Hide/disable all network-only features
--- TABLE ---
Rule | Value
Revive ad daily cap | 5
Double Coins ad daily cap | 10
Bonus Coins ad daily cap | 3
Bonus Coins ad reward | 200 Coins
Interstitial first-session delay | 10 minutes
Interstitial minimum interval | 5 minutes
Diamond packs | 80, 400, 900, 2000
Remove Ads | Removes banners and interstitials
Rewarded ads after Remove Ads | Remain optional
--- TABLE ---
Task | Target
Object pooling audit | No runtime allocation spikes in race
Track streaming audit | Only active chunks processed
Draw call audit | < 250 active race draw calls
Memory audit | < 1.2 GB runtime where possible
Shader/material audit | Limit unique materials
Particle budget | Mobile-safe VFX
Audio budget | Compressed clips, no excessive voices
FPS stability | 60 FPS mid/high-end, 30 FPS low-end
--- TABLE ---
Area | Test Focus
Core race | Countdown, finish, position, restart
Difficulty | Level 1–200 progression sample
Procedural gen | 10,000-level validation
Economy | Reward formulas, chest probabilities, first clears
Save/load | Migration, corruption, backup
Monetization | Ad caps, IAP, restore, offline
UI/UX | Safe areas, small screens, large text
Accessibility | Colorblind, touch targets, haptics toggle
Device matrix | Low/mid/high Android and iOS devices
--- TABLE ---
Order | System | Reason
1 | Project setup and autoloads | Foundation
2 | Car controller and camera | Core feel
3 | Test track and input | Driving validation
4 | Race state machine | Structure for gameplay
5 | Position tracker | Core racing requirement
6 | Basic AI | Opponent behavior
7 | Results stub | Close the loop
8 | Level generation | Scalable content
9 | Traffic/obstacles | Difficulty systems
10 | RewardService | Progression value
11 | SaveSystem | Persistence
12 | Garage/upgrades | Meta progression
13 | Full UI | Player-facing flow
14 | Cosmetics | Retention and monetization
15 | Ads/IAP | Commercial layer
16 | Optimization | Mobile stability
17 | Release | Store launch
--- TABLE ---
Item | Required
Godot 4.x project | Yes
GDScript | Yes
Mobile renderer | Yes
Landscape lock | Yes
Touch input | Yes
Autoload services | Yes
JSON save system | Yes
Scene router | Yes
EventBus | Yes
ObjectPoolManager | Yes
Debug overlay | Yes
Android/iOS export presets | Yes
Ad plugin placeholder | Yes
IAP plugin placeholder | Yes
Audio buses | Yes
Haptics abstraction | Yes
--- TABLE ---
Tool | Purpose
Level warp | Jump to level 1, 10, 25, 50, 100, 200
Force finish position | Test reward/unlock branches
Force chest tier | Test Bronze/Silver/Gold
Guaranteed Diamond pickup | Test rare pickup flow
Add Coins/Diamonds | Test upgrade pacing
Upgrade all | Test max progression
Disable AI mistakes | Test hard AI
Show D value | Inspect difficulty curve
Show expected track length | Validate race duration
--- TABLE ---
Stage | Expected Feel
Levels 1–10 | Fast unlocks, first upgrades affordable
Levels 11–30 | Car variety begins, upgrade choices matter
Levels 31–60 | Traffic and technical tracks increase pressure
Levels 61–100 | Strong upgrades needed for consistency
Levels 100+ | Mastery, cosmetics, and modifiers sustain interest
--- TABLE ---
Class | Devices
Low-end Android | 1–2 devices
Mid-range Android | 2 devices
High-end Android | 1 device
iPhone | 1–2 supported iOS devices
Tablet | 1 optional device
--- TABLE ---
Metric | Target
Race draw calls | < 250
Menu draw calls | < 120
Visible triangles | < 300k
Runtime memory | < 1.2 GB
Race start time | < 5s on mid-range
Frame rate | 60 FPS mid/high, 30 FPS low
--- TABLE ---
Milestone | Profiling Focus
M1 | Car controller and camera
M3 | Procedural track streaming
M5 | UI overdraw and fonts
M6 | Ads/IAP overhead
M7 | Full device profiling
--- TABLE ---
Risk | Likelihood | Impact | Mitigation
Touch controls feel poor | Medium | High | Prototype early, sensitivity settings
Procedural tracks become unfair | Medium | High | Validator, 10k-level test
Economy too slow | Medium | High | Simulations, debug tools
Performance on low-end devices | High | High | Pooling, streaming, budgets
Ad SDK issues | Medium | Medium | Abstraction, mock provider
IAP edge cases | Medium | High | Pending grants, restore tests
Save corruption | Low | High | Backup, checksum, recovery
Difficulty curve too steep | Medium | High | Assist Mode, AI caps
UI clutter during race | Medium | Medium | HUD wireframe validation
Scope creep | High | Medium | Strict milestone gates
--- TABLE ---
Addition | Reason | Canonical Rule
onboarding_bonus | App Flow introduces a one-time tutorial upgrade moment | Grant 120 Coins once after onboarding completion
Economy ledger reason | Support onboarding bonus | Add onboarding_bonus as valid Coins reason
Bonus ad reward amount | UI mentions free Coins ad | Bonus Coins rewarded ad grants exactly 200 Coins
Boost pickup count formula | PRD defines boost pickups but not exact count | Use TRD formula: base 3 + floor(5 * D_spawn), Sprint -1, Endurance +1, Boost Famine -30%, clamp 2–8
Track length expected speed | PRD requires stable duration but does not define generation speed | Use TRD canonical expected top speed formula
Default cosmetics | Save system requires valid starter equipment | Canonical defaults: wheel_stock, paint_red, material_basic, decal_none, underglow_none, skin_none
--- TABLE ---
Item | Check | Status
Player + AI count | 1 player + 5 AI across all docs | Consistent
Countdown | 3 seconds across PRD, TRD, App Flow, Implementation | Consistent
Position display | X/6 live ranking across PRD, TRD, UI | Consistent
Finish line | Every level finite, not endless | Consistent
Next level unlock | Finish position 1–5 | Consistent
Assist Mode | Activates after two failures | Consistent
--- TABLE ---
Race Type | PRD | TRD | Implementation Plan | Status
Standard | 120–170s | 120–170s | 120–170s | Consistent
Sprint | 85–115s | 85–115s | 85–115s | Consistent
Endurance | 175–215s | 175–215s | 175–215s | Consistent
Elite | 130–180s | 130–180s | 130–180s | Consistent
--- TABLE ---
Item | Rule | Status
Difficulty formula | D = min(1, 1 - exp(-(Level - 1)/70)) | Consistent
Elite spawn bonus | +0.05 in TRD and PRD | Consistent
Difficulty axes | AI, traffic, obstacles, track, environment, modifiers | Consistent
Length as difficulty | Explicitly not primary scaler | Consistent
Soft cap behavior | D approaches 1.0, later levels vary through complexity/modifiers | Consistent
--- TABLE ---
Item | PRD | TRD | Status
Top Speed Multiplier | 0.88 + 0.18 * D | Same | Consistent
Acceleration Multiplier | 0.86 + 0.20 * D | Same | Consistent
Handling Multiplier | 0.90 + 0.15 * D | Same | Consistent
Aggression | 0.20 + 0.70 * D | Same | Consistent
Overtake Skill | 0.25 + 0.65 * D | Same | Consistent
Mistake Chance | max(0.03, 0.16 - 0.10 * D) | Same | Consistent
Boost Use Skill | 0.30 + 0.60 * D | Same | Consistent
Elite adjustments | +0.02 speed, +0.05 aggression/overtake | Same | Consistent
--- TABLE ---
Item | Rule | Status
Seven stats | Top Speed, Acceleration, Handling, Braking, Boost Power, Boost Duration, Stability | Consistent
Upgrade increment values | +2.5 km/h, +0.35 m/s², +2.5%, +0.7 m/s², +2 km/h, +0.25s, +3% | Consistent
Max upgrade level | 10 | Consistent
Global upgrades | Apply to all owned cars | Consistent
Car base stats | Same table in PRD and TRD | Consistent
--- TABLE ---
Item | Value | Status
Upgrade levels | 0–10 | Consistent
Level 1 cost | 120 | Consistent
Level 10 cost | 10,500 | Consistent
Total per stat | 28,420 | Consistent
Total all stats | 198,940 | Consistent
Player Level gates | 1, 4, 8, 13, 20, 28, 38, 50, 65, 85 | Consistent
--- TABLE ---
Item | Rule | Status
Car unlocks | Level 8, 18, 32, 55, 90 with Coin costs | Consistent
Boost abilities | Levels 35, 38, 68 | Consistent
Environment tiers | 20-level bands | Consistent
Elite levels | Every 10th level | Consistent
Sprint levels | Ending in 5 from Level 15 | Consistent
Endurance levels | Ending in 7 from Level 27 | Consistent
Wheels/cosmetics | Cosmetic only | Consistent
--- TABLE ---
Item | Rule | Status
Coins | Common currency for upgrades/cars/basic cosmetics | Consistent
Diamonds | Rare currency for premium cosmetics/continue | Consistent
Rewarded ads | No direct Diamonds | Consistent
Track Coins | 1 Coin each, awarded only on completion | Consistent
First clear Coins | 80 + 12 * Tier | Consistent
First clear Diamonds | +3 every 10th, +5 extra every 50th | Consistent
Star milestones | 30/100/250/500/1000 | Consistent
--- TABLE ---
System | PRD | TRD | Status
Bronze chest Coins | 50/80/120/180/250/500 with exact probabilities | Same | Consistent
Silver chest Coins | 80/120/180/250/350/500 with exact probabilities | Same | Consistent
Gold chest Coins | 150/220/300/380/450/500 with exact probabilities | Same | Consistent
Chest Diamond chance | Bronze 1%, Silver 2%, Gold 3% | Same | Consistent
Diamond amount | 99% for 1, 1% for 2 | Same | Consistent
Random bonus table | Exact PRD table | Same | Consistent
--- TABLE ---
Source | Rule | Status
Chests | Small chance, usually 1, rarely 2 | Consistent
Random bonus | 0.25% for 1, 0.05% for 2 | Consistent
Diamond pickup | Standard/Sprint 5%, Endurance 8%, Elite guaranteed | Consistent
First clear milestones | +3 every 10th, +5 extra every 50th | Consistent
Rewarded ads | No Diamonds | Consistent
IAP | Available but not required | Consistent
--- TABLE ---
Item | Rule | Status
Rewarded revive | Ad or 5 Diamonds | Consistent
Double Coins | Doubles Rank + Chest Coins only | Consistent
Bonus Coins ad | Optional, capped | Consistent
Interstitial location | Return to Main Menu from Results only | Consistent
Interstitial first-session delay | 10 minutes | Consistent
Interstitial frequency | 5 minutes | Consistent
Banner locations | Garage, Shop, Settings, Cosmetics | Consistent
Remove Ads | Removes banners/interstitials, keeps rewarded optional | Consistent
Pay-to-win | Prohibited | Consistent
--- TABLE ---
Item | Rule | Status
Deterministic seed | By level number | Consistent
Race type assignment | Elite/Sprint/Endurance rules | Consistent
Track modules | Modular procedural pieces | Consistent
Traffic count formula | (8 + 32 * D_spawn) * TypeMultiplier, cap 45 | Consistent
Obstacle count formula | (6 + 30 * D_spawn) * TypeMultiplier, cap 40 | Consistent
Track Coins formula | (90 + 120 * D) * CoinMultiplier, cap 260 | Consistent
Diamond pickup max | 1 per level | Consistent
Object pooling | Mandatory | Consistent
Track streaming | Active window required | Consistent
--- TABLE ---
Item | Rule | Status
Save format | JSON | Consistent
Offline-first | No mandatory server | Consistent
Primary save path | user://save/turbo_rush_save.json | Consistent
Backup path | user://save/turbo_rush_save.backup.json | Consistent
Upgrade keys | top_speed, acceleration, handling, braking, boost_power, boost_duration, stability | Consistent
Car IDs | rookie_gt, street_king, turbo_viper, canyon_falcon, circuit_phantom, hyper_nova | Consistent
Ability IDs | slipstream_boost, clean_run_bonus, perfect_landing_boost | Consistent
Monetization fields | Remove Ads, ad caps, IAP pending grants | Consistent
Privacy fields | Consent status, ATT status | Consistent
--- TABLE ---
Item | Rule | Status
Landscape orientation | Locked | Consistent
Main menu PLAY behavior | Starts selected/current level | Consistent
Pre-Race screen | Shows level, modifiers, car | Consistent
Race HUD | Position, boost, Coins, progress, pause | Consistent
Results flow | Position, rank reward, chest, bonus, stars, unlock | Consistent
Revive flow | Ad, Diamonds, Give Up | Consistent
Garage flow | Cars, upgrades, cosmetics | Consistent
Shop flow | Diamonds, Remove Ads, bundles | Consistent
Offline UI | Network features disabled gracefully | Consistent
--- TABLE ---
Item | Rule | Status
Engine | Godot 4.x | Consistent
Language | GDScript | Consistent
Renderer | Mobile | Consistent
Autoload services | Defined in TRD, used by Implementation Plan | Consistent
Car controller | CharacterBody3D arcade model | Consistent
Race scene structure | Defined and used consistently | Consistent
Object pooling | Required for traffic, obstacles, Coins, effects | Consistent
Save service | Centralized, atomic, validated | Consistent
--- TABLE ---
Feature | Offline Rule | Status
Campaign | Fully playable offline | Consistent
Rewards | Fully offline | Consistent
Upgrades | Fully offline | Consistent
Garage/Shop UI | Shop displays but disables IAP offline | Consistent
Ads | Disabled offline | Consistent
IAP | Disabled offline | Consistent
Save | Local only | Consistent
Analytics | Optional, non-blocking | Consistent
--- TABLE ---
Dependency | Status
RaceResult depends on PositionTracker and RaceManager | Consistent
RewardService depends on DifficultyService and RaceResult | Consistent
ProgressionService depends on SaveSystem and EconomyService | Consistent
UI depends on service events, not direct mutation | Consistent
Ads/IAP depend on network but degrade offline | Consistent
LevelGenerator depends on DifficultyService and seed | Consistent
--- TABLE ---
Term | Canonical Form | Status
Coins | Coins | Consistent
Diamonds | Diamonds | Consistent
Player Level | Highest completed level | Consistent
Race Level | Campaign level number | Consistent
Elite | Elite race | Consistent
Sprint | Sprint race | Consistent
Endurance | Endurance race | Consistent
Assist | Assist Mode | Consistent
Remove Ads | Remove Ads product | Consistent
Rank Reward | Fixed deterministic race Coins | Consistent
Reward Chest | Random chest reward | Consistent
Random Bonus | Random post-race bonus roll | Consistent
--- TABLE ---
Number | Source | Status
1 player + 5 AI | PRD/TRD/UI | Consistent
3-second countdown | PRD/TRD/UI/Implementation | Consistent
Top 5 unlock | PRD/App Flow/Save/Implementation | Consistent
5 Diamonds revive | PRD/TRD/UI/Implementation | Consistent
198,940 Coins total upgrades | PRD/TRD/Implementation | Consistent
10 upgrade max | PRD/TRD/Save | Consistent
45 traffic cap | PRD/TRD/Implementation | Consistent
40 obstacle cap | PRD/TRD/Implementation | Consistent
260 track Coin cap | PRD/TRD/Implementation | Consistent
5/8/10% Diamond pickup chances | PRD/TRD | Consistent
30/100/250/500/1000 star milestones | PRD/Save/Implementation | Consistent
5/10/3 ad caps | PRD/TRD/UI/Save/Implementation | Consistent
200 Coins bonus ad reward | Resolved amendment | Canonical
120 Coins onboarding bonus | Resolved amendment | Canonical
--- TABLE ---
Gap | Resolution
Onboarding bonus not defined in PRD | Added one-time 120 Coin onboarding_bonus
Economy ledger missing onboarding reason | Added onboarding_bonus as valid Coins reason
Bonus Coins ad reward amount not fixed | Canonical value set to 200 Coins
Boost pickup count not fixed in PRD | Canonical TRD formula adopted
Track generation expected speed not fixed in PRD | Canonical TRD expected top speed formula adopted
Default starter cosmetics not named in PRD | Canonical Save Document defaults adopted