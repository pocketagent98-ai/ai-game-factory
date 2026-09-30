> Turbo Rush specification series — extracted text of the original design document. Tables are flattened with | separators.

TURBO RUSH
Mobile 3D Arcade Racing Game — Complete Specification Series
Document 4 of 6 — UI/UX Design Brief
Engine: Godot 4.x   •   Platform: Android + iOS   •   Offline-first
Extracted and formatted from the Turbo Rush specification conversation — 30 September 2026
1. Purpose
This UI/UX Design Brief defines the visual design direction, interface structure, interaction rules, wireframe requirements, component system, accessibility standards, and screen-level UX behavior for Turbo Rush.
It must allow a UI artist, UX designer, or Godot developer to build the full interface without guessing:
What screens exist
What elements appear on each screen
How the player moves between screens
How rewards and progression are displayed
How monetization is presented ethically
How offline and error states behave
How the interface scales across mobile devices
2. Core UX Goals
3. Visual Design Direction
Turbo Rush should feel:
Fast
Bright
Arcade-like
Clean
Modern
High-contrast
Rewarding
It must not copy the reference video’s assets, branding, UI, or tracks.
3.1 Visual Keywords
Speed, glow, neon accents, clean panels, bold numbers, tactile buttons, celebratory rewards.
3.2 Recommended Visual Style
4. Design Tokens
These tokens should be implemented in a Godot Theme resource.
4.1 Color Palette
4.2 Typography Scale
Design reference resolution: 1920 × 1080 landscape.
Typography rules:
Use bold italic display font for racing numbers and headings.
Use outline or soft shadow for text over 3D race scene.
Avoid thin fonts on mobile.
All critical text must remain readable at arm’s length.
4.3 Spacing and Layout
4.4 Motion Timing
Motion must never delay the player from continuing for more than a short celebratory moment. All reward animations should be skippable after the first time or after 1 second.
5. Global Layout Rules
5.1 Orientation and Resolution
5.2 Safe Area Policy
Critical interactive elements must stay inside safe area.
Decorative elements may extend beyond safe area.
Top-left pause button and top-right currency indicators must not overlap notches.
Bottom buttons must avoid home indicator and gesture zones.
Recommended safe margin for 1920 × 1080 design:
Godot implementation should query safe area where available and adjust anchors dynamically.
6. Component System
6.1 Button Types
6.2 Button States
6.3 Currency Chips
Currency chips appear in top bars and shops.
[Coin Icon] 12,480   [+]
[Diamond Icon] 36    [+]
Rules:
Coin chip uses gold accent.
Diamond chip uses blue premium accent.
Plus button opens Shop.
Values animate when increased.
If offline and plus button opens IAP, show offline toast if tapped.
6.4 Progress Bars
Used for:
Boost meter
Damage meter
Race progress ribbon
Upgrade level progression
Loading bar
Rules:
Boost bar uses cyan gradient.
Damage bar uses yellow to red gradient.
Race progress uses track ribbon with finish flag.
Bars must have numeric or icon context where useful.
6.5 Cards
Cards are used for:
Cars
Upgrades
Cosmetics
Shop items
Level select tiles
Card requirements:
Icon or preview
Title
Subtitle or stat summary
Status badge: Owned, Locked, Selected, New
Cost or action button
Rarity or premium accent where relevant
6.6 Popups
Popup categories:
Popup rules:
One modal popup at a time.
Close button visible unless action is mandatory.
Destructive actions require explicit confirmation.
Reward popups should allow quick dismissal.
7. Screen Inventory
8. Splash and Onboarding UX
8.1 Splash Screen
Elements:
Turbo Rush logo
Subtle animated speed lines
Loading indicator if initialization takes >1 second
Rules:
No interactive buttons.
Maximum recommended duration: 2 seconds.
Must not show ads.
8.2 Onboarding
Onboarding should teach through doing, not long text.
Tutorial prompts:
“Steer to avoid traffic.”
“Tap BOOST to accelerate.”
“Collect Coins.”
“Finish in the top 5 to unlock the next race.”
Rules:
Level 1 AI must be easy.
Tutorial hints appear only until the action is performed.
Player cannot fail onboarding harshly.
After results, guide player to Garage and first upgrade.
9. Main Menu UX
9.1 Wireframe Description
+----------------------------------------------------------------------+
| [Settings]        [Level 27]        [Coins +] [Diamonds +]        |
|                                                                      |
|                         3D CAR SHOWCASE                              |
|                                                                      |
|              [ GARAGE ]    [ PLAY ]    [ SHOP ]                     |
|                                                                      |
| [Campaign Icon]                                             [Banner] |
+----------------------------------------------------------------------+
9.2 Element Requirements
9.3 Main Menu Behavior
If next level is unlocked, PLAY says: PLAY — LEVEL X .
If player failed last attempt, PLAY still says: PLAY — LEVEL X .
If Assist is active for current level, small Assist badge appears near PLAY.
If new car or upgrade is available, small notification dot appears on Garage.
If free ad reward is available, small notification dot may appear on Shop.
10. Level Select UX
Level Select supports an infinite campaign.
10.1 Layout
+----------------------------------------------------------------------+
| Back                  LEVEL SELECT                   [Go to Current] |
|                                                                      |
| [1★] [2★★] [3★] [4★★★] [5] [6] [7] [8] [9] [10 ELITE]              |
|                                                                      |
| Selected Level Card:                                                 |
| Level 10 — Elite Standard                                            |
| Environment: Sunrise City                                            |
| Modifier: Traffic Rush                                               |
| Best: 1st — ★★★                                                     |
|                                                        [RACE]        |
+----------------------------------------------------------------------+
10.2 Level Tile Requirements
Each tile shows:
Level number
Star count: 0–3
Lock state if not unlocked
Type badge:
Standard: none or normal flag
Sprint: lightning icon
Endurance: long-track icon
Elite: crown or flame badge
Modifier icon if already discovered
10.3 Infinite Scrolling Rules
Use paginated horizontal chunks of 10 levels.
Dynamically load tiles as player scrolls.
“Go to Current” button jumps to highest unlocked level.
Locked levels show lock icon and short requirement:
“Finish Level 9 in top 5”
10.4 Replay Rules
Any unlocked level may be replayed.
Replaying can improve best stars.
Rewards are granted again according to economy rules.
First-time bonuses are not granted again.
11. Pre-Race UX
11.1 Wireframe Description
+----------------------------------------------------------------------+
| Back                                                                 |
|                         LEVEL 27 — ENDURANCE                         |
| Environment: Desert Canyon        Modifier: Traffic Rush             |
|                                                                      |
|   [Car Carousel]     Car: Turbo Viper        [Stats Summary]        |
|                                                                      |
| Recommended: Upgrade Handling for tight canyon turns.                |
|                                                                      |
|                                              [ RACE ]                |
+----------------------------------------------------------------------+
11.2 Required Information
11.3 Recommended Hint Examples
Hints must be helpful, not coercive.
12. Loading Screen UX
Elements:
Level name
Environment art or blurred preview
Progress bar
Gameplay tip
Small animated car or boost effect
Example tips:
“Near misses give Boost Energy.”
“Finish in the top 5 to unlock the next level.”
“Boost before long straights for maximum effect.”
“Clean driving improves your star rating.”
Rules:
Do not show ads on loading screen.
If loading exceeds 5 seconds, show animated progress feedback.
13. Race HUD UX
The race HUD must be minimal, high-contrast, and non-obstructive.
13.1 HUD Wireframe Description
+----------------------------------------------------------------------+
| [Pause] [3/6]                [Progress Ribbon]             [Coins]  |
| [Assist]                                                             |
|                                                                      |
|                         3D RACE VIEW                                 |
|                                                                      |
| [Damage Indicator]                                                   |
|                                                                      |
| [Brake Optional]                           [BOOST BUTTON + METER]    |
+----------------------------------------------------------------------+
13.2 HUD Elements
13.3 Position Badge
Visual:
3/6
Rules:
Large bold font.
Color shifts:
1st: gold accent
2nd–3rd: cyan/white
4th–5th: neutral
6th: subtle red outline
Must not rely only on color; number is always present.
13.4 Progress Ribbon
Requirements:
Horizontal track ribbon at top-center.
Finish flag at right end.
Player marker highlighted.
AI markers smaller and less saturated.
Optional segment icons for Elite or modifier zones if performance allows.
Must remain readable on small screens.
13.5 Boost Button and Meter
Visual:
Circular button with radial energy ring.
Inner icon: flame, nitro canister, or bolt.
Energy ring fills clockwise.
States:
Interaction:
Hold to boost, release to stop.
Tap can also activate if accessibility setting enables tap-hold mode.
Haptic pulse on activation.
13.6 Damage Indicator
Rules:
Hidden when damage is low.
Appears when damage > 30%.
Pulses red when damage > 75%.
Shows small warning icon and bar.
If wrecked, transitions to Wreck/Revive popup.
13.7 Assist Badge
Copy:
ASSIST ON
Visual:
Soft blue or green badge.
Non-shaming.
Tooltip on first appearance:
“Assist enabled: AI speed and traffic reduced.”
14. Pause Menu UX
14.1 Layout
+--------------------------------------+
|              PAUSED                  |
|                                      |
| [Resume]                             |
| [Restart]                            |
| [Quit Race]                          |
|                                      |
| Audio: [Music/SFX quick toggles]     |
+--------------------------------------+
14.2 Rules
Race simulation stops fully.
Audio ducks.
Quit requires confirmation if race progress would be lost.
Restart does not require network.
Pause menu must not show ads.
15. Wreck / Revive UX
15.1 Layout
+----------------------------------------------------------+
|                     WRECKED!                             |
|                                                          |
| You can continue with reduced damage and +30 Boost.      |
|                                                          |
| [Watch Ad to Revive]                                     |
| [Revive for 5 Diamonds]                                  |
| [Give Up]                                                |
+----------------------------------------------------------+
15.2 Rules
Show current Diamond balance.
If offline, hide or disable ad option.
If no Diamonds, Diamond option shows “Not Enough Diamonds”.
Give Up is always available.
No shame language. Use neutral copy.
Recommended copy:
“Your car was wrecked. You can revive once and continue the race.”
16. Results Screen UX
The Results Screen is the most important progression screen.
16.1 Required Display Order
Final position.
Fixed rank reward.
Reward chest.
Random bonus reward.
Track Coins collected.
First-time bonus if applicable.
Stars/performance rating.
Next-level unlock state.
Optional Double Coin ad prompt.
16.2 Wireframe Description
+----------------------------------------------------------------------+
|                        1st PLACE!                                    |
|                         ★★★                                        |
|                                                                      |
| Rank Reward: [Coin] 440                                              |
| Track Coins: [Coin] 128                                              |
| Chest: [OPEN CHEST]                                                  |
| Bonus: [Coin] 80                                                     |
|                                                                      |
| Total: [Coin] 648   [Diamond] 1                                     |
|                                                                      |
| [Watch Ad to Double Rank + Chest Coins]                             |
|                                                                      |
| [MENU]                              [NEXT LEVEL]                    |
+----------------------------------------------------------------------+
16.3 Position and Stars
Position display:
Star display:
1 star: finish
2 stars: top 3
3 stars: 1st + Clean Score ≥ 80
If player fails 3-star requirement, show short hint:
“Finish 1st with cleaner driving to earn 3 stars.”
16.4 Reward Animation Rules
16.5 Double Coin Ad Prompt
Rules:
Appears after total reward summary.
Must clearly state what is doubled:
“Double Rank and Chest Coins”
Must not imply Diamonds are doubled.
If offline, hide prompt.
If player declines, continue normally.
Recommended copy:
“Watch an ad to double your Rank Reward and Chest Coins.”
16.6 Unlock Rules Display
If position is 1–5:
Level 28 Unlocked!
Primary button:
NEXT LEVEL
If position is 6:
Finish in the top 5 to unlock the next level.
Primary button:
RETRY
Secondary button:
MENU
Assist hint after repeated failure:
“Assist will help you on your next attempt.”
17. Unlock Popup UX
Unlock popups celebrate progression.
17.1 Unlock Types
17.2 Rules
One unlock popup at a time.
If multiple unlocks occur, queue them.
Player can tap “Continue” to skip quickly.
Unlock popup must not contain ads.
Example copy:
NEW CAR UNLOCKED
Turbo Viper
Higher top speed and stronger boost.
18. Garage UX
The Garage is the main progression hub.
18.1 Layout
+----------------------------------------------------------------------+
| Back                 GARAGE                  [Coins] [Diamonds]      |
|----------------------------------------------------------------------|
| Car List       |         3D Car Viewer         | Tabs:               |
| [Rookie GT]    |                               | [Upgrades]          |
| [Street King]  |                               | [Wheels]            |
| [Turbo Viper]  |                               | [Paints]            |
| [Locked Car]   |                               | [Decals]            |
|----------------------------------------------------------------------|
| Car Name / Stats Summary / Select Button                             |
|----------------------------------------------------------------------|
| [Banner Ad if allowed]                                               |
+----------------------------------------------------------------------+
18.2 Car List Requirements
Each car entry shows:
Car thumbnail
Car name
Owned/Locked state
Selected checkmark
Unlock requirement if locked
Locked car example:
Canyon Falcon
Unlock at Player Level 32
Cost: 18,000 Coins
18.3 Car Detail Panel
Shows:
Car name
Short description
Stat bars:
Top Speed
Acceleration
Handling
Braking
Boost Power
Boost Duration
Stability
Select button
Trait description
Stat bars must include numeric or segment visualization.
18.4 Upgrade Tab
Each upgrade row shows:
Stat icon
Stat name
Current level pips: 0–10
Current value
Next value
Cost
Upgrade button
Lock requirement if unavailable
Example:
Top Speed
Level 4/10
150 km/h → 152.5 km/h
Cost: 650 Coins
[UPGRADE]
Locked upgrade example:
Requires Player Level 13
Rules:
If player lacks Coins, button shows “Not Enough Coins”.
Tapping insufficient Coins opens Shop or ad bonus panel.
Maxed upgrade shows “MAX”.
Upgrade success plays SFX, haptic, and stat bar fill animation.
18.5 Cosmetic Tabs
Cosmetic tabs include:
Wheels
Paints
Materials
Decals
Underglow
Special skins
Rules:
All cosmetics must clearly state “Cosmetic only”.
Premium cosmetics use violet/gold accent.
Diamond items show Diamond price.
Coin items show Coin price.
Owned items show “Owned”.
Equipped item shows “Equipped”.
19. Shop UX
19.1 Layout
+----------------------------------------------------------------------+
| Back                  SHOP                   [Coins] [Diamonds]      |
|----------------------------------------------------------------------|
| Tabs: [Diamonds] [Bundles] [Offers]                                  |
|----------------------------------------------------------------------|
| [Small Diamond Pack] [Medium Diamond Pack] [Large Diamond Pack]      |
| [Epic Diamond Pack]                                                  |
|                                                                      |
| [Remove Ads]                                                         |
| [Starter Cosmetic Bundle]                                            |
|----------------------------------------------------------------------|
| [Banner Ad if allowed]                                               |
+----------------------------------------------------------------------+
19.2 Diamond Pack Cards
Each card shows:
Diamond icon
Amount
Fiat price
Best value badge where applicable
Buy button
Rules:
Price must be visible.
No misleading “free” wording.
If offline, Buy buttons disabled.
If purchase fails, show calm error message.
19.3 Remove Ads Card
Copy:
Remove Ads
Removes banner and interstitial ads.
Rewarded ads remain optional.
State after purchase:
Owned
19.4 Free Rewards Area
If rewarded ad bonus Coins are offered:
Watch Ad
+200 Coins
3/3 remaining today
Rules:
Must show daily cap.
If offline, disabled with “Offline” label.
Must never grant Diamonds directly.
20. Settings UX
20.1 Layout
+----------------------------------------------------------------------+
| SETTINGS                                                             |
|----------------------------------------------------------------------|
| Audio                                                                |
| Master [------o----]                                                 |
| Music  [------o----]                                                 |
| SFX    [------o----]                                                 |
| Engine [------o----]                                                 |
|                                                                      |
| Controls                                                             |
| Steering Sensitivity [------o----]                                   |
| Auto-Acceleration [ON]                                               |
| Boost Tap Mode [OFF]                                                 |
|                                                                      |
| Graphics                                                             |
| Quality [Low/Medium/High]                                            |
| Frame Rate [30/60]                                                   |
|                                                                      |
| Haptics [ON]                                                         |
|                                                                      |
| Privacy                                                              |
| [Privacy Policy] [Manage Consent] [Restore Purchases]               |
+----------------------------------------------------------------------+
20.2 Requirements
Settings changes apply immediately where possible.
Graphics changes may require restart.
Restore Purchases must be visible on iOS.
Consent settings must be accessible.
Settings must be fully usable offline.
21. Consent and Privacy UX
21.1 Consent Dialog
Must appear before ad SDK initialization where required.
Copy example:
Turbo Rush uses optional ads and analytics to support free gameplay.
You can choose whether personalized ads are allowed.
The game remains playable either way.
Buttons:
“Allow Personalized Ads”
“Use Limited Ads”
“Privacy Policy”
Rules:
No deceptive wording.
No forced consent.
If denied, game continues with non-personalized or disabled ads where applicable.
21.2 iOS ATT
If App Tracking Transparency is required:
Show pre-prompt explanation if desired.
Trigger native ATT only once.
If denied, disable tracking-dependent features gracefully.
22. Error, Empty, and Offline States
22.1 Offline States
22.2 Error Messages
Tone rules:
Calm
Non-blaming
Clear next action
No urgency pressure
23. Iconography Requirements
Icon style:
Bold outlines
Simple silhouettes
High contrast
Rounded corners
Recognizable at 32 px
24. Accessibility Requirements
24.1 Readability
24.2 Color Accessibility
Do not use red/green as the only distinction.
Position badge always includes numeric rank.
Success/failure states include icons or text.
Damage warnings include icon and pulse, not only color.
24.3 Touch Accessibility
Minimum touch target: 48 × 48 dp.
Boost button large and separated from brake.
Pause button not smaller than 48 × 48 dp.
Optional larger controls setting recommended.
24.4 Motion Sensitivity
Provide reduced motion option where feasible.
Avoid fullscreen flashing during boost or chest opening.
Countdown and reward animations should be skippable after first view.
24.5 Audio Accessibility
Important audio cues should have visual equivalents:
Countdown numbers
Boost ready
Damage warning
Finish event
Rare Diamond reward
25. Audio and Haptics UX Mapping
Haptics must be disabled by user setting.
26. Monetization UX Rules
26.1 Rewarded Ads
Rules:
Always optional.
Always show reward before watching.
Never disguise ads as mandatory progression.
Never reward Diamonds directly from ads.
Show daily cap where applicable.
Ad button labels:
Watch Ad to Revive
Watch Ad to Double Rank + Chest Coins
Watch Ad for Bonus Coins
26.2 Interstitial Ads
UI must not imply an interstitial is part of the game flow.
No “Ad Loading” screen inside race.
Interstitial appears only when returning to Main Menu from Results, subject to caps.
If an interstitial is expected, transition should show a brief neutral loading state, not a fake reward.
26.3 Banners
Only in Garage, Shop, Settings, or Cosmetics browser.
Never in race HUD.
Never over critical buttons.
Must be hidden when Remove Ads is owned.
26.4 IAP
Show real prices.
Show item contents.
No fake urgency.
No misleading “free” premium currency.
Remove Ads must be easy to find.
27. Godot UI Implementation Notes
27.1 Recommended UI Node Structure
UILayer (CanvasLayer)
  ├── SafeAreaContainer
  │   ├── MainMenu
  │   ├── LevelSelect
  │   ├── PreRace
  │   ├── RaceHUD
  │   ├── PauseMenu
  │   ├── ResultsScreen
  │   ├── GarageScreen
  │   ├── ShopScreen
  │   └── SettingsScreen
  ├── PopupLayer
  │   ├── ConfirmationPopup
  │   ├── ErrorPopup
  │   ├── UnlockPopup
  │   └── ConsentPopup
  ├── ToastLayer
  └── TransitionLayer
27.2 Theme Resources
Create reusable theme resources:
turbo_theme.tres
button_styles.tres
panel_styles.tres
font_assets.tres
icon_pack.tres
27.3 Input Focus
Touch is primary.
Keyboard/controller focus is optional but should not break layout.
Pause and back actions should support hardware back button.
27.4 Localization Preparation
Even if launching in English only:
Store all UI strings in string tables.
Avoid hardcoded text in scenes.
Allow text expansion of at least 30%.
Use icons alongside text where possible.
28. Visual Specification Recommendations
The following visuals should be produced from this brief.
UI-V1 — Global UI Navigation Map
Where it belongs: Section 7 / Screen Inventory Purpose: Show all screens and major transitions, including race, results, garage, shop, and settings.
UI-V2 — Race HUD Wireframe
Where it belongs: Section 13 / Race HUD UX Purpose: Show final HUD layout with safe-area margins, position badge, progress ribbon, boost button, brake button, and damage indicator.
UI-V3 — Results Reward Flow
Where it belongs: Section 16 / Results Screen UX Purpose: Show the exact reward reveal order and the placement of the optional Double Coin ad prompt.
UI-V4 — Garage Upgrade Panel
Where it belongs: Section 18 / Garage UX Purpose: Show stat rows, level pips, cost, locked state, and insufficient Coins state.
UI-V5 — Shop Layout
Where it belongs: Section 19 / Shop UX Purpose: Show Diamond packs, Remove Ads, bundles, banner ad placement, and offline disabled state.
UI-V6 — Design System Components
Where it belongs: Section 6 / Component System Purpose: Show buttons, cards, currency chips, popups, progress bars, badges, and their states.
UI-V7 — Safe Area Layout Guide
Where it belongs: Section 5 / Global Layout Rules Purpose: Show landscape safe areas for notched devices and how UI anchors should behave.
29. UX Acceptance Criteria
This UI/UX brief is considered complete when:
All screens from the App Flow are visually specified.
The race HUD is readable and does not obscure gameplay.
Results screen displays all PRD-required reward elements.
Unlock and progression rules are clearly visible.
Ads and IAP are presented transparently and ethically.
Offline behavior is clear and non-breaking.
The interface is safe-area aware and mobile-friendly.
Accessibility requirements are defined.
A Godot developer can implement the UI using the described components and screen hierarchy.
30. Canonical UI/UX Values Carried Forward
End of Document 4 — UI/UX DESIGN BRIEF.
--- TABLE ---
Version: | 1.0
--- TABLE ---
Platform: | Android + iOS
--- TABLE ---
Engine: | Godot 4.x
--- TABLE ---
Orientation: | Landscape locked
--- TABLE ---
Dependency: | This document implements the product rules from Document 1, technical constraints from Document 2, and navigation logic from Document 3.
--- TABLE ---
Goal | Requirement
Instant clarity | Player always knows what to tap next
Racing focus | HUD must remain clean and readable during high speed
Reward satisfaction | Results screen must make Coins, chests, stars, and unlocks feel exciting
Fair progression | Upgrade requirements, costs, and unlock rules must be visible
Ethical monetization | Ads and IAP must be transparent, optional, and non-deceptive
Mobile comfort | Touch targets must be large, safe-area aware, and thumb-friendly
Accessibility | Text, icons, and color usage must remain readable for broad audiences
--- TABLE ---
Element | Direction
Backgrounds | Dark asphalt blue or carbon panels to make bright accents pop
Primary UI | Bold orange for primary actions
Secondary UI | Cyan or electric blue for boost and technical info
Premium UI | Violet/gold accents for Diamonds and premium cosmetics
Shapes | Rounded rectangles, angled speed accents, subtle bevels
Icons | Flat with slight depth, thick outlines, high readability
Motion | Snappy, spring-like, not slow or overly fancy
Typography | Bold condensed display for headings, clean sans-serif for body
--- TABLE ---
Token | Hex | Usage
bg_dark | #0B1020 | Main background, race HUD backdrop
panel | #151B2E | Cards, panels, popups
panel_light | #1E2740 | Elevated cards, selected states
primary | #FF6B2C | Primary buttons, key highlights
primary_pressed | #E55A1B | Button pressed state
secondary | #23C4FF | Boost, technical info, secondary accents
success | #3BD47A | Success states, unlock confirmations
warning | #FFB020 | Warnings, insufficient resources
danger | #FF4D5E | Damage, errors, destructive actions
coin_gold | #FFC93C | Coin currency
diamond_blue | #6BE1FF | Diamond currency
text_primary | #F5F7FF | Main text
text_secondary | #A7B0CC | Secondary text
text_disabled | #5A627A | Disabled buttons and locked content
premium_accent | #B77BFF | Premium cosmetic highlights
--- TABLE ---
Token | Size | Usage
display_xl | 96 px | Countdown numbers, final rank
display_l | 64 px | Results headings, level unlock
h1 | 36 px | Screen titles
h2 | 28 px | Section titles
button | 22 px | Buttons, tabs
body | 18 px | Descriptions, settings labels
caption | 14 px | Legal text, small metadata
--- TABLE ---
Token | Value
Base grid | 4 px
Padding S | 8 px
Padding M | 16 px
Padding L | 24 px
Padding XL | 32 px
Button corner radius | 12 px
Card corner radius | 16 px
Popup corner radius | 24 px
Minimum touch target | 48 × 48 dp
Recommended race button target | 64 × 64 dp minimum
--- TABLE ---
Interaction | Duration
Button press scale | 0.08–0.12s
Screen transition fade/slide | 0.20–0.35s
Countdown number pop | 0.25s
Chest open | 0.60–0.80s
Coin count-up | 0.80s
Toast notification | 2.5s visible
Reward popup entrance | 0.25s
--- TABLE ---
Rule | Requirement
Orientation | Landscape locked
Base design resolution | 1920 × 1080
Stretch mode | canvas_items recommended
Aspect handling | Expand or keep safe-area anchored UI
Safe areas | Respect notch, camera cutout, rounded corners
--- TABLE ---
Edge | Minimum margin
Left | 48 px
Right | 48 px
Top | 40 px
Bottom | 48 px
--- TABLE ---
Button Type | Usage | Visual
Primary | Main action: Race, Next Level, Buy | Large orange, bold label
Secondary | Back, Cancel, Menu | Dark panel with outline
Currency | Displays Coins/Diamonds and plus button | Pill with icon and value
Icon Button | Pause, settings, close | Circular or rounded square
Locked | Locked cars/upgrades/cosmetics | Dimmed with lock icon
Danger | Quit without saving, reset progress | Red accent, confirmation required
Disabled | Offline ads, unaffordable items | Gray text, no glow
--- TABLE ---
State | Behavior
Normal | Full color
Pressed | Slight scale down, darker fill
Disabled | Reduced opacity, no input
Locked | Lock icon, requirement text
Selected | Accent border or glow
Offline | Grayed out with offline tooltip
--- TABLE ---
Type | Usage
Confirmation | Quit, reset, purchase
Error | Insufficient funds, ad unavailable
Reward | Unlock, milestone, chest result
Consent | Privacy/ads consent
Info | Tutorial hint, settings note
--- TABLE ---
Screen | Purpose
Splash | Branding and load initialization
Onboarding | First race tutorial
Main Menu | Central hub
Level Select | Browse and replay unlocked levels
Pre-Race | Confirm car, level info, start race
Loading | Race generation and asset load
Race HUD | Live race interface
Pause Menu | Resume, restart, quit
Wreck/Revive | Continue after wreck
Results | Rank, rewards, chest, stars, unlock
Unlock Popup | New car, environment, ability
Garage | Cars, upgrades, cosmetics
Shop | Diamonds, bundles, remove ads
Settings | Audio, controls, graphics, privacy
Consent Dialog | Ads/privacy permission
Error/Offline States | Graceful failure handling
--- TABLE ---
Element | Requirement
Settings icon | Top-left or top-right, safe-area anchored
Player Level badge | Shows highest completed level
Currency chips | Coins and Diamonds visible
3D car showcase | Selected car displayed
PLAY button | Largest and most prominent
Garage button | Secondary large button
Shop button | Secondary large button
Campaign button | Opens Level Select
Banner ad | Only if online, ads not removed, and allowed by consent
--- TABLE ---
Info | Purpose
Level number | Progress context
Race type | Standard/Sprint/Endurance/Elite
Environment | Visual expectation
Modifier | Difficulty expectation
Selected car | Confirmation of active car
Car stats summary | Player readiness
Recommended hint | Gentle progression guidance
RACE button | Primary action
--- TABLE ---
Situation | Hint Copy
High AI speed | “AI are faster here. Consider upgrading Top Speed.”
Many hairpins | “This track has tight turns. Handling and Braking help.”
Traffic Rush | “Heavy traffic ahead. Stability and Acceleration help.”
Boost Famine | “Boost pickups are rare. Upgrade Boost Duration.”
--- TABLE ---
Element | Position | Requirement
Pause button | Top-left | Large, always accessible
Position badge | Top-left near pause | Shows 3/6, updates live
Progress ribbon | Top-center | Shows finish flag, player dot, AI dots
Coin counter | Top-right | Shows Coins collected in current race
Assist badge | Below position or top-right | Visible only when Assist active
Boost button | Bottom-right | Large circular button with energy ring
Brake button | Bottom-left | Optional, semi-transparent if auto-accel ON
Damage indicator | Near car or bottom-left | Visible when damage > 30%
Countdown | Center | 3, 2, 1, GO
Wreck prompt | Center | Appears only when wrecked
--- TABLE ---
State | Visual
Ready | Cyan glow
Active | Bright animated flame/energy
Low energy | Dimmed ring
Locked below 20 energy | Grayed but tappable to show tooltip
Boost Famine modifier | Slightly desaturated ring
--- TABLE ---
Position | Style
1st | Gold, large celebration
2nd–3rd | Silver/bronze accent
4th–5th | Neutral
6th | Subtle red, but non-punitive
--- TABLE ---
Reward | Animation
Rank Coins | Count-up with Coin icon
Chest | Drops in, player taps to open
Chest Coins | Burst from chest
Diamond from chest | Rare glow, haptic, special SFX
Random bonus | Card flip or slot reveal
Track Coins | Added to total
First clear bonus | Banner with level number
Star milestone | Popup if milestone reached
--- TABLE ---
Unlock | Visual
New car | 3D car reveal
New environment | Environment art banner
New race type | Type badge and description
New boost ability | Ability icon and short description
New wheel/cosmetic | Cosmetic preview
--- TABLE ---
Feature | Offline Behavior
Core game | Fully playable
Rewarded ads | Disabled with “Offline” label
Interstitials | Disabled
Banners | Hidden
IAP | Disabled with “Connect to internet” message
Restore Purchases | Disabled or queued message
Analytics | Silent or discarded
--- TABLE ---
Situation | Copy
Not enough Coins | “Not enough Coins. Earn more by racing or watching optional bonuses.”
Not enough Diamonds | “Not enough Diamonds. Diamonds are earned rarely or available in the Shop.”
Ad unavailable | “Ad unavailable right now. Please try again later.”
Purchase failed | “Purchase could not be completed. No charge was made.”
Restore failed | “No previous purchases found or restore unavailable.”
Save error | “Save data could not be loaded. Backup or reset options available.”
--- TABLE ---
Icon | Meaning
Flag | Finish, race, campaign
Coin | Coin currency
Diamond | Diamond currency
Wrench | Upgrades
Car silhouette | Garage/car select
Wheel | Wheel cosmetics
Paint bucket | Paints/materials
Decal | Decals
Flame/bolt | Boost
Star | Star rating
Crown/flame | Elite level
Lightning | Sprint level
Long road | Endurance level
Lock | Locked content
Pause bars | Pause
Speaker | Audio
Gear | Settings
Shield | Assist
Warning triangle | Damage/error
--- TABLE ---
Requirement | Target
Minimum body text | 18 px at 1080p design
Contrast ratio | At least 4.5:1 for important text
HUD text outline | Required over 3D scene
Button labels | Text preferred over icon-only
--- TABLE ---
Event | Sound | Haptic
Button tap | Soft click | Optional light
Countdown tick | Beep | Light
GO | Stronger beep | Medium
Coin pickup | Bright chime | None or very light
Diamond pickup | Rare sparkle sound | Medium
Boost activation | Whoosh/engine flare | Medium
Collision light | Thud | Light
Collision heavy | Heavy impact | Strong
Wreck | Dramatic impact | Strong
Finish | Fanfare | Medium
Chest open | Wood/metal plus sparkle | Medium
Upgrade success | Positive chime | Medium
Error | Low soft buzz | Light
--- TABLE ---
Rule | Value
Orientation | Landscape locked
Base design resolution | 1920 × 1080
Minimum touch target | 48 × 48 dp
Safe margin baseline | 48 px left/right, 40 px top, 48 px bottom
Primary action color | #FF6B2C
Boost color | #23C4FF
Coin color | #FFC93C
Diamond color | #6BE1FF
Countdown duration | 3 seconds
Chest open animation | 0.6–0.8s
Toast duration | 2.5s
Banner locations | Garage, Shop, Settings, Cosmetics
Interstitial location | Only return to Main Menu from Results
Rewarded ad labels | Must state exact reward
Results ad double | Only Rank Reward + Chest Coins
Assist badge | Visible but non-shaming
Offline ad buttons | Disabled with clear label