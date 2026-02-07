import { useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// DATA — Sources noted for future AI update pipeline
// BUILD SOURCE: Mobalytics expert builds (Hydration, Rina) + MetaBattle
// MATCHUP SOURCE: MetaBot.gg hero-vs-hero win rates, Mobalytics tier data
// TIER/WR SOURCE: MetaBot.gg tier list (Feb 2026)
// LAST UPDATED: 2026-02-06
// ═══════════════════════════════════════════════════════

const HEROES = {
  haze: {
    name: "Haze",
    short: "HZ",
    winRate: 54.1,
    tier: "S",
    role: "Bullet DPS / Assassin",
    color: "#a63d4a",
    tags: ["heavy_bullet", "stealth", "aoe_ult", "single_target"],
    weakTo: ["hard_cc", "reveal", "burst"],
    threatProfile: "Heavy bullet DPS, stealth flanker, team-wiping AOE ult",
    killPattern: "Smoke Bomb → Sleep Dagger from invis → gun down with Fixation stacks, or Slowing Hex → Bullet Dance in teamfights",
    philosophy: "Fixation rewards sustained fire on one target, so we stack fire rate and bullet damage early. Mid-game adds hex/sleep utility for solo pick opportunities. Late game pivots to team-fight AOE — Ricochet and Silencer during Bullet Dance turn a decent ult into a team-wipe.",
    build: {
      early: [
        { name: "Extra Stamina", cost: 500, slot: "weapon", note: "Fire rate + stamina for lane trades" },
        { name: "Headshot Booster", cost: 500, slot: "weapon", note: "Fire rate + bullet shield for poke" },
        { name: "Active Reload", cost: 1250, slot: "weapon", note: "Core lane item — damage + fast reload covers Haze's weak early game" },
        { name: "Ammo Scavenger", cost: 500, slot: "weapon", note: "Patches Haze's tiny magazine so you don't run dry mid-fight" },
        { name: "Healing Rite", cost: 500, slot: "vitality", note: "Lane sustain, sell once you have lifesteal" },
      ],
      earlyToMid: "After pushing guardian, start roaming with Smoke Bomb. Your power spike is Slowing Hex — it turns Sleep Dagger misses into guaranteed kills.",
      mid: [
        { name: "Bullet Lifesteal", cost: 1250, slot: "weapon", note: "Sustain through duels — Fixation stacks make this very efficient" },
        { name: "Kinetic Dash", cost: 1250, slot: "vitality", note: "Health + repositioning for aggressive plays" },
        { name: "Quicksilver Reload", cost: 1750, slot: "weapon", note: "Spirit damage proc on reload adds burst between magazines" },
        { name: "Fleetfoot", cost: 1500, slot: "vitality", note: "Roam speed — Haze is one of the best urn carriers with Smoke Bomb" },
        { name: "Slowing Hex", cost: 1750, slot: "spirit", key: true, note: "Hex an enemy, then Bullet Dance. They can't escape the channel. This is what makes mid-game Haze lethal." },
      ],
      midToLate: "Start looking for Bullet Dance angles in teamfights. Ricochet is your biggest spike — farm toward it aggressively.",
      late: [
        { name: "Ricochet", cost: 6200, slot: "weapon", key: true, note: "Bouncing bullets proc Fixation on multiple targets during Bullet Dance. This is what turns your ult from decent to team-wiping." },
        { name: "Lucky Shot", cost: 3000, slot: "weapon", note: "Ammo + chance to slow on each bullet hit" },
        { name: "Silencer", cost: 6200, slot: "weapon", key: true, note: "Enemies hit by Bullet Dance can't activate Metal Skin, Ethereal Shift, or any save items. Removes counterplay to your ult." },
        { name: "Glass Cannon", cost: 6200, slot: "weapon", note: "Final spike — pure DPS increase to close games" },
      ],
    },
    tips: [
      "Fixation stacks = more damage the longer you shoot ONE target. Commit to fights, don't spread shots.",
      "Smoke Bomb before picking up the Urn = invisible carry. Best urn runner in the game.",
      "Sleep Dagger does NOT break invisibility. You can dagger from stealth for surprise kills.",
      "Bullet Dance grants bullet evasion during the channel — you're harder to kill than you think while ulting.",
    ],
    counters: [
      { name: "Metal Skin", reason: "Become immune to bullets briefly — hard counters Bullet Dance if she doesn't have Silencer yet" },
      { name: "Return Fire", reason: "Reflects her high sustained bullet DPS back at her" },
      { name: "Reactive Barrier", reason: "Auto-shield absorbs burst when she ambushes from stealth" },
    ],
  },

  seven: {
    name: "Seven",
    short: "SV",
    winRate: 54.0,
    tier: "S",
    color: "#4a7a9e",
    role: "Spirit AOE / Farm Machine",
    tags: ["spirit_burst", "aoe", "hard_cc", "farm_speed"],
    weakTo: ["long_range", "anti_spirit", "hard_cc"],
    threatProfile: "Spirit burst, AOE stun, fast farmer, devastating team-fight ult",
    killPattern: "Static Charge stun → Lightning Ball → gun under Power Surge for burst. Late game: Storm Cloud for massive AOE zone denial",
    philosophy: "Seven farms faster than almost anyone and snowballs with items. Echo Shard is the build's keystone — it effectively doubles your ability output. Everything before it is about surviving lane and accumulating souls. Everything after it amplifies the spirit damage loop.",
    build: {
      early: [
        { name: "Headshot Booster", cost: 500, slot: "weapon", note: "Early poke damage in lane" },
        { name: "Extra Regen", cost: 500, slot: "vitality", note: "Stacks with Seven's naturally high base regen for dominant laning" },
        { name: "Mystic Reach", cost: 500, slot: "spirit", note: "Extra range on Static Charge makes it much easier to land" },
        { name: "Basic Magazine", cost: 500, slot: "weapon", note: "Raw damage + extra ammo to use during Power Surge window" },
        { name: "Enduring Spirit", cost: 500, slot: "spirit", note: "Spirit power + survivability" },
      ],
      earlyToMid: "Use Lightning Ball between waves to clear side jungle camps — this is how Seven gets ahead. Static Charge → Ball → gun under Power Surge is your full combo, use it on cooldown.",
      mid: [
        { name: "Warp Stone", cost: 3000, slot: "spirit", key: true, note: "Engage or escape tool. Also provides bullet resist so you're less vulnerable to gun heroes while casting." },
        { name: "Echo Shard", cost: 3000, slot: "spirit", key: true, note: "NON-NEGOTIABLE. Doubles your ability output — cast Lightning Ball twice, Static Charge twice. The entire build revolves around this item." },
        { name: "Arcane Surge", cost: 1750, slot: "spirit", note: "Range, duration, stamina — synergizes with everything Seven does" },
        { name: "Mystic Slow", cost: 1250, slot: "spirit", note: "Apply debuffs in skirmishes, weakens enemy carries" },
        { name: "Fleetfoot", cost: 1500, slot: "vitality", note: "Roaming speed for ganks and urn delivery" },
      ],
      midToLate: "With Echo Shard, you can burst most heroes. Start looking for Storm Cloud angles in grouped fights around objectives.",
      late: [
        { name: "Mystic Vulnerability", cost: 3000, slot: "spirit", key: true, note: "Stacks with Seven's innate 15% spirit shred on Power Surge. Combined, enemies take massively amplified spirit damage from your whole team." },
        { name: "Greater Expansion", cost: 6200, slot: "spirit", note: "Bigger Static Charge radius — easier to land on multiple enemies" },
        { name: "Superior Cooldown", cost: 6200, slot: "spirit", note: "More ability uptime, more Storm Cloud casts" },
        { name: "Divine Barrier", cost: 6200, slot: "vitality", note: "Cleanses debuffs on yourself or allies — counters Pocket, Wraith Telekinesis" },
      ],
    },
    tips: [
      "Static Charge → Lightning Ball → gun under Power Surge is your full combo. Use on cooldown in lane.",
      "Lightning Ball clears jungle camps between waves — always be farming the side camps.",
      "Storm Cloud damage was nerfed recently. Build around Power Surge burst, not just ult.",
      "Echo Shard is the entire build. Rush it. Nothing else matters until you have it.",
    ],
    counters: [
      { name: "Spirit Armor", reason: "Flat reduction against his heavy spirit damage output" },
      { name: "Knockdown", reason: "Stun him out of Storm Cloud channel — his ult is interruptible" },
      { name: "Dispel Magic", reason: "Cleanse Static Charge stun so he can't follow up with combo" },
    ],
  },

  warden: {
    name: "Warden",
    short: "WD",
    winRate: 50.8,
    tier: "B",
    role: "Tank / Brawler / Frontline",
    color: "#9e8a4a",
    tags: ["heavy_bullet", "hard_cc", "sustain", "dive"],
    weakTo: ["kiting", "long_range", "hard_cc"],
    threatProfile: "Best base gun in the game, root/CC chain, unkillable during Last Stand",
    killPattern: "Alchemical Flask drains stamina → Binding Word roots (can't dash out) → gun burst. Last Stand when low = massive lifesteal and near-invincibility",
    philosophy: "Warden has the best raw gun stats in the game and wins most straight-up fights. The build amplifies this with bullet damage and sustain, then adds tools to stick to targets and survive. Surge of Power solves his ammo and speed problems. Spellbreaker is his late-game insurance policy.",
    build: {
      early: [
        { name: "Monster Rounds", cost: 500, slot: "weapon", note: "Wave shove + jungle clear speed" },
        { name: "Extra Stamina", cost: 500, slot: "weapon", note: "Fire rate + stamina for aggression" },
        { name: "Fleetfoot", cost: 500, slot: "vitality", note: "Close gaps — Warden needs to be in your face" },
        { name: "Healing Rite", cost: 500, slot: "vitality", note: "Lane sustain" },
        { name: "Headshot Booster", cost: 500, slot: "weapon", note: "Early damage + shield" },
      ],
      earlyToMid: "Use Flask to drain enemy stamina, then Binding Word. They can't dash out of root without stamina. Slide into engagements for extra speed.",
      mid: [
        { name: "Kinetic Dash", cost: 1250, slot: "vitality", note: "Health + dash for chasing or escaping" },
        { name: "Bullet Lifesteal", cost: 1250, slot: "weapon", note: "Sustain through extended brawls" },
        { name: "Enduring Speed", cost: 1750, slot: "vitality", note: "Permanent move speed — very hard to escape from or kite" },
        { name: "Battle Vest", cost: 1250, slot: "vitality", note: "Bullet armor for frontline trading" },
        { name: "Bullet Resist Shredder", cost: 1250, slot: "spirit", key: true, note: "Spirit damage strips enemy bullet resist, then your gun hits even harder. Faster farming too." },
      ],
      midToLate: "You win almost every 1v1. Look for isolated targets. Surge of Power is your next big spike — always slide to maximize the buff.",
      late: [
        { name: "Surge of Power", cost: 3000, slot: "weapon", key: true, note: "Fixes speed and ammo in one item. Slide to activate — the buff window is when you're strongest." },
        { name: "Spellbreaker", cost: 6200, slot: "spirit", key: true, note: "Bought in most games. Massive value — shreds enemy shields and provides survivability." },
        { name: "Lucky Shot", cost: 3000, slot: "weapon", note: "More ammo + slow on hit keeps targets in range" },
        { name: "Unstoppable", cost: 6200, slot: "vitality", note: "Prevents Last Stand from being interrupted by CC. Without this, a single stun wastes your ult." },
      ],
    },
    tips: [
      "Flask → Binding Word → shoot is your kill combo. Flask drains stamina so they can't dash out of root.",
      "Last Stand makes you nearly unkillable but CAN be interrupted during windup. Unstoppable fixes this.",
      "Best base gun stats in the game. You win almost every straight-up gunfight.",
      "Slide-canceling with Surge of Power active gives massive value. Practice this in sandbox.",
    ],
    counters: [
      { name: "Slowing Hex", reason: "Slow him before he gets into range — Warden has to be close" },
      { name: "Knockdown", reason: "Interrupt Last Stand windup to waste his ult" },
      { name: "Toxic Bullets", reason: "Anti-heal cuts his massive Last Stand lifesteal" },
    ],
  },

  wraith: {
    name: "Wraith",
    short: "WR",
    winRate: 49.0,
    tier: "B",
    role: "Burst DPS / Ganker",
    color: "#7a5494",
    tags: ["heavy_bullet", "hard_cc", "mobility", "burst"],
    weakTo: ["long_range", "tankiness", "anti_bullet"],
    threatProfile: "High bullet burst, long-range CC stun, elusive with Project Mind",
    killPattern: "Telekinesis stun → Full Auto for massive DPS window. Card Trick for poke. Project Mind to escape or bait. Late-game Telekinesis becomes AOE stun.",
    philosophy: "Wraith scales hard with farm. Her gun + Full Auto combo shreds targets locked in Telekinesis, so we prioritize bullet damage and items that extend that DPS window. Slowing Hex gives kill setup when Telekinesis is on cooldown. Late game, Glass Cannon turns her into a hyper-carry.",
    build: {
      early: [
        { name: "Infuser", cost: 500, slot: "weapon", note: "Lifesteal pairs naturally with Full Auto's sustained fire" },
        { name: "Ammo Scavenger", cost: 500, slot: "weapon", note: "Ammo sustain so you don't run dry in extended trades" },
        { name: "Headshot Booster", cost: 500, slot: "weapon", note: "Poke damage + shield" },
        { name: "Extra Regen", cost: 500, slot: "vitality", note: "Lane sustain" },
        { name: "Sprint Boots", cost: 500, slot: "vitality", note: "Roaming speed + small gun damage bonus" },
      ],
      earlyToMid: "Hit enemies with gun to charge Card Trick, then use cards to poke from safety. Telekinesis is one of the best CCs in the game — save it for kill confirms, not poke.",
      mid: [
        { name: "Bullet Lifesteal", cost: 1250, slot: "weapon", note: "Sustain through Full Auto damage windows" },
        { name: "Kinetic Dash", cost: 1250, slot: "vitality", note: "Health + reposition" },
        { name: "Quicksilver Reload", cost: 1750, slot: "weapon", note: "Spirit proc adds burst between magazines" },
        { name: "Fleetfoot", cost: 1500, slot: "vitality", note: "Mobility for ganks — Wraith wants to roam mid-game" },
        { name: "Slowing Hex", cost: 1750, slot: "spirit", key: true, note: "Kill setup when Telekinesis is on cooldown. Hex → Full Auto melts targets who can't escape." },
      ],
      midToLate: "Wraith needs souls. Prioritize jungle farming and lane shoving over risky fights. Your late game is devastating if you get there.",
      late: [
        { name: "Glass Cannon", cost: 6200, slot: "weapon", key: true, note: "Enormous DPS spike. Wraith's scaling with raw weapon damage is among the best in the game — this item is why." },
        { name: "Silencer", cost: 6200, slot: "weapon", note: "Silence enemies during Full Auto so they can't use saves" },
        { name: "Lucky Shot", cost: 3000, slot: "weapon", note: "Ammo + slow on hit" },
        { name: "Crippling Headshot", cost: 6200, slot: "weapon", key: true, note: "If your aim is good, this rewards it massively. Headshots devastate." },
      ],
    },
    tips: [
      "Shooting enemies charges Card Trick — use cards to poke, then gun for the kill.",
      "Telekinesis upgraded becomes AOE stun. In late-game teamfights, this sets up your whole team.",
      "Project Mind lets you escape almost anything. Use it to bait aggressive enemies into overcommitting.",
      "Wraith scales extremely hard but needs farm. Prioritize souls over risky plays in the early/mid game.",
    ],
    counters: [
      { name: "Return Fire", reason: "Reflects her sustained Full Auto damage back at her" },
      { name: "Metal Skin", reason: "Become immune to bullets during her Full Auto burst window" },
      { name: "Dispel Magic", reason: "Cleanse Telekinesis stun so she can't follow up" },
    ],
  },

  mina: {
    name: "Mina",
    short: "MN",
    winRate: 47.3,
    tier: "C",
    role: "Assassin / Disruptor",
    color: "#9e4a6e",
    tags: ["heavy_bullet", "dive", "hard_cc", "disruption"],
    weakTo: ["kiting", "long_range", "group_focus"],
    threatProfile: "Melee-range dive, mind control ult, displacement pull",
    killPattern: "Spectral Grasp pulls enemies in → gun them down at close range. Spectral Possession takes over an enemy hero, removing them from the fight and displacing them.",
    philosophy: "Mina is a high-risk disruptor who needs to get into melee range to be effective. The build stacks survivability and gap-closing so she can actually reach targets. Unstoppable prevents her ult from being interrupted. Currently a weak hero (47% WR) — you need good matchups and smart target selection.",
    build: {
      early: [
        { name: "Headshot Booster", cost: 500, slot: "weapon", note: "Lane poke + shield" },
        { name: "Extra Stamina", cost: 500, slot: "weapon", note: "Fire rate for close-range trades" },
        { name: "Healing Rite", cost: 500, slot: "vitality", note: "Lane sustain — Mina takes a lot of chip damage" },
        { name: "Sprint Boots", cost: 500, slot: "vitality", note: "Gap closing speed" },
        { name: "Melee Lifesteal", cost: 500, slot: "vitality", note: "Sustain in melee trades when you commit" },
      ],
      earlyToMid: "Play lane carefully — Mina is weak early. Look for opportunities where your partner has CC to chain with Spectral Grasp.",
      mid: [
        { name: "Kinetic Dash", cost: 1250, slot: "vitality", note: "Health + dash for engage or escape" },
        { name: "Bullet Lifesteal", cost: 1250, slot: "weapon", note: "Sustain while DPSing at close range" },
        { name: "Slowing Hex", cost: 1750, slot: "spirit", key: true, note: "Hex before diving in. Targets can't escape, giving you time to get damage off." },
        { name: "Enduring Speed", cost: 1750, slot: "vitality", note: "Permanent speed — stay on top of targets" },
        { name: "Reactive Barrier", cost: 1250, slot: "vitality", note: "Auto-shield absorbs burst when you dive into the fight" },
      ],
      midToLate: "Target the enemy carry with Spectral Possession. Removing their DPS for the ult duration can swing teamfights even if you die after.",
      late: [
        { name: "Unstoppable", cost: 6200, slot: "vitality", key: true, note: "Prevents ult interruption. Without this, any stun wastes Spectral Possession." },
        { name: "Lucky Shot", cost: 3000, slot: "weapon", note: "Ammo + slow keeps targets in your range" },
        { name: "Knockdown", cost: 3000, slot: "spirit", key: true, note: "Extra hard CC for picks — stun a target, then Grasp + gun them down" },
        { name: "Vampiric Burst", cost: 6200, slot: "vitality", note: "Massive heal burst to survive after diving in" },
      ],
    },
    tips: [
      "Spectral Possession takes over an enemy — use it on the enemy carry to waste their positioning and cooldowns.",
      "Mina is C-tier (47% WR) right now. You need good lane matchups and farm to be effective.",
      "Spectral Grasp pulls enemies toward you — chain with ally CC for guaranteed kills.",
      "You're squishy despite being melee. Pick your fights carefully and always have an escape plan.",
    ],
    counters: [
      { name: "Knockdown", reason: "Stun her when she dives in — she's fragile at close range" },
      { name: "Dispel Magic", reason: "Cleanse disruption and possession effects" },
      { name: "Unstoppable", reason: "Become immune to her pull and possession" },
    ],
  },

  lash: {
    name: "Lash",
    short: "LS",
    winRate: 51.5,
    tier: "A",
    role: "Mobility / Burst / Initiator",
    color: "#4a8a5e",
    tags: ["mobility", "spirit_burst", "hard_cc", "dive"],
    weakTo: ["long_range", "hard_cc", "anti_spirit"],
    threatProfile: "Extreme mobility, AOE spirit burst from above, team-wide pull ult",
    killPattern: "Grapple to height → Ground Strike slam (damage scales with HEIGHT) → Flog for burst + heal. Death Slam pulls entire teams then stuns on ground impact.",
    philosophy: "Lash is an assassin-roamer who trades vertical mobility for kill opportunities. Greater Expansion is the keystone — it makes Ground Strike's AOE massive enough to be reliable. Quicksilver Reload imbued on Flog gives surprising sustain. Everything else feeds the burst-and-escape loop.",
    build: {
      early: [
        { name: "Healing Rite", cost: 500, slot: "vitality", note: "Lane sustain — needed for tough matchups" },
        { name: "Headshot Booster", cost: 500, slot: "weapon", note: "Burst poke from cover between cooldowns" },
        { name: "Mystic Burst", cost: 500, slot: "spirit", note: "Extra burst on Grapple combo engages" },
        { name: "Extra Charge", cost: 500, slot: "spirit", note: "More ability casts for frequent ganking" },
        { name: "Mystic Shot", cost: 500, slot: "weapon", note: "Cheap gun damage boost" },
      ],
      earlyToMid: "Grapple to adjacent lanes for ganks whenever enemies push up. Grapple → Ground Strike → Flog is your bread-and-butter burst combo.",
      mid: [
        { name: "Quicksilver Reload", cost: 1750, slot: "weapon", key: true, note: "Imbue this on Flog. Combined with Mystic Burst, it heals 150+ HP every 12 seconds. Sustain that lets you stay on the map." },
        { name: "Improved Spirit", cost: 1750, slot: "spirit", note: "Spirit power spike at the 4800 soul mark" },
        { name: "Superior Stamina", cost: 3000, slot: "vitality", key: true, note: "Mobility is everything on Lash. More dashes = more escape routes = more aggressive angles for Ground Strike." },
        { name: "Improved Burst", cost: 3000, slot: "weapon", note: "Higher kill potential on gank combos" },
        { name: "Mystic Expansion", cost: 1250, slot: "spirit", note: "Imbue on Ground Strike for bigger AOE slam radius" },
      ],
      midToLate: "With Superior Stamina, you can take aggressive high-ground positions. Start using Death Slam in grouped fights — pull enemies into Ground Strike.",
      late: [
        { name: "Greater Expansion", cost: 6200, slot: "spirit", key: true, note: "CORE. Makes Ground Strike radius massive — the difference between hitting 1 target and hitting 4. Non-negotiable." },
        { name: "Boundless Spirit", cost: 6200, slot: "spirit", note: "Huge spirit scaling spike — every ability hits harder" },
        { name: "Mystic Reverb", cost: 6200, slot: "spirit", note: "Imbue on Ground Strike for a double-hit proc. Effectively doubles slam damage." },
        { name: "Unstoppable", cost: 6200, slot: "vitality", note: "Prevents Death Slam from being interrupted by CC mid-channel" },
      ],
    },
    tips: [
      "Death Slam damage scales with HEIGHT. Grapple up high before slamming for maximum damage.",
      "Grapple works on guardians, walkers, troopers — use everything on the map for vertical mobility.",
      "Ground Strike rotation was nerfed to 90° (was 360°). You must aim it now, no more free spins.",
      "Flog is instant cast — use it immediately after Ground Strike while enemies are still airborne.",
    ],
    counters: [
      { name: "Knockdown", reason: "Stun him out of the air during Grapple or Death Slam" },
      { name: "Spirit Armor", reason: "Reduces his Ground Strike and Flog burst damage" },
      { name: "Slowing Hex", reason: "Ground him so he can't use vertical mobility to escape" },
    ],
  },

  bebop: {
    name: "Bebop",
    short: "BB",
    winRate: 47.7,
    tier: "B",
    role: "Hook Combo / Spirit Burst",
    color: "#6a7a8e",
    tags: ["hard_cc", "spirit_burst", "aoe", "disruption"],
    weakTo: ["mobility", "long_range", "burst"],
    threatProfile: "Hook displacement, Sticky Bomb spirit burst, Hyper Beam sustained zone denial",
    killPattern: "Hook from unexpected angle → Exploding Uppercut away from safety → Sticky Bomb (Echo Shard for double bomb). Late game: Hyper Beam from elevation melts grouped enemies.",
    philosophy: "Bebop creates picks with Hook and punishes positioning mistakes. Echo Shard is non-negotiable — it doubles Sticky Bomb for massive spirit burst. Everything else serves the Hook→Bomb→Uppercut combo loop. If you can't land hooks, Bebop doesn't work. His massive HP pool makes him deceptively hard to kill, but he has zero mobility — if Hook is on cooldown, walk away.",
    build: {
      early: [
        { name: "Headshot Booster", cost: 500, slot: "weapon", note: "Shield + damage for lane poke between hooks" },
        { name: "Extra Spirit", cost: 500, slot: "spirit", note: "Increases Sticky Bomb damage from the start" },
        { name: "Mystic Burst", cost: 500, slot: "spirit", note: "Spirit proc adds burst to your combo engages" },
        { name: "Extra Stamina", cost: 500, slot: "weapon", note: "Fire rate + stamina for ganking between lanes" },
        { name: "Healing Rite", cost: 500, slot: "vitality", note: "Lane sustain — Bebop takes chip damage from lack of mobility" },
      ],
      earlyToMid: "Always Be Bombing — stick a Sticky Bomb to enemy heroes at every opportunity. Use Hyper Beam to farm T3 jungle camps starting at 8 minutes for a huge soul lead.",
      mid: [
        { name: "Echo Shard", cost: 3000, slot: "spirit", key: true, note: "NON-NEGOTIABLE. Doubles Sticky Bomb — Hook → Uppercut → Bomb → Echo → Bomb is your kill combo. Rush this." },
        { name: "Warp Stone", cost: 3000, slot: "spirit", key: true, note: "Engage/escape tool. Also gives bullet resist so you survive while setting up hooks." },
        { name: "Improved Spirit", cost: 1750, slot: "spirit", note: "Raw spirit power spike — every bomb hits harder" },
        { name: "Arcane Surge", cost: 1750, slot: "spirit", note: "Range + duration + stamina for aggressive play" },
        { name: "Fleetfoot", cost: 1500, slot: "vitality", note: "Movement speed partially patches Bebop's zero-mobility problem" },
      ],
      midToLate: "Your combo is Hook → Exploding Uppercut → Sticky Bomb → Echo Shard → Sticky Bomb. Practice until muscle memory. One clean combo kills most heroes.",
      late: [
        { name: "Boundless Spirit", cost: 6200, slot: "spirit", key: true, note: "Massive spirit scaling — every bomb, every Hyper Beam tick hits dramatically harder" },
        { name: "Mystic Reverb", cost: 6200, slot: "spirit", note: "Extra spirit damage proc on abilities — synergizes with double-bomb combo" },
        { name: "Superior Cooldown", cost: 6200, slot: "spirit", note: "More hooks, more bombs, more Hyper Beams" },
        { name: "Knockdown", cost: 3000, slot: "spirit", note: "Extra hard CC for picks when Hook is on cooldown" },
      ],
    },
    tips: [
      "Hook → 180° turn → Uppercut sends enemies flying behind you into your team. This is THE Bebop play.",
      "You can hook allies — use it to save a teammate being chased or pull them into better position.",
      "Hyper Beam farms T3 jungle camps at 8 minutes. Do this on cooldown for massive soul advantage.",
      "If you miss Hook, walk away. Bebop without Hook cooldown is a giant, slow target.",
    ],
    counters: [
      { name: "Unstoppable", reason: "Become immune to Hook displacement — removes his entire combo" },
      { name: "Reactive Barrier", reason: "Auto-shield absorbs Sticky Bomb spirit burst" },
      { name: "Debuff Remover", reason: "Cleanse Sticky Bomb before it detonates for full damage" },
    ],
  },

  abrams: {
    name: "Abrams",
    short: "AB",
    winRate: 53.0,
    tier: "S",
    role: "Tank / Bruiser / Frontline",
    color: "#8a6a3a",
    tags: ["heavy_bullet", "dive", "sustain", "hard_cc"],
    weakTo: ["kiting", "long_range", "anti_heal"],
    threatProfile: "Extremely tanky with passive regen, Shoulder Charge wall-stun, Siphon Life drain, AOE stun ult",
    killPattern: "Shoulder Charge → pin into wall (1s stun) → shotgun + melee at point blank. Siphon Life drains health during the brawl. Seismic Impact for AOE teamfight stun.",
    philosophy: "Abrams is the simplest hero in the game: charge in, stun them into a wall, shotgun them at point blank. His passive Infernal Resilience regenerates a huge portion of damage taken, making him incredibly hard to kill. The build stacks close-range damage, sustain, and tankiness. Healbane is critical because anti-heal on the enemy counters THEIR sustain while Abrams out-regens them.",
    build: {
      early: [
        { name: "Extra Regen", cost: 500, slot: "vitality", note: "Stacks with Infernal Resilience passive for dominant laning regen" },
        { name: "Close Quarters", cost: 500, slot: "weapon", note: "Melee damage + bullet resist for close-range brawling" },
        { name: "Melee Lifesteal", cost: 500, slot: "vitality", note: "Sustain through melee trades — Abrams lives in melee range" },
        { name: "Sprint Boots", cost: 500, slot: "vitality", note: "Gap closing speed to reach targets" },
        { name: "Headshot Booster", cost: 500, slot: "weapon", note: "Shield + damage for shotgun poke" },
      ],
      earlyToMid: "Bully enemies with superior regen. Pin them into walls with Shoulder Charge — wall stun is basically a guaranteed kill with your lane partner following up.",
      mid: [
        { name: "Healbane", cost: 1250, slot: "spirit", key: true, note: "Anti-heal on enemies while you out-regen them. Instant heal on kill synergizes perfectly with Abrams' brawling." },
        { name: "Kinetic Dash", cost: 1250, slot: "vitality", note: "Health + dash for gap closing" },
        { name: "Enduring Speed", cost: 1750, slot: "vitality", note: "Permanent move speed — very hard to kite" },
        { name: "Warp Stone", cost: 3000, slot: "spirit", note: "Teleport engage + bullet resist for diving backline" },
        { name: "Weighted Shots", cost: 1250, slot: "weapon", note: "Extra resist + 30% damage on first hit — huge with shotgun" },
      ],
      midToLate: "You can 1v1 almost anyone. Look for isolated targets and dive aggressively. Shoulder Charge into walls is still your bread and butter.",
      late: [
        { name: "Colossus", cost: 6200, slot: "vitality", key: true, note: "Massive resist aura + weapon damage. Turns Abrams from tanky to nearly unkillable while boosting DPS." },
        { name: "Point Blank", cost: 6200, slot: "weapon", key: true, note: "Enormous close-range damage spike + negative bullet resist on enemies. Core for late-game kills." },
        { name: "Unstoppable", cost: 6200, slot: "vitality", note: "Prevents CC from interrupting your engages. Essential vs CC-heavy teams." },
        { name: "Leech", cost: 6200, slot: "spirit", note: "Spirit lifesteal + bullet lifesteal combined — sustain through anything" },
      ],
    },
    tips: [
      "Pin enemies into walls with Shoulder Charge for a 1-second stun. This is your most important mechanic — learn wall positions.",
      "Infernal Resilience regenerates damage over 16 seconds. You're much tankier than your HP bar suggests.",
      "Don't heavy melee after Charge until it's level 2 — the stun is too short and they'll parry you.",
      "Seismic Impact level 3 grants CC immunity on cast. Save it to escape stun chains in teamfights.",
    ],
    counters: [
      { name: "Toxic Bullets", reason: "Anti-heal cuts his massive passive regeneration in half" },
      { name: "Slowing Hex", reason: "Slow him before he reaches you — Abrams must be in melee range to function" },
      { name: "Knockdown", reason: "Stun him to interrupt Shoulder Charge or waste Seismic Impact timing" },
    ],
  },

  shiv: {
    name: "Shiv",
    short: "SH",
    winRate: 47.0,
    tier: "C",
    role: "Melee Assassin / Bruiser",
    color: "#8a4a4a",
    tags: ["heavy_bullet", "dive", "single_target", "sustain"],
    weakTo: ["hard_cc", "long_range", "burst"],
    threatProfile: "Bleed DOT from knives, deferred damage passive (deceptively tanky), high mobility dash, execute ult",
    killPattern: "Serrated Knives bleed poke → Slice and Dice gap close → gun at point blank → Killing Blow execute when target is low HP. Bloodletting passive defers damage, making him seem unkillable in short trades.",
    philosophy: "Shiv is about controlled aggression — poke with knives to build bleed, then dash in for the execute. Bloodletting defers a portion of damage taken, making him deceptively tanky in short trades. The build focuses on bleed amplification and sustain so he can outlast targets at close range. Currently a weak hero (47% WR) — requires disciplined play and good target selection to succeed.",
    build: {
      early: [
        { name: "Restorative Shot", cost: 500, slot: "weapon", note: "Best sustain item in lane — time the cooldown for maximum value" },
        { name: "Extra Charge", cost: 500, slot: "spirit", note: "More Serrated Knives charges for constant bleed poke" },
        { name: "Headshot Booster", cost: 500, slot: "weapon", note: "Shield + damage for close-range trades" },
        { name: "Extra Health", cost: 500, slot: "vitality", note: "Raw survivability for aggressive trades" },
        { name: "Healing Rite", cost: 500, slot: "vitality", note: "Additional lane sustain for tough matchups" },
      ],
      earlyToMid: "Throw Serrated Knives constantly — the bleed adds up. Don't fight too early, Shiv needs items to come online. Farm efficiently and avoid unnecessary deaths.",
      mid: [
        { name: "Healbane", cost: 1250, slot: "spirit", key: true, note: "Anti-heal + instant heal on kill synergizes perfectly with Killing Blow execute. Core item." },
        { name: "Kinetic Dash", cost: 1250, slot: "vitality", note: "Health + dash for engaging or escaping" },
        { name: "Torment Pulse", cost: 1250, slot: "spirit", note: "Passive spirit damage aura for melee trades + faster jungle clearing" },
        { name: "Warp Stone", cost: 3000, slot: "spirit", key: true, note: "Teleport-dive squishy targets. Warp in → combo → Killing Blow for instant picks." },
        { name: "Reactive Barrier", cost: 1250, slot: "vitality", note: "Auto-shield absorbs burst when you dive into fights" },
      ],
      midToLate: "With Warp Stone, you can teleport onto squishy backliners. Save Killing Blow for the execute — it does more damage the lower the target's HP.",
      late: [
        { name: "Escalating Exposure", cost: 6200, slot: "spirit", key: true, note: "Stacking spirit damage amplification — every bleed tick increases subsequent damage. Synergizes with Shiv's sustained damage pattern." },
        { name: "Unstoppable", cost: 6200, slot: "vitality", note: "CC immunity for diving in without getting locked down" },
        { name: "Leech", cost: 6200, slot: "spirit", note: "Spirit + bullet lifesteal for sustain through extended fights" },
        { name: "Berserker", cost: 3000, slot: "weapon", note: "More damage as you take hits — synergizes with Bloodletting's deferred damage" },
      ],
    },
    tips: [
      "Bloodletting defers damage — you're tankier than you look in short trades. Don't panic at low HP.",
      "Killing Blow is an execute — more damage based on missing HP. Use it as a finisher, never an opener.",
      "Serrated Knives are free poke. Throw them between every other action, constantly.",
      "Shiv glows red at max Rage. Enemies can see this — it telegraphs your power spike.",
    ],
    counters: [
      { name: "Spirit Armor", reason: "Flat reduction against his bleed and ability damage" },
      { name: "Knockdown", reason: "Stun him when he Slice and Dices in — he's fragile if locked down" },
      { name: "Slowing Hex", reason: "Remove his mobility so he can't stick to targets or escape" },
    ],
  },

  infernus: {
    name: "Infernus",
    short: "IF",
    winRate: 49.4,
    tier: "B",
    role: "DOT / Fire / Brawler",
    color: "#b86a30",
    tags: ["spirit_burst", "aoe", "sustain", "hard_cc"],
    weakTo: ["long_range", "anti_heal", "burst"],
    threatProfile: "Afterburn DOT stacking, Flame Dash mobility + damage, Concussive Combustion delayed AOE stun, massive late-game lifesteal",
    killPattern: "Apply Afterburn via gun → Catalyst burst → Flame Dash through for damage + reposition. Concussive Combustion for delayed AOE stun in grouped fights. Late game: unkillable with spirit lifesteal sustain.",
    philosophy: "Infernus stacks DOTs on everything he touches. Afterburn from his gun builds damage over time, Catalyst amplifies it, and Flame Dash lets him weave in and out. Toxic Bullets synergize with his DOT-heavy kit. Late game with Leech and spirit lifesteal, he becomes nearly unkillable in sustained fights. The core tension: he needs to be close to deal damage, but he's not inherently tanky until items cover that gap.",
    build: {
      early: [
        { name: "Headshot Booster", cost: 500, slot: "weapon", note: "Shield + damage for lane poke" },
        { name: "Healing Rite", cost: 500, slot: "vitality", note: "Lane sustain" },
        { name: "Infuser", cost: 500, slot: "weapon", note: "Lifesteal + spirit power for stronger Afterburn" },
        { name: "Enduring Spirit", cost: 500, slot: "spirit", note: "Spirit power + survivability for early trades" },
        { name: "Sprint Boots", cost: 500, slot: "vitality", note: "Movement speed for aggressive Flame Dash engages" },
      ],
      earlyToMid: "Apply Afterburn constantly — even brief trades stack DOTs that win attrition over time. Use Flame Dash to clear jungle camps between waves for soul advantage.",
      mid: [
        { name: "Toxic Bullets", cost: 1250, slot: "weapon", key: true, note: "Bleed DOT stacks with Afterburn — enemies take double DOT. Also applies anti-heal. Core synergy item." },
        { name: "Spirit Lifesteal", cost: 1250, slot: "spirit", note: "Sustain through ability damage — Afterburn ticks heal you" },
        { name: "Duration Extender", cost: 1250, slot: "spirit", note: "Longer Afterburn and Flame Dash uptime — more damage per engagement" },
        { name: "Kinetic Dash", cost: 1250, slot: "vitality", note: "Health + reposition for aggressive plays" },
        { name: "Suppressor", cost: 1250, slot: "spirit", note: "Slow enemies to keep them in Afterburn range" },
      ],
      midToLate: "You should be near the top of the damage scoreboard. Farm jungle with Flame Dash, then look for Concussive Combustion angles in teamfight objectives.",
      late: [
        { name: "Leech", cost: 6200, slot: "spirit", key: true, note: "Combined spirit + bullet lifesteal. With DOTs ticking on multiple enemies, you heal through basically everything. This is your godmode item." },
        { name: "Escalating Exposure", cost: 6200, slot: "spirit", key: true, note: "Stacking spirit amp — every DOT tick increases subsequent damage. Infernus applies this faster than almost anyone." },
        { name: "Boundless Spirit", cost: 6200, slot: "spirit", note: "Massive spirit scaling — every Afterburn tick, every Flame Dash hits harder" },
        { name: "Unstoppable", cost: 6200, slot: "vitality", note: "CC immunity so you can Flame Dash into fights without being stunned out" },
      ],
    },
    tips: [
      "Afterburn refreshes duration with every hit. Keep shooting to keep the DOT ticking indefinitely.",
      "Flame Dash is your only escape. Don't waste it aggressively unless you're certain of the kill.",
      "Concussive Combustion has a delayed fuse. Flame Dash into enemies and time it so they can't escape the stun.",
      "Late game with Leech, you heal through almost anything. Prioritize sustained fights over quick trades.",
    ],
    counters: [
      { name: "Debuff Remover", reason: "Cleanses Afterburn DOT — removes his primary damage source entirely" },
      { name: "Healbane", reason: "Cuts his massive spirit lifesteal sustain that makes him unkillable late game" },
      { name: "Metal Skin", reason: "Bullet immunity stops Afterburn application — no bullets means no burn" },
    ],
  },

  viscous: {
    name: "Viscous",
    short: "VS",
    winRate: 52.2,
    tier: "A",
    role: "Utility Tank / Disruptor",
    color: "#5a9a7a",
    tags: ["hard_cc", "sustain", "aoe", "disruption"],
    weakTo: ["long_range", "burst", "anti_heal"],
    threatProfile: "Puddle Punch displacement, Splatter slow zones, The Cube healing/invulnerability, Goo Ball mobile stun",
    killPattern: "Splatter slow → Puddle Punch enemies into team → allies gun them down. The Cube saves allies from burst. Goo Ball rolls in for mobile engage with stun on impact.",
    philosophy: "Viscous is a nuisance — tanky enough to not ignore, disruptive enough to not let play. Puddle Punch repositions enemies into bad spots, Splatter zones them out, and The Cube saves allies at critical moments. Goo Ball upgraded lets him cast abilities while rolling, becoming an unstoppable CC machine. High skill ceiling but rewarding. The build stacks spirit for Splatter damage and survivability for frontline presence.",
    build: {
      early: [
        { name: "Melee Lifesteal", cost: 500, slot: "vitality", note: "Puddle Punch counts as light melee — procs lifesteal for free sustain" },
        { name: "Spirit Strike", cost: 500, slot: "spirit", note: "Reduces enemy spirit resist on hit — follow up with Splatter for more damage" },
        { name: "Extra Charge", cost: 500, slot: "spirit", note: "More Puddle Punch charges for lane control and deny" },
        { name: "Mystic Burst", cost: 500, slot: "spirit", note: "Spirit proc for stronger ability burst combos" },
        { name: "Extra Health", cost: 500, slot: "vitality", note: "Raw survivability for frontline presence" },
      ],
      earlyToMid: "Puddle Punch acts as light melee — spam it for Melee Lifesteal procs and to deny souls by punching the wave. Splatter from distance to poke safely.",
      mid: [
        { name: "Warp Stone", cost: 3000, slot: "spirit", key: true, note: "Teleport in → Puddle Punch enemies into your team. Also works while in Goo Ball for surprise engages." },
        { name: "Spirit Lifesteal", cost: 1250, slot: "spirit", note: "Sustain through Splatter and ability damage" },
        { name: "Kinetic Dash", cost: 1250, slot: "vitality", note: "Health + dash for repositioning" },
        { name: "Improved Spirit", cost: 1750, slot: "spirit", note: "Raw spirit power — Splatter and Goo Ball hit harder" },
        { name: "Superior Cooldown", cost: 6200, slot: "spirit", key: true, note: "More ability uptime — more punches, more Splatters, more Cubes. Core quality-of-life item." },
      ],
      midToLate: "The Cube can protect allies channeling abilities (like Seven's Storm Cloud) without interrupting them. Use Warp Stone + Puddle Punch from unexpected angles.",
      late: [
        { name: "Boundless Spirit", cost: 6200, slot: "spirit", key: true, note: "Massive spirit scaling — Splatter becomes a real damage threat, not just a slow" },
        { name: "Colossus", cost: 6200, slot: "vitality", note: "Resist aura + weapon damage. Makes Viscous genuinely hard to kill as a frontliner." },
        { name: "Unstoppable", cost: 6200, slot: "vitality", note: "CC immunity for Goo Ball engages — roll through stuns" },
        { name: "Escalating Exposure", cost: 6200, slot: "spirit", note: "Stacking spirit amp from frequent ability hits" },
      ],
    },
    tips: [
      "The Cube cast on allies channeling abilities (Seven ult, McGinnis turrets) does NOT interrupt them — it just protects.",
      "Puddle Punch from unexpected angles to displace enemies into your team or off high ground.",
      "Goo Ball fully upgraded lets you cast abilities while rolling — Splatter + roll through is devastating.",
      "Viscous is hard to learn. Expect 10+ games before his kit clicks. The skill ceiling is very high.",
    ],
    counters: [
      { name: "Knockdown", reason: "Stun him out of Goo Ball — he's vulnerable when it ends early" },
      { name: "Debuff Remover", reason: "Cleanse Splatter slow so your team can reposition" },
      { name: "Toxic Bullets", reason: "Anti-heal cuts The Cube's healing, reducing his save potential" },
    ],
  },

  paige: {
    name: "Paige",
    short: "PG",
    winRate: 52.5,
    tier: "A",
    role: "Support / Buffer / Controller",
    color: "#7a6a9e",
    tags: ["hard_cc", "aoe", "disruption", "sustain"],
    weakTo: ["dive", "burst", "single_target"],
    threatProfile: "Root/slow from Captivating Read, DPS buffs + barriers on allies via Defend and Fight!, Conjure Dragon zone damage, Rallying Charge cavalry stun",
    killPattern: "Captivating Read root → buffed ally guns you down. Defend and Fight! barriers + DPS buff turns her carry into a raid boss. Rallying Charge global cavalry stun in teamfight objectives.",
    philosophy: "Paige doesn't kill you — she makes her allies kill you faster while keeping them alive. Defend and Fight! gives massive barriers and damage buffs to carries like Haze or Wraith. The build stacks support items (Divine Barrier, Rescue Beam) to maximize ally uptime. Paige is extremely fragile with only 2 base stamina and no mobility tools. If she gets caught alone, she dies. Positioning is everything.",
    build: {
      early: [
        { name: "High-Velocity Rounds", cost: 500, slot: "weapon", note: "Fire rate makes her awkward gun feel better for last-hitting" },
        { name: "Guardian Ward", cost: 500, slot: "vitality", note: "Buy early — keeps your lane partner alive through trades" },
        { name: "Healing Rite", cost: 500, slot: "vitality", note: "Lane sustain for yourself" },
        { name: "Extra Stamina", cost: 500, slot: "weapon", note: "She only has 2 base stamina. This is mandatory for survival." },
        { name: "Mystic Burst", cost: 500, slot: "spirit", note: "Spirit proc for stronger Conjure Dragon and Captivating Read" },
      ],
      earlyToMid: "Poke with your gun — it's surprisingly strong early. Buy Guardian Ward first to keep your lane partner alive. Stay behind your ally at ALL times.",
      mid: [
        { name: "Slowing Hex", cost: 1750, slot: "spirit", key: true, note: "Hex → Captivating Read root is almost guaranteed. Essential CC chain setup." },
        { name: "Arcane Surge", cost: 1750, slot: "spirit", note: "Range + duration + stamina for safer positioning" },
        { name: "Reactive Barrier", cost: 1250, slot: "vitality", note: "Auto-shield saves you when assassins dive you" },
        { name: "Express Shot", cost: 1250, slot: "weapon", note: "Easier application of slows + utility for team" },
        { name: "Divine Barrier", cost: 6200, slot: "vitality", key: true, note: "STACKS with Defend and Fight! barriers. Use both together on your carry for massive shield + DPS buff. This combo wins teamfights." },
      ],
      midToLate: "Divine Barrier + Defend and Fight! on your carry makes them nearly unkillable. Stay in backline, root divers with Captivating Read, and buff your best player.",
      late: [
        { name: "Rescue Beam", cost: 3000, slot: "vitality", key: true, note: "Pull allies to safety + heal. Can pull someone out of The Cube (Viscous) or save a carry being dived." },
        { name: "Knockdown", cost: 3000, slot: "spirit", note: "Extra hard CC — stun a diver trying to reach you or your carry" },
        { name: "Boundless Spirit", cost: 6200, slot: "spirit", note: "Spirit scaling for stronger Conjure Dragon and roots" },
        { name: "Unstoppable", cost: 6200, slot: "vitality", note: "CC immunity so you can't be locked down before casting saves" },
      ],
    },
    tips: [
      "Defend and Fight! + Divine Barrier on your carry = massive barrier + DPS buff. This combo wins teamfights on its own.",
      "Paige has 2 base stamina — she is incredibly slow. Never get caught alone. Ever.",
      "Captivating Read roots enemies — chain with ally CC for guaranteed kills in lane.",
      "Rallying Charge summons cavalry across the map. Save it for grouped teamfight objectives, not solo picks.",
    ],
    counters: [
      { name: "Slowing Hex", reason: "Slow her — she already has no escape tools and minimal stamina" },
      { name: "Knockdown", reason: "Stun her in teamfights before she can buff/save allies" },
      { name: "Silence Wave", reason: "Silence prevents her from casting barriers and heals at critical moments" },
    ],
  },
};

// Matchup matrix: matchups[yourHero][enemyHero] = your win rate %
const MATCHUPS = {
  haze:     { haze: 50, seven: 50.1, warden: 52.5, wraith: 52.0, mina: 53.5, lash: 50.1, bebop: 53.5, abrams: 52.0, shiv: 54.0, infernus: 51.5, viscous: 50.5, paige: 54.0 },
  seven:    { haze: 49.9, seven: 50, warden: 52.8, wraith: 53.0, mina: 55.2, lash: 49.5, bebop: 53.0, abrams: 50.0, shiv: 54.5, infernus: 52.0, viscous: 50.5, paige: 52.5 },
  warden:   { haze: 47.5, seven: 47.2, warden: 50, wraith: 51.5, mina: 53.0, lash: 50.1, bebop: 52.0, abrams: 49.0, shiv: 52.5, infernus: 50.5, viscous: 49.0, paige: 51.5 },
  wraith:   { haze: 48.0, seven: 47.0, warden: 48.5, wraith: 50, mina: 52.0, lash: 48.4, bebop: 51.5, abrams: 47.5, shiv: 51.0, infernus: 49.5, viscous: 48.0, paige: 50.5 },
  mina:     { haze: 46.5, seven: 44.8, warden: 47.0, wraith: 48.0, mina: 50, lash: 47.5, bebop: 49.0, abrams: 45.5, shiv: 49.5, infernus: 48.0, viscous: 46.5, paige: 49.5 },
  lash:     { haze: 49.9, seven: 50.5, warden: 49.9, wraith: 51.6, mina: 52.5, lash: 50, bebop: 53.5, abrams: 49.5, shiv: 52.5, infernus: 51.0, viscous: 50.0, paige: 52.0 },
  bebop:    { haze: 46.5, seven: 47.0, warden: 48.0, wraith: 48.5, mina: 51.0, lash: 46.5, bebop: 50, abrams: 48.5, shiv: 49.5, infernus: 48.0, viscous: 47.5, paige: 49.5 },
  abrams:   { haze: 48.0, seven: 50.0, warden: 51.0, wraith: 52.5, mina: 54.5, lash: 50.5, bebop: 51.5, abrams: 50, shiv: 54.0, infernus: 49.0, viscous: 49.5, paige: 53.0 },
  shiv:     { haze: 46.0, seven: 45.5, warden: 47.5, wraith: 49.0, mina: 50.5, lash: 47.5, bebop: 50.5, abrams: 46.0, shiv: 50, infernus: 48.0, viscous: 46.5, paige: 50.0 },
  infernus: { haze: 48.5, seven: 48.0, warden: 49.5, wraith: 50.5, mina: 52.0, lash: 49.0, bebop: 52.0, abrams: 51.0, shiv: 52.0, infernus: 50, viscous: 49.0, paige: 51.5 },
  viscous:  { haze: 49.5, seven: 49.5, warden: 51.0, wraith: 52.0, mina: 53.5, lash: 50.0, bebop: 52.5, abrams: 50.5, shiv: 53.5, infernus: 51.0, viscous: 50, paige: 51.0 },
  paige:    { haze: 46.0, seven: 47.5, warden: 48.5, wraith: 49.5, mina: 50.5, lash: 48.0, bebop: 50.5, abrams: 47.0, shiv: 50.0, infernus: 48.5, viscous: 49.0, paige: 50 },
};

// ═══════════════════════════════════════════════════════
// PALETTE — Warm noir, desaturated, Deadlock-inspired
// Weapon=orange, Vitality=green, Spirit=purple (canonical)
// ═══════════════════════════════════════════════════════
const P = {
  bg: "#111114",
  surface: "#18181c",
  surfaceRaised: "#1e1e24",
  border: "#2a2a30",
  borderSubtle: "#222228",
  text: "#c8c4bc",
  textMuted: "#8a877f",
  textDim: "#5a5850",
  textBright: "#e8e4dc",
  weapon: { bg: "#1e1912", border: "#3d3420", text: "#b8963a", textDim: "#8a7030" },
  vitality: { bg: "#121e16", border: "#203d28", text: "#5a9e6a", textDim: "#3a7048" },
  spirit: { bg: "#1a141e", border: "#30203d", text: "#9070b8", textDim: "#6a4a8a" },
};

// ═══════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════

function Monogram({ hero, size = 36, selected = false, onClick, dimmed = false }) {
  const s = {
    width: size,
    height: size,
    borderRadius: 6,
    border: `1.5px solid ${selected ? hero.color : dimmed ? P.borderSubtle : P.border}`,
    background: selected ? `${hero.color}18` : P.surface,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: onClick ? "pointer" : "default",
    transition: "all 0.12s ease",
    opacity: dimmed ? 0.4 : 1,
    flexShrink: 0,
  };
  return (
    <div style={s} onClick={onClick}>
      <span style={{
        fontSize: size * 0.36,
        fontWeight: 700,
        color: selected ? hero.color : P.textMuted,
        letterSpacing: 0.5,
        fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
      }}>
        {hero.short}
      </span>
    </div>
  );
}

function HeroSelector({ heroId, hero, selected, onClick, showMeta = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <Monogram hero={hero} size={52} selected={selected} onClick={onClick} />
      <span style={{ fontSize: 11, color: selected ? hero.color : P.textMuted, fontWeight: selected ? 600 : 400 }}>
        {hero.name}
      </span>
      {showMeta && (
        <span style={{ fontSize: 10, color: P.textDim }}>
          {hero.tier} · {hero.winRate}%
        </span>
      )}
    </div>
  );
}

function ItemRow({ item, isKey = false, isCounter = false }) {
  const [expanded, setExpanded] = useState(false);
  const slotColors = P[item.slot] || P.weapon;
  const showNote = expanded || isKey || isCounter;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: isCounter ? "#1e1418" : slotColors.bg,
        border: `1px solid ${isKey ? `${slotColors.text}40` : isCounter ? "#3d202a" : slotColors.border}`,
        borderRadius: 6,
        padding: "7px 10px",
        cursor: "pointer",
        borderLeft: isKey ? `3px solid ${slotColors.text}` : isCounter ? "3px solid #9e4a5a" : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          {isCounter && <span style={{ color: "#9e5a5a", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>VS</span>}
          <span style={{
            color: isCounter ? "#c8887a" : slotColors.text,
            fontWeight: isKey ? 600 : 400,
            fontSize: 13,
          }}>
            {item.name}
          </span>
        </div>
        {item.cost && (
          <span style={{
            color: P.textDim,
            fontSize: 11,
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            flexShrink: 0,
          }}>
            {item.cost >= 1000 ? `${(item.cost / 1000).toFixed(1)}k` : item.cost}
          </span>
        )}
      </div>
      {showNote && (item.note || item.reason) && (
        <div style={{
          color: isCounter ? "#9e8a84" : P.textMuted,
          fontSize: 12,
          marginTop: 4,
          lineHeight: 1.45,
        }}>
          {item.note || item.reason}
        </div>
      )}
    </div>
  );
}

function BuildPhase({ label, items, transitionNote }) {
  const colors = { EARLY: "#6a9a5a", MID: "#b89a4a", LATE: "#9a5a5a" };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: colors[label] || P.textMuted,
        letterSpacing: 1.5,
        marginBottom: 6,
        fontFamily: "'SF Mono', 'Fira Code', monospace",
      }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((item, i) => <ItemRow key={i} item={item} isKey={item.key} />)}
      </div>
      {transitionNote && (
        <div style={{
          fontSize: 11,
          color: P.textDim,
          marginTop: 8,
          paddingLeft: 10,
          borderLeft: `2px solid ${P.borderSubtle}`,
          lineHeight: 1.5,
          fontStyle: "italic",
        }}>
          {transitionNote}
        </div>
      )}
    </div>
  );
}

function MatchupDetail({ yourHeroId, enemyId }) {
  const you = HEROES[yourHeroId];
  const enemy = HEROES[enemyId];
  const wr = MATCHUPS[yourHeroId]?.[enemyId] || 50;
  const adv = wr - 50;
  const advColor = adv > 2 ? "#5a9a5a" : adv < -2 ? "#9a5a5a" : "#9a8a4a";
  const advLabel = adv > 2 ? "Favored" : adv < -2 ? "Unfavored" : "Even";

  return (
    <div style={{
      background: P.surface,
      border: `1px solid ${P.border}`,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Monogram hero={enemy} size={28} selected />
        <span style={{ color: enemy.color, fontWeight: 600, fontSize: 14, flex: 1 }}>{enemy.name}</span>
        <span style={{
          color: advColor,
          fontWeight: 700,
          fontSize: 12,
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}>
          {wr.toFixed(1)}%
        </span>
        <span style={{ color: P.textDim, fontSize: 10 }}>{advLabel}</span>
      </div>

      {/* Win rate bar */}
      <div style={{ height: 3, background: P.borderSubtle, borderRadius: 2, marginBottom: 10, overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute",
          left: adv >= 0 ? "50%" : `${wr}%`,
          width: `${Math.abs(adv)}%`,
          height: "100%",
          background: advColor,
          borderRadius: 2,
        }} />
      </div>

      {/* Threat info */}
      <div style={{ fontSize: 12, color: P.textMuted, marginBottom: 6, lineHeight: 1.45 }}>
        <span style={{ color: P.textDim, fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>THREAT </span>
        {enemy.threatProfile}
      </div>
      <div style={{ fontSize: 12, color: P.textMuted, marginBottom: 10, lineHeight: 1.45 }}>
        <span style={{ color: P.textDim, fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>WATCH FOR </span>
        {enemy.killPattern}
      </div>

      {/* Counter items */}
      <div style={{ fontSize: 10, color: P.textDim, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>
        COUNTER ITEMS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {enemy.counters.map((c, i) => (
          <ItemRow key={i} item={{ ...c, slot: "vitality" }} isCounter />
        ))}
      </div>
    </div>
  );
}

function Section({ label, children, noPad = false }) {
  return (
    <div style={{
      background: P.surface,
      border: `1px solid ${P.border}`,
      borderRadius: 8,
      padding: noPad ? 0 : 14,
      marginBottom: 12,
    }}>
      {label && (
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: P.textDim,
          letterSpacing: 1.5,
          marginBottom: 10,
          padding: noPad ? "14px 14px 0" : 0,
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}>
          {label}
        </div>
      )}
      <div style={{ padding: noPad ? "0 14px 14px" : 0 }}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════

export default function DeadlockAdvisor() {
  const [selectedHero, setSelectedHero] = useState(null);
  const [lanePartner, setLanePartner] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [selectingFor, setSelectingFor] = useState(null);
  const [showAllMatchups, setShowAllMatchups] = useState(false);

  const hero = selectedHero ? HEROES[selectedHero] : null;

  const resetLane = useCallback(() => {
    setLanePartner(null);
    setEnemies([]);
    setSelectingFor(null);
  }, []);

  const handlePick = useCallback((id) => {
    if (selectingFor === "partner") {
      setLanePartner(id);
      setSelectingFor("enemy");
    } else if (selectingFor === "enemy") {
      if (enemies.includes(id)) {
        setEnemies(enemies.filter(e => e !== id));
      } else if (enemies.length < 2) {
        const next = [...enemies, id];
        setEnemies(next);
        if (next.length === 2) setSelectingFor(null);
      }
    }
  }, [selectingFor, enemies]);

  const pickableHeroes = Object.keys(HEROES).filter(id => {
    if (selectingFor === "partner") return id !== selectedHero;
    if (selectingFor === "enemy") return id !== selectedHero && id !== lanePartner;
    return true;
  });

  // ─── Render: Hero Selection ─────────────────────────
  if (!selectedHero) {
    return (
      <div style={{ minHeight: "100vh", background: P.bg, padding: 20, maxWidth: 460, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: P.textBright,
            letterSpacing: 2,
            fontFamily: "'SF Mono', 'Fira Code', monospace",
          }}>
            DEADLOCK ADVISOR
          </div>
          <div style={{ fontSize: 10, color: P.textDim, marginTop: 6 }}>
            Select your hero
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {Object.entries(HEROES).map(([id, h]) => (
            <HeroSelector
              key={id}
              heroId={id}
              hero={h}
              selected={false}
              onClick={() => setSelectedHero(id)}
              showMeta
            />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 10, color: P.textDim }}>
          12-hero prototype · updated 2026-02-06
        </div>
      </div>
    );
  }

  // ─── Render: Hero Detail ────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: P.bg,
      color: P.text,
      fontFamily: "'Segoe UI', 'SF Pro Text', -apple-system, sans-serif",
      padding: 14,
      maxWidth: 460,
      margin: "0 auto",
    }}>
      {/* Hero Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
        padding: "10px 12px",
        background: P.surface,
        borderRadius: 8,
        border: `1px solid ${P.border}`,
      }}>
        <Monogram hero={hero} size={40} selected />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: hero.color }}>{hero.name}</span>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "1px 6px",
              borderRadius: 3,
              border: `1px solid ${P.border}`,
              color: P.textMuted,
            }}>
              {hero.tier} · {hero.winRate}%
            </span>
          </div>
          <div style={{ fontSize: 11, color: P.textDim, marginTop: 1 }}>{hero.role}</div>
        </div>
        <button
          onClick={() => { setSelectedHero(null); resetLane(); setShowAllMatchups(false); }}
          style={{
            background: "none",
            border: `1px solid ${P.borderSubtle}`,
            borderRadius: 5,
            color: P.textDim,
            cursor: "pointer",
            padding: "4px 8px",
            fontSize: 10,
          }}
        >
          Back
        </button>
      </div>

      {/* Lane Setup */}
      <Section label="LANE MATCHUP">
        {!lanePartner && !selectingFor ? (
          <button
            onClick={() => setSelectingFor("partner")}
            style={{
              width: "100%",
              padding: 10,
              background: P.surfaceRaised,
              border: `1px dashed ${P.border}`,
              borderRadius: 6,
              color: P.textDim,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            + Set up lane matchup
          </button>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: P.vitality.text, fontWeight: 600, width: 46, fontFamily: "monospace" }}>ALLY</span>
              <Monogram hero={hero} size={28} selected />
              {lanePartner ? (
                <Monogram hero={HEROES[lanePartner]} size={28} selected />
              ) : (
                <div
                  onClick={() => setSelectingFor("partner")}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: `1px dashed ${P.vitality.text}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: P.vitality.text, fontSize: 14, cursor: "pointer",
                  }}
                >+</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "#9a5a5a", fontWeight: 600, width: 46, fontFamily: "monospace" }}>ENEMY</span>
              {enemies.map(eid => (
                <Monogram key={eid} hero={HEROES[eid]} size={28} selected />
              ))}
              {enemies.length < 2 && lanePartner && (
                <div
                  onClick={() => setSelectingFor("enemy")}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: `1px dashed #9a5a5a40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#9a5a5a", fontSize: 14, cursor: "pointer",
                  }}
                >+</div>
              )}
              {(lanePartner || enemies.length > 0) && (
                <button
                  onClick={resetLane}
                  style={{
                    marginLeft: "auto", background: "none", border: "none",
                    color: P.textDim, cursor: "pointer", fontSize: 10,
                  }}
                >
                  reset
                </button>
              )}
            </div>
            {selectingFor && (
              <div style={{
                background: P.bg,
                borderRadius: 6,
                padding: 8,
                marginTop: 4,
                border: `1px solid ${P.borderSubtle}`,
              }}>
                <div style={{
                  fontSize: 10,
                  color: selectingFor === "partner" ? P.vitality.text : "#9a5a5a",
                  marginBottom: 6,
                  fontWeight: 600,
                }}>
                  Select {selectingFor === "partner" ? "lane partner" : `enemy ${enemies.length + 1} of 2`}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {pickableHeroes.map(id => (
                    <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <Monogram
                        hero={HEROES[id]}
                        size={36}
                        selected={enemies.includes(id)}
                        onClick={() => handlePick(id)}
                      />
                      <span style={{ fontSize: 9, color: P.textDim }}>{HEROES[id].name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Per-enemy matchup detail */}
      {enemies.length > 0 && (
        <div style={{ marginBottom: 2 }}>
          {enemies.map(eid => (
            <MatchupDetail key={eid} yourHeroId={selectedHero} enemyId={eid} />
          ))}
        </div>
      )}

      {/* Build */}
      <Section label="BUILD">
        {/* Philosophy */}
        <div style={{
          fontSize: 12,
          color: P.textMuted,
          lineHeight: 1.55,
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: `1px solid ${P.borderSubtle}`,
        }}>
          {hero.philosophy}
        </div>

        {/* Legend */}
        <div style={{ fontSize: 10, color: P.textDim, marginBottom: 12, lineHeight: 1.6 }}>
          <span style={{ color: P.weapon.text }}>■</span> Weapon{" "}
          <span style={{ color: P.vitality.text }}>■</span> Vitality{" "}
          <span style={{ color: P.spirit.text }}>■</span> Spirit{" "}
          · Highlighted = key item · Tap any for details
        </div>

        <BuildPhase label="EARLY" items={hero.build.early} transitionNote={hero.build.earlyToMid} />
        <BuildPhase label="MID" items={hero.build.mid} transitionNote={hero.build.midToLate} />
        <BuildPhase label="LATE" items={hero.build.late} />
      </Section>

      {/* Tips */}
      <Section label="TIPS">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {hero.tips.map((tip, i) => (
            <div key={i} style={{
              fontSize: 12,
              color: P.textMuted,
              lineHeight: 1.5,
              paddingLeft: 10,
              borderLeft: `2px solid ${P.borderSubtle}`,
            }}>
              {tip}
            </div>
          ))}
        </div>
      </Section>

      {/* All Matchups toggle */}
      <button
        onClick={() => setShowAllMatchups(!showAllMatchups)}
        style={{
          width: "100%",
          padding: 10,
          background: P.surface,
          border: `1px solid ${P.border}`,
          borderRadius: 8,
          color: P.textDim,
          cursor: "pointer",
          fontSize: 11,
          marginBottom: 12,
        }}
      >
        {showAllMatchups ? "Hide" : "Show"} all matchups vs roster
      </button>

      {showAllMatchups && (
        <div>
          {Object.keys(HEROES).filter(id => id !== selectedHero).map(eid => (
            <MatchupDetail key={eid} yourHeroId={selectedHero} enemyId={eid} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: 9, color: P.textDim, padding: "8px 0 16px" }}>
        12-hero prototype · updated 2026-02-06 · builds from Mobalytics / MetaBattle · matchups from MetaBot.gg
      </div>
    </div>
  );
}
