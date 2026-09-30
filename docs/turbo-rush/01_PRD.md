> Turbo Rush specification series — extracted text of the original design document. Tables are flattened with | separators.

TURBO RUSH
Mobile 3D Arcade Racing Game — Complete Specification Series
Document 1 of 6 — Product Requirements Document (PRD)
Engine: Godot 4.x   •   Platform: Android + iOS   •   Offline-first
Extracted and formatted from the Turbo Rush specification conversation — 30 September 2026
1. Executive Summary
Turbo Rush is a mobile 3D arcade racing game built around short, skill-based, level-driven races. Each level is a complete race against five AI opponents, with real-time position display, traffic, obstacles, collectible Coins, rare Diamonds, boost gameplay, overtaking, a finish line, final ranking, deterministic rank rewards, random reward chests, and next-level unlock progression.
The game must support an effectively unlimited level sequence:
Level 1 → Level 2 → Level 3 → … → Level 1000 → …
However, every individual level must remain a finite race with a clear finish line.
The core design rule is:
Difficulty must not progress primarily by making races longer.
Most races must remain approximately 2–3 minutes.
Higher levels must become harder through AI quality, traffic behavior, track complexity, obstacle density, technical sections, boost timing pressure, environmental conditions, and special modifiers.
The product must be fair, offline-first, mobile-friendly, and monetized ethically. Paid content must not create mandatory pay-to-win progression.
2. Product Positioning
2.1 Product Definition
3. Design Pillars
4. Reference Video Usage Rule
The provided reference video may be used only to understand general racing structure:
Multiple cars racing together
Live position indicator such as 2/6
Finish line and final ranking
Result screen
Reward flow
The game must not copy:
Assets
UI layout
Track designs
Branding
Exact visual style
Specific mechanics not defined in this specification
Turbo Rush must establish its own identity and systems.
5. Core Game Requirements
5.1 Core Race Structure
Each race level must include:
6. Race Session Requirements
6.1 Race Start Flow
Each race begins with:
Level loaded from deterministic seed.
Cars placed on start grid.
Camera settles behind player car.
Countdown displayed:
3
2
1
GO
Player and AI begin racing.
The countdown lasts exactly 3 seconds.
During countdown:
Player may rev or prepare boost, but cannot move forward.
HUD is visible.
Pause is available.
Race objectives and modifiers are visible.
6.2 Live Race State
During the race, the player must always see:
Position must update in real time based on race progress.
6.3 Position Calculation
Position must be calculated by:
Total spline distance completed + forward progress offset
Not by raw world distance.
Rules:
All six race cars are ranked continuously.
Traffic vehicles do not count toward race position.
If two cars have identical progress, the car ahead laterally or with higher recent speed may be ranked ahead.
Position must update at least once per frame during active race.
6.4 Finish Requirement
Every level must have a physical and logical finish line.
A race is completed when the player crosses the finish line.
Rules:
The race is not endless.
The track has a fixed endpoint.
AI cars that finish before the player are assigned finish times.
AI cars behind the player continue simulation until player finish or are simplified for performance.
Player finish triggers the Results flow.
7. Level-Based Campaign Structure
7.1 Infinite Level Sequence
The campaign must support unlimited level numbers:
Level 1, Level 2, Level 3, … Level 1000, Level 10000, etc.
However, every level must be individually finite.
There is no endless runner mode as the core mode.
7.2 Level Identity
Each level must have:
7.3 Level Types
Turbo Rush uses four level classifications.
7.3.1 Level Type Assignment
Priority order:
Elite
Sprint
Endurance
Standard
Example:
Level 15 = Sprint
Level 20 = Elite
Level 27 = Endurance
Level 30 = Elite
Level 35 = Sprint
Level 40 = Elite
8. Race Duration Requirements
Race length must not be the primary difficulty scaler.
Most races must remain around 2–3 minutes.
8.1 Target Race Time
Let:
D = min(1, 1 - exp(-(Level - 1) / 70))
Where:
D is normalized difficulty from 0 to 1.
Level 1 has D = 0 .
Level 50 has D ≈ 0.50 .
Level 100 has D ≈ 0.76 .
Level 200 has D ≈ 0.94 .
Level 300+ approaches 1.
8.2 Base Target Time by Race Type
8.3 Duration Rule
Track length may increase if cars become faster, but the target completion time must remain stable.
Difficulty must not be created by continuously increasing race duration.
9. Difficulty Progression System
Difficulty must scale through multiple systems, not through raw race length.
9.1 Difficulty Normalization
Use:
D = min(1, 1 - exp(-(Level - 1) / 70))
Elite levels add:
D_spawn = min(1, D + 0.05)
For all spawning and density calculations, use D_spawn.
10. AI Difficulty Progression
10.1 AI Baseline Rule
AI performance is based on:
The player’s currently selected car base stats
The recommended upgrade level for the current level
A difficulty multiplier
AI does not directly copy the player’s actual upgrades beyond the recommended upgrade level.
This keeps races fair while allowing upgraded players to gain an advantage.
10.2 Recommended Upgrade Level by Player Level
This table defines the expected average upgrade level per stat at a given campaign level.
10.3 AI Performance Scaling
Elite levels add:
All final values must respect the caps above.
10.4 AI Personality Distribution
Each race has five AI opponents.
Recommended distribution:
At high difficulty:
Fewer mistake-prone AI cars.
More aggressive overtake behavior.
Better boost timing.
Better traffic navigation.
11. Traffic Difficulty Progression
Traffic consists of non-race civilian vehicles and slow-moving obstacles.
11.1 Traffic Count
Let:
TrafficCount = round((8 + 32 * D_spawn) * TypeMultiplier)
Hard cap:
Maximum traffic vehicles per race: 45
11.2 Traffic Behavior Scaling
Traffic must always leave a fair path through the race.
No traffic pattern may create an unavoidable wall.
12. Obstacle Difficulty Progression
12.1 Obstacle Count
ObstacleCount = round((6 + 30 * D_spawn) * TypeMultiplier)
Hard cap:
Maximum obstacles per race: 40
12.2 Obstacle Mix
12.3 Jumps
JumpCount = floor(2 + 10 * D_spawn)
Sprint levels use:
JumpCount = floor(JumpCount * 0.8)
Endurance levels use:
JumpCount = floor(JumpCount * 1.2)
13. Track Complexity Progression
Difficulty must increase through technical layout.
13.1 Corner Scaling
13.2 Track Composition Rules
Every track must include:
A starting straight.
A finish straight.
At least one clear overtaking zone every 150–250 meters.
No impossible blind obstacles.
At least one recovery path after major obstacles.
Coin lines that guide the player through the intended racing path.
14. Environmental Progression
Environment changes must provide variety and mild difficulty increase.
14.1 Environment Tiers
14.2 Weather/Condition Chance
ConditionChance = min(60%, 10% + 45% * D)
Conditions depend on environment.
14.3 Condition Effects
Effects must remain mild and fair.
AI must also be affected by conditions through slightly increased mistake chance.
Environmental effects must not make the race feel unfair.
15. Special Race Modifiers
Special modifiers add difficulty variety.
15.1 Modifier Availability
Unlocked from Level 25.
Modifier chance:
ModifierChance = min(0.55, 0.10 + 0.55 * D)
Elite levels always have one modifier.
Endurance levels from Level 40 always have one modifier.
15.2 Modifier Table
No modifier may remove all safe passing lanes.
16. Boost / Nitro System
Boost is a core skill system.
16.1 Boost Energy
16.2 Boost Duration and Drain
Boost Duration is a car stat.
Base Boost Duration:
2.0 seconds
With upgrades:
BoostDuration = 2.0 + 0.25 * BoostDurationUpgradeLevel
Boost drain:
DrainPerSecond = 100 / BoostDuration
Example:
16.3 Boost Power
Base Boost Speed Bonus:
+25 km/h
With upgrades:
BoostSpeedBonus = 25 + 2 * BoostPowerUpgradeLevel
At max upgrade:
+45 km/h
16.4 Boost Timing Pressure
As difficulty increases:
Boost pickups become less frequent.
Boost zones appear closer to hazards.
Jumps and hairpins increasingly require correct boost timing.
Traffic clusters require boost conservation.
Elite races require stronger boost management.
17. Damage, Wreck, and Continue System
Turbo Rush is arcade-friendly but has stakes.
17.1 Damage Values
17.2 Damage Recovery
Damage recovers at 3 per second .
Recovery begins after 2 seconds without new damage.
17.3 Wreck State
When damage reaches 100:
The car becomes wrecked.
The race ends unless the player chooses a continue/revive option.
If no revive is used, the race is recorded as DNF.
17.4 Revive Rules
A player may revive once per race using either:
One rewarded ad, or
5 Diamonds.
Revive effect:
Damage reduced to 40.
Boost Energy +30.
2 seconds of collision protection.
No bonus Coins, no extra stats, no rank improvement.
Revive is optional and must never be required for fair progression.
18. Overtaking and Traffic Interaction
Overtaking must be central to gameplay.
18.1 Player Overtaking
The player can overtake by:
Steering around traffic.
Using boost on straights.
Taking inside lines on corners.
Drafting, if advanced boost ability is unlocked.
Avoiding collisions that reduce speed.
18.2 AI Overtaking
AI opponents can overtake:
The player.
Other AI cars.
Traffic vehicles.
AI overtake quality scales with:
AI Overtake Skill.
Traffic density.
Track width.
Difficulty.
18.3 Fairness Rules
Traffic must never form an unavoidable wall.
At least one drivable gap must exist every 80–120 meters.
AI may collide with traffic, but AI pathing must not be immune to traffic.
Player mistakes should have consequences, but not instant unavoidable failure.
19. Collectible Economy During Race
19.1 Track Coins
Each level contains collectible Coins.
TrackCoinCount = round((90 + 120 * D) * RaceTypeCoinMultiplier)
Hard cap:
Maximum track Coins per level: 260
Each collected track Coin is worth 1 Coin in the final reward flow.
Track Coins are awarded only if the race is completed.
19.2 Rare Diamond Placement
Diamonds must remain rare.
Diamond pickup rules:
Maximum ordinary Diamond pickups per level:
1
Diamond pickups are placed in risky locations:
Shortcut paths.
Near heavy traffic.
After jumps.
Inside tight corners.
Near obstacle clusters.
Diamond pickups are not placed in trivially unavoidable locations.
20. Finish, Ranking, and Unlock Rules
20.1 Final Ranking
When the player crosses the finish line:
All six cars are ranked.
AI cars that already finished use their finish time.
AI cars behind the player are ranked by progress.
The result screen displays final position.
20.2 Next-Level Unlock Rule
The next level unlocks when:
The player finishes in position 1, 2, 3, 4, or 5.
Finishing 6th does not unlock the next level.
This rule keeps progression accessible while maintaining mild challenge.
20.3 Assist After Repeated Failure
To avoid frustration:
If the player fails the same level twice:
Failure means finishing 6th or DNF without revive.
On the third attempt, Assist Mode activates.
Assist Mode effects:
AI top speed -5%.
Traffic count -10%.
Damage taken -20%.
Assist remains active for that level until the player wins.
Assist must be clearly displayed but never shaming.
21. Star / Performance Rating System
Stars are earned per race attempt.
21.1 Star Rules
21.2 Clean Score
Clean Score starts at 100.
Minimum Clean Score:
0
Only the best star count per level is stored for progression.
22. Car Progression System
Car progression is a major motivation loop.
It includes:
Performance upgrades.
New car unlocks.
Cosmetic customization.
Performance upgrades must be earnable through gameplay.
23. Car Stats
There are seven performance stats:
Top Speed
Acceleration
Handling
Braking
Boost Power
Boost Duration
Stability
23.1 Stat Definitions
24. Base Cars
All cars are unlockable through gameplay using Coins.
No mandatory performance car may be paid-only.
24.1 Car Table
Cars must differ visually and behaviorally.
No car may be strictly inferior after upgrades if selected for player preference.
25. Performance Upgrade System
Performance upgrades are global garage upgrades.
They apply to all owned cars.
This prevents punishing the player when unlocking a new car.
25.1 Upgrade Levels
Each stat has upgrade levels:
Level 0 to Level 10
Level 0 is base.
Level 10 is maximum.
25.2 Upgrade Cost per Stat Level
Costs are paid in Coins.
Total cost per stat to max:
28,420 Coins
Total cost for all seven stats:
198,940 Coins
25.3 Upgrade Unlock Requirements
Upgrade levels unlock by Player Level.
Player Level is defined as:
Highest campaign level completed.
25.4 Upgrade Stat Increases
25.5 Difficulty Justification for Upgrades
Upgrades are justified by:
Upgrades provide advantage but are not mandatory to complete early content.
26. Unlock Progression System
Unlock progression must keep the player looking forward.
26.1 Major Unlock Timeline
27. Advanced Boost Abilities
Advanced boost abilities are earned through progression, not purchased.
They add skill depth and do not create direct pay-to-win.
27.1 Ability Table
These abilities must be toggleable in settings if desired.
They are enabled by default after unlock.
28. Cosmetic Unlock System
Cosmetics must not affect performance.
28.1 Wheels
All wheels are cosmetic only.
28.2 Colors and Materials
Legendary skins are cosmetic only.
29. Currency System
Turbo Rush uses two currencies.
30. Coin Economy
30.1 Coin Sources
Coins are earned from:
Fixed rank reward.
Reward chest.
Random bonus reward.
Track Coins collected during race.
First-time level completion bonus.
Optional rewarded ads.
Star milestone rewards.
30.2 Coin Sinks
Coins are spent on:
Performance upgrades.
Car unlocks.
Basic wheels.
Basic paints.
Decals.
Utility cosmetics.
31. Diamond Economy
Diamonds must remain genuinely rare.
31.1 Diamond Sources
Diamonds may be earned from:
Reward chests, very rarely.
Random bonus reward, extremely rarely.
Rare in-race Diamond pickup, limited.
First-time completion of every 10th level.
Star milestones.
IAP.
Rewarded ads must not be a major Diamond source.
Recommended rule:
Rewarded ads do not directly grant Diamonds.
31.2 Diamond Sinks
Diamonds are spent on:
Premium wheels.
Premium materials.
Animated paints.
Legendary cosmetic skins.
Optional race continue.
Profile cosmetics.
Diamonds must not buy exclusive performance upgrades or mandatory performance cars.
32. Reward System After Every Completed Race
After every completed race, the results flow must include:
Final position.
Fixed rank reward.
Reward chest.
Random bonus reward.
Stars/performance rating.
Next-level unlock state.
33. Fixed Rank Reward
Rank reward is deterministic.
33.1 Difficulty Tier
Tier T = floor((Level - 1) / 10) + 1
Examples:
Levels 1–10 = Tier 1
Levels 11–20 = Tier 2
Levels 91–100 = Tier 10
33.2 Base Coin Reward
BaseCoin(T) = min(500, 60 + 18 * (T - 1))
33.3 Rank Multipliers
33.4 Elite Multiplier
Elite levels receive:
Rank reward × 1.5
33.5 Final Formula
RankReward = round(BaseCoin(T) * RankMultiplier * EliteMultiplier / 5) * 5
34. Reward Chest System
Chests are random but bounded.
34.1 Chest Tier by Finish
34.2 Bronze Chest Coin Table
Expected Coins:
98.5 Coins
Diamond chance:
1%
When Diamonds drop:
Expected Diamonds:
0.0101 per Bronze chest
34.3 Silver Chest Coin Table
Expected Coins:
157 Coins
Diamond chance:
2%
Diamond amount:
Expected Diamonds:
0.0202 per Silver chest
34.4 Gold Chest Coin Table
Expected Coins:
263 Coins
Diamond chance:
3%
Diamond amount:
Expected Diamonds:
0.0303 per Gold chest
35. Random Bonus Reward
Every completed race triggers one random bonus roll.
Expected Coins:
57.94 Coins
Expected Diamonds:
0.0035 Diamonds per race
36. First-Time Level Completion Rewards
When a level is completed for the first time:
Examples:
Level 10 first completion: +3 Diamonds
Level 20 first completion: +3 Diamonds
Level 50 first completion: +8 Diamonds total
Level 100 first completion: +8 Diamonds total
37. Star Milestone Rewards
Stars accumulate from best level results.
Star milestones may also grant cosmetic rewards.
38. Expected Economy Behavior
The economy must support steady upgrade progression.
38.1 Early Game Income
At Levels 1–10, a typical mid-rank race should produce roughly:
This allows early upgrades every 1–3 races.
38.2 Mid Game Income
At Levels 40–80, a typical good race should produce:
This supports mid-tier upgrades every 2–5 races.
38.3 Late Game Income
At Levels 100+, a strong race should produce:
This supports late upgrades over several races and long-term cosmetic spending.
39. Monetization Requirements
Monetization must be ethical, limited, and non-predatory.
39.1 Monetization Principles
No mandatory pay-to-win.
No performance content locked exclusively behind Diamonds.
Rewarded ads must be optional.
Interstitials must be limited.
Diamonds must remain rare.
Ads must not interrupt active racing.
First-time user experience must not be aggressive.
40. Rewarded Ads
Rewarded ads may be used for:
Rules:
Rewarded ads never grant Diamonds directly.
Rewarded ads cannot double Diamonds.
Rewarded ads cannot grant exclusive performance upgrades.
Maximum rewarded ads per day should be capped.
Recommended caps:
41. Interstitial Ads
Interstitials must be limited.
Rules:
No interstitial before race start.
No interstitial during race.
No interstitial immediately after failure.
Interstitial may appear only after returning from results to menu.
Frequency cap: maximum one interstitial per 5 minutes.
Recommended session rule: no interstitial in first 10 minutes of first session.
42. Banner Ads
Banner ads are optional.
Allowed locations:
Garage
Shop
Settings
Cosmetics browser
Forbidden locations:
Race HUD
Countdown
Active race
Results reward moment
Upgrade purchase confirmation
Banners should be dismissible where platform policy allows.
43. In-App Purchases
43.1 Diamond Packs
43.2 Remove Ads
Recommended price:
$2.99
43.3 Cosmetic Bundles
Cosmetic bundles may include:
Premium paint
Premium wheels
Underglow
Profile badge
Decal set
They must not include performance upgrades.
44. Fairness Rules for Monetization
The following are prohibited:
Paid-only mandatory cars with superior stats not earnable in gameplay.
Paid-only performance upgrades.
Diamond-only required race progression.
Hidden stats that make paid items overwhelmingly better.
Forced ads to receive base race rewards.
Ad-gated normal level unlocks.
Diamond prices so high that normal play feels pointless.
45. Procedural Level Design Requirements
Each level must be generated deterministically from its level number.
45.1 Seed Rule
LevelSeed = 64-bit hash(level_number + game_salt)
The same level number must always generate the same track layout.
This allows players to learn levels.
45.2 Modular Track Pieces
The track generator must use modular pieces:
45.3 Track Generation Targets
The generator must satisfy:
Target race time.
Difficulty-based module selection.
Fair spawn rules.
No impossible obstacle walls.
At least one overtaking opportunity every 150–250 meters.
Coin paths that guide the racing line.
Traffic-free start zone for first 20 meters.
Traffic-free finish approach for final 15 meters.
45.4 Object Pooling Requirement
For mobile performance, the game must use object pooling for:
Traffic vehicles
Coins
Obstacles
Particle effects
Skid marks
Boost pickups
Temporary decals
This will be detailed in the TRD.
46. UX Requirements at Product Level
Full UI/UX details will be defined later, but the PRD requires:
The game must be playable in portrait or landscape if decided later, but the default recommendation is landscape for racing.
Final orientation will be locked in the UI/UX document.
47. Offline-First Requirements
Turbo Rush must be fully playable offline.
47.1 Offline Features
The following must work offline:
Campaign progression
Race generation
Rewards
Upgrades
Car unlocks
Cosmetic purchases using earned currencies
Local save
Settings
Garage
47.2 Online-Dependent Features
The following require network:
Rewarded ads
Interstitial ads
Banners
IAP
Optional analytics
If offline:
Ads are hidden.
IAP is unavailable.
Rewarded ad buttons are disabled or hidden.
Core game remains fully playable.
48. Performance Product Requirements
Target performance:
Memory target:
Under 1.2 GB total runtime memory where possible
Loading target:
Race start within 5 seconds on mid-range device after initial load
49. Accessibility Requirements
Minimum accessibility requirements:
50. Analytics Product Requirements
If analytics are included, they must respect privacy and offline-first behavior.
Recommended events:
Level start
Level finish
Level fail
Race position
Upgrade purchased
Car unlocked
Chest opened
Ad viewed
IAP started/completed
Diamond spend/source
Analytics must not block gameplay.
51. Success Metrics
Exact live targets can be adjusted after soft launch.
52. Risks and Mitigations
53. Visual Specification Recommendations
The following visuals should be produced as part of the design package. They are not decorative; they communicate required system behavior.
V1 — Core Game Loop Diagram
Where it belongs: PRD Section 5 / Core Game Requirements Purpose: Show the loop:
Main Menu → Race → Finish → Results → Rewards → Upgrade/Unlock → Next Race
It should highlight the relationship between race completion, Coins, upgrades, and level unlock.
V2 — Difficulty Curve Graph
Where it belongs: PRD Section 9 / Difficulty Progression Purpose: Plot D versus Level from Level 1 to Level 300. It should show:
Rapid early growth
Slowing growth later
Soft cap near 1.0
This justifies why difficulty remains fair for infinite levels.
V3 — Race Duration by Level and Type
Where it belongs: PRD Section 8 / Race Duration Requirements Purpose: Show Standard, Sprint, Endurance, and Elite target durations over level. It must communicate that duration remains bounded and does not continuously increase.
V4 — AI Difficulty Progression Graph
Where it belongs: PRD Section 10 / AI Difficulty Progression Purpose: Plot AI speed multiplier, overtake skill, aggression, and mistake chance versus level. It should show AI becoming stronger but still capped.
V5 — Upgrade Cost Curve
Where it belongs: PRD Section 25 / Performance Upgrade System Purpose: Show Coin cost per upgrade level and cumulative cost to max. It should be paired with expected Coin income to validate pacing.
V6 — Reward Probability Charts
Where it belongs: PRD Sections 34 and 35 Purpose: Show chest Coin probabilities, Diamond probabilities, and random bonus probabilities. It should make Diamond rarity visually obvious.
V7 — Unlock Timeline
Where it belongs: PRD Section 26 / Unlock Progression System Purpose: Show cars, upgrades, environments, race types, wheels, and boost abilities across Levels 1–100. It should demonstrate constant meaningful unlocks.
V8 — Procedural Track Module Diagram
Where it belongs: PRD Section 45 / Procedural Level Design Requirements Purpose: Show how modular pieces connect into a finite track with start, middle, and finish. It should include examples of straight, curve, hairpin, chicane, jump, and narrow sections.
54. Acceptance Criteria for Document 1
This PRD is considered complete when the following are true:
The game is clearly level-based, not endless.
Every race has a finish line.
Difficulty progression is not primarily based on length.
Most races remain 2–3 minutes.
AI, traffic, obstacles, track complexity, and modifiers scale with level.
Car upgrades are fully defined.
Coin and Diamond rules are explicit.
Diamonds are rare.
Rewards are deterministic where required and random where allowed.
Monetization is ethical and non-pay-to-win.
The specification is ready to guide the Technical Requirements Document.
55. Canonical Values Established in This PRD
The following values are now canonical and must be carried forward consistently into later documents:
End of Document 1 — PRD.
--- TABLE ---
Version: | 1.0
--- TABLE ---
Platform: | Android + iOS
--- TABLE ---
Engine: | Godot 4.x
--- TABLE ---
Mode: | Offline-first
--- TABLE ---
Race Type: | Level-based finite races, not endless racing
--- TABLE ---
Document Status: | Canonical foundation for all later documents
--- TABLE ---
Item | Requirement
Game Name | Turbo Rush
Genre | 3D arcade racing
Platform | Android and iOS
Engine | Godot 4.x
Connectivity | Offline-first
Session Length | Short races, mostly 2–3 minutes
Core Mode | Level-based campaign
Player Count | Single player
Race Format | 1 player + 5 AI cars
Progression | Levels, stars, car upgrades, car unlocks, cosmetics
Monetization | Rewarded ads, limited interstitials, optional banner, IAP, premium cosmetics
--- TABLE ---
Pillar | Meaning
Instant Arcade Fun | Races start quickly, controls are simple, feedback is immediate
Clear Finite Progression | Every level has a start, race, finish, result, reward, and unlock
Skill-Based Difficulty | Challenge comes from AI, traffic, track layout, obstacles, and boost timing
Meaningful Car Progression | Upgrades and new cars are useful but never mandatory for fairness
Fair Economy | Coins are earned through play; Diamonds remain rare and mostly cosmetic
Mobile-First Performance | Short sessions, low friction, object pooling, efficient 3D scenes
Ethical Monetization | Ads are optional or limited; paid items do not create unbeatable advantages
--- TABLE ---
Requirement | Mandatory
1 player car | Yes
5 AI opponent cars | Yes
Start countdown | Yes
Real-time position display | Yes
Traffic vehicles | Yes
Obstacles | Yes
Collectible Coins | Yes
Rare Diamond placement | Yes, limited
Boost/Nitro system | Yes
Overtaking | Yes
Finish line | Yes
Final ranking | Yes
Fixed rank reward | Yes
Random reward chest | Yes
Random bonus reward | Yes
Star/performance rating | Yes
Next-level unlock | Yes
--- TABLE ---
HUD Element | Requirement
Current position | Example: 3/6
Lap/progress bar | Since tracks are point-to-point, show race completion progress
Boost meter | Visible energy bar
Coin count | Coins collected during current race
Speed indicator | Optional but recommended
Mini-map or track progress ribbon | Recommended for UX
Wreck/damage indicator | Visible when damage becomes meaningful
Pause button | Always accessible
--- TABLE ---
Property | Requirement
Level number | Integer, starts at 1
Unique deterministic seed | Derived from level number
Difficulty rating | Derived from level number
Race type | Standard, Sprint, Endurance, or Elite
Environment | Deterministic by level range
AI tier | Derived from level number
Traffic density | Derived from difficulty
Obstacle density | Derived from difficulty
Coin layout | Procedurally generated
Rare Diamond placement | Limited and rule-based
Special modifiers | Unlocked gradually
--- TABLE ---
Type | Description | Frequency
Standard | Normal race | Majority
Sprint | Shorter, faster race | Occasional
Endurance | Slightly longer race | Occasional
Elite | High-reward challenge race | Every 10th level
--- TABLE ---
Level Rule | Type
Every 10th level: 10, 20, 30… | Elite
Levels ending in 5, starting from Level 15 | Sprint
Levels ending in 7, starting from Level 27 | Endurance
All other levels | Standard
--- TABLE ---
Race Type | Formula | Clamp Range
Standard | 135 + 15 * D ± 10 seed variance | 120–170 seconds
Sprint | 95 + 10 * D ± 8 seed variance | 85–115 seconds
Endurance | 185 + 15 * D ± 12 seed variance | 175–215 seconds
Elite | Standard formula + 10 seconds | 130–180 seconds
--- TABLE ---
Campaign Level Range | Recommended Avg Upgrade Level
1–4 | 0
5–12 | 1
13–22 | 2
23–34 | 3
35–48 | 4
49–64 | 5
65–84 | 6
85–109 | 7
110–144 | 8
145–199 | 9
200+ | 10
--- TABLE ---
AI Property | Formula | Cap
Top Speed Multiplier | 0.88 + 0.18 * D | 1.06 standard, 1.08 Elite
Acceleration Multiplier | 0.86 + 0.20 * D | 1.06
Handling Multiplier | 0.90 + 0.15 * D | 1.05
Aggression | 0.20 + 0.70 * D | 0.90
Overtake Skill | 0.25 + 0.65 * D | 0.90
Mistake Chance | max(0.03, 0.16 - 0.10 * D) | Minimum 0.03
Boost Use Skill | 0.30 + 0.60 * D | 0.90
--- TABLE ---
Elite Adjustment | Value
Extra Top Speed Multiplier | +0.02
Extra Aggression | +0.05
Extra Overtake Skill | +0.05
--- TABLE ---
AI Role | Count | Behavior
Front Runner | 1 | High speed, strong boost use
Aggressive Overtaker | 1–2 | Frequent overtakes, tight lanes
Balanced Racer | 2 | Stable performance
Mistake-Prone Racer | 1 | Slightly lower consistency
--- TABLE ---
Race Type | Traffic Type Multiplier
Standard | 1.00
Sprint | 0.80
Endurance | 1.25
Elite | 1.15
--- TABLE ---
Difficulty Range | Traffic Behavior
D < 0.20 | Mostly lane-locked, slow, predictable
0.20–0.45 | Occasional lane changes, small clusters
0.45–0.70 | Paired vehicles, partial road blocking
0.70–0.85 | Sudden braking zones, moving pairs
0.85+ | Dense clusters, aggressive lane shifts, technical overtaking required
--- TABLE ---
Obstacle Type | Approximate Weight
Cones | 40%
Barriers | 25%
Oil slicks | 15%
Ramps/jumps | Variable
Road debris/crates | 10%
Construction gates | 10%
--- TABLE ---
Parameter | Formula / Rule
Minimum corner radius | max(10, 26 - 14 * D) meters
Hairpins | Introduced at Level 10
Hairpin count | floor(4 * D)
Chicane count | 1 + floor(6 * D)
Narrow section percentage | min(30%, 5% + 25% * D)
Normal track width | 16m early, 14m late
Minimum narrow width | 9m
--- TABLE ---
Level Range | Environment
1–19 | Sunrise City
20–39 | Coastal Highway
40–59 | Desert Canyon
60–79 | Mountain Pass
80–99 | Industrial Night
100–119 | Snowline
120–139 | Neon Metro
140–159 | Volcanic Rim
160+ | Cycle environments with visual variants
--- TABLE ---
Environment | Possible Conditions
Sunrise City | Clear, Sunset, Light Rain
Coastal Highway | Clear, Sunset, Rain, Fog
Desert Canyon | Clear, Heat Haze, Sandstorm
Mountain Pass | Clear, Fog, Rain, Snow
Industrial Night | Clear, Night, Rain, Fog
Snowline | Clear, Snow, Fog
Neon Metro | Clear, Night, Rain
Volcanic Rim | Clear, Ash Haze, Night
--- TABLE ---
Condition | Effect
Clear | No penalty
Sunset | Cosmetic lighting change
Night | Reduced visibility, headlights required
Rain | Grip -4%, visibility -5%
Fog | Visibility -10%
Snow | Grip -5%, visibility -5%
Sandstorm | Visibility -8%, grip -2%
Ash Haze | Visibility -6%
--- TABLE ---
Modifier | Effect
Traffic Rush | Traffic count +20%
Slippery Zones | Oil slick count +30%
Boost Famine | Boost pickups -30%, passive boost recharge -20%
Narrow Works | Narrow section percentage +10 points, max 40%
Night Run | Visibility -10%
Mirror Layout | Track layout direction reversed, available from Level 60
--- TABLE ---
Parameter | Value
Maximum Boost Energy | 100
Starting Boost Energy | 40
Passive Recharge | 4 per second
Drift Recharge | 3 per second while drifting validly
Near Miss Reward | +6
Boost Pickup Reward | +35
Minimum Energy to Activate Boost | 20
--- TABLE ---
Boost Duration Upgrade Level | Boost Duration | Drain per Second
0 | 2.0s | 50/s
4 | 3.0s | 33.3/s
10 | 4.5s | 22.2/s
--- TABLE ---
Event | Damage
Light collision | 8
Heavy collision | 25
Traffic rear-end | 12
Barrier scrape | 5 per second
Oil slick | 0 damage, control slip
Jump landing failure | 10
--- TABLE ---
Race Type | Coin Multiplier
Standard | 1.00
Sprint | 0.80
Endurance | 1.30
Elite | 1.10
--- TABLE ---
Level Type | Diamond Pickup Chance
Standard | 5% chance of one Diamond pickup
Sprint | 5% chance of one Diamond pickup
Endurance | 8% chance of one Diamond pickup
Elite | 1 guaranteed Diamond pickup
--- TABLE ---
Star | Requirement
1 Star | Finish the race
2 Stars | Finish in top 3
3 Stars | Finish 1st and Clean Score ≥ 80
--- TABLE ---
Event | Penalty
Heavy collision | -15
Light collision | -5
Off-track time | -2 per second, max -30
Revive used | -20
--- TABLE ---
Stat | Effect
Top Speed | Maximum non-boost speed
Acceleration | Speed gain from standing start and exits
Handling | Steering response and corner grip
Braking | Deceleration before corners and obstacles
Boost Power | Extra speed while boosting
Boost Duration | How long boost energy lasts
Stability | Resistance to spinouts, collisions, and landing instability
--- TABLE ---
Car | Unlock Requirement | Coin Cost | Top Speed km/h | Accel m/s² | Grip | Braking m/s² | Boost Power km/h | Boost Duration s | Stability | Trait
Rookie GT | Start | Free | 140 | 8.0 | 1.00 | 12.0 | +25 | 2.0 | 1.00 | Balanced starter
Street King | Player Level 8 | 2,500 | 148 | 8.6 | 1.03 | 12.5 | +27 | 2.1 | 1.00 | Better city handling
Turbo Viper | Player Level 18 | 7,500 | 155 | 9.1 | 1.01 | 12.2 | +32 | 2.2 | 0.98 | Strong boost pickup affinity
Canyon Falcon | Player Level 32 | 18,000 | 149 | 8.8 | 1.05 | 13.2 | +28 | 2.2 | 1.08 | Reduced obstacle slowdown
Circuit Phantom | Player Level 55 | 45,000 | 162 | 9.6 | 1.06 | 13.0 | +34 | 2.3 | 1.02 | Better drift boost gain
Hyper Nova | Player Level 90 | 120,000 | 170 | 10.2 | 1.04 | 13.5 | +38 | 2.4 | 1.00 | High top speed specialist
--- TABLE ---
Upgrade Level | Cost per Stat
1 | 120
2 | 220
3 | 380
4 | 650
5 | 1,050
6 | 1,700
7 | 2,700
8 | 4,300
9 | 6,800
10 | 10,500
--- TABLE ---
Upgrade Level | Required Player Level
1 | 1
2 | 4
3 | 8
4 | 13
5 | 20
6 | 28
7 | 38
8 | 50
9 | 65
10 | 85
--- TABLE ---
Stat | Increase per Upgrade Level | Max Increase at Level 10
Top Speed | +2.5 km/h | +25 km/h
Acceleration | +0.35 m/s² | +3.5 m/s²
Handling | +2.5% grip/steering | +25%
Braking | +0.7 m/s² | +7.0 m/s²
Boost Power | +2.0 km/h | +20 km/h
Boost Duration | +0.25 seconds | +2.5 seconds
Stability | +3% control resistance | +30%
--- TABLE ---
Difficulty Source | Relevant Upgrade
Faster AI | Top Speed, Acceleration
Tighter corners | Handling, Braking
More traffic | Acceleration, Handling, Stability
More obstacles | Braking, Stability
More jumps | Stability, Boost Timing
Narrow sections | Handling, Braking
Boost famine | Boost Duration, Boost Power
Wet/snow conditions | Stability, Handling
Elite races | Balanced upgrades
--- TABLE ---
Level | Unlock
1 | Rookie GT, basic upgrades
5 | Wheel: Street Steel
8 | Car: Street King
10 | Elite races begin
12 | Wheel: Alloy Sport
15 | Sprint races begin
18 | Car: Turbo Viper
20 | Environment: Coastal Highway
25 | Special modifiers begin
27 | Endurance races begin
30 | Wheel: Turbo Fan
32 | Car: Canyon Falcon
35 | Advanced boost ability: Slipstream Boost
38 | Advanced boost ability: Clean Run Bonus
40 | Environment: Desert Canyon
45 | Wheel: Carbon Track
55 | Car: Circuit Phantom
60 | Environment: Mountain Pass
68 | Advanced boost ability: Perfect Landing Boost
70 | Wheel: Chrome Racer
80 | Environment: Industrial Night
90 | Car: Hyper Nova
100 | Environment: Snowline
--- TABLE ---
Ability | Unlock Level | Effect
Slipstream Boost | 35 | Drafting behind a racer for 1.5s grants +6 boost energy, max +18 per draft
Clean Run Bonus | 38 | Every 25 seconds without collision grants +10 boost energy
Perfect Landing Boost | 68 | Clean landing from a jump grants +12 boost energy
--- TABLE ---
Wheel | Unlock Requirement | Cost
Street Steel | Level 5 | Free
Alloy Sport | Level 12 | 500 Coins
Turbo Fan | Level 20 | 1,200 Coins
Carbon Track | Level 45 | 4,000 Coins
Chrome Racer | Level 70 | 8,000 Coins
Neon Glow | Level 60 | 60 Diamonds
Golden Crown | Level 80 | 100 Diamonds
Nova Edge | Level 100 | 150 Diamonds
--- TABLE ---
Item | Unlock | Cost
Basic Paint Colors | Early levels | Free or low Coin cost
Metallic Finish | Level 25 | 2,000 Coins
Matte Finish | Level 40 | 3,500 Coins
Chrome Finish | Level 70 | 50 Diamonds
Animated Gradient | Level 120 | 120 Diamonds
Legendary Skin | Level 150 | 300 Diamonds or special milestone
--- TABLE ---
Currency | Rarity | Primary Use
Coins | Common | Upgrades, car unlocks, basic cosmetics
Diamonds | Rare | Premium cosmetics, optional continue, legendary content
--- TABLE ---
Finish Position | Multiplier
1st | 2.20
2nd | 1.80
3rd | 1.50
4th | 1.25
5th | 1.10
6th | 1.00
--- TABLE ---
Finish | Normal Chest | Elite Chest
1st | Gold | Gold + 50 bonus Coins
2nd–3rd | Silver | Gold
4th–6th | Bronze | Silver
--- TABLE ---
Reward | Probability
50 Coins | 35%
80 Coins | 30%
120 Coins | 20%
180 Coins | 10%
250 Coins | 4%
500 Coins | 1%
--- TABLE ---
Amount | Probability
1 Diamond | 99%
2 Diamonds | 1%
--- TABLE ---
Reward | Probability
80 Coins | 30%
120 Coins | 30%
180 Coins | 20%
250 Coins | 12%
350 Coins | 6%
500 Coins | 2%
--- TABLE ---
Amount | Probability
1 Diamond | 99%
2 Diamonds | 1%
--- TABLE ---
Reward | Probability
150 Coins | 30%
220 Coins | 25%
300 Coins | 20%
380 Coins | 15%
450 Coins | 8%
500 Coins | 2%
--- TABLE ---
Amount | Probability
1 Diamond | 99%
2 Diamonds | 1%
--- TABLE ---
Reward | Probability
+20 Coins | 39.7%
+40 Coins | 30.0%
+80 Coins | 15.0%
+150 Coins | 9.0%
+250 Coins | 5.0%
+1 Diamond | 0.25%
+2 Diamonds | 0.05%
--- TABLE ---
Reward | Value
Coins | 80 + 12 * Tier
Diamond on every 10th level | +3 Diamonds
Extra Diamond on every 50th level | +5 additional Diamonds
--- TABLE ---
Total Stars | Reward
30 | 1 Diamond
100 | 2 Diamonds
250 | 3 Diamonds
500 | 5 Diamonds
1000 | 8 Diamonds
--- TABLE ---
Source | Approximate Coins
Rank reward | 80–130
Chest | 100–160
Random bonus | 40–80
Track Coins | 60–100
Total | 280–470 Coins
--- TABLE ---
Source | Approximate Coins
Rank reward | 200–450
Chest | 150–260
Random bonus | 40–120
Track Coins | 120–180
Total | 510–1,010 Coins
--- TABLE ---
Source | Approximate Coins
Rank reward | 400–1,100
Chest | 150–310
Random bonus | 50–150
Track Coins | 150–220
Total | 750–1,780 Coins
--- TABLE ---
Feature | Effect
Race Revive | Continue after wreck once
Double Coin Reward | Doubles rank reward and chest Coins
Bonus Coins | Optional small Coin bonus from garage or daily board
--- TABLE ---
Ad Type | Daily Cap
Revive ads | 5
Double Coin ads | 10
Bonus Coin ads | 3
--- TABLE ---
Pack | Diamonds | Approximate Price
Small | 80 | $0.99
Medium | 400 | $4.99
Large | 900 | $9.99
Epic | 2,000 | $19.99
--- TABLE ---
Product | Effect
Remove Ads | Removes banners and interstitials, keeps optional rewarded ads
--- TABLE ---
Module | Purpose
Straight | Base running section
Gentle Curve | Light steering
Medium Curve | Normal cornering
Tight Curve | Heavy braking/steering
Hairpin | Slow technical turn
Chicane | Rapid left-right sequence
Narrow Gate | Width pressure
Jump/Ramp | Vertical variation
Boost Lane | Reward zone
Traffic Zone | Dense traffic area
Scenic Segment | Visual pacing
--- TABLE ---
Screen/Component | Requirement
Main menu | Clear play, garage, shop, settings
Level start | Race start button, level info, modifiers
Race HUD | Position, boost, Coins, progress
Pause menu | Resume, restart, exit
Results screen | Rank, rewards, chest, stars, next action
Garage | Car selection, upgrades, cosmetics
Shop | Coins, Diamonds, IAP, cosmetic bundles
Settings | Audio, controls, accessibility, ads privacy
--- TABLE ---
Device Class | Target
High-end mobile | 60 FPS
Mid-range mobile | 60 FPS
Low-end mobile | 30 FPS stable
--- TABLE ---
Feature | Requirement
Colorblind-friendly UI | Avoid red/green-only meaning
Text size | Readable on mobile
Motion effects | Optional reduce motion where feasible
Control sensitivity | Adjustable steering sensitivity
Sound cues | Optional visual cues for countdown and boost
Assist Mode | Available after repeated failure
--- TABLE ---
Metric | Target
Race completion rate | > 80%
First 10 levels retention | Strong onboarding
D1 retention | Healthy casual benchmark
Upgrade conversion | High organic upgrade use
Rewarded ad opt-in | Optional but attractive
Crash rate | Low
Race start time | Fast
--- TABLE ---
Risk | Impact | Mitigation
Difficulty becomes unfair | Player churn | Assist Mode, AI caps, fair track rules
Economy too slow | Frustration | Adjust Coin rewards and upgrade costs
Too many ads | Negative UX | Strict caps and no race interruptions
Procedural tracks become repetitive | Boredom | Environment cycles, modifiers, module variety
Godot performance issues on low-end | Crashes/lag | Object pooling, mobile renderer, LOD
Diamond rarity too harsh | Monetization weakness | Premium cosmetics and bundles
Upgrades feel meaningless | Weak progression | Clear AI difficulty justification
--- TABLE ---
System | Canonical Value
Player + AI cars | 1 + 5
Countdown | 3 seconds
Standard race time | 120–170 seconds
Sprint race time | 85–115 seconds
Endurance race time | 175–215 seconds
Elite race time | 130–180 seconds
Difficulty formula | D = min(1, 1 - exp(-(Level - 1)/70))
Upgrade max level | 10
Upgrade total cost all stats | 198,940 Coins
Diamond chest behavior | Max ordinary chest drop usually 1, rarely 2
Random bonus Diamond chance | 0.25% for 1, 0.05% for 2
Next level unlock | Finish top 5
Assist trigger | After 2 failures on same level
Revive cost | Rewarded ad or 5 Diamonds
Elite level frequency | Every 10th level
Track seed | Deterministic by level number
Offline-first | Required
Pay-to-win | Prohibited