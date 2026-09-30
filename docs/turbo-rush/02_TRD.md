> Turbo Rush specification series — extracted text of the original design document. Tables are flattened with | separators.

TURBO RUSH
Mobile 3D Arcade Racing Game — Complete Specification Series
Document 2 of 6 — Technical Requirements Document (TRD)
Engine: Godot 4.x   •   Platform: Android + iOS   •   Offline-first
Extracted and formatted from the Turbo Rush specification conversation — 30 September 2026
1. Purpose
This Technical Requirements Document defines how Turbo Rush must be built in Godot 4.x for Android and iOS.
It translates the PRD into:
Engine architecture
Scene structure
Core systems
Procedural level generation rules
Race simulation rules
AI implementation rules
Economy/reward service rules
Save system interface
Monetization abstraction
Performance requirements
Platform integration requirements
Debug and QA requirements
All values in this document must remain consistent with the PRD.
2. Technology Stack
2.1 Renderer Decision
Use:
Mobile renderer
Reason:
Suitable for 3D mobile games.
Better balance between visuals and performance than Forward+.
More future-proof than relying only on Compatibility.
A low-end fallback using Compatibility may be added later if device testing requires it, but the primary technical target is Mobile.
3. High-Level Architecture
3.1 Architecture Principles
The implementation must follow these principles:
Game logic must be separated from UI.
Race simulation must be deterministic where required.
Procedural level generation must use deterministic seeds.
Economy changes must go through services, not UI directly.
Ads and IAP must be abstracted behind interfaces.
All persistent changes must go through SaveSystem.
Object pooling must be used for frequently spawned mobile entities.
The game must remain playable without network access.
3.2 Recommended Architecture Diagram
A visual architecture diagram should be created and stored with this TRD.
Diagram Name: TRD-V1 Architecture Overview Purpose: Show relationship between:
Game bootstrap
Autoload services
Race scene
UI layer
Save system
Monetization abstraction
Procedural generation
The diagram should show that UI requests actions from services, services mutate state or emit events, and UI reacts to events.
4. Godot Project Structure
Recommended directory structure:
res://
  project.godot
  autoload/
    GameConfig.gd
    EventBus.gd
    SaveSystem.gd
    EconomyService.gd
    ProgressionService.gd
    RewardService.gd
    LevelGenerator.gd
    DifficultyService.gd
    RaceSession.gd
    AdsManager.gd
    IAPManager.gd
    AudioSystem.gd
    HapticsSystem.gd
    AnalyticsService.gd
    ObjectPoolManager.gd
  scenes/
    bootstrap/
    ui/
    race/
    cars/
    traffic/
    obstacles/
    pickups/
    environments/
    effects/
  resources/
    cars/
    upgrades/
    cosmetics/
    levels/
    economy/
    iap/
    ads/
  scripts/
    race/
    ai/
    generation/
    economy/
    save/
    ads/
    iap/
    utils/
  assets/
    models/
    textures/
    audio/
    fonts/
    materials/
    animations/
5. Autoload Services
These autoloads are required.
6. Core Scene Structure
6.1 Bootstrap Scene
Bootstrap
  ├── ServiceInitializer
  ├── LoadingScreen
  └── SceneRouter
Responsibilities:
Initialize services.
Load save.
Validate save version.
Route to main menu or last relevant screen.
Handle offline/online state.
6.2 Main UI Scene
MainUI
  ├── MainMenu
  ├── LevelSelect
  ├── Garage
  ├── Shop
  ├── Settings
  ├── PopupLayer
  └── TransitionLayer
Full UI/UX details are defined later in Document 3 and Document 4.
6.3 Race Scene
RaceWorld
  ├── WorldEnvironment
  ├── TrackRoot
  │   ├── TrackChunks
  │   ├── TrackPath
  │   └── TrackColliders
  ├── CarsRoot
  │   ├── PlayerCar
  │   └── AICars
  ├── TrafficRoot
  ├── ObstaclesRoot
  ├── PickupsRoot
  │   ├── CoinsRoot
  │   ├── BoostPickupsRoot
  │   └── DiamondRoot
  ├── EffectsRoot
  ├── RaceManager
  ├── PositionTracker
  ├── RaceHUD
  └── PauseLayer
7. Game Configuration Constants
GameConfig must expose canonical values.
7.1 Core Constants
7.2 Race Duration Constants
8. Difficulty Service
DifficultyService must be deterministic and stateless where possible.
8.1 Difficulty Formula
static func difficulty(level: int) -> float:
    return min(1.0, 1.0 - exp(-(level - 1) / 70.0))
Elite levels use:
static func spawn_difficulty(level: int) -> float:
    var d := difficulty(level)
    if race_type(level) == RaceType.ELITE:
        d = min(1.0, d + 0.05)
    return d
8.2 Race Type Resolution
enum RaceType { STANDARD, SPRINT, ENDURANCE, ELITE }
static func race_type(level: int) -> RaceType:
    if level % 10 == 0:
        return RaceType.ELITE
    if level >= 15 and level % 10 == 5:
        return RaceType.SPRINT
    if level >= 27 and level % 10 == 7:
        return RaceType.ENDURANCE
    return RaceType.STANDARD
This exactly matches the PRD.
8.3 Recommended Upgrade Level
Use the PRD table.
Implementation can use a lookup table.
8.4 Expected Top Speed for Track Generation
To keep level layouts deterministic and independent of selected car, track length must use a canonical expected top speed.
static func car_progression_bonus(level: int) -> float:
    return min(30.0, floor(level / 10.0) * 2.0)
static func expected_top_speed_kmh(level: int) -> float:
    var recommended := recommended_upgrade_level(level)
    var bonus := car_progression_bonus(level)
    return min(190.0, 140.0 + 2.5 * recommended + bonus)
This value is used only for track length estimation, not for AI stat scaling.
8.5 Target Time
static func target_time(level: int, type: RaceType, d: float, rng: RandomNumberGenerator) -> float:
    var t := 0.0
    match type:
        RaceType.STANDARD:
            t = 135.0 + 15.0 * d + rng.randf_range(-10.0, 10.0)
            t = clamp(t, 120.0, 170.0)
        RaceType.SPRINT:
            t = 95.0 + 10.0 * d + rng.randf_range(-8.0, 8.0)
            t = clamp(t, 85.0, 115.0)
        RaceType.ENDURANCE:
            t = 185.0 + 15.0 * d + rng.randf_range(-12.0, 12.0)
            t = clamp(t, 175.0, 215.0)
        RaceType.ELITE:
            t = 145.0 + 15.0 * d + rng.randf_range(-10.0, 10.0)
            t = clamp(t, 130.0, 180.0)
    return t
8.6 Track Length
static func track_length_meters(level: int, type: RaceType, target_seconds: float) -> float:
    var top_speed := expected_top_speed_kmh(level)
    var expected_mps := top_speed / 3.6 * EXPECTED_SPEED_FACTOR
    var length := target_seconds * expected_mps
    match type:
        RaceType.STANDARD:
            length = clamp(length, 2800.0, 6200.0)
        RaceType.SPRINT:
            length = clamp(length, 2000.0, 4200.0)
        RaceType.ENDURANCE:
            length = clamp(length, 4200.0, 8200.0)
        RaceType.ELITE:
            length = clamp(length, 3000.0, 6600.0)
    return length
This preserves race duration targets while allowing higher-level tracks to be physically longer because expected speed increases.
Difficulty is not primarily created by increasing duration.
9. Procedural Level Generation
9.1 Seed Rule
Each level must be deterministic.
static func level_seed(level: int) -> int:
    var salt := GameConfig.LEVEL_SEED_SALT
    var combined := (level << 32) ^ salt
    return hash(combined)
The same level number must always generate the same:
Track module order
Environment
Weather condition
Modifier
Coin path
Traffic pattern
Obstacle layout
Diamond pickup eligibility and placement
Reward rolls are separate and not part of level generation.
9.2 Level Definition Resource
LevelGenerator outputs a runtime LevelDefinition.
Required fields:
9.3 Environment Selection
Use PRD environment tiers.
Variant example:
sunrise_city_b
Variants are visual only unless a condition modifies gameplay.
9.4 Weather/Condition Chance
static func condition_chance(d: float) -> float:
    return min(0.60, 0.10 + 0.45 * d)
Condition selection is deterministic from level seed and environment-compatible.
Condition effects from PRD:
AI mistake chance increases by:
condition_severity * 0.02
where severity is 0.0 to 1.0 based on condition intensity.
9.5 Modifier Selection
static func modifier_chance(level: int, d: float) -> float:
    if level < 25:
        return 0.0
    return min(0.55, 0.10 + 0.55 * d)
Rules:
Elite always has one modifier.
Endurance levels from Level 40 always have one modifier.
Mirror Layout only appears from Level 60.
Modifiers must be deterministic from level seed.
Supported modifier IDs:
traffic_rush
slippery_zones
boost_famine
narrow_works
night_run
mirror_layout
10. Track Module System
10.1 Module Types
10.2 Module Length and Constraint Table
10.3 Corner Radius Rules
From PRD:
static func min_corner_radius(d: float) -> float:
    return max(10.0, 26.0 - 14.0 * d)
Hairpins must respect the same minimum radius.
Use:
static func hairpin_radius(d: float) -> float:
    return max(10.0, 12.0 - 2.0 * d)
10.4 Track Width Rules
static func normal_track_width(d: float) -> float:
    return lerp(16.0, 14.0, d)
static func narrow_track_width(d: float) -> float:
    return max(9.0, normal_track_width(d) - 5.0)
Narrow section percentage:
static func narrow_percentage(d: float) -> float:
    return min(30.0, 5.0 + 25.0 * d)
11. Track Generation Algorithm
11.1 High-Level Generation Pipeline
Diagram Name: TRD-V2 Track Generation Pipeline Purpose: Show generation flow from level number to fully populated race scene.
Pipeline:
Read level number.
Generate deterministic seed.
Determine race type.
Compute D and D_spawn .
Choose environment and condition.
Select modifiers.
Compute target time.
Compute expected track length.
Generate module sequence.
Build spline/path.
Place collision and visual chunks.
Place Coins.
Place Boost pickups.
Place Diamond pickup if eligible.
Place traffic.
Place obstacles.
Bake progress path.
Validate fairness constraints.
11.2 Module Sequence Rules
Generation must satisfy:
Begin with start_straight .
End with finish_straight .
No traffic or obstacles in first 20m.
No traffic or obstacles in final 15m.
At least one boost_lane or boost pickup every 350–600m.
At least one overtaking-friendly wide section every 150–250m.
No module may create an unavoidable collision wall.
Jumps must have a safe landing zone of at least 20m.
Hairpins must not be placed immediately after blind crests.
Narrow sections must not contain unavoidable traffic clusters.
11.3 Length Matching
The generator must:
Create a provisional module list.
Sum module lengths.
Adjust final straight length to reach target track length.
If target cannot be reached, add or remove straights.
Final track length must be within ±3% of target length.
12. Track Path and Progress System
12.1 Progress Path
The track must generate a sampled center path.
Requirements:
Sample interval: 3 meters .
Store cumulative distance.
Store track width at sample.
Store corner radius metadata where relevant.
Store lane count metadata.
Store boost zone metadata.
Store narrow zone metadata.
12.2 Position Tracking
PositionTracker tracks six racers.
For each racer:
Maintain current sample index.
Project car position to nearby path segment.
Compute progress distance.
Rank racers by progress.
Rules:
Search only nearby samples, not whole track.
Update every physics frame.
Emit position updates to HUD.
Position format:
current_position / TOTAL_RACERS
Example:
3/6
13. Object Pooling
Object pooling is mandatory.
13.1 Required Pools
13.2 Pool Rules
Pools are preloaded during race loading.
Inactive nodes are hidden and have processing disabled.
Physics bodies are disabled when inactive.
Traffic and obstacles outside active window are simplified or hidden.
Coins far from player may use simplified activation logic.
14. Scene Streaming
Tracks can be several kilometers long.
Use streaming.
14.1 Active Window
Track chunks outside this window must:
Be hidden.
Disable script processing.
Disable collision unless required for AI logic.
14.2 AI and Traffic Simulation
AI cars are always simulated logically.
Visual representation may be simplified when far from player.
Traffic vehicles:
Fully simulated within active window.
Simplified progress simulation outside active window.
Must not unfairly collide with player when inactive.
15. Car Controller Requirements
Turbo Rush uses an arcade car controller, not a full realistic vehicle simulation.
15.1 Recommended Node Base
Use:
CharacterBody3D
Reason:
Predictable arcade handling.
Easier mobile performance.
Simpler collision event control.
Less unstable than full rigid-body vehicle simulation.
15.2 Car Components
Each car scene should contain:
Car
  ├── BodyMesh
  ├── WheelMeshes
  ├── CollisionShape3D
  ├── GroundRaycast
  ├── FrontSensor
  ├── SideSensorLeft
  ├── SideSensorRight
  ├── BoostEffect
  ├── EngineAudio
  ├── DamageComponent
  ├── StatsComponent
  ├── BoostComponent
  ├── AIBrain # only for AI
  └── PlayerControl # only for player
15.3 Car Stats Runtime Values
Runtime stats must be derived from:
Car base definition.
Global upgrade levels.
Temporary modifiers.
Condition effects.
Stats:
top_speed_kmh
acceleration_mps2
handling_multiplier
braking_mps2
boost_power_kmh
boost_duration_sec
stability_multiplier
Upgrade increments from PRD:
15.4 Movement Model
The car controller should use:
Forward speed.
Lateral steering.
Gravity.
Ground snapping.
Slope handling.
Collision slowdown.
Boost speed bonus.
High-level update order:
Read input or AI intent.
Update boost state.
Compute target speed.
Apply acceleration or braking.
Apply steering.
Apply ground/gravity.
Move with move_and_slide() .
Emit telemetry events.
16. Input System
Default control scheme is touch arcade steering.
16.1 Input Actions
16.2 Default Settings
Input implementation details and final button placement are completed in Document 4: UI/UX Design Brief.
17. Boost System Implementation
17.1 Boost State
17.2 Boost Duration and Drain
func boost_duration_sec() -> float:
    return 2.0 + 0.25 * upgrade_levels.boost_duration
func boost_drain_per_second() -> float:
    return 100.0 / boost_duration_sec()
17.3 Boost Speed
func boost_speed_bonus_kmh() -> float:
    return 25.0 + 2.0 * upgrade_levels.boost_power
While boosting:
effective_top_speed_kmh = top_speed_kmh + boost_speed_bonus_kmh()
energy -= boost_drain_per_second() * delta
Boost ends if:
Energy reaches 0.
Player releases boost.
Car becomes wrecked.
Race is paused.
18. Damage System Implementation
18.1 Damage Values
18.2 Recovery
func recover_damage(delta: float) -> void:
    if time_since_last_damage >= 2.0:
        damage = max(0.0, damage - 3.0 * delta)
18.3 Wreck
When:
damage >= 100.0
The car enters wreck state.
Rules:
Race stops for player unless revive is used.
If revive used, damage becomes 40.
Boost energy +30.
2 seconds collision protection.
Clean Score penalty applied.
19. Clean Score Implementation
Clean Score starts at 100.
Implementation:
var clean_score := 100.0
func apply_heavy_collision() -> void:
    clean_score -= 15.0
func apply_light_collision() -> void:
    clean_score -= 5.0
func apply_offtrack(delta: float) -> void:
    offtrack_penalty_total = min(30.0, offtrack_penalty_total + 2.0 * delta)
func finalize() -> void:
    clean_score = max(0.0, clean_score - offtrack_penalty_total)
Off-track detection:
Lateral offset exceeds current track half-width + 1.0m.
Must persist for at least 0.5 seconds before penalty starts.
20. AI Implementation
20.1 AI Baseline
AI stats are based on:
Selected car base stats + recommended upgrade level + difficulty multiplier.
func ai_top_speed_kmh(selected_car: CarDefinition, level: int, d: float, elite: bool) -> float:
    var recommended := DifficultyService.recommended_upgrade_level(level)
    var base := selected_car.top_speed_kmh + 2.5 * recommended
    var multiplier := 0.88 + 0.18 * d
    if elite:
        multiplier += 0.02
    multiplier = min(multiplier, 1.08 if elite else 1.06)
    return base * multiplier
Equivalent formulas apply to acceleration, handling, and braking.
20.2 AI Difficulty Values
From PRD:
Elite adjustments:
20.3 AI Behavior Layers
AI cars use a lightweight behavior stack:
Path Following Follow track centerline with lateral offset.
Speed Planning Slow down for upcoming corners using corner radius.
Traffic Avoidance Choose lane offset or brake when blocked.
Overtake Decision Based on Overtake Skill and aggression.
Boost Decision Use boost on straights or before long sections.
Mistake Simulation Random small speed loss or steering wobble.
20.4 Corner Speed Estimation
AI target corner speed may use:
func corner_target_speed(radius_m: float, handling_multiplier: float) -> float:
    var lateral_g := 8.0 * handling_multiplier
    return sqrt(max(1.0, radius_m * lateral_g))
This is arcade-tunable, not physically exact.
20.5 AI Boost Use
AI uses boost when:
Straight segment ahead > 40m.
Boost energy > threshold.
Boost Use Skill roll succeeds.
Not in Boost Famine modifier unless energy is high.
AI boost threshold:
boost_threshold = lerp(60.0, 35.0, boost_use_skill)
21. Traffic System Implementation
21.1 Traffic Count
func traffic_count(d_spawn: float, type: RaceType) -> int:
    var type_mult := 1.0
    match type:
        RaceType.SPRINT: type_mult = 0.8
        RaceType.ENDURANCE: type_mult = 1.25
        RaceType.ELITE: type_mult = 1.15
    var count := round((8 + 32 * d_spawn) * type_mult)
    return min(45, int(count))
21.2 Traffic Behavior
Traffic vehicles:
Follow lanes.
Move at a fraction of AI speed.
Can change lanes.
May brake suddenly at high difficulty.
Never form unavoidable walls.
Traffic speed fraction:
traffic_speed_fraction = lerp(0.35, 0.65, d_spawn)
Lane change chance per second:
lane_change_chance_per_second = 0.02 + 0.08 * d_spawn
Traffic must be active only near player for performance.
22. Obstacle System Implementation
22.1 Obstacle Count
func obstacle_count(d_spawn: float, type: RaceType) -> int:
    var type_mult := 1.0
    match type:
        RaceType.SPRINT: type_mult = 0.8
        RaceType.ENDURANCE: type_mult = 1.25
        RaceType.ELITE: type_mult = 1.15
    var count := round((6 + 30 * d_spawn) * type_mult)
    return min(40, int(count))
22.2 Jump Count
func jump_count(d_spawn: float, type: RaceType) -> int:
    var count := floor(2 + 10 * d_spawn)
    match type:
        RaceType.SPRINT:
            count = floor(count * 0.8)
        RaceType.ENDURANCE:
            count = floor(count * 1.2)
    return int(count)
22.3 Obstacle Placement Rules
Not within 20m of start.
Not within 15m of finish.
Not on blind landing zone immediately after jump.
Must leave at least one drivable gap.
Oil slicks cannot be placed on hairpin apex if radius < 12m.
Barriers cannot fully block all lanes.
Construction gates must have visible warning 25m before.
23. Pickup System
23.1 Track Coins
func track_coin_count(d: float, type: RaceType) -> int:
    var mult := 1.0
    match type:
        RaceType.SPRINT: mult = 0.8
        RaceType.ENDURANCE: mult = 1.3
        RaceType.ELITE: mult = 1.1
    var count := round((90 + 120 * d) * mult)
    return min(260, int(count))
Each collected Coin is worth:
1 Coin
Coins are awarded only if the race is completed.
23.2 Boost Pickup Count
Base count:
func boost_pickup_count(d_spawn: float, type: RaceType, modifiers: Array) -> int:
    var count := 3 + floor(5 * d_spawn)
    match type:
        RaceType.SPRINT: count -= 1
        RaceType.ENDURANCE: count += 1
    if modifiers.has("boost_famine"):
        count = int(ceil(count * 0.7))
    return clamp(count, 2, 8)
Each boost pickup restores:
+35 Boost Energy
23.3 Diamond Pickup
Eligibility:
Maximum per level:
1
Placement:
Risky shortcut.
Near obstacle cluster.
After jump.
Tight corner inside line.
Near dense traffic.
If collected and race completed:
+1 Diamond
24. Race State Machine
24.1 States
24.2 State Transitions
LOADING -> READY
READY -> COUNTDOWN
COUNTDOWN -> RACING
RACING -> PAUSED
PAUSED -> RACING
RACING -> FINISHED
RACING -> WRECKED
WRECKED -> RACING if revive used
WRECKED -> RESULTS if no revive
FINISHED -> RESULTS
RESULTS -> exit to menu or next level
25. Race Completion Rules
A race is completed when the player crosses the finish line.
Completion is true even if position is 6th.
Unlock requires:
finish_position <= GameConfig.UNLOCK_POSITION_REQUIREMENT
Therefore:
Positions 1–5 unlock next level.
Position 6 does not unlock next level.
Rewards are still granted for completing.
26. Assist System Implementation
26.1 Failure Tracking
Failure conditions:
Finish position 6.
DNF without revive.
If same level failure count reaches 2, next attempt enables Assist.
26.2 Assist Effects
Assist is clearly exposed to race simulation and UI.
Assist is disabled after a win.
27. Reward Service Implementation
RewardService calculates all rewards after a completed race.
27.1 Reward Calculation Inputs
Required inputs:
level_number
finish_position
completed
track_coins_collected
diamond_pickup_collected
revive_used
first_time_completion
best_stars_before
stars_earned
27.2 Difficulty Tier
func tier(level: int) -> int:
    return int(floor((level - 1) / 10)) + 1
27.3 Base Coin Reward
func base_coin_reward(t: int) -> int:
    return int(min(500, 60 + 18 * (t - 1)))
27.4 Rank Multipliers
func rank_multiplier(position: int) -> float:
    match position:
        1: return 2.20
        2: return 1.80
        3: return 1.50
        4: return 1.25
        5: return 1.10
        _: return 1.00
27.5 Rank Reward Formula
func rank_reward(level: int, position: int) -> int:
    var t := tier(level)
    var base := base_coin_reward(t)
    var mult := rank_multiplier(position)
    var elite_mult := 1.5 if DifficultyService.race_type(level) == RaceType.ELITE else 1.0
    var raw := base * mult * elite_mult
    return int(round(raw / 5.0) * 5)
28. Chest Service Implementation
28.1 Chest Tier
func chest_tier(level: int, position: int) -> String:
    var elite := DifficultyService.race_type(level) == RaceType.ELITE
    if position == 1:
        return "gold"
    elif position <= 3:
        return "gold" if elite else "silver"
    else:
        return "silver" if elite else "bronze"
Gold Elite chest adds:
+50 bonus Coins
28.2 Bronze Chest Table
Diamond chance:
1%
Diamond amount:
28.3 Silver Chest Table
Diamond chance:
2%
Diamond amount:
28.4 Gold Chest Table
Diamond chance:
3%
Diamond amount:
29. Random Bonus Reward Implementation
This roll occurs once per completed race.
Expected values:
Coins: 57.94
Diamonds: 0.0035
Implementation must use the exact table.
30. First-Time Completion Rewards
func first_clear_coins(level: int) -> int:
    var t := tier(level)
    return 80 + 12 * t
Diamond bonuses:
func first_clear_diamonds(level: int) -> int:
    var diamonds := 0
    if level % 10 == 0:
        diamonds += 3
    if level % 50 == 0:
        diamonds += 5
    return diamonds
Examples:
Level 10: 3 Diamonds.
Level 50: 8 Diamonds.
Level 100: 8 Diamonds.
31. Star Milestone Rewards
Implementation:
Check after best stars are updated.
Grant only once per milestone.
Store claimed milestone flags in save data.
32. Reward Bundle Structure
After each completed race, create a RewardBundle.
class_name RewardBundle
var coins_from_rank: int = 0
var coins_from_chest: int = 0
var coins_from_bonus: int = 0
var coins_from_track: int = 0
var coins_from_first_clear: int = 0
var diamonds_from_chest: int = 0
var diamonds_from_bonus: int = 0
var diamonds_from_pickup: int = 0
var diamonds_from_first_clear: int = 0
var diamonds_from_star_milestones: int = 0
var ad_multiplier_applied: bool = false
Total Coins:
total_coins =
  coins_from_rank +
  coins_from_chest +
  coins_from_bonus +
  coins_from_track +
  coins_from_first_clear
Total Diamonds:
total_diamonds =
  diamonds_from_chest +
  diamonds_from_bonus +
  diamonds_from_pickup +
  diamonds_from_first_clear +
  diamonds_from_star_milestones
33. Rewarded Ad Double Coin Rule
If the player chooses Double Coin Reward:
Only these values double:
coins_from_rank *= 2
coins_from_chest *= 2
Do not double:
Random bonus Coins.
Track Coins.
First clear Coins.
Diamonds.
Star rewards.
This matches the monetization rule in the PRD.
34. Save System Interface
Full data schema is defined in Document 5.
The TRD defines service boundaries.
34.1 Required SaveSystem API
load_save() -> SaveData
save_game(data: SaveData) -> bool
mark_level_result(result: RaceResult) -> void
add_currency(currency: String, amount: int, reason: String) -> void
spend_currency(currency: String, amount: int, reason: String) -> bool
unlock_level(level: int) -> void
set_upgrade_level(stat: String, level: int) -> void
unlock_car(car_id: String) -> void
unlock_cosmetic(cosmetic_id: String) -> void
update_best_stars(level: int, stars: int) -> void
34.2 Save Timing
Save immediately after:
Race completion reward commit.
Upgrade purchase.
Car purchase.
Cosmetic purchase.
Settings change.
IAP grant.
Ad reward grant.
Milestone reward claim.
Do not wait for UI animation completion to commit critical state.
UI may animate from already committed data.
34.3 Save Safety
Requirements:
Atomic write where possible.
Temporary file + rename pattern.
Version field.
Checksum or hash validation.
Basic obfuscation for currency values.
Debug mode may disable validation.
Corrupt save should load fallback default instead of crashing.
35. Economy Service Rules
35.1 Currency Types
enum Currency { COIN, DIAMOND }
35.2 Grant Rules
Only EconomyService may grant currency.
Reasons must be logged:
race_rank
race_chest
race_bonus
track_coins
first_clear
star_milestone
diamond_pickup
ad_bonus
iap_purchase
35.3 Spend Rules
Only EconomyService may spend currency.
Reasons:
upgrade
car_purchase
cosmetic_purchase
diamond_continue
iap_restore_correction
If spend fails:
Do not mutate state.
Emit failure event.
UI shows non-punitive message.
36. Progression Service Rules
36.1 Player Level
Player Level is:
Highest completed campaign level.
func update_player_level(completed_level: int) -> void:
    if completed_level > save.player_level:
        save.player_level = completed_level
36.2 Level Unlock
func handle_race_result(result: RaceResult) -> void:
    if result.completed and result.finish_position <= 5:
        unlock_level(result.level_number + 1)
        reset_level_failure_count(result.level_number)
    else:
        increment_level_failure_count(result.level_number)
36.3 Upgrade Validation
An upgrade is valid if:
Stat exists.
Current level < 10.
Player Level meets requirement.
Player has enough Coins.
Required Player Level table:
36.4 Upgrade Cost Table
Total per stat:
28,420 Coins
All seven stats:
198,940 Coins
36.5 Car Unlock Validation
Car unlocks require:
Player Level requirement.
Coin cost.
Car not already owned.
Car table from PRD:
37. Ads Integration
37.1 AdsManager Interface
class_name AdsManager
signal rewarded_ad_loaded(slot_id)
signal rewarded_ad_completed(slot_id, success)
signal interstitial_loaded
signal interstitial_closed
func init() -> void
func is_online() -> bool
func load_rewarded(slot_id: String) -> void
func show_rewarded(slot_id: String) -> void
func load_interstitial() -> void
func show_interstitial_if_allowed() -> void
func show_banner() -> void
func hide_banner() -> void
37.2 Ad Providers
Use a provider abstraction:
AdProvider
  ├── MockAdProvider
  ├── AdMobProvider
  └── DisabledAdProvider
Default offline behavior:
Use DisabledAdProvider.
No ad call may crash the game when offline.
37.3 Rewarded Ad Rules
Daily caps:
Rewarded ads must not grant Diamonds.
37.4 Interstitial Rules
Allowed:
After returning from Results to Menu.
Maximum once per 5 minutes.
Not during race.
Not before countdown.
Not immediately after failure.
Recommended first-session rule:
No interstitial in first 10 minutes.
37.5 Banner Rules
Allowed only in:
Garage
Shop
Settings
Cosmetics browser
Forbidden in:
Race HUD
Countdown
Results reward moment
Upgrade confirmation
Active gameplay
38. IAP Integration
38.1 IAPManager Interface
class_name IAPManager
signal products_loaded(products)
signal purchase_completed(product_id, receipt)
signal purchase_failed(product_id, error)
signal restore_completed
func init() -> void
func request_products() -> void
func purchase(product_id: String) -> void
func restore_purchases() -> void
38.2 Product Catalog
38.3 IAP Rules
Purchases require network.
Restore must be available.
Grants must be idempotent.
If purchase succeeds but grant fails, restore must recover entitlement.
Remove Ads disables banners and interstitials but keeps optional rewarded ads.
IAP must not grant performance-only advantages.
39. Analytics Integration
Analytics is optional.
If implemented:
Must not block gameplay.
Must work offline by queueing or discarding events.
Must not collect personally identifiable information.
Must respect consent settings.
Recommended events:
level_start
level_finish
level_fail
race_position
upgrade_purchase
car_purchase
cosmetic_purchase
chest_opened
rewarded_ad_completed
iap_started
iap_completed
40. Audio Requirements
40.1 Audio Buses
40.2 Required Sounds
Countdown beep
GO sound
Engine loop per car class
Boost activation
Boost loop
Coin pickup
Diamond pickup
Collision light
Collision heavy
Oil slick slip
Jump takeoff
Landing
Finish fanfare
Chest opening
Upgrade purchase
Error/insufficient funds
Engine pitch should scale with speed and boost.
41. Haptics Requirements
Use mobile haptics lightly.
Recommended events:
Countdown ticks
Boost activation
Collision heavy
Diamond pickup
Finish line
Chest reveal rare item
Settings must allow haptics to be disabled.
42. Performance Requirements
42.1 Frame Rate
42.2 Memory Budget
42.3 Draw Call Budget
42.4 Triangle Budget
43. Mobile Optimization Requirements
Required optimizations:
Object pooling.
Chunk streaming.
Texture compression with ASTC/ETC2.
LODs for cars, traffic, obstacles.
Disable processing for inactive nodes.
Avoid per-frame allocations in race loop.
Use simple collision shapes.
Avoid large numbers of dynamic lights.
Use baked or cheap lighting where possible.
Use GPU particles with limited counts.
Use audio streaming carefully.
44. Collision Layers
Recommended collision setup:
Rules:
Pickups use area overlap, not physical blocking.
Oil slicks use trigger zones.
Traffic should not use expensive full physics against all objects.
Player collision response is arcade simplification.
45. Race Telemetry Signals
Use EventBus or direct race signals.
Required signals:
signal race_started(level)
signal countdown_tick(value)
signal race_finished(result)
signal position_updated(player_position, total)
signal coin_collected(amount)
signal diamond_collected
signal boost_changed(energy, active)
signal damage_changed(value)
signal wrecked
signal revive_used
signal traffic_near_miss
signal clean_score_changed(value)
46. RaceResult Object
class_name RaceResult
var level_number: int
var completed: bool
var finish_position: int
var race_time_sec: float
var clean_score: float
var stars_earned: int
var track_coins_collected: int
var diamond_pickup_collected: bool
var wrecked: bool
var revive_used: bool
var assist_used: bool
var car_id: String
var timestamp: int
This object is passed to RewardService and ProgressionService.
47. Platform Requirements
47.1 Android
Minimum target:
Manifest must include:
AdMob application ID if using AdMob.
Billing permission.
Landscape orientation lock.
47.2 iOS
Minimum target:
Info.plist must include:
AdMob application ID if used.
StoreKit configuration.
Landscape orientation settings.
Privacy usage descriptions where required.
48. Privacy and Consent
Requirements:
No mandatory personal data collection.
Ads must respect user consent.
iOS must implement ATT prompt before tracking if ads require it.
Android must respect Google Play consent requirements.
If consent denied:
Disable personalized ads.
Keep rewarded ads if contextual/non-personalized allowed.
Keep game fully playable.
49. Offline Behavior
49.1 Offline Must Work
Campaign
Garage
Upgrades
Cosmetic purchases with earned currency
Settings
Save/load
Race generation
Rewards
49.2 Offline Must Disable
Rewarded ads
Interstitials
Banners
IAP
Optional analytics upload
UI must not show misleading online-only buttons as active when offline.
50. Debug Tools
Debug builds must include:
Debug tools must be disabled in release builds.
51. Automated and Manual Testing Requirements
51.1 Unit Test Targets
Test the following formulas:
Difficulty formula.
Race type resolution.
Recommended upgrade level.
Expected top speed.
Track length clamp.
Traffic count.
Obstacle count.
Jump count.
Rank reward.
Chest tier.
Random bonus probabilities.
First clear rewards.
Star milestones.
Upgrade validation.
Car unlock validation.
51.2 Procedural Generation Tests
For at least 10,000 generated levels:
No invalid module sequence.
Start and finish exist.
Track length within ±3% target.
Traffic count within cap.
Obstacle count within cap.
Diamond pickup never exceeds 1.
No impossible obstacle wall detected by path validator.
Every Elite level has a Diamond pickup.
51.3 Performance Tests
Test on:
Low-end Android device.
Mid-range Android device.
iOS device.
Long race sessions.
Memory after 20 race restarts.
Object pool leak check.
52. Build and Release Requirements
52.1 Build Targets
52.2 Release Checks
Before release:
Ads comply with policy.
IAP restores correctly.
Offline mode verified.
No crash on first boot.
Save migration works.
Orientation locked correctly.
Safe areas respected.
Haptics can be disabled.
Audio can be muted.
Memory stable across repeated races.
53. Visual Specification Recommendations for TRD
The following visuals should be produced.
TRD-V1 — Architecture Overview
Where: Section 3 Purpose: Show services, scenes, data flow, and monetization abstraction.
TRD-V2 — Track Generation Pipeline
Where: Section 11 Purpose: Show deterministic generation from level seed to populated track.
TRD-V3 — Race State Machine
Where: Section 24 Purpose: Show transitions between loading, countdown, racing, pause, finish, wreck, and results.
TRD-V4 — AI Behavior Flow
Where: Section 20 Purpose: Show path following, speed planning, traffic avoidance, overtaking, boost, and mistakes.
TRD-V5 — Object Pool Lifecycle
Where: Section 13 Purpose: Show acquire, activate, deactivate, and return states for pooled entities.
TRD-V6 — Reward Commit Flow
Where: Sections 27–33 Purpose: Show race result to reward calculation to save commit to UI animation.
54. Technical Acceptance Criteria
This TRD is considered implementation-ready when:
A Godot developer can create the project structure without guessing core systems.
Level generation can be implemented deterministically.
AI behavior has clear scaling rules.
Race flow can be implemented with a finite finish line.
Reward formulas can be coded exactly.
Save system interface is clear.
Monetization integration is abstract and offline-safe.
Performance constraints are measurable.
Debug tools support balancing and QA.
55. Canonical Technical Values Carried Forward
These values are now locked for later documents unless explicitly revised:
End of Document 2 — TRD.
--- TABLE ---
Version: | 1.0
--- TABLE ---
Engine: | Godot 4.x
--- TABLE ---
Platform: | Android + iOS
--- TABLE ---
Mode: | Offline-first
--- TABLE ---
Dependency: | This document implements the canonical values established in Document 1: PRD.
--- TABLE ---
Item | Requirement
Engine | Godot 4.x, recommended 4.3+
Language | GDScript
Renderer | Godot Mobile renderer as primary target
Target Platforms | Android and iOS
Connectivity | Offline-first
Ads | Native ad SDK through abstraction layer
IAP | Native store integration through abstraction layer
Save System | Local file-based save
Analytics | Optional abstraction, non-blocking
Orientation | Landscape locked
Units | 1 Godot unit = 1 meter
Target Frame Rate | 60 FPS on mid/high-end, 30 FPS stable on low-end
--- TABLE ---
Autoload | Responsibility
GameConfig | Constants, tuning values, build flags
EventBus | Global signal hub
SaveSystem | Loads and saves local player data
EconomyService | Currency balance and spend/grant validation
ProgressionService | Level unlocks, player level, upgrades, cars, cosmetics
RewardService | Calculates deterministic and random rewards
LevelGenerator | Generates level definition from level number
DifficultyService | Calculates D, race type, AI scaling, traffic, obstacles
RaceSession | Holds active race state and result
AdsManager | Abstracts rewarded/interstitial/banner ads
IAPManager | Abstracts store purchases and restores
AudioSystem | Music, SFX, engine audio
HapticsSystem | Mobile haptics
AnalyticsService | Optional event tracking
ObjectPoolManager | Pools traffic, coins, obstacles, effects
--- TABLE ---
Constant | Value
PLAYER_CAR_COUNT | 1
AI_CAR_COUNT | 5
TOTAL_RACERS | 6
COUNTDOWN_SECONDS | 3
UNLOCK_POSITION_REQUIREMENT | 5
MAX_UPGRADE_LEVEL | 10
MAX_DIAMOND_PICKUPS_PER_LEVEL | 1
REVIVE_DIAMOND_COST | 5
MAX_TRACK_COINS | 260
MAX_TRAFFIC | 45
MAX_OBSTACLES | 40
PHYSICS_UNIT_TO_KMH | 3.6
EXPECTED_SPEED_FACTOR | 0.66
--- TABLE ---
Constant | Value
STANDARD_TIME_MIN | 120
STANDARD_TIME_MAX | 170
SPRINT_TIME_MIN | 85
SPRINT_TIME_MAX | 115
ENDURANCE_TIME_MIN | 175
ENDURANCE_TIME_MAX | 215
ELITE_TIME_MIN | 130
ELITE_TIME_MAX | 180
--- TABLE ---
Campaign Level Range | Recommended Upgrade Level
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
Field | Type
level_number | int
seed | int
race_type | enum
difficulty | float
spawn_difficulty | float
environment_id | String
condition_id | String
modifiers | Array[String]
target_time_sec | float
track_length_m | float
traffic_count | int
obstacle_count | int
jump_count | int
coin_count | int
boost_pickup_count | int
has_diamond_pickup | bool
track_modules | Array[TrackModuleData]
ai_baseline | AIBaselineData
--- TABLE ---
Level Range | Environment ID
1–19 | sunrise_city
20–39 | coastal_highway
40–59 | desert_canyon
60–79 | mountain_pass
80–99 | industrial_night
100–119 | snowline
120–139 | neon_metro
140–159 | volcanic_rim
160+ | Cycle with variant suffix
--- TABLE ---
Condition | Grip Modifier | Visibility Modifier
Clear | 0% | 0%
Sunset | 0% | 0%
Night | 0% | -10%
Rain | -4% | -5%
Fog | 0% | -10%
Snow | -5% | -5%
Sandstorm | -2% | -8%
Ash Haze | 0% | -6%
--- TABLE ---
Module | Purpose
start_straight | Safe start zone
straight | Normal running
gentle_curve | Light corner
medium_curve | Standard corner
tight_curve | Hard corner
hairpin | Very tight turn
chicane | Left-right sequence
narrow_gate | Reduced width
jump | Vertical event
boost_lane | Boost pickup zone
traffic_zone | Dense traffic area
finish_straight | Final approach
--- TABLE ---
Module | Length Range | Angle / Notes
Start Straight | 50–70m | No traffic or obstacles
Straight | 30–80m | Normal lanes
Gentle Curve | 40–70m | 30–60°
Medium Curve | 35–60m | 45–90°
Tight Curve | 30–50m | 60–120°
Hairpin | 25–45m | 150–180°
Chicane | 50–80m | Sequence of 2–3 direction changes
Narrow Gate | 30–60m | Reduced width
Jump | 20–40m | Ramp + landing zone
Boost Lane | 40–80m | Boost pickup likely
Traffic Zone | 60–120m | Increased traffic
Finish Straight | 50–70m | No traffic or obstacles
--- TABLE ---
Pool | Maximum Size
Traffic vehicles | 50
Obstacles | 60
Coins | 300
Boost pickups | 12
Diamond pickup | 1
Spark/skid effects | 30
Impact effects | 20
UI floating reward labels | 10
--- TABLE ---
Direction | Distance
Ahead of player | 300m
Behind player | 100m
--- TABLE ---
Stat | Increment
Top Speed | +2.5 km/h
Acceleration | +0.35 m/s²
Handling | +2.5%
Braking | +0.7 m/s²
Boost Power | +2.0 km/h
Boost Duration | +0.25s
Stability | +3%
--- TABLE ---
Action | Description
steer | Analog steering value from -1 to 1
brake | Optional brake input
boost | Boost activation
pause | Pause race
--- TABLE ---
Setting | Default
Auto-acceleration | ON
Manual brake | Optional
Steering sensitivity | Medium
Boost button | Right side
Pause button | Top corner
--- TABLE ---
Property | Value
Max Energy | 100
Start Energy | 40
Passive Recharge | 4/sec
Drift Recharge | 3/sec
Near Miss Reward | +6
Boost Pickup Reward | +35
Minimum Energy to Activate | 20
--- TABLE ---
Event | Damage
Light collision | 8
Heavy collision | 25
Traffic rear-end | 12
Barrier scrape | 5 per second
Jump landing failure | 10
Oil slick | 0
--- TABLE ---
Event | Penalty
Heavy collision | -15
Light collision | -5
Off-track time | -2/sec, max -30
Revive used | -20
--- TABLE ---
AI Property | Formula
Top Speed Multiplier | 0.88 + 0.18 * D
Acceleration Multiplier | 0.86 + 0.20 * D
Handling Multiplier | 0.90 + 0.15 * D
Aggression | 0.20 + 0.70 * D
Overtake Skill | 0.25 + 0.65 * D
Mistake Chance | max(0.03, 0.16 - 0.10 * D)
Boost Use Skill | 0.30 + 0.60 * D
--- TABLE ---
Property | Elite Bonus
Top Speed Multiplier | +0.02
Aggression | +0.05
Overtake Skill | +0.05
--- TABLE ---
Level Type | Diamond Pickup Chance
Standard | 5%
Sprint | 5%
Endurance | 8%
Elite | 100%
--- TABLE ---
State | Description
LOADING | Race scene and pools loading
READY | Cars on grid, waiting for countdown
COUNTDOWN | 3-2-1-GO
RACING | Active gameplay
PAUSED | Race paused
FINISHED | Player crossed finish line
WRECKED | Player wrecked and no active revive
RESULTS | Reward flow shown
--- TABLE ---
Effect | Value
AI top speed | -5%
Traffic count | -10%
Damage taken | -20%
--- TABLE ---
Position | Multiplier
1 | 2.20
2 | 1.80
3 | 1.50
4 | 1.25
5 | 1.10
6 | 1.00
--- TABLE ---
Coins | Probability
50 | 35%
80 | 30%
120 | 20%
180 | 10%
250 | 4%
500 | 1%
--- TABLE ---
Amount | Chance
1 | 99%
2 | 1%
--- TABLE ---
Coins | Probability
80 | 30%
120 | 30%
180 | 20%
250 | 12%
350 | 6%
500 | 2%
--- TABLE ---
Amount | Chance
1 | 99%
2 | 1%
--- TABLE ---
Coins | Probability
150 | 30%
220 | 25%
300 | 20%
380 | 15%
450 | 8%
500 | 2%
--- TABLE ---
Amount | Chance
1 | 99%
2 | 1%
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
Total Stars | Reward
30 | 1 Diamond
100 | 2 Diamonds
250 | 3 Diamonds
500 | 5 Diamonds
1000 | 8 Diamonds
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
Upgrade Level | Cost
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
Car | Player Level | Coin Cost
Rookie GT | Start | Free
Street King | 8 | 2,500
Turbo Viper | 18 | 7,500
Canyon Falcon | 32 | 18,000
Circuit Phantom | 55 | 45,000
Hyper Nova | 90 | 120,000
--- TABLE ---
Slot | Effect
revive | Continue race once
double_coins | Double rank and chest Coins
bonus_coins | Optional bonus Coins
--- TABLE ---
Slot | Cap
revive | 5
double_coins | 10
bonus_coins | 3
--- TABLE ---
Product ID | Diamonds
diamond_small | 80
diamond_medium | 400
diamond_large | 900
diamond_epic | 2000
remove_ads | 0
Cosmetic bundle IDs | variable
--- TABLE ---
Bus | Purpose
Master | Final mix
Music | Background music
SFX | Impacts, pickups, UI
Engine | Car engine loops
UI | Buttons, transitions
Ambient | Environment sound
--- TABLE ---
Device Class | Target
High-end | 60 FPS
Mid-range | 60 FPS
Low-end | 30 FPS stable
--- TABLE ---
Category | Budget
Textures | 256 MB
Meshes | 128 MB
Audio | 64 MB
Scenes/Nodes | 100 MB
Runtime systems | 200 MB
Total target | Under 1.2 GB
--- TABLE ---
Scene | Budget
Active race view | < 250 draw calls
Menus | < 120 draw calls
Garage | < 150 draw calls
--- TABLE ---
Scene | Budget
Visible track segment | < 250k triangles
Player car | < 25k triangles
AI car | < 20k triangles
Traffic car | < 12k triangles
--- TABLE ---
Layer | Name
1 | Track collision
2 | Player car
3 | AI car
4 | Traffic
5 | Obstacles
6 | Pickup areas
7 | Trigger zones
8 | UI raycast if needed
--- TABLE ---
Item | Requirement
Minimum API | 24 recommended
Target API | Latest stable Google Play requirement
Permissions | INTERNET, ACCESS_NETWORK_STATE, BILLING
Ads | AdMob or equivalent via plugin
IAP | Google Play Billing
--- TABLE ---
Item | Requirement
Minimum iOS | 13+ recommended
Ads | Google AdMob or equivalent iOS SDK
IAP | StoreKit
Orientation | Landscape locked
ATT | App Tracking Transparency flow where required
--- TABLE ---
Tool | Purpose
Level warp | Jump to specific level
Add Coins | Test economy
Add Diamonds | Test premium flow
Force race result | Test rewards/unlocks
Force chest tier | Test chest probabilities
Show FPS | Performance debug
Show draw calls | Rendering debug
Show level seed | Generation verification
Disable ads | QA without ads
Guarantee Diamond pickup | Test rare pickup flow
Toggle Assist | Test failure flow
--- TABLE ---
Target | Purpose
Debug | Development, debug tools enabled
Release Candidate | Full game, no debug tools
Store Release | Signed, optimized, privacy compliant
--- TABLE ---
System | Value
Engine | Godot 4.x
Language | GDScript
Renderer | Mobile
Orientation | Landscape
Physics unit | 1 meter
Level seed | Deterministic by level number
Track length source | Canonical expected top speed, not selected car
Expected speed factor | 0.66
Sample path interval | 3 meters
Active streaming window | 300m ahead, 100m behind
Traffic cap | 45
Obstacle cap | 40
Coin cap | 260
Boost pickup count | 2–8
Diamond pickup max | 1
AI baseline | Selected car + recommended upgrade level
Reward RNG | Separate from level seed
Save commit | Immediate after result/purchase
Ads | Abstracted, offline-safe
IAP | Abstracted, restore-safe
Debug tools | Required in development builds