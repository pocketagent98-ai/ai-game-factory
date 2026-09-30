> Turbo Rush specification series — extracted text of the original design document. Tables are flattened with | separators.

TURBO RUSH
Mobile 3D Arcade Racing Game — Complete Specification Series
Document 3 of 6 — App Flow Document
Engine: Godot 4.x   •   Platform: Android + iOS   •   Offline-first
Extracted and formatted from the Turbo Rush specification conversation — 30 September 2026
1. Purpose and Scope
This document defines the complete user navigation, screen hierarchy, and state transition logic for Turbo Rush. It serves as the blueprint for UI programmers, UX designers, and game flow logic implementation in Godot 4.x.
The App Flow covers:
App launch and onboarding
Main hub navigation
Pre-race preparation
In-race state machine transitions
Post-race reward and progression flows
Garage and Shop navigation
Settings and utility flows
Edge cases and error handling
All flows must respect the offline-first requirement. If a network-dependent feature (Ads, IAP) is triggered while offline, the UI must gracefully handle the state without crashing or blocking core gameplay.
2. Global Navigation Rules
2.1 Orientation and Input
Orientation: Strictly Landscape.
Hardware Back Button (Android): Maps to the current screen's "Back" or "Cancel" action. If on the Main Menu, triggers an "Exit Game" confirmation prompt.
Safe Areas: All interactive UI elements must respect device safe areas (notches, camera cutouts).
2.2 Transition Rules
Scene Transitions: Use a global TransitionLayer (fade to black or swipe) to hide scene loading.
Popups: Modal popups (e.g., "Not Enough Coins", "Confirm Purchase") dim the background and block interaction with underlying layers.
Loading Screens: Mandatory for any operation taking >0.5 seconds (e.g., Race generation, IAP store fetching).
3. App Launch & Onboarding Flow
3.1 Cold Start Sequence
Splash Screen: Display game logo (2 seconds max).
Save Check: SaveSystem attempts to load local data.
If Save Exists & Valid:
Route to
Main Menu
.
If Save Missing/Corrupt:
Initialize default save data and route to
Onboarding
.
Network Check: Asynchronously check internet connection to initialize AdsManager and IAPManager . (Does not block UI).
3.2 Onboarding Flow (First-Time User Experience)
The onboarding is a guided version of Level 1.
4. Main Hub / Main Menu Flow
The Main Menu is the central navigation hub.
4.1 Screen Layout & Elements
Top Bar: Player Level, Coin Balance, Diamond Balance, Settings (Gear Icon).
Center: 3D Showcase of currently selected car. "PLAY" button (prominent).
Bottom Navigation: Garage, Shop, Campaign/Level Select.
Banner Ad Zone: Bottom edge (only if online and ads not removed).
4.2 Navigation Logic
5. Pre-Race Flow
5.1 Level Info & Car Select Screen
When the player taps "PLAY", they enter the Pre-Race screen.
Level Info Display:
Level Number (e.g., "Level 24")
Race Type (e.g., "Standard", "Elite")
Environment (e.g., "Desert Canyon")
Active Modifiers (e.g., "Traffic Rush", "Night Run")
Car Selection Carousel:
Swipe left/right to change car.
Shows Car Name, Tier, and Key Stats.
Locked cars show a padlock and "Unlock at Level X / Cost Y Coins".
Action Buttons:
"Back" (Returns to Main Menu).
"RACE" (Starts loading).
5.2 Loading Sequence
Tap "RACE".
Show Loading Screen with progress bar and gameplay tips.
LevelGenerator builds the track definition.
ObjectPoolManager pre-spawns entities.
Transition to Race Scene (Ready State) .
6. In-Race Flow
6.1 Race State Transitions
The in-race flow is strictly governed by the RaceManager state machine (defined in TRD).
6.2 Pause Menu Flow
Resume: Closes overlay, returns to RACING .
Restart: Fades to black, resets race state, reloads same level seed.
Quit: Fades to black, abandons race (counts as DNF), returns to Main Menu. Trigger Interstitial Check.
6.3 Wreck & Revive Flow
When the player's car reaches 100 Damage:
Game pauses automatically. Camera zooms in on wreck.
Revive Popup appears:
Option A (Rewarded Ad):
"Watch Ad to Revive".
If Online & Ad Available: Play Ad -> On Success -> Resume race with 40 Damage, +30 Boost, 2s invulnerability.
If Offline/No Ad: Button disabled/hidden.
Option B (Diamonds):
"Revive for 5 Diamonds".
If Balance >= 5: Deduct 5 Diamonds -> Resume race.
If Balance < 5: Show "Not Enough Diamonds" prompt with link to Shop.
Option C (Give Up):
"Quit Race".
Abandons race, counts as DNF, returns to Results Screen (with 0 rewards).
7. Post-Race / Results Flow
The Results Flow is the core progression loop. It must feel rewarding and clearly communicate unlocks.
7.1 Results Screen Sequence
Camera Pan: Slow-mo or dynamic camera pan across the finish line.
Position Reveal: Large text showing final rank (e.g., "1st Place").
Reward Tally (Animated Count-up):
Rank Reward:
Base Coins × Rank Multiplier.
Track Coins:
Coins collected during the race.
Chest Reveal:
Chest drops onto screen. Player taps to open. Shows Chest Coins + Diamond (if any).
Random Bonus:
A spinning wheel or card flip reveals the random bonus reward.
First Clear Bonus:
If first time completing, show extra Coins/Diamonds.
Total Summary: Final Coins and Diamonds added to the top bar.
Star Rating: 1 to 3 stars fill up based on Clean Score and Position.
Ad Multiplier Prompt:
"Watch Ad to Double your Rank and Chest Coins!"
If tapped & successful:
Coin total animates upward (x2).
Next Action Buttons:
If Position <= 5:
"NEXT LEVEL" (Primary, highlighted).
If Position == 6 or DNF:
"RETRY" (Primary) and "MENU" (Secondary).
7.2 Next Level Unlock Logic
If "NEXT LEVEL" is tapped:
Increment internal level pointer.
Check for Environment change or Unlock milestones.
If major unlock (e.g., New Car, New Environment), show
Unlock Cinematic/Popup
before entering Pre-Race Flow for the new level.
Otherwise, go directly to Pre-Race Flow for Level + 1.
7.3 Interstitial Ad Check
When transitioning from Results Screen back to Main Menu (via "MENU" button or after "NEXT LEVEL" sequence completes):
AdsManager
checks time since last interstitial.
If > 5 minutes (and > 10 mins since app launch), show Interstitial Ad.
After ad closes (or if no ad shown), load Main Menu.
8. Garage Flow
The Garage is where players manage cars, upgrades, and cosmetics.
8.1 Garage Layout
Left Panel: Car Roster (Scrollable list of all cars).
Center: 3D Car Viewer (Rotate, Pan, Zoom).
Right Panel: Tabs for [Stats/Upgrades], [Wheels], [Paints/Decals].
Bottom: Banner Ad Zone.
8.2 Upgrade Flow
Player selects a Stat (e.g., "Top Speed").
UI shows Current Level, Next Level Stat Value, and Coin Cost.
Player taps "Upgrade".
Validation Check:
Check 1:
Is Player Level high enough? (If no, show "Reach Player Level X").
Check 2:
Is Stat already maxed (Level 10)? (If yes, show "MAX").
Check 3:
Does player have enough Coins? (If no, show "Not Enough Coins" + "Get Coins" button).
Execution:
Deduct Coins via
EconomyService
.
Update
ProgressionService
.
Play SFX and particle effect on the stat bar.
Update Car Stats in 3D viewer (e.g., engine sound pitch changes, visual glow).
8.3 Cosmetic Flow
Player selects a Wheel or Paint.
UI shows Preview on the 3D car.
If Locked: Show Cost (Coins or Diamonds).
Tap "Buy/Equip".
Validate currency -> Deduct -> Unlock -> Equip.
9. Shop & Monetization Flow
The Shop handles IAP, Ad rewards, and special bundles.
9.1 Shop Tabs
Diamonds: IAP Diamond packs.
Bundles: Cosmetic + Currency bundles.
Offers: "Remove Ads", "Starter Pack" (one-time).
9.2 IAP Purchase Flow
Player taps a Diamond Pack.
Confirmation Popup: Shows fiat price and Diamond amount.
Tap "Buy".
IAPManager initiates native store flow (Google Play / Apple StoreKit).
Success:
Store receipt validated (locally or via server if implemented later).
EconomyService
grants Diamonds.
Show "Purchase Successful" popup with particle effects.
Failure/Cancel:
Show "Purchase Cancelled" or "Transaction Failed" toast.
Do not grant currency.
9.3 Rewarded Ad Flows (Shop/Menu)
Free Coins (Daily Board): Player taps "Watch Ad for 100 Coins". Plays ad, grants coins.
Offline Handling: If device is offline, all "Watch Ad" and "Buy" buttons must be visually grayed out with an "Offline" tooltip. Tapping them shows a "Please connect to the internet" toast.
10. Settings & Utility Flows
10.1 Settings Menu
Accessible from Main Menu and Pause Menu.
11. Edge Cases & Error Handling Flows
11.1 App Backgrounding / Interruption
Trigger: Phone call, user swipes to home screen.
Action:
If in
RACING
state: Auto-trigger
PAUSED
state. Mute audio.
If in Menu: Mute audio.
Return: Resume audio. If in PAUSED state, remain paused until user taps "Resume".
11.2 Insufficient Funds
Trigger: Player taps Upgrade/Buy without enough Coins/Diamonds.
Action:
Show "Insufficient Funds" modal.
Display current balance vs required amount.
Provide shortcut button: "Get Coins" (Routes to Shop/Ad board) or "Get Diamonds" (Routes to IAP Shop).
11.3 Ad Failure
Trigger: Player taps "Watch Ad to Revive", but ad fails to load or user closes it early.
Action:
If closed early: Show "You must watch the full ad to revive" prompt. Return to Wreck Overlay.
If no ad fill (network error): Show "Ad unavailable right now" toast. Hide Ad button, leave Diamond/Quit options visible.
11.4 Save Data Corruption
Trigger: SaveSystem detects invalid checksum or impossible values on load.
Action:
Show "Save Data Error" screen.
Option A: "Load Backup" (if local backup exists).
Option B: "Reset Progress" (Warns user that progress will be lost).
Never silently wipe a player's save without explicit confirmation.
12. Visual Specification Recommendations (Flowcharts)
The following visual diagrams must be created by the UX/UI team to accompany this document.
FLOW-V1 — Global App Navigation Map
Where it belongs: Section 4 / Main Hub Flow Purpose: A high-level node graph showing all major screens (Splash, Menu, Garage, Shop, Race, Results) and the primary buttons that connect them.
FLOW-V2 — In-Race State Machine
Where it belongs: Section 6 / In-Race Flow Purpose: A state diagram showing READY -> COUNTDOWN -> RACING -> PAUSED/WRECKED/FINISHED. Must clearly show the branching logic for the Revive prompt.
FLOW-V3 — Post-Race Reward Sequence
Where it belongs: Section 7 / Post-Race Flow Purpose: A vertical timeline or flowchart showing the exact order of UI animations and popups on the Results Screen (Position -> Rank Coins -> Chest -> Bonus -> Total -> Ad Prompt -> Next Level).
FLOW-V4 — Upgrade Validation Logic
Where it belongs: Section 8 / Garage Flow Purpose: A decision tree showing the exact checks (Level Requirement -> Max Level -> Currency Check) that occur when a player taps an upgrade button, including the error state routing.
13. Canonical App Flow Values Carried Forward
These navigation and state rules are now locked for the UI/UX and Implementation documents:
End of Document 3 — APP FLOW.
--- TABLE ---
Version: | 1.0
--- TABLE ---
Platform: | Android + iOS
--- TABLE ---
Engine: | Godot 4.x
--- TABLE ---
Mode: | Offline-first
--- TABLE ---
Dependency: | This document implements the user navigation and state transitions established in Document 1 (PRD) and Document 2 (TRD).
--- TABLE ---
Step | Screen / State | Action / Logic
1 | Intro Cinematic / Art | Brief 3-second animated intro or panning shot of the starter car.
2 | Level 1 Start | Force Rookie GT car. Force Standard race type.
3 | In-Race Tutorial | Overlay prompts: "Steer to avoid traffic", "Tap to Boost".
4 | Finish Race | Ensure AI is heavily nerfed so player easily gets 1st place.
5 | Results Screen | Show standard results flow. Highlight "Level 2 Unlocked".
6 | Garage Redirect | Auto-navigate to Garage. Highlight the Upgrades tab.
7 | First Upgrade | Prompt player to upgrade "Acceleration" (Cost: 120 Coins, granted via hidden onboarding bonus).
8 | Main Menu | Route to Main Menu. Onboarding flag set to true in Save Data.
--- TABLE ---
Interaction | Destination | Condition
Tap "PLAY" | Pre-Race Flow | Always available.
Tap "Garage" | Garage Screen | Always available.
Tap "Shop" | Shop Screen | Always available.
Tap "Level Select" | Campaign Map | Shows unlocked levels.
Tap "Settings" | Settings Popup | Modal overlay.
Tap Currency (+) | Shop Screen (Currency Tab) | Opens specific IAP/Ad shop section.
--- TABLE ---
State | UI Visible | Allowed Inputs | Transition Trigger
READY | HUD hidden, "Get Ready" text | None | Cars placed on grid
COUNTDOWN | 3... 2... 1... GO! | Boost (revving) | Timer expires
RACING | Full HUD (Position, Boost, Coins, Pause) | Steer, Brake, Boost, Pause | Player crosses finish or wrecks
PAUSED | Pause Menu Overlay | Resume, Restart, Quit | Tap Pause or App Backgrounded
WRECKED | Wreck Overlay (Revive Prompt) | Revive (Ad/Diamond), Quit | Damage >= 100
FINISHED | "FINISH!" banner, Camera pan | None | Player crosses finish line
--- TABLE ---
Category | Controls | Logic
Audio | Sliders for Master, Music, SFX, Engine | Updates AudioSystem buses immediately.
Controls | Steering Sensitivity Slider, Button Layout Toggle | Updates InputSystem.
Graphics | Quality (Low/Med/High), FPS (30/60) | Updates Godot ProjectSettings and renderer. Requires restart or scene reload.
Haptics | Toggle On/Off | Updates HapticsSystem.
Privacy | "Privacy Policy", "Manage Consent" (GDPR/ATT) | Opens web view or native consent dialog.
Account | "Restore Purchases" (iOS), "Credits", "Support" | Triggers IAPManager.restore().
--- TABLE ---
Rule | Canonical Value
Orientation | Landscape strictly
Hardware Back Button | Maps to UI Back / Exit Prompt
Onboarding | Forced Level 1, guided tutorial, auto-redirect to Garage
Interstitial Trigger | Only on return to Main Menu from Results, max 1 per 5 mins
Revive Options | Rewarded Ad OR 5 Diamonds OR Quit
Results Ad Multiplier | Only doubles Rank Reward and Chest Coins
Next Level Unlock | Requires Finish Position <= 5
Offline UI Behavior | Ad/IAP buttons grayed out, core game fully functional
Save Corruption | Requires explicit user confirmation to reset
App Backgrounding | Auto-pauses race, mutes audio