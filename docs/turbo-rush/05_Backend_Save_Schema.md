> Turbo Rush specification series — extracted text of the original design document. Tables are flattened with | separators.

TURBO RUSH
Mobile 3D Arcade Racing Game — Complete Specification Series
Document 5 of 6 — Backend / Local Save Schema
Engine: Godot 4.x   •   Platform: Android + iOS   •   Offline-first
Extracted and formatted from the Turbo Rush specification conversation — 30 September 2026
1. Purpose
This document defines the complete local backend and save data architecture for Turbo Rush.
Because the game is offline-first, there is no mandatory game server. The “backend” is a set of local services and persistent data structures responsible for:
Player progression
Campaign state
Currencies
Upgrades
Car ownership
Cosmetics
Settings
Monetization entitlements
Ad frequency caps
Privacy consent
Save integrity
Backup and migration
All systems must work fully offline. Online services are optional and limited to:
Ads
IAP
Optional analytics
Optional privacy consent flows
2. Backend Philosophy
3. Local Backend Services
The local backend is implemented through the service layer defined in the TRD.
Only these services may mutate persistent data.
UI must not write directly to the save file.
4. Save File Locations
Recommended file paths:
Godot user:// maps to the platform-specific application data directory.
5. Save Format
Primary format:
JSON
Reasons:
Easy to inspect and debug.
Easy to migrate.
Compatible with Godot JSON parsing.
Suitable for small local save data.
Optional protection:
Checksum/hash validation.
Basic value obfuscation for currencies.
Optional encrypted file access if platform key storage is available.
The save system must not rely on server-side validation.
6. Root Save Structure
{
  "meta": {},
  "profile": {},
  "currencies": {},
  "campaign": {},
  "progression": {},
  "cosmetics": {},
  "settings": {},
  "monetization": {},
  "privacy": {},
  "stats": {},
  "integrity": {}
}
7. Meta Object
7.1 Schema
"meta": {
  "schema_version": 1,
  "game_version": "1.0.0",
  "save_id": "uuid-string",
  "created_at_unix": 0,
  "updated_at_unix": 0,
  "last_launch_unix": 0
}
7.2 Field Definitions
8. Profile Object
The profile stores high-level player identity and progression.
8.1 Schema
"profile": {
  "player_level": 0,
  "highest_completed_level": 0,
  "highest_unlocked_level": 1,
  "selected_level": 1,
  "selected_car_id": "rookie_gt",
  "onboarding_completed": false,
  "total_races_completed": 0,
  "total_races_failed": 0
}
8.2 Field Definitions
8.3 Rules
player_level must always equal highest_completed_level .
highest_unlocked_level must never exceed highest_completed_level + 1 unless replay or special unlock logic is used.
selected_level must be clamped to unlocked content on load.
9. Currencies Object
9.1 Schema
"currencies": {
  "coins": 0,
  "diamonds": 0
}
9.2 Field Definitions
9.3 Rules
Currencies must never go negative.
All currency mutations must go through EconomyService .
If a load value is negative, clamp to 0.
If a load value exceeds max, clamp to max and log warning.
10. Campaign Object
The campaign object stores level-by-level progression and global campaign totals.
10.1 Schema
"campaign": {
  "total_stars": 0,
  "star_milestones_claimed": [],
  "levels": {}
}
10.2 Field Definitions
11. Level Record Schema
Each level record is stored under campaign.levels using the level number as a string key.
Example:
"levels": {
  "1": {
    "best_position": 1,
    "best_stars": 3,
    "best_time_sec": 142.7,
    "first_clear_completed": true,
    "failure_count": 0
  },
  "2": {
    "best_position": 5,
    "best_stars": 1,
    "best_time_sec": 151.2,
    "first_clear_completed": true,
    "failure_count": 0
  }
}
11.1 Level Record Fields
11.2 Default Missing Level Values
If a level record does not exist, use:
{
  "best_position": 0,
  "best_stars": 0,
  "best_time_sec": 0.0,
  "first_clear_completed": false,
  "failure_count": 0
}
11.3 Level Record Rules
A lower best_position is better.
best_position = 0 means the level has not been completed.
failure_count increments when:
Player finishes 6th.
Player DNFs without revive.
failure_count resets to 0 when the player completes the level in position 1–5.
Assist is active when:
failure_count >= 2
12. Star Milestones
Canonical star milestone thresholds:
12.1 Save Field
"star_milestones_claimed": [30, 100]
Rules:
Store only claimed thresholds.
Grant once.
If total_stars exceeds multiple thresholds, grant all unclaimed milestones in order.
13. Progression Object
The progression object stores upgrades, cars, boost abilities, and seen unlock prompts.
13.1 Schema
"progression": {
  "upgrades": {
    "top_speed": 0,
    "acceleration": 0,
    "handling": 0,
    "braking": 0,
    "boost_power": 0,
    "boost_duration": 0,
    "stability": 0
  },
  "cars": {
    "owned": ["rookie_gt"],
    "selected": "rookie_gt"
  },
  "abilities": {
    "slipstream_boost": {
      "unlocked": false,
      "enabled": true
    },
    "clean_run_bonus": {
      "unlocked": false,
      "enabled": true
    },
    "perfect_landing_boost": {
      "unlocked": false,
      "enabled": true
    }
  },
  "seen_unlocks": []
}
14. Upgrade Save Rules
14.1 Upgrade Fields
14.2 Upgrade Rules
Upgrades are global garage upgrades and apply to all owned cars.
Upgrade level must be clamped to 0–10.
Upgrade purchase validation must check:
Current level < 10.
Player Level requirement.
Coin balance.
14.3 Required Player Level Table
15. Car Save Rules
15.1 Canonical Car IDs
15.2 Car Save Fields
15.3 Car Rules
rookie_gt must always be owned.
If selected car is missing from owned list, reset selected to rookie_gt .
Car availability is derived from player_level and catalog data.
Ownership is granted only after Coin purchase.
16. Boost Ability Save Rules
16.1 Canonical Ability IDs
16.2 Ability Fields
16.3 Ability Rules
Abilities are earned by progression, not purchased.
If player_level reaches unlock level and ability is not unlocked, set unlocked = true .
If an ability is unlocked but disabled by player, it must not affect race simulation.
If save is corrupted, default to unlocked false and enabled true.
17. Seen Unlock Prompts
Used to prevent repeated unlock popups.
"seen_unlocks": [
  "car_available_street_king",
  "environment_coastal_highway",
  "ability_slipstream_boost",
  "race_type_sprint"
]
Rules:
Store string IDs.
Add once when the player first sees the unlock popup.
Do not store temporary UI queue state here.
Cap array at 500 entries.
18. Cosmetics Object
18.1 Schema
"cosmetics": {
  "owned": [
    "wheel_stock",
    "paint_red",
    "material_basic"
  ],
  "equipped": {
    "wheel": "wheel_stock",
    "paint": "paint_red",
    "material": "material_basic",
    "decal": "none",
    "underglow": "none",
    "skin": "none"
  }
}
18.2 Cosmetic Slots
18.3 Default Cosmetic IDs
These defaults are required so the starter car is always valid.
18.4 Cosmetic Rules
Cosmetics are performance-neutral.
Owned cosmetics must be validated against catalog.
Unknown owned cosmetic IDs should be kept but not equipped.
Equipped items must be owned or be "none" .
If equipped item is invalid, reset slot to default.
19. Settings Object
19.1 Schema
"settings": {
  "audio": {
    "master_volume": 1.0,
    "music_volume": 1.0,
    "sfx_volume": 1.0,
    "engine_volume": 1.0
  },
  "controls": {
    "steering_sensitivity": 0.5,
    "auto_acceleration": true,
    "manual_brake_enabled": false,
    "boost_tap_mode": false,
    "large_controls": false
  },
  "graphics": {
    "quality": "medium",
    "target_fps": 60,
    "reduce_motion": false
  },
  "haptics_enabled": true,
  "language": "en"
}
19.2 Field Validation
19.3 Settings Rules
Settings must load before UI initialization.
Invalid settings values reset to defaults individually.
Settings changes save immediately.
20. Monetization Object
20.1 Schema
"monetization": {
  "remove_ads": false,
  "ads": {
    "daily": {
      "date": "1970-01-01",
      "revive_count": 0,
      "double_coins_count": 0,
      "bonus_coins_count": 0
    },
    "interstitial": {
      "first_launch_unix": 0,
      "last_shown_unix": 0
    }
  },
  "iap": {
    "owned_products": [],
    "pending_purchase_grants": [],
    "transactions": [],
    "last_restore_unix": 0
  }
}
21. Rewarded Ad Daily Caps
21.1 Canonical Caps
21.2 Save Fields
21.3 Daily Reset Rule
On app launch or ad request:
if current_local_date != saved_date:
    reset daily counts
    saved_date = current_local_date
Optional anti-clock-tamper rule:
if current_unix < last_seen_unix - 3600:
    reset daily counts
22. Interstitial Save Rules
22.1 Fields
22.2 Canonical Rules
No interstitial during first 10 minutes after first launch.
Minimum 5 minutes between interstitials.
No interstitial during race.
No interstitial immediately after failure.
Remove Ads disables interstitials.
Runtime check:
func can_show_interstitial() -> bool:
    if remove_ads:
        return false
    if now_unix - first_launch_unix < 600:
        return false
    if now_unix - last_shown_unix < 300:
        return false
    return true
23. IAP Save Rules
23.1 Canonical Product IDs
23.2 Owned Products
"owned_products": ["remove_ads"]
Rules:
Store only permanent entitlements.
Consumable Diamond packs are not stored as owned products after grant.
remove_ads must also set monetization.remove_ads = true .
23.3 Pending Purchase Grants
Used to ensure purchases are not lost if app closes during grant.
"pending_purchase_grants": [
  {
    "transaction_id": "local-or-store-id",
    "product_id": "diamond_small",
    "quantity": 80,
    "created_unix": 0,
    "status": "pending"
  }
]
Rules:
Add pending grant before attempting to grant.
Remove after successful grant.
Cap pending list at 20 entries.
On launch, retry any pending grants.
23.4 Transaction History
Optional capped local history.
"transactions": [
  {
    "transaction_id": "id",
    "product_id": "diamond_small",
    "quantity": 80,
    "status": "granted",
    "unix": 0
  }
]
Rules:
Cap at 50 entries.
Do not store sensitive receipt data unless required by store plugin.
Do not store personal data.
24. Privacy Object
24.1 Schema
"privacy": {
  "consent_version": 1,
  "consent_status": "unknown",
  "personalized_ads": false,
  "analytics_allowed": false,
  "att_status": "not_required",
  "consent_timestamp_unix": 0
}
24.2 Field Definitions
24.3 Privacy Rules
Save must not store advertising IDs or personal identifiers.
If consent is unknown, ads must initialize in safest available mode.
If consent is rejected, personalized ads must be disabled.
Privacy settings must be editable in Settings.
25. Stats Object
Stats are optional but recommended for balancing and support.
25.1 Schema
"stats": {
  "races_started": 0,
  "races_completed": 0,
  "races_won": 0,
  "races_top3": 0,
  "races_wrecked": 0,
  "revives_used": 0,
  "diamond_pickups_collected": 0,
  "chests_opened": 0,
  "coins_earned_lifetime": 0,
  "diamonds_earned_lifetime": 0,
  "coins_spent_lifetime": 0,
  "diamonds_spent_lifetime": 0,
  "ads_revive_used": 0,
  "ads_double_coins_used": 0,
  "ads_bonus_coins_used": 0
}
25.2 Rules
Stats are cumulative counters.
Stats must not affect gameplay.
Stats may be reset if save is reset.
Counters must be clamped to non-negative integers.
26. Integrity Object
26.1 Schema
"integrity": {
  "checksum": "",
  "checksum_version": 1,
  "debug_save": false
}
26.2 Field Definitions
26.3 Checksum Rule
The checksum should be computed from the save payload excluding the checksum field itself.
Recommended approach:
Remove integrity.checksum .
Sort keys deterministically.
Serialize to compact JSON.
Append a private salt from GameConfig .
Compute SHA-256.
Store hex string in integrity.checksum .
This is not server-grade anti-cheat. It is intended to deter casual editing and detect corruption.
27. Economy Ledger
An optional local economy ledger helps debugging and support.
27.1 Schema
"economy_ledger": [
  {
    "id": "entry-uuid",
    "unix": 0,
    "currency": "coins",
    "amount": 120,
    "balance_after": 120,
    "reason": "race_rank",
    "reference": "level:1"
  }
]
27.2 Rules
Store latest 100 entries only.
Do not store personal data.
Ledger is optional in release builds if storage is a concern.
If ledger exists, currency mutations should append entries.
27.3 Canonical Reason Values
28. Default Save Example
This is the canonical starting save for a new player.
{
  "meta": {
    "schema_version": 1,
    "game_version": "1.0.0",
    "save_id": "REPLACE_WITH_UUID",
    "created_at_unix": 0,
    "updated_at_unix": 0,
    "last_launch_unix": 0
  },
  "profile": {
    "player_level": 0,
    "highest_completed_level": 0,
    "highest_unlocked_level": 1,
    "selected_level": 1,
    "selected_car_id": "rookie_gt",
    "onboarding_completed": false,
    "total_races_completed": 0,
    "total_races_failed": 0
  },
  "currencies": {
    "coins": 0,
    "diamonds": 0
  },
  "campaign": {
    "total_stars": 0,
    "star_milestones_claimed": [],
    "levels": {}
  },
  "progression": {
    "upgrades": {
      "top_speed": 0,
      "acceleration": 0,
      "handling": 0,
      "braking": 0,
      "boost_power": 0,
      "boost_duration": 0,
      "stability": 0
    },
    "cars": {
      "owned": ["rookie_gt"],
      "selected": "rookie_gt"
    },
    "abilities": {
      "slipstream_boost": {
        "unlocked": false,
        "enabled": true
      },
      "clean_run_bonus": {
        "unlocked": false,
        "enabled": true
      },
      "perfect_landing_boost": {
        "unlocked": false,
        "enabled": true
      }
    },
    "seen_unlocks": []
  },
  "cosmetics": {
    "owned": [
      "wheel_stock",
      "paint_red",
      "material_basic",
      "decal_none",
      "underglow_none",
      "skin_none"
    ],
    "equipped": {
      "wheel": "wheel_stock",
      "paint": "paint_red",
      "material": "material_basic",
      "decal": "none",
      "underglow": "none",
      "skin": "none"
    }
  },
  "settings": {
    "audio": {
      "master_volume": 1.0,
      "music_volume": 1.0,
      "sfx_volume": 1.0,
      "engine_volume": 1.0
    },
    "controls": {
      "steering_sensitivity": 0.5,
      "auto_acceleration": true,
      "manual_brake_enabled": false,
      "boost_tap_mode": false,
      "large_controls": false
    },
    "graphics": {
      "quality": "medium",
      "target_fps": 60,
      "reduce_motion": false
    },
    "haptics_enabled": true,
    "language": "en"
  },
  "monetization": {
    "remove_ads": false,
    "ads": {
      "daily": {
        "date": "1970-01-01",
        "revive_count": 0,
        "double_coins_count": 0,
        "bonus_coins_count": 0
      },
      "interstitial": {
        "first_launch_unix": 0,
        "last_shown_unix": 0
      }
    },
    "iap": {
      "owned_products": [],
      "pending_purchase_grants": [],
      "transactions": [],
      "last_restore_unix": 0
    }
  },
  "privacy": {
    "consent_version": 1,
    "consent_status": "unknown",
    "personalized_ads": false,
    "analytics_allowed": false,
    "att_status": "not_required",
    "consent_timestamp_unix": 0
  },
  "stats": {
    "races_started": 0,
    "races_completed": 0,
    "races_won": 0,
    "races_top3": 0,
    "races_wrecked": 0,
    "revives_used": 0,
    "diamond_pickups_collected": 0,
    "chests_opened": 0,
    "coins_earned_lifetime": 0,
    "diamonds_earned_lifetime": 0,
    "coins_spent_lifetime": 0,
    "diamonds_spent_lifetime": 0,
    "ads_revive_used": 0,
    "ads_double_coins_used": 0,
    "ads_bonus_coins_used": 0
  },
  "integrity": {
    "checksum": "",
    "checksum_version": 1,
    "debug_save": false
  }
}
29. Save Write Flow
29.1 Required Write Sequence
Mutate in-memory save object through a service.
Update meta.updated_at_unix .
Recompute total_stars if stars changed.
Recompute derived flags if needed.
Remove invalid or temporary fields.
Compute checksum.
Serialize to temporary file:
user://save/turbo_rush_save.tmp
If write succeeds:
Copy current primary save to backup.
Rename temporary file to primary save.
Emit save_completed event.
29.2 Write Rules
Never write directly over the primary file without temporary file.
Never write while race simulation is active unless handling a critical pause/save event.
Save after every meaningful persistent change.
Avoid saving more than once per second unless critical.
30. Save Load Flow
30.1 Required Load Sequence
Check primary save.
If missing, check backup.
If both missing, create default save.
Parse JSON.
Validate schema version.
Run migration if needed.
Validate fields.
Clamp invalid values.
Recompute derived values.
Verify checksum.
If checksum invalid, mark save as suspect and show recovery flow.
Emit save_loaded .
30.2 Load Rules
Do not crash on corrupted save.
Do not silently delete a corrupted primary save without attempting backup.
If backup is valid, restore it.
If both corrupted, show explicit reset confirmation.
31. Validation and Clamping Rules
31.1 Global Rules
31.2 Critical Field Validation Table
32. Reward Commit Rules
Reward commits must be atomic at the service level.
32.1 Race Reward Commit Sequence
Receive RaceResult .
Validate completion.
Calculate rewards.
Update level record.
Update total stars.
Grant first-clear rewards if applicable.
Grant star milestones if applicable.
Grant Coins and Diamonds.
Unlock next level if position <= 5.
Write save.
Emit reward_committed .
32.2 Important Rule
The UI may animate rewards only after the reward bundle has been committed.
This prevents:
Duplicate rewards.
Lost rewards.
Inconsistent unlock state.
Currency display mismatch.
33. Purchase Commit Rules
33.1 IAP Grant Sequence
Store pending purchase grant.
Attempt store purchase.
On success:
Validate product.
Grant Diamonds or entitlement.
Add transaction record.
Remove pending grant.
Write save.
On failure:
Keep pending grant if store says purchase succeeded but grant failed.
Otherwise remove pending grant.
Show error.
33.2 Restore Rules
On restore:
Reapply permanent entitlements.
Do not re-grant consumable Diamond packs unless pending grant exists.
Set remove_ads if owned.
Update last_restore_unix .
34. Ad Cap Enforcement
34.1 Rewarded Ad Check
func can_show_rewarded(slot: String) -> bool:
    reset_daily_if_needed()
    match slot:
        "revive":
            return daily.revive_count < 5
        "double_coins":
            return daily.double_coins_count < 10
        "bonus_coins":
            return daily.bonus_coins_count < 3
    return false
34.2 After Successful Rewarded Ad
Increment the relevant counter before granting reward.
daily.revive_count += 1
Then:
SaveSystem.save_game()
Then grant reward.
35. Time and Daily Reset Rules
35.1 Time Source
Use device local time for:
Daily ad caps.
UI date display.
Consent timestamp display.
Use Unix timestamps for:
Interstitial frequency.
First-session ad delay.
Transaction records.
35.2 Clock Tampering Mitigation
Recommended lightweight rules:
If current Unix time is earlier than last_launch_unix by more than 1 hour, reset daily ad counts.
Do not punish the player with data loss.
Do not attempt aggressive anti-cheat based only on clock changes.
36. Migration System
36.1 Migration Rule
If:
save.meta.schema_version < CURRENT_SCHEMA_VERSION
Run migration.
36.2 Migration Structure
func migrate(save: Dictionary) -> Dictionary:
    var version = save["meta"]["schema_version"]
    if version == 1:
        save = migrate_v1_to_v2(save)
        version = 2
    # future migrations here
    save["meta"]["schema_version"] = CURRENT_SCHEMA_VERSION
    return save
36.3 Migration Requirements
Never assume fields exist.
Add missing fields with defaults.
Preserve player progression.
Log migration events locally.
Create backup before migration.
37. Backup and Recovery
37.1 Backup Policy
Maintain one backup file:
turbo_rush_save.backup.json
Backup is updated:
Before primary save overwrite.
Before migration.
After successful recovery.
37.2 Recovery Flow
If primary save fails checksum or parsing:
Try backup.
If backup valid:
Restore backup.
Notify player: “Backup save loaded.”
If backup invalid:
Show recovery screen.
Offer “Reset Progress”.
Require explicit confirmation.
38. Debug Save Rules
Debug builds may modify save data.
Debug tools may:
Add Coins.
Add Diamonds.
Unlock levels.
Force upgrades.
Toggle ads.
When debug tools modify save:
"integrity": {
  "debug_save": true
}
Rules:
Debug flags must not exist in release builds.
Debug-modified saves should be excluded from analytics if possible.
Debug changes must still pass validation.
39. Optional Analytics Queue
If analytics are enabled and the app is offline, events may be queued locally.
39.1 Queue File
user://save/analytics_queue.json
39.2 Queue Schema
{
  "events": [
    {
      "name": "level_finish",
      "timestamp": 0,
      "properties": {
        "level": 12,
        "position": 2,
        "stars": 2
      }
    }
  ]
}
39.3 Rules
Cap queue at 200 events.
Discard oldest events when full.
Do not store personal identifiers.
If analytics consent is denied, do not queue events.
40. Security and Anti-Tamper Policy
Turbo Rush is offline, so complete anti-cheat is impossible. The goal is:
Prevent accidental corruption.
Deter casual editing.
Maintain fair experience.
Avoid punishing legitimate players.
40.1 Required Protections
40.2 Prohibited Practices
Do not store passwords.
Do not store emails.
Do not store device advertising IDs in save.
Do not store full receipts in plain text unless required by plugin.
Do not delete progress silently.
41. Save Data Relationship Diagram Recommendation
SAVE-V1 — Save Data Relationship Diagram
Where it belongs: Document 5, Section 6 Purpose: Show how root save objects relate to each other.
The diagram should show:
meta
profile
currencies
campaign
progression
cosmetics
settings
monetization
privacy
stats
integrity
It should also show:
profile.selected_car_id references progression.cars.selected .
progression.upgrades affects runtime car stats.
campaign.levels updates profile.player_level .
campaign.total_stars updates star milestones.
monetization.remove_ads affects ad runtime behavior.
42. Save Write/Load Flow Diagram Recommendation
SAVE-V2 — Save Write and Load Flow
Where it belongs: Document 5, Sections 29–30 Purpose: Show atomic write and recovery behavior.
Diagram should include:
In-memory mutation
Checksum
Temp file write
Backup
Rename
Load primary
Load backup
Corruption recovery
Migration
43. Economy Transaction Flow Diagram Recommendation
SAVE-V3 — Economy Transaction Flow
Where it belongs: Document 5, Section 32 Purpose: Show how rewards and purchases become persistent grants.
Diagram should show:
Race result
Reward calculation
First clear check
Star milestone check
Currency grant
Save commit
UI animation
And separately:
IAP purchase
Pending grant
Grant
Transaction record
Save commit
44. Testing Requirements
44.1 Save Tests
Test:
New save creation.
Save/load roundtrip.
Missing field recovery.
Wrong type recovery.
Corrupt JSON recovery.
Backup recovery.
Checksum failure handling.
Migration from older schema.
Atomic write interruption.
Currency clamping.
Invalid equipped cosmetic recovery.
Invalid selected car recovery.
44.2 Economy Tests
Test:
Race reward grant once.
First clear grant once.
Star milestone grant once.
Diamond pickup grant once per completed race.
Rewarded ad double only affects rank and chest Coins.
Rewarded ad caps reset daily.
IAP pending grant recovery.
Remove Ads persistence.
Restore purchases flow.
44.3 Progression Tests
Test:
Top 5 finish unlocks next level.
6th finish increments failure count.
Assist activates after two failures.
Assist resets after win.
Player Level updates correctly.
Upgrade requirements enforce correctly.
Car unlock requirements enforce correctly.
Boost abilities unlock at correct levels.
45. Acceptance Criteria
This document is implementation-ready when:
A developer can create the full local save schema without guessing fields.
Save loading, writing, backup, and recovery are clearly defined.
Economy and progression mutations are protected against duplication.
Monetization entitlements are stored safely and offline gracefully.
The save system respects offline-first behavior.
No server dependency is required for core gameplay.
The schema is consistent with PRD, TRD, App Flow, and UI/UX documents.
46. Canonical Save Values Carried Forward
End of Document 5 — Backend / Local Save Schema.
--- TABLE ---
Version: | 1.0
--- TABLE ---
Platform: | Android + iOS
--- TABLE ---
Engine: | Godot 4.x
--- TABLE ---
Mode: | Offline-first
--- TABLE ---
Dependency: | Implements rules from Document 1: PRD, Document 2: TRD, Document 3: App Flow, and Document 4: UI/UX Design Brief.
--- TABLE ---
Rule | Requirement
Offline-first | All core gameplay and progression must function without internet
Local save | Player data is stored locally on the device
No mandatory account | No login, user account, or server profile is required
No server authority | Game logic and rewards are resolved locally
Safe monetization | Ads and IAP are abstracted and degrade gracefully offline
Save integrity | Checksums, backups, validation, and migration are required
No PII in save | Save data must not contain personally identifiable information
Idempotent grants | Rewards and purchases must not be duplicated accidentally
--- TABLE ---
Service | Responsibility
SaveSystem | Loads, validates, writes, backs up, and migrates save data
EconomyService | Grants and spends Coins/Diamonds
ProgressionService | Updates level unlocks, player level, upgrades, cars, abilities
RewardService | Calculates race rewards and writes reward result
AdsManager | Stores and enforces ad caps and consent state
IAPManager | Stores entitlements and pending purchase grants
AnalyticsService | Optional local queue for non-blocking analytics
--- TABLE ---
File | Purpose
user://save/turbo_rush_save.json | Primary save file
user://save/turbo_rush_save.backup.json | Last known good backup
user://save/turbo_rush_save.tmp | Temporary write file
user://save/analytics_queue.json | Optional offline analytics queue
user://save/corrupt_save.log | Optional corruption diagnostics log
--- TABLE ---
Field | Type | Default | Validation | Purpose
schema_version | int | 1 | >= 1 | Used for migration
game_version | string | "1.0.0" | non-empty | Last game version that wrote save
save_id | string | generated UUID | non-empty | Unique local save identifier
created_at_unix | int | current time | >= 0 | Creation timestamp
updated_at_unix | int | current time | >= created_at | Last write timestamp
last_launch_unix | int | current time | >= 0 | Last app launch timestamp
--- TABLE ---
Field | Type | Default | Validation | Purpose
player_level | int | 0 | 0–1,000,000 | Highest completed level
highest_completed_level | int | 0 | 0–1,000,000 | Same source as player level
highest_unlocked_level | int | 1 | 1–1,000,001 | Next level available to play
selected_level | int | 1 | 1–highest_unlocked_level | Level selected in UI
selected_car_id | string | "rookie_gt" | owned car ID | Currently selected car
onboarding_completed | bool | false | bool | Tutorial completion flag
total_races_completed | int | 0 | >= 0 | Lifetime completed races
total_races_failed | int | 0 | >= 0 | Lifetime failed races
--- TABLE ---
Field | Type | Default | Min | Max | Purpose
coins | int | 0 | 0 | 99,999,999 | Common currency
diamonds | int | 0 | 0 | 9,999,999 | Rare premium currency
--- TABLE ---
Field | Type | Default | Validation | Purpose
total_stars | int | 0 | >= 0 | Sum of best stars across levels
star_milestones_claimed | int[] | [] | valid thresholds | Prevents duplicate milestone rewards
levels | object map | {} | valid level records | Stores per-level progression
--- TABLE ---
Field | Type | Default | Validation | Purpose
best_position | int | 0 | 0–6 | Best finish position, 0 = none
best_stars | int | 0 | 0–3 | Best star rating
best_time_sec | float | 0.0 | >= 0 | Best completion time
first_clear_completed | bool | false | bool | First-time completion flag
failure_count | int | 0 | >= 0 | Used for Assist Mode
--- TABLE ---
Threshold | Reward
30 | 1 Diamond
100 | 2 Diamonds
250 | 3 Diamonds
500 | 5 Diamonds
1000 | 8 Diamonds
--- TABLE ---
Stat Key | Type | Default | Min | Max
top_speed | int | 0 | 0 | 10
acceleration | int | 0 | 0 | 10
handling | int | 0 | 0 | 10
braking | int | 0 | 0 | 10
boost_power | int | 0 | 0 | 10
boost_duration | int | 0 | 0 | 10
stability | int | 0 | 0 | 10
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
Car ID | Name
rookie_gt | Rookie GT
street_king | Street King
turbo_viper | Turbo Viper
canyon_falcon | Canyon Falcon
circuit_phantom | Circuit Phantom
hyper_nova | Hyper Nova
--- TABLE ---
Field | Type | Default | Validation
cars.owned | string[] | ["rookie_gt"] | valid car IDs, no duplicates
cars.selected | string | "rookie_gt" | must exist in owned
--- TABLE ---
Ability ID | Unlock Level
slipstream_boost | 35
clean_run_bonus | 38
perfect_landing_boost | 68
--- TABLE ---
Field | Type | Default | Purpose
unlocked | bool | false | Ability is available
enabled | bool | true | Ability is active in race
--- TABLE ---
Slot Key | Example Items
wheel | Stock wheels, sport wheels, neon wheels
paint | Basic colors, special paints
material | Basic, metallic, matte, chrome, animated
decal | Stripes, flames, racing numbers
underglow | None, cyan, orange, violet
skin | None, legendary skins
--- TABLE ---
ID | Slot | Default Owned
wheel_stock | wheel | Yes
paint_red | paint | Yes
material_basic | material | Yes
decal_none | decal | Yes
underglow_none | underglow | Yes
skin_none | skin | Yes
--- TABLE ---
Field | Type | Range / Allowed Values
master_volume | float | 0.0–1.0
music_volume | float | 0.0–1.0
sfx_volume | float | 0.0–1.0
engine_volume | float | 0.0–1.0
steering_sensitivity | float | 0.0–1.0
auto_acceleration | bool | true/false
manual_brake_enabled | bool | true/false
boost_tap_mode | bool | true/false
large_controls | bool | true/false
quality | string | "low", "medium", "high"
target_fps | int | 30 or 60
reduce_motion | bool | true/false
haptics_enabled | bool | true/false
language | string | ISO-like language code
--- TABLE ---
Ad Slot | Daily Cap
revive | 5
double_coins | 10
bonus_coins | 3
--- TABLE ---
Field | Type | Default | Validation
daily.date | string | "1970-01-01" | local date YYYY-MM-DD
daily.revive_count | int | 0 | 0–5
daily.double_coins_count | int | 0 | 0–10
daily.bonus_coins_count | int | 0 | 0–3
--- TABLE ---
Field | Type | Purpose
first_launch_unix | int | Used to enforce first-session ad delay
last_shown_unix | int | Used to enforce 5-minute frequency cap
--- TABLE ---
Product ID | Type
diamond_small | Diamond pack
diamond_medium | Diamond pack
diamond_large | Diamond pack
diamond_epic | Diamond pack
remove_ads | Entitlement
Cosmetic bundle IDs | Cosmetic entitlement
--- TABLE ---
Field | Type | Allowed Values | Purpose
consent_version | int | >= 1 | Consent policy version
consent_status | string | unknown, allowed_personalized, limited, rejected | User consent state
personalized_ads | bool | true/false | Whether personalized ads may be requested
analytics_allowed | bool | true/false | Optional analytics permission
att_status | string | not_required, not_determined, authorized, denied | iOS ATT status
consent_timestamp_unix | int | >= 0 | When consent was last updated
--- TABLE ---
Field | Type | Purpose
checksum | SHA-256 hex string | Tamper-deterrent validation
checksum_version | int | Allows checksum algorithm migration
debug_save | bool | Marks save created or modified by debug tools
--- TABLE ---
Reason | Currency
race_rank | Coins
race_chest | Coins/Diamonds
race_bonus | Coins/Diamonds
track_coins | Coins
first_clear | Coins/Diamonds
star_milestone | Diamonds
diamond_pickup | Diamonds
ad_bonus | Coins
iap_purchase | Diamonds
upgrade_spend | Coins
car_purchase | Coins
cosmetic_purchase | Coins/Diamonds
diamond_continue | Diamonds
--- TABLE ---
Rule | Action
Missing field | Add default
Wrong type | Replace with default
Negative currency | Clamp to 0
Upgrade > 10 | Clamp to 10
Invalid car selected | Select rookie_gt
Equipped cosmetic not owned | Unequip to default
Invalid level record | Reset record
Invalid enum string | Replace with default enum
Unknown cosmetic ID | Keep in owned, do not equip
Excessive currency | Clamp to max
--- TABLE ---
Path | Validation
meta.schema_version | int >= 1
profile.player_level | int 0–1,000,000
profile.highest_unlocked_level | int >= 1
profile.selected_level | int between 1 and highest_unlocked_level
currencies.coins | int 0–99,999,999
currencies.diamonds | int 0–9,999,999
campaign.total_stars | int >= 0
campaign.levels.*.best_position | int 0–6
campaign.levels.*.best_stars | int 0–3
campaign.levels.*.failure_count | int >= 0
progression.upgrades.* | int 0–10
progression.cars.selected | must exist in owned
cosmetics.equipped.* | owned or "none"
settings.audio.*_volume | float 0.0–1.0
monetization.ads.daily.*_count | int within cap
privacy.consent_status | valid enum
--- TABLE ---
Protection | Requirement
Checksum | Required
Backup | Required
Validation | Required
Currency clamp | Required
Debug flag | Required in dev builds
Encryption | Optional
Server validation | Not required
--- TABLE ---
System | Canonical Value
Save format | JSON
Primary save | user://save/turbo_rush_save.json
Backup save | user://save/turbo_rush_save.backup.json
Schema version | 1
Max Coins | 99,999,999
Max Diamonds | 9,999,999
Upgrade max | 10
Level failure Assist trigger | 2 failures
Next level unlock | Finish position <= 5
Daily revive ad cap | 5
Daily double coin ad cap | 10
Daily bonus coin ad cap | 3
Interstitial first-session delay | 10 minutes
Interstitial frequency cap | 5 minutes
Remove Ads effect | Removes banners and interstitials
Rewarded ads | Remain optional after Remove Ads
Star milestones | 30, 100, 250, 500, 1000
Car IDs | rookie_gt, street_king, turbo_viper, canyon_falcon, circuit_phantom, hyper_nova
Default cosmetics | wheel_stock, paint_red, material_basic, decal_none, underglow_none, skin_none
Checksum | SHA-256 based, tamper-deterrent only
Server requirement | None for core game