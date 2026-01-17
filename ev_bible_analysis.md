# EV Nova Bible Analysis - Phase 2

This document provides a comprehensive analysis of the EV Nova Bible (`ev_bible.md`), documenting all game mechanics, statistics, and specifications found within.

---

## Table of Contents
1. [Game Constants and Limits](#game-constants-and-limits)
2. [Ship Statistics and Specifications](#ship-statistics-and-specifications)
3. [Weapon Specifications](#weapon-specifications)
4. [Outfit/Upgrade Specifications](#outfitupgrade-specifications)
5. [Mission Types and Structures](#mission-types-and-structures)
6. [Faction/Government Relationships](#factiongovernment-relationships)
7. [Economic Systems](#economic-systems)
8. [Planet/Station Information](#planetstation-information)
9. [Star System Mechanics](#star-system-mechanics)
10. [AI and Dude System](#ai-and-dude-system)
11. [Combat System](#combat-system)
12. [Control Bit System](#control-bit-system)
13. [Sprite and Animation System](#sprite-and-animation-system)
14. [Recommendations for Space-Armada Implementation](#recommendations-for-space-armada-implementation)

---

## Game Constants and Limits

Direct quote from source:

```
Max Ships In System         64
Max Stellar Objects         2048
Max Systems                 2048
Max Ship Classes            768
Max Stellar Classes         256
Jump Distance               1000 pixels
Max Weapon Types            256
Max Outfit Item Types       512
Max Beams On Screen         64
Max Dude Types              512
Max Ships Per Dude          16
Max Govts                   256
Max Explosions On Screen    32
Max Explosion Types         64
Max Missions                1000
Num Mission Bits            10000
Max Cargo Types             256
Max Person Types            1024
Max Shots On Screen         128
Max Asteroids               16
Max Asteroid Types          16
Max Nebulae                 32
Max Images Per Nebula       7
Max Simultaneous Missions   16
Max Disasters               256
Max Fleets                  256
Max Ranks                   128
Max Junk Types              128
```

---

## Ship Statistics and Specifications

### Core Ship Fields

| Field | Description | Example Values |
|-------|-------------|----------------|
| **Holds** | Cargo capacity in tons | Negative value = no mass expansions allowed (e.g., -100 = 100 tons, no expansions) |
| **Shield** | Shield strength points | Variable |
| **Accel** | Acceleration magnitude | 300 = average |
| **Speed** | Top speed | 300 = average |
| **Maneuver** | Turn rate | 10 = 30 degrees/sec |
| **Fuel** | Fuel capacity | 100 = 1 jump |
| **FreeMass** | Space for additional items/upgrades | In tons, in addition to stock weapons |
| **Armor** | Armor strength points | Variable |
| **ShieldRech** | Shield recharge speed | 1000 = 1 point/frame = 30 pts/sec |
| **ArmorRech** | Armor recharge speed | 1000 = 1 point/frame = 30 pts/sec |
| **Crew** | Number of crew members | 0 = can't be boarded or capture |
| **Strength** | Relative combat strength | Used for combat odds calculation |
| **Mass** | Ship mass in tons | 1-99: 1 day/jump, 100-199: 2 days/jump, 200+: 3 days/jump |
| **Length** | Ship length in meters | Display only |
| **MaxGun** | Maximum fixed guns | Limits weapon slots |
| **MaxTur** | Maximum turrets | Limits turret slots |
| **TechLevel** | Tech level for availability | Available at spaceports >= this level |
| **Cost** | Ship purchase price | Trade-up cost = new ship - 25% of current ship |
| **DeathDelay** | Frames before final explosion | 0-59: single fireball, 60+: huge explosion proportional to mass |

### Ship AI Types (InherentAI)

| AI Type | Name | Behavior |
|---------|------|----------|
| 1 | Wimpy Trader | Visits planets, runs away when attacked |
| 2 | Brave Trader | Visits planets, fights back but runs when attacker out of range |
| 3 | Warship | Seeks out and attacks enemies, jumps out if none |
| 4 | Interceptor | Seeks enemies or parks in orbit, scans for illegal cargo, acts as piracy police |

### Ship Flags (0x0001 - 0x8000)

| Flag | Effect |
|------|--------|
| 0x0001 | Slow jumping (75% normal speed) |
| 0x0002 | Semi-fast jumping (125%) |
| 0x0004 | Fast jumping (150%) |
| 0x0008 | Player uses FuelRegen property |
| 0x0010 | Disabled at 10% armor instead of 33% |
| 0x0020 | Afterburner with advanced combat rating |
| 0x0040 | Always has afterburner (AI only) |
| 0x0100 | Show % armor instead of "Shields Down" |
| 0x0200 | Don't show armor/shield on status |
| 0x0400 | Planet-type ship (only hit by planet weapons) |
| 0x1000 | Turrets have front blind spot |
| 0x2000 | Turrets have side blind spot |
| 0x4000 | Turrets have rear blind spot |
| 0x8000 | Escape ship type (player ejects in this) |

### Ship Flags2 (Behavior Flags)

| Flag | Effect |
|------|--------|
| 0x0001 | Swarming behavior |
| 0x0002 | Prefers standoff attacks |
| 0x0004 | Can't be targeted |
| 0x0008 | Can be fired on by point defense |
| 0x0010 | Don't use fighter voices |
| 0x0020 | Can jump without slowing down |
| 0x0040 | Ship is inertialess |
| 0x0080 | AI runs away/docks if out of ammo |
| 0x0100 | AI cloaks during burst reload |
| 0x0200 | AI cloaks when running away |
| 0x0400 | AI cloaks when hyperspacing |
| 0x0800 | AI cloaks when just flying around |
| 0x1000 | AI won't uncloak until close to target |
| 0x2000 | AI cloaks when docking |
| 0x4000 | AI cloaks when preemptively attacked |

### Ship Ionization System

| Field | Description |
|-------|-------------|
| **Deionize** | Rate of ion charge dissipation (100 = 1 point per 1/30th sec) |
| **IonizeMax** | Amount at which ship is "fully ionized" |

### Stock Weapons

Ships can have up to 8 weapon types with:
- **WeapType (x8)**: ID numbers of weapon types (128-191, or -1/0 for none)
- **WeapCount (x8)**: Number of each weapon
- **AmmoLoad (x8)**: Standard ammo load for ammo-using weapons

### Default Items

Ships can have up to 16 default outfit items:
- **DefaultItems (x8)**: First set of default items
- **DefaultItms2 (x8)**: Second set of default items
- **ItemCount (x8)**: Quantity of each default item

---

## Weapon Specifications

### Core Weapon Fields

| Field | Description | Values |
|-------|-------------|--------|
| **Reload** | Frames between shots | 30 = 1 shot/sec |
| **Count** | Frames of shot lifetime | 30 = 1 second |
| **MassDmg** | Armor damage | Damages armor only |
| **EnergyDmg** | Shield damage | Damages shields only |
| **Speed** | Projectile speed | pixels/frame x 100 |
| **Inaccuracy** | Launch spread | Degrees of random spread |
| **Impact** | Knockback force | Inversely proportional to target mass (e.g., missile = 30) |
| **ProxRadius** | Proximity fuse radius | 0 = direct hit required |
| **BlastRadius** | Explosion effect radius | 0 = no blast effect |
| **Sound** | Firing sound | 0-63 = snd ID 200-263, -1 = silent |

### Guidance Types

| Value | Type | Behavior |
|-------|------|----------|
| -1 | Unguided projectile | Flies straight |
| 0 | Beam weapon | Instant hit, continuous |
| 1 | Homing weapon | Tracks target |
| 3 | Turreted beam | Tracks like turret |
| 4 | Turreted unguided | Turret fires unguided |
| 5 | Freefall bomb | 80% ship velocity, weathervanes |
| 6 | Freeflight rocket | Straight, accelerates |
| 7 | Front-quadrant turret | +/-45 deg off nose |
| 8 | Rear-quadrant turret | +/-45 deg off tail |
| 9 | Point defense turret | Auto-fires at missiles/nearby ships |
| 10 | Point defense beam | Auto-fires beam at missiles |
| 99 | Carried ship | Fighter bay (AmmoType = ship ID) |

### Weapon Flags

| Flag | Effect |
|------|--------|
| 0x0001 | Spin graphic continuously |
| 0x0002 | Fired by second trigger |
| 0x0004 | Cycling weapons start on first frame |
| 0x0008 | Guided: don't fire at fast ships (turn > 3) |
| 0x0010 | Looped sound |
| 0x0020 | Passes through shields |
| 0x0040 | Multiple weapons fire simultaneously |
| 0x0080 | Can't be targeted by point defense |
| 0x0100 | Blast doesn't hurt player |
| 0x0200 | Generates small smoke |
| 0x0400 | Generates big smoke |
| 0x0800 | More persistent smoke trail |
| 0x1000 | Turreted: front blind spot |
| 0x2000 | Turreted: side blind spot |
| 0x4000 | Turreted: rear blind spot |
| 0x8000 | Detonates at end of lifespan (flak) |

### Seeker/Guidance Flags (for Guidance = 1)

| Flag | Effect |
|------|--------|
| 0x0001 | Passes over asteroids |
| 0x0002 | Decoyed by asteroids |
| 0x0008 | Confused by sensor interference |
| 0x0010 | Turns away if jammed |
| 0x0020 | Can't fire if ship is ionized |
| 0x4000 | Loses lock if target not ahead |
| 0x8000 | May attack parent ship if jammed |

### Weapon Flags2

| Flag | Effect |
|------|--------|
| 0x0001 | Keep on first frame until ProxSafety expires |
| 0x0002 | Stop on last frame |
| 0x0004 | Proximity detonator ignores asteroids |
| 0x0008 | Proximity triggered by non-target ships |
| 0x0010 | Submunitions fire at nearest target |
| 0x0020 | Don't launch submunitions on expire |
| 0x0040 | Don't show ammo quantity |
| 0x0080 | Only fire when KeyCarried ships aboard |
| 0x0100 | AI won't use this weapon |
| 0x0200 | Uses ship's weapon sprite |
| 0x0400 | Planet-type weapon (hits planet ships/stellars only) |
| 0x0800 | Don't display if out of ammo |
| 0x1000 | Can disable but not destroy |
| 0x2000 | Beam displays under ships |
| 0x4000 | Can fire while cloaked |
| 0x8000 | x10 mass damage to asteroids |

### Weapon Flags3

| Flag | Effect |
|------|--------|
| 0x0001 | Only use ammo at burst cycle end |
| 0x0002 | Shots are translucent |
| 0x0004 | Can't fire until previous shot expires |
| 0x0010 | Fire from closest exit point to target |
| 0x0020 | Exclusive: no other weapons can fire |

### Ammunition System

| AmmoType Value | Meaning |
|----------------|---------|
| -1 | Unlimited ammo |
| 0-255 | Uses ammo from weapon ID |
| -999 | Ship destroyed on fire |
| -1000 & below | Uses fuel (abs(AmmoType+1000)/10 units per shot) |

### Beam Weapons

| Field | Beam Function |
|-------|---------------|
| **BeamLength** | Length of beam in pixels |
| **BeamWidth** | Beam radius (0 = corona only) |
| **Falloff** | Corona falloff (2-16) |
| **BeamColor** | Center beam color (00RRGGBB) |
| **CoronaColor** | Corona color (appears half as bright) |
| **LiDensity** | Lightning beam zig-zags per 100 pixels |
| **LiAmplitude** | Lightning zig-zag amplitude in pixels |
| **Count** | Frames beam stays onscreen |
| **Decay** | If > 0, beam shrinks before disappearing |
| **Impact** | Negative = tractor beam |

### Submunitions

| Field | Description |
|-------|-------------|
| **SubCount** | Number of submunitions on detonation |
| **SubType** | Weapon type ID for submunitions |
| **SubTheta** | Angular error from parent heading |
| **SubLimit** | Max recursive splits |

### Ionization Weapons

| Field | Description |
|-------|-------------|
| **Ionization** | Ion energy added on hit |
| **IonizeColor** | Ship color when ionized (00RRGGBB) |

### Burst Fire System

| Field | Description |
|-------|-------------|
| **BurstCount** | Shots before burst reload |
| **BurstReload** | Reload time after burst |

### Jamming Vulnerability

| Field | Description |
|-------|-------------|
| **JamVuln1-4** | Vulnerability to jamming types 1-4 (0-100%) |

### Weapon Exit Points

| ExitType | Position Fields |
|----------|-----------------|
| 0 | GunPosX/Y |
| 1 | TurretPosX/Y |
| 2 | GuidedPosX/Y |
| 3 | BeamPosX/Y |

---

## Outfit/Upgrade Specifications

### Core Outfit Fields

| Field | Description |
|-------|-------------|
| **DispWeight** | Display order (higher = closer to top) |
| **Mass** | Weight in tons (0 = no appreciable mass) |
| **TechLevel** | Required tech level for availability |
| **Cost** | Purchase price |
| **Max** | Maximum quantity allowed |

### ModType Categories

| ModType | Effect | ModVal Reference |
|---------|--------|------------------|
| 1 | Weapon | w'ap resource ID |
| 2 | Cargo space | Tons to add |
| 3 | Ammunition | w'ap resource ID |
| 4 | Shield capacity | Shield points to add |
| 5 | Shield recharge | Speed increase (1000 = 1 pt/frame) |
| 6 | Armor | Armor points to add |
| 7 | Acceleration boost | Accel amount |
| 8 | Speed increase | Speed amount |
| 9 | Turn rate change | Amount (100 = 30 deg/sec) |
| 11 | Escape pod | Ignored |
| 12 | Fuel capacity | Amount (100 = 1 jump) |
| 13 | Density scanner | Ignored |
| 14 | IFF (colorized radar) | Ignored |
| 15 | Afterburner | Fuel units/sec |
| 16 | Map | Jumps to explore (-1 = all inhabited independent) |
| 17 | Cloaking device | See cloaking flags below |
| 18 | Fuel scoop | Frames per 1 unit (negative = fuel sucking) |
| 19 | Auto-refueller | Ignored |
| 20 | Auto-eject | Requires escape pod |
| 21 | Clean legal record | Govt ID (-1 = all) |
| 22 | Hyperspace speed mod | Days to add/subtract |
| 23 | Hyperspace dist mod | Radius change (standard = 1000) |
| 24 | Interference mod | Subtract from interference |
| 25 | Marines | Crew boost or capture odds % |
| 27 | Increase maximum | Another outfit ID to boost max |
| 28 | Murk modifier | System murkiness change |
| 29 | Armor recharge | Speed (1000 = 1 pt/frame) |
| 30 | Cloak scanner | Detection flags |
| 31 | Mining scoop | - |
| 32 | Multi-jump | Extra jumps per hyperspace |
| 33-36 | Jamming Type 1-4 | Jamming amount |
| 37 | Fast jumping | Enter hyperspace without slowing |
| 38 | Inertial dampener | Makes ship inertialess |
| 39 | Ion dissipator | Deionization rate (100 = 1 pt per 1/30th sec) |
| 40 | Ion absorber | Extra ionization capacity |
| 41 | Gravity resistance | - |
| 42 | Resist deadly stellars | - |
| 43 | Paint | Ship color (15-bit: 0RRRRRGGGGGBBBBB) |
| 44 | Reinforcement inhibitor | Govt class to inhibit |
| 45 | Modify max guns | Add/subtract gun slots |
| 46 | Modify max turrets | Add/subtract turret slots |
| 47 | Bomb | Destroys player (ModVal = desc ID) |
| 48 | IFF scrambler | Govt class to fool |
| 49 | Repair system | Occasionally repairs when disabled |
| 50 | Nonlethal bomb | Random self-destruct (ModVal = boom ID) |

### Cloaking Device Flags (ModType 17)

| Flag | Effect |
|------|--------|
| 0x0001 | Faster fading |
| 0x0002 | Visible on radar |
| 0x0004 | Immediately drops shields |
| 0x0008 | Deactivates on damage |
| 0x0010 | Use 1 unit fuel/sec |
| 0x0020 | Use 2 units fuel/sec |
| 0x0040 | Use 4 units fuel/sec |
| 0x0080 | Use 8 units fuel/sec |
| 0x0100 | Use 1 unit shield/sec |
| 0x0200 | Use 2 units shield/sec |
| 0x0400 | Use 4 units shield/sec |
| 0x0800 | Use 8 units shield/sec |
| 0x1000 | Area cloak (formation ships also cloaked) |

### Cloak Scanner Flags (ModType 30)

| Flag | Effect |
|------|--------|
| 0x0001 | Reveal cloaked ships on radar |
| 0x0002 | Reveal cloaked ships on screen |
| 0x0004 | Target untargetable ships |
| 0x0008 | Target cloaked ships |

### Outfit Flags

| Flag | Effect |
|------|--------|
| 0x0001 | Fixed gun |
| 0x0002 | Turret |
| 0x0004 | Persistent (stays when trading ships) |
| 0x0008 | Can't be sold |
| 0x0010 | Remove after purchase (permits) |
| 0x0020 | Persistent in mission ship changes |
| 0x0100 | Don't show unless meets Require or already has |
| 0x0200 | Price proportional to ship mass |
| 0x0400 | Mass proportional to ship mass |
| 0x0800 | Can be sold anywhere |
| 0x1000 | Prevents higher-numbered same-weight items |
| 0x2000 | Appears in Ranks section of player info |
| 0x4000 | Don't show unless Availability true or already has |

---

## Mission Types and Structures

### Mission Availability Fields

| Field | Description | Values |
|-------|-------------|--------|
| **AvailStel** | Where mission is available | -1: any inhabited, 128-2175: specific stellar, 9999-10255: govt stellar, etc. |
| **AvailLoc** | Where on planet | 0: mission computer, 1: bar, 2: from ship, 3: spaceport, 4: trading, 5: shipyard, 6: outfit |
| **AvailRecord** | Legal record requirement | 0: ignored, positive: must be this good, negative: can be this evil, -32000: dominated |
| **AvailRating** | Combat rating requirement | -1: ignored, 0+: minimum rating |
| **AvailRandom** | Random availability | 1-100: percent chance |
| **AvailShipType** | Ship type requirement | 128-255: must fly this, 1128-1255: must not fly, etc. |

### Mission Travel Fields

| Field | Description |
|-------|-------------|
| **TravelStel** | Intermediate destination (-1: none, -2: random inhabited, -3: random uninhabited) |
| **ReturnStel** | Final destination for completion |

### Mission Cargo

| Field | Description |
|-------|-------------|
| **CargoType** | Type of cargo (-1: none, 0-255: specific, 1000: random standard) |
| **CargoQty** | Amount (-1: none, 0+: tons, -2 & below: abs(qty) +/- 50%) |
| **PickupMode** | Where to pick up (-1: ignored, 0: mission start, 1: TravelStel, 2: boarding) |
| **DropOffMode** | Where to drop (-1: ignored, 0: TravelStel, 1: mission end) |
| **ScanMask** | Which govts consider cargo illegal |

### Mission Payment

| PayVal | Effect |
|--------|--------|
| 0 or -1 | No pay |
| 1+ | Credits |
| -10128 to -10383 | Clean record with govt ID |
| -20128 to -20383 | Clean record with govt + allies |
| -30128 to -30383 | Clean record with govt + classmates |
| -40001 to -40099 | Take % of player's cash |
| -50000 & down | Take credits at mission start |

### Special Ships

| Field | Description |
|-------|-------------|
| **ShipCount** | Number of special ships (-1: none, 0-31: count) |
| **ShipSyst** | System for ships (-1: initial, -2: random, -3: TravelStel, -4: ReturnStel, -5: adjacent, -6: follow player) |
| **ShipDude** | Dude type for ships |
| **ShipGoal** | Mission objective (0: destroy, 1: disable, 2: board, 3: escort, 4: observe, 5: rescue, 6: chase off) |
| **ShipBehav** | Special behavior (-1: standard AI, 0: attack player, 1: protect player, 2: destroy stellars) |
| **ShipStart** | Starting position (0: random, 1: jump in, 2: cloaked, -1 to -4: nav defaults) |

### Auxiliary Ships

| Field | Description |
|-------|-------------|
| **AuxShipCount** | Number of aux ships (-1: none, 1-31: count) |
| **AuxShipDude** | Dude type ID |
| **AuxShipSyst** | System placement |

### Mission Flags

| Flag | Effect |
|------|--------|
| 0x0001 | Auto-aborting mission |
| 0x0002 | Don't show red destination arrows |
| 0x0004 | Can't refuse mission |
| 0x0008 | Takes 100 fuel on auto-abort |
| 0x0010 | Infinite aux ships |
| 0x0020 | Fails if scanned |
| 0x0040 | -5x CompReward on abort |
| 0x0100 | Show green arrow in briefing |
| 0x0200 | Show arrow for ShipSyst |
| 0x0400 | Invisible mission |
| 0x0800 | Lock special ship type at start |
| 0x2000 | Unavailable for cargo ships (AI 1-2) |
| 0x4000 | Unavailable for warships (AI 3-4) |
| 0x8000 | Fails if boarded by pirates |

### Mission Text Tags

| Tag | Expansion |
|-----|-----------|
| `<DSY>` | Destination system name |
| `<DST>` | Destination stellar name |
| `<RSY>` | Return system name |
| `<RST>` | Return stellar name |
| `<CT>` | Cargo type name |
| `<CQ>` | Cargo quantity |
| `<DL>` | Deadline date |
| `<PAY>` | Mission pay (absolute) |
| `<PN>` | Player name |
| `<PNN>` | Player nickname |
| `<PSN>` | Player ship name |
| `<PST>` | Player ship type |
| `<PRK>` | Highest rank ConvName |
| `<SRK>` | Highest rank ShortName |
| `<SN>` | Special ship name |

---

## Faction/Government Relationships

### Government Fields

| Field | Description |
|-------|-------------|
| **VoiceType** | Voice type for escorts (0-7, -1 for none) |
| **CrimeTol** | Crime tolerance threshold |
| **ScanFine** | Fine for illegal cargo (positive: amount, negative: % of cash) |
| **SmugPenalty** | Evilness for smuggling |
| **DisabPenalty** | Evilness for disabling ships |
| **BoardPenalty** | Evilness for boarding ships |
| **KillPenalty** | Evilness for killing ships |
| **ShootPenalty** | Evilness for shooting (currently ignored) |
| **InitialRec** | Starting legal record (0 = neutral) |
| **MaxOdds** | Maximum combat odds (100 = 1:1) |
| **SkillMult** | Pilot skill multiplier (100 = normal) |

### Government Classes

| Field | Description |
|-------|-------------|
| **Class1-4** | Up to 4 arbitrary class groupings |
| **Ally1-4** | Up to 4 allied class numbers |
| **Enemy1-4** | Up to 4 enemy class numbers |

### Government Flags

| Flag | Effect |
|------|--------|
| 0x0001 | Xenophobic (attacks everyone except allies) |
| 0x0002 | Attacks player if criminal in non-allied systems |
| 0x0004 | Always attacks player |
| 0x0008 | Player shots won't hit |
| 0x0010 | Warships retreat at 25% shields |
| 0x0020 | Nosy ships ignore attacks on this govt |
| 0x0040 | Never attacks player |
| 0x0080 | Freighters have 50% of warship InherentJam |
| 0x0100 | Pers ships won't use escape pod but act like they did |
| 0x0200 | Warships take bribes |
| 0x0400 | Can't hail ships of this govt |
| 0x0800 | Ships start disabled (derelicts) |
| 0x1000 | Warships plunder before destroying |
| 0x2000 | Freighters take bribes |
| 0x4000 | Planets take bribes |
| 0x8000 | Ships demand larger bribes |

### Government Flags2

| Flag | Effect |
|------|--------|
| 0x0001 | Request assistance disabled, not talkative |
| 0x0002 | Minor govt for map boundaries |
| 0x0004 | Systems don't affect map boundaries |
| 0x0008 | Ships don't send distress/greetings |
| 0x0010 | Roadside Assistance (free repair/refuel) |
| 0x0020 | Ships don't use hypergates |
| 0x0040 | Ships prefer hypergates |
| 0x0080 | Ships prefer wormholes |

### Jamming System

| Field | Description |
|-------|-------------|
| **InhJam1-4** | Inherent jamming ability (0-100%) for 4 types |
| **ScanMask** | 16-bit field for illegal cargo detection |

---

## Economic Systems

### Standard Commodities (6 types)

| Type | Name | Index |
|------|------|-------|
| 0 | Food | 0 |
| 1 | Industrial goods | 1 |
| 2 | Medical supplies | 2 |
| 3 | Luxury goods | 3 |
| 4 | Metal | 4 |
| 5 | Equipment | 5 |

### Commodity Price Levels (Stellar Flags)

| Price Level | Food | Industrial | Medical | Luxury | Metal | Equipment |
|-------------|------|------------|---------|--------|-------|-----------|
| Won't trade | 0x00000000 | 0x00000000 | 0x00000000 | 0x00000000 | 0x00000000 | 0x00000000 |
| Low prices | 0x10000000 | 0x01000000 | 0x00100000 | 0x00010000 | 0x00001000 | 0x00000100 |
| Medium prices | 0x20000000 | 0x02000000 | 0x00200000 | 0x00020000 | 0x00002000 | 0x00000200 |
| High prices | 0x40000000 | 0x04000000 | 0x00400000 | 0x00040000 | 0x00004000 | 0x00000400 |

### Junk Resources (Special Commodities)

| Field | Description |
|-------|-------------|
| **SoldAt1-8** | Stellar IDs where sold |
| **BoughtAt1-8** | Stellar IDs where purchased |
| **BasePrice** | Average price |

### Junk Flags

| Flag | Effect |
|------|--------|
| 0x0001 | Tribbles (multiplies in cargo) |
| 0x0002 | Perishable (decays over time) |

### Ship Trade-In Value

- Trade-up cost = new ship cost - 25% of current ship + upgrades
- Escort sell value: Default 10% of original cost (customizable via EscSellValue)

### Disasters (Price Events)

| Field | Description |
|-------|-------------|
| **Stellar** | Affected stellar ID (-1: any, -2: none/news only) |
| **Commodity** | Affected commodity type |
| **PriceDelta** | Price adjustment |
| **Duration** | Days |
| **Freq** | Percent chance per day |

---

## Planet/Station Information

### Core Stellar Fields

| Field | Description |
|-------|-------------|
| **xPos, yPos** | Position in system (0,0 = center) |
| **Type** | Graphic type (0-255) |
| **TechLevel** | Base tech level for items/ships |
| **Govt** | Government ID (-1 = independent) |
| **MinStatus** | Minimum legal record to land |
| **Tribute** | Daily tribute when dominated (-1/0: default = 1000 x TechLevel) |
| **Fee** | Landing fee |
| **Strength** | Damage to destroy (0/-1 = invincible) |

### Stellar Flags

| Flag | Effect |
|------|--------|
| 0x00000001 | Can land/dock |
| 0x00000002 | Has commodity exchange |
| 0x00000004 | Can outfit ship |
| 0x00000008 | Can buy ships |
| 0x00000010 | Is a station (not planet) |
| 0x00000020 | Uninhabited (no traffic control/refuel) |
| 0x00000040 | Has bar |
| 0x00000080 | Can only land after destroyed |

### Stellar Flags2

| Flag | Effect |
|------|--------|
| 0x0001 | Animation: first frame after each subsequent |
| 0x0002 | Animation: random next frame |
| 0x0010 | Loop sound continuously |
| 0x0020 | Always dominated |
| 0x0040 | Starts destroyed |
| 0x0080 | Animated when destroyed |
| 0x0100 | Deadly (destroys touching ships) |
| 0x0200 | Weapon only fires when provoked |
| 0x0400 | Outfit shop buys any nonpermanent |
| 0x1000 | Hypergate |
| 0x2000 | Wormhole |

### Stellar Defense

| Field | Description |
|-------|-------------|
| **DefenseDude** | Dude type for defense fleet |
| **DefCount** | Ship count (1000+ = waves, e.g., 1082 = 4 waves of 2, 8 total) |

### Stellar Special Features

| Field | Description |
|-------|-------------|
| **SpecialTech (x8)** | Special tech levels for unique items |
| **HyperLink1-8** | Connected hypergates/wormholes |
| **Weapon** | Stellar weapon ID (projectile/missile only) |
| **Gravity** | Gravity strength (positive = pull, negative = push) |
| **DeadType** | Graphic when destroyed |
| **DeadTime** | Regeneration time (-1 = never) |

---

## Star System Mechanics

### System Fields

| Field | Description |
|-------|-------------|
| **xPos, yPos** | Map coordinates |
| **Con1-16** | Hyperspace links (up to 16) |
| **NavDef (x16)** | Navigation defaults (F1-F4 and more) |
| **DudeTypes (x8)** | Ship types in system |
| **Prob (x8)** | Probability for each dude type |
| **AvgShips** | Average ships (+/- 50%) |
| **Govt** | Controlling government |
| **Message** | Entry message buoy string |
| **Asteroids** | Asteroid count (0-16) |
| **Interference** | Sensor interference (0-100) |
| **BkgndColor** | Background color (RRGGBB) |
| **Murk** | System murkiness (0-100, negative = no starfield) |

### Asteroid Types

| Flag | Type | ršid ID |
|------|------|---------|
| 0x0001 | Small metal | 128 |
| 0x0002 | Medium metal | 129 |
| 0x0004 | Large metal | 130 |
| 0x0008 | Huge metal | 131 |
| 0x0010 | Small ice | 132 |
| 0x0020 | Medium ice | 133 |
| etc. | ... | ... |

### Asteroids (ršid Resource)

| Field | Description |
|-------|-------------|
| **Strength** | Equivalent to armor |
| **SpinRate** | Animation speed (100 = 30 fps) |
| **YieldType** | Cargo type or junk ID |
| **YieldQty** | Resource boxes ejected (+/- 50%) |
| **PartCount** | Destruction particles |
| **FragType1&2** | Sub-asteroid types |
| **FragCount** | Sub-asteroids spawned (+/- 50%) |
| **ExplodeType** | Explosion type (0-63) |
| **Mass** | Collision mass |

### Reinforcement Fleet

| Field | Description |
|-------|-------------|
| **ReinfFleet** | Fleet ID for reinforcements |
| **ReinfTime** | Delay (30 = 1 second) |
| **ReinfIntrval** | Regeneration time in days |

---

## AI and Dude System

### Dude Resource

| Field | Description |
|-------|-------------|
| **AIType** | AI behavior (0 = use ship's AI) |
| **Govt** | Government ID (-1 = independent) |
| **Booty** | Boarding loot flags |
| **ShipType (x16)** | Ship type IDs |
| **Probability (x16)** | Probability for each ship type |

### Booty/Info Flags

| Flag | Effect |
|------|--------|
| 0x0001 | Carries food |
| 0x0002 | Carries industrial goods |
| 0x0004 | Carries medical supplies |
| 0x0008 | Carries luxury goods |
| 0x0010 | Carries metal |
| 0x0020 | Carries equipment |
| 0x0040 | Carries money (proportional to ship cost) |
| 0x0100 | Can't hit/be hit by player |
| 0x1000 | Gives good price info |
| 0x2000 | Gives disaster info |
| 0x4000 | Gives specific advice |
| 0x8000 | Generic govt hail messages |

### Fleet Resource

| Field | Description |
|-------|-------------|
| **LeadShipType** | Flagship ship class ID |
| **EscortType (x4)** | Escort ship class IDs |
| **Min/Max (x4)** | Min/max escorts of each type |
| **Govt** | Fleet government |
| **LinkSyst** | Where fleet can appear |

### Person (p'rs) Resource

| Field | Description |
|-------|-------------|
| **LinkSyst** | Where person appears |
| **Govt** | Government affiliation |
| **AIType** | AI behavior (1-4) |
| **Aggress** | Aggression (1-3, higher = attacks from farther) |
| **Coward** | Retreat threshold (% shields) |
| **ShipType** | Ship class ID |
| **WeapType/Count/Ammo (x8)** | Weapon loadout (can be negative to remove) |
| **Credits** | Money carried (+/- 25%) |
| **ShieldMod** | Shield modifier (%, negative = invincible) |
| **HailPict** | Custom comm picture |
| **LinkMission** | Mission to offer |
| **GrantClass** | Outfit class given on board |
| **GrantProb/Count** | Probability and amount |

### Person Flags

| Flag | Effect |
|------|--------|
| 0x0001 | Holds grudge if attacked |
| 0x0002 | Uses escape pod & afterburner |
| 0x0004 | HailQuote only when grudge |
| 0x0008 | HailQuote only when likes player |
| 0x0010 | HailQuote only when attacking |
| 0x0020 | HailQuote only when disabled |
| 0x0040 | Replace with special ship on mission accept |
| 0x0080 | Only show quote once |
| 0x0100 | Deactivate after LinkMission accepted |
| 0x0200 | Offer mission when boarding |
| 0x0400 | Don't show quote if mission unavailable |
| 0x0800 | Leave after mission accepted |
| 0x1000 | Don't offer to wimpy freighters |
| 0x2000 | Don't offer to beefy freighters |
| 0x4000 | Don't offer to warships |
| 0x8000 | Show disaster info on hail |

---

## Combat System

### Combat Ratings

| Kills | Rating |
|-------|--------|
| 0 | No Ability |
| 1 | Little Ability |
| 100 | Fair Ability |
| 200 | Average Ability |
| 400 | Good Ability |
| 800 | Competent |
| 1600 | Very Competent |
| 3200 | Worthy of Note |
| 6400 | Dangerous |
| 12,800 | Deadly |
| 25,600 | Frightening |

### Legal Status

**Good Scale:**
| Points | Status |
|--------|--------|
| 0 | Clean |
| 4 | Citizen |
| 16 | Good Citizen |
| 64 | Upstanding Citizen |
| 256 | Leading Citizen |
| 1024 | Model Citizen |
| 4096 | Virtuous Citizen |

**Evil Scale:**
| Points | Status |
|--------|--------|
| 0 | No record |
| 1 | Minor Offender |
| 4 | Offender |
| 16 | Criminal |
| 64 | Wanted Criminal |
| 256 | Fugitive |
| 1024 | Hunted Fugitive |
| 4096 | Public Enemy |

### Combat Odds Calculation

Quote from source:
> "Combat odds are calculated by summing the strengths of the ship's enemies (where a ship's strength is taken from the Strength field in the sh•p resource, and modified from between 30% and 100% of that value depending on the ship's present shield stat) and comparing it to the sum of the strength of the ship's friends."

### Ship Disable Threshold

- Standard: 33% armor
- With flag 0x0010: 10% armor

### Escape Pods

- **PodCount**: Number of decorative escape pods launched on death (rate: 1/second)
- Ships with 0 crew cannot be boarded

### Capture System

- Crew count affects boarding
- Marines outfit adds to effective crew
- GrantClass/GrantProb/GrantCount on p'rs for loot

---

## Control Bit System

### Test Expressions

| Operator | Function |
|----------|----------|
| Bxxx | Lookup control bit xxx (b0-b9999) |
| Pxxx | Check if game paid/registered for xxx days |
| G | Player gender (1 = male, 0 = female) |
| Oxxx | Has outfit item ID xxx |
| Exxx | Has explored system ID xxx |
| \| | Logical OR |
| & | Logical AND |
| ! | Logical NOT |
| ( ) | Parentheses |

### Set Expressions

| Operator | Function |
|----------|----------|
| bxxx | Set bit xxx |
| !bxxx | Clear bit xxx |
| ^bxxx | Toggle bit xxx |
| R(op1 op2) | Random choice between op1 and op2 |
| Axxx | Abort mission ID xxx |
| Fxxx | Fail mission ID xxx |
| Sxxx | Start mission ID xxx |
| Gxxx | Grant outfit ID xxx |
| Dxxx | Delete outfit ID xxx |
| Mxxx | Move to system xxx (on first stellar) |
| Nxxx | Move to system xxx (same coordinates) |
| Cxxx | Change ship to type xxx (keep outfits, no defaults) |
| Exxx | Change ship to type xxx (keep outfits, add defaults) |
| Hxxx | Change ship to type xxx (lose non-persistent, add defaults) |
| Kxxx | Activate rank ID xxx |
| Lxxx | Deactivate rank ID xxx |
| Pxxx | Play sound ID xxx |
| Yxxx | Destroy stellar ID xxx |
| Uxxx | Regenerate stellar ID xxx |
| Xxxx | Explore system ID xxx |

### Cron (Timed Events)

| Field | Description |
|-------|-------------|
| **FirstDay/Month/Year** | Start of activation window |
| **LastDay/Month/Year** | End of activation window |
| **Random** | Percent chance (100 = always) |
| **Duration** | Days active |
| **PreHoldoff** | Days before start |
| **PostHoldoff** | Days after end |
| **OnStart** | Set expression when starts |
| **OnEnd** | Set expression when ends |

---

## Sprite and Animation System

### Ship Animation (shŠn)

| Field | Description |
|-------|-------------|
| **BaseImageID** | Base sprite resource ID |
| **BaseSetCount** | Number of sprite sets |
| **BaseXSize/YSize** | Sprite dimensions |
| **BaseTransp** | Transparency (0-32) |
| **AltImageID** | Alternating sprites |
| **GlowImageID** | Engine glow |
| **LightImageID** | Running lights |
| **WeapImageID** | Weapon effects |
| **ShieldImageID** | Shield bubble |
| **AnimDelay** | Frame delay (30ths/sec) |
| **WeapDecay** | Weapon glow fade rate (50 = median) |
| **FramesPer** | Frames per rotation (usually 36) |

### Ship Animation Flags

| Flag | Effect |
|------|--------|
| 0x0001 | Extra frames for banking |
| 0x0002 | Extra frames for folding/unfolding |
| 0x0004 | Second set when not carrying KeyCarried |
| 0x0008 | Extra frames shown in sequence |
| 0x0010 | Stop animations when disabled |
| 0x0020 | Hide alt sprites when disabled |
| 0x0040 | Hide running lights when disabled |
| 0x0080 | Unfolds when firing |
| 0x0100 | Visual skew correction |

### Blink Modes

| Mode | Effect |
|------|--------|
| 1 | Square-wave blinking |
| 2 | Triangle-wave pulsing |
| 3 | Random pulsing |

### Explosion (bššm)

| Field | Description |
|-------|-------------|
| **FrameAdvance** | Animation speed (100 = 1:1) |
| **SoundIndex** | Sound ID (0-63, or -1) |
| **GraphicIndex** | Graphic ID (0-63) |

### Weapon Sprites

- Stored in sp•n resources 3000-3255
- Weapon exit points: Gun, Turret, Guided, Beam positions

---

## Recommendations for Space-Armada Implementation

Based on this analysis, here are key mechanics to implement:

### Priority 1: Core Ship Stats
- Shield/Armor dual-health system
- Shield recharge rate
- Speed, acceleration, and turn rate
- Crew count for boarding
- Fuel system (100 units = 1 jump)

### Priority 2: Weapon System
- Guidance types: unguided, homing, turreted
- Energy vs Mass damage distinction
- Reload timing
- Ammunition tracking
- Multiple weapon slots with firing modes

### Priority 3: Combat Mechanics
- Shield damage first, then armor
- Ship disabling at 33% armor
- Escape pod system
- Combat rating from kills
- Combat odds calculation for AI retreat

### Priority 4: AI Behaviors
- 4 AI types: Wimpy Trader, Brave Trader, Warship, Interceptor
- Retreat behavior based on MaxOdds
- Cargo scanning for illegal goods
- Defensive formation

### Priority 5: Economic System
- 6 standard commodity types
- Price levels (low/medium/high)
- Trade-in value (25% of original)
- Tech level gating for items/ships

### Priority 6: Mission System
- Mission availability criteria
- Travel and return destinations
- Cargo pickup/dropoff
- Special ship goals (destroy, disable, board, escort)
- Payment and reputation rewards

### Priority 7: Faction System
- Government alliances and enemies via class system
- Legal status tracking per government
- Crime penalties
- Bribery system

### Priority 8: Advanced Features
- Cloaking devices
- Jamming systems (4 types)
- Ionization weapons
- Submunitions
- Point defense
- Afterburners
- Hyperspace mechanics

### Key Constants to Respect
- Max 64 ships in system
- Max 128 shots on screen
- Max 64 beams on screen
- 30 FPS timing (30 frames = 1 second)
- Jump distance: 1000 pixels
