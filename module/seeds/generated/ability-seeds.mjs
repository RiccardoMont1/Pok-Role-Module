export const ABILITY_COMPENDIUM_ENTRIES = Object.freeze([
  {
    "name": "Stench",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Has a 10% chance of making target Pok\u00e9mon [flinch]{mechanic:flinch} with each hit.",
      "description": "Corebook p.464. By releasing a stench when attacking, the Pok\u00e9mon may cause the target to flinch."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stench"
      }
    }
  },
  {
    "name": "Drizzle",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Summons [rain]{mechanic:rain} that lasts indefinitely upon entering battle.",
      "description": "Corebook p.440. The Pok\u00e9mon makes it rain when it enters a battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-drizzle"
      }
    }
  },
  {
    "name": "Speed Boost",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises [Speed]{mechanic:speed} one [stage]{mechanic:stat-modifier} after each turn.",
      "description": "Corebook p.463. The Pok\u00e9mon's Speed stat is boosted every turn."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-speed-boost"
      }
    }
  },
  {
    "name": "Battle Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against [critical hits]{mechanic:critical-hit}.",
      "description": "Corebook p.436. Hard armor protects the Pok\u00e9mon from critical hits."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-battle-armor"
      }
    }
  },
  {
    "name": "Sturdy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents being KOed from full [HP]{mechanic:hp}, leaving 1 HP instead. Protects against the one-hit KO moves regardless of HP.",
      "description": "Corebook p.461. The Pok\u00e9mon cannot be knocked out by a single hit as long as its HP is full. One-hit KO moves will also fail to knock it out."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sturdy"
      }
    }
  },
  {
    "name": "Damp",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents []{move:self-destruct}, []{move:explosion}, and []{ability:aftermath} from working while the Pok\u00e9mon is in battle.",
      "description": "Corebook p.439. The Pok\u00e9mon dampens its surroundings, preventing all Pok\u00e9mon from using explosive moves such as Self-Destruct."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-damp"
      }
    }
  },
  {
    "name": "Limber",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents [paralysis]{mechanic:paralysis}.",
      "description": "Corebook p.449. The Pok\u00e9mon's limber body prevents it from being paralyzed."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-limber"
      }
    }
  },
  {
    "name": "Sand Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases [evasion]{mechanic:evasion} to 1.25\u00d7 during a [sandstorm]{mechanic:sandstorm}. Protects against sandstorm damage.",
      "description": "Corebook p.459. Boosts the Pok\u00e9mon's evasiveness in a sandstorm."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sand-veil"
      }
    }
  },
  {
    "name": "Static",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Has a 30% chance of [paralyzing]{mechanic:paralysis} attacking Pok\u00e9mon on contact.",
      "description": "Corebook p.464. The Pok\u00e9mon is charged with static electricity and may paralyze attackers that make direct contact with it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-static"
      }
    }
  },
  {
    "name": "Volt Absorb",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Absorbs []{type:electric} moves, healing for 1/4 max [HP]{mechanic:hp}.",
      "description": "Corebook p.469. If hit by an Electric-type move, the Pok\u00e9mon has its HP restored instead of taking damage."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-volt-absorb"
      }
    }
  },
  {
    "name": "Water Absorb",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Absorbs []{type:water} moves, healing for 1/4 max [HP]{mechanic:hp}.",
      "description": "Corebook p.469. If hit by a Water-type move, the Pok\u00e9mon has its HP restored instead of taking damage."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-water-absorb"
      }
    }
  },
  {
    "name": "Oblivious",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents [infatuation]{mechanic:infatuation} and protects against []{move:captivate}.",
      "description": "Corebook p.453. The Pok\u00e9mon is oblivious, keeping it from being infatuated, falling for taunts, or being affected by Intimidate."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-oblivious"
      }
    }
  },
  {
    "name": "Cloud Nine",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Negates all effects of [weather]{mechanic:weather}, but does not prevent the weather itself.",
      "description": "Corebook p.437. Eliminates the effects of weather."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-cloud-nine"
      }
    }
  },
  {
    "name": "Compound Eyes",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases moves' [accuracy]{mechanic:accuracy} to 1.3\u00d7.",
      "description": "Corebook p.438. The Pok\u00e9mon's compound eyes boost its accuracy."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-compound-eyes"
      }
    }
  },
  {
    "name": "Insomnia",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents [sleep]{mechanic:sleep}.",
      "description": "Corebook p.447. The Pok\u00e9mon is suffering from insomnia and cannot fall asleep."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-insomnia"
      }
    }
  },
  {
    "name": "Color Change",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Changes type to match when hit by a damaging move.",
      "description": "Corebook p.437. The Pok\u00e9mon\u2019s type becomes the type of the move used on it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-color-change"
      }
    }
  },
  {
    "name": "Immunity",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents [poison]{mechanic:poison}.",
      "description": "Corebook p.435. The Pok\u00e9mon's immune system prevents it from being poisoned."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-immunity"
      }
    }
  },
  {
    "name": "Flash Fire",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against []{type:fire} moves. Once one has been blocked, the Pok\u00e9mon's own Fire moves inflict 1.5\u00d7 damage until it leaves battle.",
      "description": "Corebook p.442. If hit by a Fire-type move, the Pok\u00e9mon absorbs the flames and uses them to power up its own Fire-type moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-flash-fire"
      }
    }
  },
  {
    "name": "Shield Dust",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against incoming moves' extra effects.",
      "description": "Corebook p.461. Protective dust shields the Pok\u00e9mon from the additional effects of moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shield-dust"
      }
    }
  },
  {
    "name": "Own Tempo",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents [confusion]{mechanic:confusion}.",
      "description": "Corebook p.454. The Pok\u00e9mon sticks to its own tempo, preventing it from becoming confused or being affected by Intimidate."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-own-tempo"
      }
    }
  },
  {
    "name": "Suction Cups",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents being forced out of battle by other Pok\u00e9mon's moves.",
      "description": "Corebook p.465. The Pok\u00e9mon uses suction cups to stay in one spot. This protects it from moves and items that would force it to switch out."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-suction-cups"
      }
    }
  },
  {
    "name": "Intimidate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Lowers opponents' [Attack]{mechanic:attack} one [stage]{mechanic:stat-modifier} upon entering battle.",
      "description": "Corebook p.447. When the Pok\u00e9mon enters a battle, it intimidates opposing Pok\u00e9mon and makes them cower, lowering their Attack stats."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-intimidate"
      }
    }
  },
  {
    "name": "Shadow Tag",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents opponents from fleeing or switching out.",
      "description": "Corebook p.460. The Pok\u00e9mon steps on the opposing Pok\u00e9mon's shadows to prevent them from fleeing or switching out."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shadow-tag"
      }
    }
  },
  {
    "name": "Rough Skin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Damages attacking Pok\u00e9mon for 1/8 their max [HP]{mechanic:hp} on contact.",
      "description": "Corebook p.459. The Pok\u00e9mon's rough skin damages attackers that make direct contact with it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rough-skin"
      }
    }
  },
  {
    "name": "Wonder Guard",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against damaging moves that are not [super effective]{mechanic:super-effective}.",
      "description": "Corebook p.468. Its mysterious power only lets supereffective moves hit the Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-wonder-guard"
      }
    }
  },
  {
    "name": "Levitate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Evades []{type:ground} moves.",
      "description": "Corebook p.449. By floating in the air, the Pok\u00e9mon receives full immunity to all Ground-type moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-levitate"
      }
    }
  },
  {
    "name": "Effect Spore",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Has a 30% chance of inflcting either [paralysis]{mechanic:paralysis}, [poison]{mechanic:poison}, or [sleep]{mechanic:sleep} on attacking Pok\u00e9mon on contact.",
      "description": "Corebook p.441. Contact with the Pok\u00e9mon may inflict poison, sleep, or paralysis on the attacker."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-effect-spore"
      }
    }
  },
  {
    "name": "Synchronize",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Copies [burns]{mechanic:burn}, [paralysis]{mechanic:paralysis}, and [poison]{mechanic:poison} received onto the Pok\u00e9mon that inflicted them.",
      "description": "Corebook p.466. If the Pok\u00e9mon is burned, paralyzed, or poisoned by another Pok\u00e9mon, that Pok\u00e9mon will be inflicted with the same status condition."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-synchronize"
      }
    }
  },
  {
    "name": "Clear Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents stats from being [lowered]{mechanic:stat-modifier} by other Pok\u00e9mon.",
      "description": "Corebook p.437. Prevents other Pok\u00e9mon's moves or Abilities from lowering the Pok\u00e9mon's stats."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-clear-body"
      }
    }
  },
  {
    "name": "Natural Cure",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Cures any [major status ailment]{mechanic:major-status-ailment} upon switching out.",
      "description": "Corebook p.452. The Pok\u00e9mon's status conditions are cured when it switches out."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-natural-cure"
      }
    }
  },
  {
    "name": "Lightning Rod",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Redirects single-target []{type:electric} moves to this Pok\u00e9mon where possible. Absorbs Electric moves, raising [Special Attack]{mechanic:special-attack} one [stage]{mechanic:stat-modifier}.",
      "description": "Corebook p.449. The Pok\u00e9mon draws in all Electric-type moves. Instead of taking damage from them, its Sp. Atk stat is boosted."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-lightning-rod"
      }
    }
  },
  {
    "name": "Serene Grace",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles the chance of moves' extra effects occurring.",
      "description": "Corebook p.460. Raises the likelihood of additional effects occurring when the Pok\u00e9mon uses its moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-serene-grace"
      }
    }
  },
  {
    "name": "Swift Swim",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles [Speed]{mechanic:speed} during [rain]{mechanic:rain}.",
      "description": "Corebook p.466. Boosts the Pok\u00e9mon's Speed stat in rain."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-swift-swim"
      }
    }
  },
  {
    "name": "Chlorophyll",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles [Speed]{mechanic:speed} during [strong sunlight]{mechanic:strong-sunlight}.",
      "description": "Corebook p.437. Boosts the Pok\u00e9mon's Speed stat in harsh sunlight."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-chlorophyll"
      }
    }
  },
  {
    "name": "Illuminate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles the wild encounter rate.",
      "description": "Corebook p.446. By illuminating its surroundings, the Pok\u00e9mon prevents its accuracy from being lowered."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-illuminate"
      }
    }
  },
  {
    "name": "Trace",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Copies an opponent's ability upon entering battle.",
      "description": "Corebook p.468. When it enters a battle, the Pok\u00e9mon copies an opposing Pok\u00e9mon's Ability."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-trace"
      }
    }
  },
  {
    "name": "Huge Power",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles [Attack]{mechanic:attack} in battle.",
      "description": "Corebook p.445. Doubles the Pok\u00e9mon's Attack stat."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-huge-power"
      }
    }
  },
  {
    "name": "Poison Point",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Has a 30% chance of [poisoning]{mechanic:poison} attacking Pok\u00e9mon on contact.",
      "description": "Corebook p.455. Contact with the Pok\u00e9mon may poison the attacker."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-poison-point"
      }
    }
  },
  {
    "name": "Inner Focus",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents [flinching]{mechanic:flinching}.",
      "description": "Corebook p.447. The Pok\u00e9mon's intense focus prevents it from flinching or being affected by Intimidate."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-inner-focus"
      }
    }
  },
  {
    "name": "Magma Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents [freezing]{mechanic:freezing}.",
      "description": "Corebook p.450. The Pok\u00e9mon\u2019s hot magma coating prevents it from being frozen."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-magma-armor"
      }
    }
  },
  {
    "name": "Water Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents [burns]{mechanic:burn}.",
      "description": "Corebook p.470. The Pok\u00e9mon's water veil prevents it from being burned."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-water-veil"
      }
    }
  },
  {
    "name": "Magnet Pull",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents []{type:steel} opponents from fleeing or switching out.",
      "description": "Corebook p.450. Prevents Steel-type Pok\u00e9mon from fleeing by pulling them in with magnetism."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-magnet-pull"
      }
    }
  },
  {
    "name": "Soundproof",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against sound-based moves.",
      "description": "Corebook p.463. Soundproofing gives the Pok\u00e9mon full immunity to all sound-based moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-soundproof"
      }
    }
  },
  {
    "name": "Rain Dish",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Heals for 1/16 max [HP]{mechanic:hp} after each turn during [rain]{mechanic:rain}.",
      "description": "Corebook p.457. The Pok\u00e9mon gradually regains HP in rain."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rain-dish"
      }
    }
  },
  {
    "name": "Sand Stream",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Summons a [sandstorm]{mechanic:sandstorm} that lasts indefinitely upon entering battle.",
      "description": "Corebook p.459. The Pok\u00e9mon summons a sandstorm when it enters a battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sand-stream"
      }
    }
  },
  {
    "name": "Pressure",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases the [PP]{mechanic:pp} cost of moves targetting the Pok\u00e9mon by one.",
      "description": "Corebook p.454. Puts other Pok\u00e9mon under pressure, causing them to expend more PP to use their moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-pressure"
      }
    }
  },
  {
    "name": "Thick Fat",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Halves damage from []{type:fire} and []{type:ice} moves.",
      "description": "Corebook p.467. The Pok\u00e9mon is protected by a layer of thick fat, which halves the damage taken from Fire- and Ice-type moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-thick-fat"
      }
    }
  },
  {
    "name": "Early Bird",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Makes [sleep]{mechanic:sleep} pass twice as quickly.",
      "description": "Corebook p.441. The Pok\u00e9mon awakens from sleep twice as fast as other Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-early-bird"
      }
    }
  },
  {
    "name": "Flame Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Has a 30% chance of [burning]{mechanic:burn} attacking Pok\u00e9mon on contact.",
      "description": "Corebook p.441. Contact with the Pok\u00e9mon may burn the attacker."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-flame-body"
      }
    }
  },
  {
    "name": "Run Away",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Ensures success fleeing from wild battles.",
      "description": "Corebook p.459. Enables a sure getaway from wild Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-run-away"
      }
    }
  },
  {
    "name": "Keen Eye",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents [accuracy]{mechanic:accuracy} from being [lowered]{mechanic:stat-modifier}.",
      "description": "Corebook p.448. The Pok\u00e9mon's keen eyes prevent its accuracy from being lowered."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-keen-eye"
      }
    }
  },
  {
    "name": "Hyper Cutter",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents [Attack]{mechanic:attack} from being [lowered]{mechanic:stat-modifiers} by other Pok\u00e9mon.",
      "description": "Corebook p.446. The Pok\u00e9mon's prized, mighty pincers prevent other Pok\u00e9mon from lowering its Attack stat."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-hyper-cutter"
      }
    }
  },
  {
    "name": "Truant",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Skips every second turn.",
      "description": "Corebook p.468. Each time the Pok\u00e9mon uses a move, it spends the next turn loafing around."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-truant"
      }
    }
  },
  {
    "name": "Hustle",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens physical moves to inflict 1.5\u00d7 damage, but decreases their [accuracy]{mechanic:accuracy} to 0.8\u00d7.",
      "description": "Corebook p.445. Boosts the Pok\u00e9mon's Attack stat but lowers its accuracy."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-hustle"
      }
    }
  },
  {
    "name": "Cute Charm",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Has a 30% chance of [infatuating]{mechanic:infatuation} attacking Pok\u00e9mon on contact.",
      "description": "Corebook p.438. The Pok\u00e9mon may infatuate attackers that make direct contact with it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-cute-charm"
      }
    }
  },
  {
    "name": "Plus",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases [Special Attack]{mechanic:special-attack} to 1.5\u00d7 when a friendly Pok\u00e9mon has []{ability:plus} or []{ability:minus}.",
      "description": "Corebook p.451. Boosts the Sp. Atk stat of the Pok\u00e9mon if an ally with the Plus or Minus Ability is also in battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-plus"
      }
    }
  },
  {
    "name": "Minus",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases [Special Attack]{mechanic:special-attack} to 1.5\u00d7 when a friendly Pok\u00e9mon has []{ability:plus} or []{ability:minus}.",
      "description": "Corebook p.451. Boosts the Sp. Atk stat of the Pok\u00e9mon if an ally with the Plus or Minus Ability is also in battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-minus"
      }
    }
  },
  {
    "name": "Forecast",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Changes []{pokemon:castform}'s type and form to match the [weather]{mechanic:weather}.",
      "description": "Corebook p.442. The Pok\u00e9mon transforms with the weather to change its type to Water, Fire, or Ice."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-forecast"
      }
    }
  },
  {
    "name": "Sticky Hold",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents a held item from being removed by other Pok\u00e9mon.",
      "description": "Corebook p.465. The Pok\u00e9mon's held items cling to its sticky body and cannot be removed by other Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sticky-hold"
      }
    }
  },
  {
    "name": "Shed Skin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Has a 33% chance of curing any [major status ailment]{mechanic:major-status-ailment} after each turn.",
      "description": "Corebook p.461. The Pok\u00e9mon may cure its own status conditions by shedding its skin."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shed-skin"
      }
    }
  },
  {
    "name": "Guts",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases [Attack]{mechanic:attack} to 1.5\u00d7 with a [major status ailment]{mechanic:major-status-ailment}.",
      "description": "Corebook p.444. It's so gutsy that having a status condition boosts the Pok\u00e9mon's Attack stat."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-guts"
      }
    }
  },
  {
    "name": "Marvel Scale",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases [Defense]{mechanic:defense} to 1.5\u00d7 with a [major status ailment]{mechanic:major-status-ailment}.",
      "description": "Corebook p.450. The Pok\u00e9mon's marvelous scales boost its Defense stat if it has a status condition."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-marvel-scale"
      }
    }
  },
  {
    "name": "Liquid Ooze",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Damages opponents using leeching moves for as much as they would heal.",
      "description": "Corebook p.449. The strong stench of the Pok\u00e9mon's oozed liquid damages attackers that use HP-draining moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-liquid-ooze"
      }
    }
  },
  {
    "name": "Overgrow",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens []{type:grass} moves to inflict 1.5\u00d7 damage at 1/3 max [HP]{mechanic:hp} or less.",
      "description": "Corebook p.453. Powers up Grass-type moves when the Pok\u00e9mon's HP is low."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-overgrow"
      }
    }
  },
  {
    "name": "Blaze",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens []{type:fire} moves to inflict 1.5\u00d7 damage at 1/3 max [HP]{mechanic:hp} or less.",
      "description": "Corebook p.436. Powers up Fire-type moves when the Pok\u00e9mon's HP is low."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-blaze"
      }
    }
  },
  {
    "name": "Torrent",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens []{type:water} moves to inflict 1.5\u00d7 damage at 1/3 max [HP]{mechanic:hp} or less.",
      "description": "Corebook p.467. Powers up Water-type moves when the Pok\u00e9mon's HP is low."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-torrent"
      }
    }
  },
  {
    "name": "Swarm",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens []{type:bug} moves to inflict 1.5\u00d7 damage at 1/3 max [HP]{mechanic:hp} or less.",
      "description": "Corebook p.466. Powers up Bug-type moves when the Pok\u00e9mon's HP is low."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-swarm"
      }
    }
  },
  {
    "name": "Rock Head",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against recoil damage.",
      "description": "Corebook p.458. Protects the Pok\u00e9mon from recoil damage."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rock-head"
      }
    }
  },
  {
    "name": "Drought",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Summons [strong sunlight]{mechanic:strong-sunlight} that lasts indefinitely upon entering battle.",
      "description": "Corebook p.440. Turns the sunlight harsh when the Pok\u00e9mon enters a battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-drought"
      }
    }
  },
  {
    "name": "Arena Trap",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents opponents from fleeing or switching out. Eluded by []{type:flying}-types and Pok\u00e9mon in the air.",
      "description": "Corebook p.435. Prevents opposing Pok\u00e9mon from fleeing from battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-arena-trap"
      }
    }
  },
  {
    "name": "Vital Spirit",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents [sleep]{mechanic:sleep}.",
      "description": "Corebook p.469. The Pok\u00e9mon is full of vitality, and that prevents it from falling asleep."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-vital-spirit"
      }
    }
  },
  {
    "name": "White Smoke",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents stats from being [lowered]{mechanic:stat-modifier} by other Pok\u00e9mon.",
      "description": "Corebook p.470. The Pok\u00e9mon is protected by its white smoke, which prevents other Pok\u00e9mon from lowering its stats."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-white-smoke"
      }
    }
  },
  {
    "name": "Pure Power",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles [Attack]{mechanic:attack} in battle.",
      "description": "Corebook p.457. Using its pure power, the Pok\u00e9mon doubles its Attack stat."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-pure-power"
      }
    }
  },
  {
    "name": "Shell Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against [critical hits]{mechanic:critical-hit}.",
      "description": "Corebook p.461. A hard shell protects the Pok\u00e9mon from critical hits."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shell-armor"
      }
    }
  },
  {
    "name": "Air Lock",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Negates all effects of [weather]{mechanic:weather}, but does not prevent the weather itself.",
      "description": "Corebook p.434. Eliminates the effects of weather."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-air-lock"
      }
    }
  },
  {
    "name": "Tangled Feet",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles [evasion]{mechanic:evasion} when [confused]{mechanic:confusion}.",
      "description": "Corebook p.466. Boosts the Pok\u00e9mon's evasiveness if it is confused."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-tangled-feet"
      }
    }
  },
  {
    "name": "Motor Drive",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Absorbs []{type:electric} moves, raising [Speed]{mechanic:speed} one [stage]{mechanic:stat-modifier}.",
      "description": "Corebook p.452. The Pok\u00e9mon takes no damage when hit by Electric-type moves. Instead, its Speed stat is boosted."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-motor-drive"
      }
    }
  },
  {
    "name": "Rivalry",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases damage inflicted to 1.25\u00d7 against Pok\u00e9mon of the same gender, but decreases damage to 0.75\u00d7 against the opposite gender.",
      "description": "Corebook p.458. The Pok\u00e9mon's competitive spirit makes it deal more damage to Pok\u00e9mon of the same gender, but less damage to Pok\u00e9mon of the opposite gender."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rivalry"
      }
    }
  },
  {
    "name": "Steadfast",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises [Speed]{mechanic:speed} one [stage]{mechanic:stat-modifier} upon [flinching]{mechanic:flinching}.",
      "description": "Corebook p.464. The Pok\u00e9mon's determination boosts its Speed stat every time it flinches."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-steadfast"
      }
    }
  },
  {
    "name": "Snow Cloak",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases evasion to 1.25\u00d7 during [hail]{mechanic:hail}. Protects against hail damage.",
      "description": "Corebook p.462. Boosts the Pok\u00e9mon's evasiveness in snow."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-snow-cloak"
      }
    }
  },
  {
    "name": "Gluttony",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Makes the Pok\u00e9mon eat any held Berry triggered by low [HP]{mechanic:hp} below 1/2 its max HP.",
      "description": "Corebook p.443. If the Pok\u00e9mon is holding a Berry to be eaten when its HP is low, it will instead eat the Berry when its HP drops to half or less."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-gluttony"
      }
    }
  },
  {
    "name": "Anger Point",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises [Attack]{mechanic:attack} to the maximum of six [stages]{mechanic:stat-modifier} upon receiving a [critical hit]{mechanic:critical-hit}.",
      "description": "Corebook p.435. The Pok\u00e9mon is angered when it takes a critical hit, and that maxes its Attack stat."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-anger-point"
      }
    }
  },
  {
    "name": "Unburden",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles [Speed]{mechanic:speed} upon using or losing a held item.",
      "description": "Corebook p.468. Boosts the Speed stat if the Pok\u00e9mon's held item is used or lost."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-unburden"
      }
    }
  },
  {
    "name": "Heatproof",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Halves damage from []{type:fire} moves and [burns]{mechanic:burn}.",
      "description": "Corebook p.445. The Pok\u00e9mon's heatproof body halves the damage taken from Fire-type moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-heatproof"
      }
    }
  },
  {
    "name": "Simple",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles the Pok\u00e9mon's [stat modifiers]{mechanic:stat-modifiers}. These doubled modifiers are still capped at -6 or 6 stages.",
      "description": "Corebook p.450. Doubles the effects of the Pok\u00e9mon's stat changes."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-simple"
      }
    }
  },
  {
    "name": "Dry Skin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Causes 1/8 max [HP]{mechanic:hp} in damage each turn during [strong sunlight]{mechanic:strong-sunlight}, but heals for 1/8 max HP during [rain]{mechanic:rain}. Increases damage from []{type:fire} moves to 1.25\u00d7, but absorbs []{type:water} moves, healing for 1/4 max HP.",
      "description": "Corebook p.440. Restores the Pok\u00e9mon's HP in rain or when it is hit by Water-type moves. Reduces HP in harsh sunlight, and increases the damage received from Fire-type moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-dry-skin"
      }
    }
  },
  {
    "name": "Download",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises the attack stat corresponding to the opponents' weaker defense one [stage]{mechanic:stat-modifier} upon entering battle.",
      "description": "Corebook p.440. The Pok\u00e9mon compares an opposing Pok\u00e9mon's Defense and Sp. Def stats before raising its own Attack or Sp. Atk stat\u2014whichever will be more effective."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-download"
      }
    }
  },
  {
    "name": "Iron Fist",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens punch-based moves to 1.2\u00d7 their power.",
      "description": "Corebook p.448. Powers up punching moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-iron-fist"
      }
    }
  },
  {
    "name": "Poison Heal",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Heals for 1/8 max [HP]{mechanic:hp} after each turn when [poisoned]{mechanic:poison} in place of damage.",
      "description": "Corebook p.455. If poisoned, the Pok\u00e9mon has its HP restored instead of taking damage."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-poison-heal"
      }
    }
  },
  {
    "name": "Adaptability",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases the [same-type attack bonus]{mechanic:same-type-attack-bonus} from 1.5\u00d7 to 2\u00d7.",
      "description": "Corebook p.434. Powers up moves of the same type as the Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-adaptability"
      }
    }
  },
  {
    "name": "Skill Link",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Extends two-to-five-hit moves and []{move:triple-kick} to their full length every time.",
      "description": "Corebook p.461. Maximizes the number of times multistrike moves hit."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-skill-link"
      }
    }
  },
  {
    "name": "Hydration",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Cures any [major status ailment]{mechanic:major-status-ailment} after each turn during [rain]{mechanic:rain}.",
      "description": "Corebook p.440. Cures the Pok\u00e9mon's status conditions in rain."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-hydration"
      }
    }
  },
  {
    "name": "Solar Power",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases [Special Attack]{mechanic:special-attack} to 1.5\u00d7 but costs 1/8 max [HP]{mechanic:hp} after each turn during [strong sunlight]{mechanic:strong-sunlight}.",
      "description": "Corebook p.462. In harsh sunlight, the Pok\u00e9mon's Sp. Atk stat is boosted, but its HP decreases every turn."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-solar-power"
      }
    }
  },
  {
    "name": "Quick Feet",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases [Speed]{mechanic:speed} to 1.5\u00d7 with a [major status ailment]{mechanic:major-status-ailment}.",
      "description": "Corebook p.457. Boosts the Speed stat if the Pok\u00e9mon has a status condition."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-quick-feet"
      }
    }
  },
  {
    "name": "Normalize",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Makes the Pok\u00e9mon's moves all act []{type:normal}-type.",
      "description": "Corebook p.453. All the Pok\u00e9mon\u2019s moves become Normal type. The power of those moves is boosted a little."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-normalize"
      }
    }
  },
  {
    "name": "Sniper",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens [critical hits]{mechanic:critical-hit} to inflict 3\u00d7 damage rather than 2\u00d7.",
      "description": "Corebook p.462. If the Pok\u00e9mon's attack lands a critical hit, the attack is powered up even further."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sniper"
      }
    }
  },
  {
    "name": "Magic Guard",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against damage not directly caused by a move.",
      "description": "Corebook p.450. The Pok\u00e9mon only takes damage from attacks."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-magic-guard"
      }
    }
  },
  {
    "name": "No Guard",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Ensures all moves used by and against the Pok\u00e9mon hit.",
      "description": "Corebook p.453. The Pok\u00e9mon employs no-guard tactics to ensure incoming and outgoing attacks always land."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-no-guard"
      }
    }
  },
  {
    "name": "Stall",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Makes the Pok\u00e9mon move last within its move's priority bracket.",
      "description": "Corebook p.463. The Pok\u00e9mon is always the last to use its moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stall"
      }
    }
  },
  {
    "name": "Technician",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens moves of 60 base power or less to 1.5\u00d7 their power.",
      "description": "Corebook p.467. Powers up weak moves so the Pok\u00e9mon can deal more damage with them."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-technician"
      }
    }
  },
  {
    "name": "Leaf Guard",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against [major status ailments]{mechanic:major-status-ailments} during [strong sunlight]{mechanic:strong-sunlight}.",
      "description": "Corebook p.448. Prevents status conditions in harsh sunlight."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-leaf-guard"
      }
    }
  },
  {
    "name": "Klutz",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents the Pok\u00e9mon from using its held item in battle.",
      "description": "Corebook p.448. The Pok\u00e9mon can't use any held items."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-klutz"
      }
    }
  },
  {
    "name": "Mold Breaker",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Bypasses targets' abilities if they could hinder or prevent a move.",
      "description": "Corebook p.451. The Pok\u00e9mon's moves are unimpeded by the Ability of the target."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mold-breaker"
      }
    }
  },
  {
    "name": "Super Luck",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises moves' [critical hit]{mechanic:critical-hit} rates one stage.",
      "description": "Corebook p.465. The Pok\u00e9mon is so lucky that the critical-hit ratios of its moves are boosted."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-super-luck"
      }
    }
  },
  {
    "name": "Aftermath",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Damages the attacker for 1/4 its max [HP]{mechanic:hp} when knocked out by a contact move.",
      "description": "Corebook p.434. Damages the attacker if it knocks out the Pok\u00e9mon with a move that makes direct contact."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-aftermath"
      }
    }
  },
  {
    "name": "Anticipation",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Notifies all trainers upon entering battle if an opponent has a [super-effective]{mechanic:super-effective} move, []{move:self-destruct}, []{move:explosion}, or a one-hit KO move.",
      "description": "Corebook p.435. The Pok\u00e9mon can sense an opposing Pok\u00e9mon's dangerous moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-anticipation"
      }
    }
  },
  {
    "name": "Forewarn",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Reveals the opponents' strongest move upon entering battle.",
      "description": "Corebook p.442. When it enters a battle, the Pok\u00e9mon can tell one of the moves an opposing Pok\u00e9mon has."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-forewarn"
      }
    }
  },
  {
    "name": "Unaware",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Ignores other Pok\u00e9mon's stat modifiers for damage and accuracy calculation.",
      "description": "Corebook p.468. When attacking, the Pok\u00e9mon ignores the target's stat changes."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-unaware"
      }
    }
  },
  {
    "name": "Tinted Lens",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles damage inflicted with [not-very-effective]{mechanic:not-very-effective} moves.",
      "description": "Corebook p.467. The Pok\u00e9mon can use \u201cnot very effective\u201d moves to deal regular damage."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-tinted-lens"
      }
    }
  },
  {
    "name": "Filter",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Decreases damage taken from [super-effective]{mechanic:super-effective} moves by 1/4.",
      "description": "Corebook p.441. Reduces the power of supereffective attacks that hit the Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-filter"
      }
    }
  },
  {
    "name": "Slow Start",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Halves [Attack]{mechanic:attack} and [Speed]{mechanic:speed} for five turns upon entering battle.",
      "description": "Corebook p.462. For five turns, the Pok\u00e9mon's Attack and Speed stats are halved."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-slow-start"
      }
    }
  },
  {
    "name": "Scrappy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Lets the Pok\u00e9mon's []{type:normal} and []{type:fighting} moves hit []{type:ghost} Pok\u00e9mon.",
      "description": "Corebook p.460. The Pok\u00e9mon can hit Ghost-type Pok\u00e9mon with Normal- and Fighting-type moves. It is also unaffected by Intimidate."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-scrappy"
      }
    }
  },
  {
    "name": "Storm Drain",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Redirects single-target []{type:water} moves to this Pok\u00e9mon where possible. Absorbs Water moves, raising [Special Attack]{mechanic:special-attack} one [stage]{mechanic:stat-modifier}.",
      "description": "Corebook p.465. The Pok\u00e9mon draws in all Water-type moves. Instead of taking damage from them, its Sp. Atk stat is boosted."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-storm-drain"
      }
    }
  },
  {
    "name": "Ice Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Heals for 1/16 max [HP]{mechanic:hp} after each turn during hail. Protects against hail damage.",
      "description": "Corebook p.446. The Pok\u00e9mon gradually regains HP in snow."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-ice-body"
      }
    }
  },
  {
    "name": "Solid Rock",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Decreases damage taken from [super-effective]{mechanic:super-effective} moves by 1/4.",
      "description": "Corebook p.462. Reduces the power of supereffective attacks that hit the Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-solid-rock"
      }
    }
  },
  {
    "name": "Snow Warning",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Summons [hail]{mechanic:hail} that lasts indefinitely upon entering battle.",
      "description": "Corebook p.462. The Pok\u00e9mon makes it snow when it enters a battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-snow-warning"
      }
    }
  },
  {
    "name": "Honey Gather",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "The Pok\u00e9mon may pick up []{item:honey} after battle.",
      "description": "Corebook p.445. The Pok\u00e9mon may gather Honey after a battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-honey-gather"
      }
    }
  },
  {
    "name": "Frisk",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Reveals an opponent's held item upon entering battle.",
      "description": "Corebook p.443. When it enters a battle, the Pok\u00e9mon can check an opposing Pok\u00e9mon's held item."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-frisk"
      }
    }
  },
  {
    "name": "Reckless",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens recoil moves to 1.2\u00d7 their power.",
      "description": "Corebook p.444. Powers up moves that have recoil damage."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-reckless"
      }
    }
  },
  {
    "name": "Multitype",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Changes []{pokemon:arceus}'s type and form to match its held Plate.",
      "description": "Corebook p.452. Changes the Pok\u00e9mon's type to match the plate it holds."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-multitype"
      }
    }
  },
  {
    "name": "Flower Gift",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases friendly Pok\u00e9mon's [Attack]{mechanic:attack} and [Special Defense]{mechanic:special-defense} to 1.5\u00d7 during [strong sunlight]{mechanic:strong-sunlight}.",
      "description": "Corebook p.442. Boosts the Attack and Sp. Def stats of itself and allies in harsh sunlight."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-flower-gift"
      }
    }
  },
  {
    "name": "Bad Dreams",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Damages [sleeping]{mechanic:sleep} opponents for 1/8 their max [HP]{mechanic:hp} after each turn.",
      "description": "Corebook p.435. Damages opposing Pok\u00e9mon that are asleep."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-bad-dreams"
      }
    }
  },
  {
    "name": "Pickpocket",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Steals attacking Pok\u00e9mon's held items on contact.",
      "description": "Corebook p.454. The Pok\u00e9mon steals the held item from attackers that made direct contact with it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-pickpocket"
      }
    }
  },
  {
    "name": "Sheer Force",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens moves with extra effects to 1.3\u00d7 their power, but prevents their extra effects.",
      "description": "Corebook p.461. Removes any additional effects from the Pok\u00e9mon's moves, but increases the moves' power."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sheer-force"
      }
    }
  },
  {
    "name": "Contrary",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Inverts [stat changes]{mechanic:stat-modifiers}.",
      "description": "Corebook p.438. Reverses any stat changes affecting the Pok\u00e9mon so that attempts to boost its stats instead lower them\u2014and attempts to lower its stats will boost them."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-contrary"
      }
    }
  },
  {
    "name": "Unnerve",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents opposing Pok\u00e9mon from eating held Berries.",
      "description": "Corebook p.469. Unnerves opposing Pok\u00e9mon and makes them unable to eat Berries."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-unnerve"
      }
    }
  },
  {
    "name": "Defiant",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises [Attack]{mechanic:attack} two [stages]{mechanic:stat-modifier} upon having any stat lowered.",
      "description": "Corebook p.439. If the Pok\u00e9mon has any stat lowered by an opposing Pok\u00e9mon, its Attack stat will be boosted sharply."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-defiant"
      }
    }
  },
  {
    "name": "Defeatist",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Halves [Attack]{mechanic:attack} and [Special Attack]{mechanic:special-attack} at 50% max [HP]{mechanic:hp} or less.",
      "description": "Corebook p.439. Halves the Pok\u00e9mon\u2019s Attack and Sp. Atk stats when its HP becomes half or less."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-defeatist"
      }
    }
  },
  {
    "name": "Cursed Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Has a 30% chance of [Disabling]{move:disable} any move that hits the Pok\u00e9mon.",
      "description": "Corebook p.438. May disable a move that has dealt damage to the Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-cursed-body"
      }
    }
  },
  {
    "name": "Healer",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Has a 30% chance of curing each adjacent ally of any [major status ailment]{mechanic:major-status-ailment} after each turn.",
      "description": "Corebook p.445. Sometimes cures the status conditions of the Pok\u00e9mon's allies."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-healer"
      }
    }
  },
  {
    "name": "Friend Guard",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Decreases all direct damage taken by friendly Pok\u00e9mon to 0.75\u00d7.",
      "description": "Corebook p.443. Reduces damage dealt to allies."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-friend-guard"
      }
    }
  },
  {
    "name": "Weak Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises [Speed]{mechanic:speed} and lowers [Defense]{mechanic:defense} by one stage each upon being hit by a physical move.",
      "description": "Corebook p.470. The Pok\u00e9mon's Defense stat is lowered when it takes damage from physical moves, but its Speed stat is sharply boosted."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-weak-armor"
      }
    }
  },
  {
    "name": "Heavy Metal",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles the Pok\u00e9mon's weight.",
      "description": "Corebook p.445. Doubles the Pok\u00e9mon's weight."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-heavy-metal"
      }
    }
  },
  {
    "name": "Light Metal",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Halves the Pok\u00e9mon's weight.",
      "description": "Corebook p.449. Halves the Pok\u00e9mon's weight."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-light-metal"
      }
    }
  },
  {
    "name": "Multiscale",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Halves damage taken from full [HP]{mechanic:hp}.",
      "description": "Corebook p.452. Reduces the amount of damage the Pok\u00e9mon takes while its HP is full."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-multiscale"
      }
    }
  },
  {
    "name": "Toxic Boost",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Increases [Attack]{mechanic:attack} to 1.5\u00d7 when [poisoned]{mechanic:poison}.",
      "description": "Corebook p.468. Powers up physical moves when the Pok\u00e9mon is poisoned."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-toxic-boost"
      }
    }
  },
  {
    "name": "Flare Boost",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Increases [Special Attack]{mechanic:special-attack} to 1.5\u00d7 when [burned]{mechanic:burn}.",
      "description": "Corebook p.442. Powers up special moves when the Pok\u00e9mon is burned."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-flare-boost"
      }
    }
  },
  {
    "name": "Harvest",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Has a 50% chance of restoring a used Berry after each turn if the Pok\u00e9mon has held no items in the meantime.",
      "description": "Corebook p.444. May create another Berry after one is used."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-harvest"
      }
    }
  },
  {
    "name": "Telepathy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against friendly Pok\u00e9mon's damaging moves.",
      "description": "Corebook p.467. The Pok\u00e9mon anticipates and dodges the attacks of its allies."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-telepathy"
      }
    }
  },
  {
    "name": "Moody",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Raises a random stat two [stages]{mechanic:stat-modifier} and lowers another one stage after each turn.",
      "description": "Corebook p.452. Every turn, one of the Pok\u00e9mon's stats will be boosted sharply but another stat will be lowered."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-moody"
      }
    }
  },
  {
    "name": "Overcoat",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against damage from [weather]{mechanic:weather}.",
      "description": "Corebook p.453. The Pok\u00e9mon takes no damage from sandstorms. It is also protected from the effects of powders and spores."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-overcoat"
      }
    }
  },
  {
    "name": "Poison Touch",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Has a 30% chance of [poisoning]{mechanic:poison} target Pok\u00e9mon upon contact.",
      "description": "Corebook p.455. May poison a target when the Pok\u00e9mon makes contact."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-poison-touch"
      }
    }
  },
  {
    "name": "Regenerator",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Heals for 1/3 max [HP]{mechanic:hp} upon switching out.",
      "description": "Corebook p.458. The Pok\u00e9mon has a little of its HP restored when withdrawn from battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-regenerator"
      }
    }
  },
  {
    "name": "Big Pecks",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against [Defense]{mechanic:defense} drops.",
      "description": "Corebook p.436. Prevents the Pok\u00e9mon from having its Defense stat lowered."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-big-pecks"
      }
    }
  },
  {
    "name": "Sand Rush",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles [Speed]{mechanic:speed} during a [sandstorm]{mechanic:sandstorm}. Protects against sandstorm damage.",
      "description": "Corebook p.459. Boosts the Pok\u00e9mon's Speed stat in a sandstorm."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sand-rush"
      }
    }
  },
  {
    "name": "Wonder Skin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Lowers incoming non-damaging moves' base [accuracy]{mechanic:accuracy} to exactly 50%.",
      "description": "Corebook p.470. Makes status moves more likely to miss the Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-wonder-skin"
      }
    }
  },
  {
    "name": "Analytic",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Strengthens moves to 1.3\u00d7 their power when moving last.",
      "description": "Corebook p.434. Boosts the power of the Pok\u00e9mon's move if it is the last to act that turn."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-analytic"
      }
    }
  },
  {
    "name": "Illusion",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Takes the appearance of the last conscious party Pok\u00e9mon upon being sent out until hit by a damaging move.",
      "description": "Corebook p.446. The Pok\u00e9mon fools opponents by entering battle disguised as the last Pok\u00e9mon in its Trainer's party."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-illusion"
      }
    }
  },
  {
    "name": "Imposter",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "[Transforms]{move:transform} upon entering battle.",
      "description": "Corebook p.447. The Pok\u00e9mon transforms itself into the Pok\u00e9mon it's facing."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-imposter"
      }
    }
  },
  {
    "name": "Infiltrator",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Bypasses []{move:light-screen}, []{move:reflect}, and []{move:safeguard}.",
      "description": "Corebook p.447. The Pok\u00e9mon's moves are unaffected by the target's barriers, substitutes, and the like."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-infiltrator"
      }
    }
  },
  {
    "name": "Mummy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Changes attacking Pok\u00e9mon's abilities to Mummy on contact.",
      "description": "Corebook p.452. Contact with the Pok\u00e9mon changes the attacker\u2019s Ability to Mummy."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mummy"
      }
    }
  },
  {
    "name": "Moxie",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises [Attack]{mechanic:attack} one stage upon KOing a Pok\u00e9mon.",
      "description": "Corebook p.452. When the Pok\u00e9mon knocks out a target, it shows moxie, which boosts its Attack stat."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-moxie"
      }
    }
  },
  {
    "name": "Justified",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises [Attack]{mechanic:attack} one stage upon taking damage from a []{type:dark} move.",
      "description": "Corebook p.448. When the Pok\u00e9mon is hit by a Dark-type attack, its Attack stat is boosted by its sense of justice."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-justified"
      }
    }
  },
  {
    "name": "Rattled",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises [Speed]{mechanic:speed} one [stage]{mechanic:stat-modifier} upon being hit by a []{type:dark}, []{type:ghost}, or []{type:bug} move.",
      "description": "Corebook p.457. The Pok\u00e9mon gets scared when hit by a Dark-, Ghost-, or Bug-type attack or if intimidated, which boosts its Speed stat."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rattled"
      }
    }
  },
  {
    "name": "Magic Bounce",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Reflects most non-damaging moves back at their user.",
      "description": "Corebook p.450. The Pok\u00e9mon reflects status moves instead of getting hit by them."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-magic-bounce"
      }
    }
  },
  {
    "name": "Sap Sipper",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Absorbs []{type:grass} moves, raising [Attack]{mechanic:attack} one [stage]{mechanic:stat-modifier}.",
      "description": "Corebook p.460. The Pok\u00e9mon takes no damage when hit by Grass-type moves. Instead, its Attack stat is boosted."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sap-sipper"
      }
    }
  },
  {
    "name": "Prankster",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises non-damaging moves' priority by one stage.",
      "description": "Corebook p.456. Gives priority to the Pok\u00e9mon's status moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-prankster"
      }
    }
  },
  {
    "name": "Sand Force",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens []{type:rock}, []{type:ground}, and []{type:steel} moves to 1.3\u00d7 their power during a [sandstorm]{mechanic:sandstorm}. Protects against sandstorm damage.",
      "description": "Corebook p.459. Boosts the power of Rock-, Ground-, and Steel-type moves in a sandstorm."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sand-force"
      }
    }
  },
  {
    "name": "Iron Barbs",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Damages attacking Pok\u00e9mon for 1/8 their max [HP]{mechanic:hp} on contact.",
      "description": "Corebook p.448. Inflicts damage on the attacker upon contact with iron barbs."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-iron-barbs"
      }
    }
  },
  {
    "name": "Zen Mode",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Changes []{pokemon:darmanitan}'s form after each turn depending on its [HP]{mechanic:hp}: Zen Mode below 50% max HP, and Standard Mode otherwise.",
      "description": "Corebook p.471. Changes the Pok\u00e9mon\u2019s shape when HP is half or less."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-zen-mode"
      }
    }
  },
  {
    "name": "Victory Star",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases moves' accuracy to 1.1\u00d7 for friendly Pok\u00e9mon.",
      "description": "Corebook p.469. Boosts the accuracy of its allies and itself."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-victory-star"
      }
    }
  },
  {
    "name": "Turboblaze",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Bypasses targets' abilities if they could hinder or prevent moves.",
      "description": "Corebook p.468. The Pok\u00e9mon's moves are unimpeded by the Ability of the target."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-turboblaze"
      }
    }
  },
  {
    "name": "Teravolt",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Bypasses targets' abilities if they could hinder or prevent moves.",
      "description": "Corebook p.467. The Pok\u00e9mon's moves are unimpeded by the Ability of the target."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-teravolt"
      }
    }
  },
  {
    "name": "Aroma Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects allies against moves that affect their mental state.",
      "description": "Corebook p.435. Protects the Pok\u00e9mon and its allies from effects that prevent the use of moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-aroma-veil"
      }
    }
  },
  {
    "name": "Flower Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects friendly []{type:grass} Pok\u00e9mon from having their stats lowered by other Pok\u00e9mon.",
      "description": "Corebook p.442. Ally Grass-type Pok\u00e9mon are protected from status conditions and the lowering of their stats."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-flower-veil"
      }
    }
  },
  {
    "name": "Cheek Pouch",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Restores HP upon eating a Berry, in addition to the Berry's effect.",
      "description": "Corebook p.437. The Pok\u00e9mon's HP is restored when it eats any Berry, in addition to the Berry's usual effect."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-cheek-pouch"
      }
    }
  },
  {
    "name": "Protean",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Changes the bearer's type to match each move it uses.",
      "description": "Corebook p.456. Changes the Pok\u00e9mon's type to the type of the move it's about to use. This works only once each time the Pok\u00e9mon enters battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-protean"
      }
    }
  },
  {
    "name": "Fur Coat",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Halves damage from physical attacks.",
      "description": "Corebook p.443. Halves the damage from physical moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-fur-coat"
      }
    }
  },
  {
    "name": "Magician",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Steals the target's held item when the bearer uses a damaging move.",
      "description": "Corebook p.450. The Pok\u00e9mon steals the held item from any target it hits with a move."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-magician"
      }
    }
  },
  {
    "name": "Bulletproof",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Protects against bullet, ball, and bomb-based moves.",
      "description": "Corebook p.437. Protects the Pok\u00e9mon from ball and bomb moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-bulletproof"
      }
    }
  },
  {
    "name": "Competitive",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises Special Attack by two stages upon having any stat lowered.",
      "description": "Corebook p.438. Boosts the Pok\u00e9mon's Sp. Atk stat sharply when its stats are lowered by an opposing Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-competitive"
      }
    }
  },
  {
    "name": "Strong Jaw",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens biting moves to 1.5\u00d7 their power.",
      "description": "Corebook p.465. The Pok\u00e9mon's strong jaw boosts the power of its biting moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-strong-jaw"
      }
    }
  },
  {
    "name": "Refrigerate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Turns the bearer's []{type:normal} moves into []{type:ice} moves and strengthens them to 1.3\u00d7 their power.",
      "description": "Corebook p.458. Normal-type moves become Ice-type moves. The power of those moves is boosted a little."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-refrigerate"
      }
    }
  },
  {
    "name": "Sweet Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents friendly Pok\u00e9mon from sleeping.",
      "description": "Corebook p.466. Prevents the Pok\u00e9mon and its allies from falling asleep."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sweet-veil"
      }
    }
  },
  {
    "name": "Stance Change",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Changes []{pokemon:aegislash} to Blade Forme before using a damaging move, or Shield Forme before using []{move:kings-shield}.",
      "description": "Corebook p.464. The Pok\u00e9mon changes its form to Blade Forme when it uses an attack move and changes to Shield Forme when it uses King\u2019s Shield."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stance-change"
      }
    }
  },
  {
    "name": "Gale Wings",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Raises []{type:flying} moves' priority by one stage.",
      "description": "Corebook p.443. Gives priority to the Pok\u00e9mon's Flying-type moves while its HP is full."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-gale-wings"
      }
    }
  },
  {
    "name": "Mega Launcher",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens aura and pulse moves to 1.5\u00d7 their power.",
      "description": "Corebook p.451. Powers up pulse moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mega-launcher"
      }
    }
  },
  {
    "name": "Grass Pelt",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Boosts Defense while []{move:grassy-terrain} is in effect.",
      "description": "Corebook p.444. Boosts the Pok\u00e9mon's Defense stat on Grassy Terrain."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-grass-pelt"
      }
    }
  },
  {
    "name": "Symbiosis",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Passes the bearer's held item to an ally when the ally uses up its item.",
      "description": "Corebook p.466. The Pok\u00e9mon passes its held item to an ally that has used up an item."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-symbiosis"
      }
    }
  },
  {
    "name": "Tough Claws",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens moves that make contact to 1.33\u00d7 their power.",
      "description": "Corebook p.467. Powers up moves that make direct contact."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-tough-claws"
      }
    }
  },
  {
    "name": "Pixilate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Turns the bearer's []{type:normal} moves into []{type:fairy} moves and strengthens them to 1.3\u00d7 their power.",
      "description": "Corebook p.454. Normal-type moves become Fairy-type moves. The power of those moves is boosted a little."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-pixilate"
      }
    }
  },
  {
    "name": "Gooey",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Lowers attacking Pok\u00e9mon's Speed by one stage on contact.",
      "description": "Corebook p.444. Contact with the Pok\u00e9mon lowers the attacker's Speed stat."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-gooey"
      }
    }
  },
  {
    "name": "Aerilate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Turns the bearer's []{type:normal} moves into []{type:flying} moves and strengthens them to 1.3\u00d7 their power.",
      "description": "Corebook p.434. Normal-type moves become Flying-type moves. The power of those moves is boosted a little."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-aerilate"
      }
    }
  },
  {
    "name": "Parental Bond",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Lets the bearer hit twice with damaging moves. The second hit has half power.",
      "description": "Corebook p.454. Parent and child each attacks."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-parental-bond"
      }
    }
  },
  {
    "name": "Dark Aura",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens []{type:dark} moves to 1.33\u00d7 their power for all friendly and opposing Pok\u00e9mon.",
      "description": "Corebook p.435. Powers up each Pok\u00e9mon\u2019s Dark-type moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-dark-aura"
      }
    }
  },
  {
    "name": "Fairy Aura",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Strengthens []{type:fairy} moves to 1.33\u00d7 their power for all friendly and opposing Pok\u00e9mon.",
      "description": "Corebook p.435. Powers up each Pok\u00e9mon\u2019s Fairy-type moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-fairy-aura"
      }
    }
  },
  {
    "name": "Aura Break",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Makes []{ability:dark-aura} and []{ability:fairy-aura} weaken moves of their respective types.",
      "description": "Corebook p.435. The effects of \u201cAura\u201d Abilities are reversed to lower the power of affected moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-aura-break"
      }
    }
  },
  {
    "name": "Primordial Sea",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Creates heavy rain, which has all the properties of Rain Dance, cannot be replaced, and causes damaging Fire moves to fail.",
      "description": "Corebook p.456. The Pok\u00e9mon changes the weather to nullify Fire-type attacks."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-primordial-sea"
      }
    }
  },
  {
    "name": "Desolate Land",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Creates extremely harsh sunlight, which has all the properties of Sunny Day, cannot be replaced, and causes damaging Water moves to fail.",
      "description": "Corebook p.440. The Pok\u00e9mon changes the weather to nullify Water-type attacks."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-desolate-land"
      }
    }
  },
  {
    "name": "Delta Stream",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Creates a mysterious air current, which cannot be replaced and causes moves to never be super effective against Flying Pok\u00e9mon.",
      "description": "Corebook p.440. The Pok\u00e9mon changes the weather to eliminate all of the Flying type\u2019s weaknesses."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-delta-stream"
      }
    }
  },
  {
    "name": "Stamina",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises this Pok\u00e9mon's Defense by one stage when it takes damage from a move.",
      "description": "Corebook p.463. Boosts the Defense stat when the Pok\u00e9mon is hit by an attack."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stamina"
      }
    }
  },
  {
    "name": "Wimp Out",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "This Pok\u00e9mon automatically switches out when its HP drops below half.",
      "description": "Corebook p.470. The Pok\u00e9mon cowardly switches out when its HP becomes half or less."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-wimp-out"
      }
    }
  },
  {
    "name": "Emergency Exit",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "This Pok\u00e9mon automatically switches out when its HP drops below half.",
      "description": "Corebook p.441. The Pok\u00e9mon, sensing danger, switches out when its HP becomes half or less."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-emergency-exit"
      }
    }
  },
  {
    "name": "Water Compaction",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises this Pok\u00e9mon's Defense by two stages when it's hit by a Water move.",
      "description": "Corebook p.470. Boosts the Defense stat sharply when the Pok\u00e9mon is hit by a Water-type move."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-water-compaction"
      }
    }
  },
  {
    "name": "Merciless",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "This Pok\u00e9mon's moves critical hit against poisoned targets.",
      "description": "Corebook p.451. The Pok\u00e9mon's attacks become critical hits if the target is poisoned."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-merciless"
      }
    }
  },
  {
    "name": "Shields Down",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Transforms this Minior between Core Form and Meteor Form. Prevents major status ailments and drowsiness while in Meteor Form.",
      "description": "Corebook p.461. When its HP drops to half or less, the Pok\u00e9mon's shell breaks and it becomes aggressive."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shields-down"
      }
    }
  },
  {
    "name": "Stakeout",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "This Pok\u00e9mon's moves have double power against Pok\u00e9mon that switched in this turn.",
      "description": "Corebook p.463. Doubles the damage dealt to a target that has just switched into battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stakeout"
      }
    }
  },
  {
    "name": "Water Bubble",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Halves damage from Fire moves, doubles damage of Water moves, and prevents burns.",
      "description": "Corebook p.469. Lowers the power of Fire-type moves that hit the Pok\u00e9mon and prevents it from being burned."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-water-bubble"
      }
    }
  },
  {
    "name": "Steelworker",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "This Pok\u00e9mon's Steel moves have 1.5\u00d7 power.",
      "description": "Corebook p.464. Powers up Steel-type moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-steelworker"
      }
    }
  },
  {
    "name": "Berserk",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises this Pok\u00e9mon's Special Attack by one stage every time its HP drops below half.",
      "description": "Corebook p.436. Boosts the Pok\u00e9mon's Sp. Atk stat when it takes a hit that causes its HP to drop to half or less."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-berserk"
      }
    }
  },
  {
    "name": "Slush Rush",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "During Hail, this Pok\u00e9mon has double Speed.",
      "description": "Corebook p.462. Boosts the Pok\u00e9mon's Speed stat in snow."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-slush-rush"
      }
    }
  },
  {
    "name": "Long Reach",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "This Pok\u00e9mon's moves do not make contact.",
      "description": "Corebook p.450. The Pok\u00e9mon uses its moves without making contact with the target."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-long-reach"
      }
    }
  },
  {
    "name": "Liquid Voice",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Sound-based moves become Water-type.",
      "description": "Corebook p.449. Sound-based moves become Water-type moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-liquid-voice"
      }
    }
  },
  {
    "name": "Triage",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "This Pok\u00e9mon's healing moves have their priority increased by 3.",
      "description": "Corebook p.468. Gives priority to the Pok\u00e9mon's healing moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-triage"
      }
    }
  },
  {
    "name": "Galvanize",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "This Pok\u00e9mon's Normal moves are Electric and have their power increased to 1.2\u00d7.",
      "description": "Corebook p.443. Normal-type moves become Electric-type moves. The power of those moves is boosted a little."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-galvanize"
      }
    }
  },
  {
    "name": "Surge Surfer",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles this Pok\u00e9mon's Speed on Electric Terrain.",
      "description": "Corebook p.465. Doubles the Pok\u00e9mon's Speed stat on Electric Terrain."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-surge-surfer"
      }
    }
  },
  {
    "name": "Schooling",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Wishiwashi becomes Schooling Form when its HP is 25% or higher.",
      "description": "Corebook p.460. When it has a lot of HP, the Pok\u00e9mon forms a powerful school. It stops schooling when its HP is low."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-schooling"
      }
    }
  },
  {
    "name": "Disguise",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents the first instance of battle damage.",
      "description": "Corebook p.440. Once per battle, the shroud that covers the Pok\u00e9mon can protect it from an attack."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-disguise"
      }
    }
  },
  {
    "name": "Battle Bond",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Transforms this Pok\u00e9mon into Ash-Greninja after fainting an opponent. Water Shuriken's power is 20 and always hits three times.",
      "description": "Corebook p.436. When the Pok\u00e9mon knocks out a target, its bond with its Trainer is strengthened, and its Attack, Sp. Atk, and Speed stats are boosted."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-battle-bond"
      }
    }
  },
  {
    "name": "Power Construct",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Transforms 10% or 50% Zygarde into Complete Forme when its HP is below 50%.",
      "description": "Corebook p.455. Other Cells gather to aid when its HP becomes half or less. Then the Pok\u00e9mon changes its form to Complete Forme."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-power-construct"
      }
    }
  },
  {
    "name": "Corrosion",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "This Pok\u00e9mon can inflict poison on Poison and Steel Pok\u00e9mon.",
      "description": "Corebook p.438. The Pok\u00e9mon can poison the target even if it's a Steel or Poison type."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-corrosion"
      }
    }
  },
  {
    "name": "Comatose",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "This Pok\u00e9mon always acts as though it were Asleep.",
      "description": "Corebook p.437. The Pok\u00e9mon is always drowsing and will never wake up. It can attack while in its sleeping state."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-comatose"
      }
    }
  },
  {
    "name": "Queenly Majesty",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Opposing Pok\u00e9mon cannot use priority attacks.",
      "description": "Corebook p.457. When the Pok\u00e9mon uses Surf or Dive, it will come back with prey. When it takes damage, it will spit out the prey to attack."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-queenly-majesty"
      }
    }
  },
  {
    "name": "Innards Out",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "When this Pok\u00e9mon faints from an opponent's move, that opponent takes damage equal to the HP this Pok\u00e9mon had remaining.",
      "description": "Corebook p.447. Damages the attacker landing the finishing hit by the amount equal to its last HP."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-innards-out"
      }
    }
  },
  {
    "name": "Dancer",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Whenever another Pok\u00e9mon uses a dance move, this Pok\u00e9mon will use the same move immediately afterwards.",
      "description": "Corebook p.439. Whenever a dance move is used in battle, the Pok\u00e9mon will copy the user to immediately perform that dance move itself."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-dancer"
      }
    }
  },
  {
    "name": "Battery",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Ally Pok\u00e9mon's moves have their power increased to 1.3\u00d7.",
      "description": "Corebook p.436. Powers up ally Pok\u00e9mon's special moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-battery"
      }
    }
  },
  {
    "name": "Fluffy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Damage from contact moves is halved. Damage from Fire moves is doubled.",
      "description": "Corebook p.442. Halves the damage taken from moves that make direct contact, but doubles that of Fire-type moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-fluffy"
      }
    }
  },
  {
    "name": "Dazzling",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Opposing Pok\u00e9mon cannot use priority attacks.",
      "description": "Corebook p.439. The Pok\u00e9mon dazzles its opponents, making them unable to use priority moves against the Pok\u00e9mon or its allies."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-dazzling"
      }
    }
  },
  {
    "name": "Soul-Heart",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "This Pok\u00e9mon's Special Attack rises by one stage every time any Pok\u00e9mon faints.",
      "description": "Corebook p.463. Boosts the Pok\u00e9mon's Sp. Atk stat every time another Pok\u00e9mon faints."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-soul-heart"
      }
    }
  },
  {
    "name": "Tangling Hair",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "When this Pok\u00e9mon takes regular damage from a contact move, the attacking Pok\u00e9mon's Speed lowers by one stage.",
      "description": "Corebook p.466. Contact with the Pok\u00e9mon lowers the attacker's Speed stat."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-tangling-hair"
      }
    }
  },
  {
    "name": "Receiver",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "When an ally faints, this Pok\u00e9mon gains its Ability.",
      "description": "Corebook p.457. The Pok\u00e9mon copies the Ability of a defeated ally."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-receiver"
      }
    }
  },
  {
    "name": "Power of Alchemy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "When an ally faints, this Pok\u00e9mon gains its Ability.",
      "description": "Corebook p.455. The Pok\u00e9mon copies the Ability of a defeated ally."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-power-of-alchemy"
      }
    }
  },
  {
    "name": "Beast Boost",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Raises this Pok\u00e9mon's highest stat by one stage when it faints another Pok\u00e9mon.",
      "description": "Corebook p.436. The Pok\u00e9mon boosts its most proficient stat each time it knocks out a Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-beast-boost"
      }
    }
  },
  {
    "name": "RKS System",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Changes this Pok\u00e9mon's type to match its held Memory.",
      "description": "Corebook p.458. Changes the Pok\u00e9mon\u2019s type to match the memory disc it holds."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rks-system"
      }
    }
  },
  {
    "name": "Electric Surge",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "When this Pok\u00e9mon enters battle, it changes the terrain to Electric Terrain.",
      "description": "Corebook p.441. Turns the ground into Electric Terrain when the Pok\u00e9mon enters a battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-electric-surge"
      }
    }
  },
  {
    "name": "Psychic Surge",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "When this Pok\u00e9mon enters battle, it changes the terrain to Psychic Terrain.",
      "description": "Corebook p.456. Turns the ground into Psychic Terrain when the Pok\u00e9mon enters a battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-psychic-surge"
      }
    }
  },
  {
    "name": "Misty Surge",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "When this Pok\u00e9mon enters battle, it changes the terrain to Misty Terrain.",
      "description": "Corebook p.451. Turns the ground into Misty Terrain when the Pok\u00e9mon enters a battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-misty-surge"
      }
    }
  },
  {
    "name": "Grassy Surge",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "When this Pok\u00e9mon enters battle, it changes the terrain to Grassy Terrain.",
      "description": "Corebook p.444. Turns the ground into Grassy Terrain when the Pok\u00e9mon enters a battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-grassy-surge"
      }
    }
  },
  {
    "name": "Full Metal Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Other Pok\u00e9mon cannot lower this Pok\u00e9mon's stats.",
      "description": "Corebook p.443. Prevents other Pok\u00e9mon\u2019s moves or Abilities from lowering the Pok\u00e9mon\u2019s stats."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-full-metal-body"
      }
    }
  },
  {
    "name": "Shadow Shield",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "When this Pok\u00e9mon has full HP, regular damage from moves is halved.",
      "description": "Corebook p.460. Reduces the amount of damage the Pok\u00e9mon takes while its HP is full."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shadow-shield"
      }
    }
  },
  {
    "name": "Prism Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Reduces super-effective damage to 0.75\u00d7.",
      "description": "Corebook p.456. Reduces the power of supereffective attacks taken."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-prism-armor"
      }
    }
  },
  {
    "name": "Neuroforce",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Increases super-effective damage dealt to 1.25\u00d7.",
      "description": "Corebook p.453. Powers up moves that are super effective."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-neuroforce"
      }
    }
  },
  {
    "name": "Intrepid Sword",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Boosts Attack in battle.",
      "description": "Corebook p.448. Boosts the Pok\u00e9mon\u2019s Attack stat the first time the Pok\u00e9mon enters a battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-intrepid-sword"
      }
    }
  },
  {
    "name": "Dauntless Shield",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Boosts Defense in battle.",
      "description": "Corebook p.439. Boosts the Pok\u00e9mon\u2019s Defense stat the first time the Pok\u00e9mon enters a battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-dauntless-shield"
      }
    }
  },
  {
    "name": "Libero",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Libero changes the Pok\u00e9mon's type to that of its previously used attack.",
      "description": "Corebook p.449. Changes the Pok\u00e9mon's type to the type of the move it's about to use. This works only once each time the Pok\u00e9mon enters battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-libero"
      }
    }
  },
  {
    "name": "Ball Fetch",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "If the Pok\u00e9mon is not holding an item, it will fetch the Pok\u00e9 Ball from the first failed throw of the battle.",
      "description": "Corebook p.435. If the Pok\u00e9mon is not holding an item, it will fetch the Pok\u00e9 Ball from the first failed throw of the battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-ball-fetch"
      }
    }
  },
  {
    "name": "Cotton Down",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "When Ignores moves and abilities that draw in moves.",
      "description": "Corebook p.438. When the Pok\u00e9mon is hit by an attack, it scatters cotton fluff around and lowers the Speed stat of all Pok\u00e9mon except itself."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-cotton-down"
      }
    }
  },
  {
    "name": "Propeller Tail",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Ignores moves and abilities that draw in moves.",
      "description": "Corebook p.456. Ignores the effects of opposing Pok\u00e9mon's Abilities and moves that draw in moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-propeller-tail"
      }
    }
  },
  {
    "name": "Mirror Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Reflects any stat-lowering effects.",
      "description": "Corebook p.451. Bounces back only the stat-lowering effects that the Pok\u00e9mon receives."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mirror-armor"
      }
    }
  },
  {
    "name": "Gulp Missile",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "If a Cramorant with Gulp Missile uses Surf or Dive, it catches prey and changes its form depending on its remaining HP.",
      "description": "Corebook p.444. When the Pok\u00e9mon uses Surf or Dive, it will come back with prey. When it takes damage, it will spit out the prey to attack."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-gulp-missile"
      }
    }
  },
  {
    "name": "Stalwart",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Ignores moves and abilities that draw in moves.",
      "description": "Corebook p.463. Ignores the effects of opposing Pok\u00e9mon's Abilities and moves that draw in moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stalwart"
      }
    }
  },
  {
    "name": "Steam Engine",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Boosts the Speed stat drastically when the Pok\u00e9mon is hit by a Fire- or Water-type move.",
      "description": "Corebook p.464. Boosts the Speed stat drastically when the Pok\u00e9mon is hit by a Fire- or Water-type move."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-steam-engine"
      }
    }
  },
  {
    "name": "Punk Rock",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Boosts sound-based moves and halves damage from the same moves.",
      "description": "Corebook p.457. Boosts the power of sound-based moves. The Pok\u00e9mon also takes half the damage from these kinds of moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-punk-rock"
      }
    }
  },
  {
    "name": "Sand Spit",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Creates a sandstorm when hit by an attack.",
      "description": "Corebook p.459. The Pok\u00e9mon creates a sandstorm when it's hit by an attack."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sand-spit"
      }
    }
  },
  {
    "name": "Ice Scales",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Halves damage from Special moves.",
      "description": "Corebook p.446. The Pok\u00e9mon is protected by ice scales, which halve the damage taken from special moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-ice-scales"
      }
    }
  },
  {
    "name": "Ripen",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Doubles the effect of berries.",
      "description": "Corebook p.458. Ripens Berries and doubles their effect."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-ripen"
      }
    }
  },
  {
    "name": "Ice Face",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "The Pok\u00e9mon\u2019s ice head can take a physical attack as a substitute, but the attack also changes the Pok\u00e9mon\u2019s appearance. The ice will be restored when it snows.",
      "description": "Corebook p.446. The Pok\u00e9mon's ice head can take a physical attack as a substitute, but the attack also changes the Pok\u00e9mon's appearance. The ice will be restored when it snows."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-ice-face"
      }
    }
  },
  {
    "name": "Power Spot",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Just being next to the Pok\u00e9mon powers up moves.",
      "description": "Corebook p.455. Just being next to the Pok\u00e9mon powers up moves."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-power-spot"
      }
    }
  },
  {
    "name": "Mimicry",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Changes type depending on the terrain.",
      "description": "Corebook p.451. Changes the Pok\u00e9mon\u2019s type depending on the terrain."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mimicry"
      }
    }
  },
  {
    "name": "Screen Cleaner",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Nullifies effects of Light Screen, Reflect, and Aurora Veil.",
      "description": "Corebook p.460. When the Pok\u00e9mon enters a battle, the effects of Light Screen, Reflect, and Aurora Veil are nullified for both opposing and ally Pok\u00e9mon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-screen-cleaner"
      }
    }
  },
  {
    "name": "Steely Spirit",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "Powers up ally Pok\u00e9mon's Steel-type moves.",
      "description": "Corebook p.464. Powers up the Steel-type moves of the Pok\u00e9mon and its allies."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-steely-spirit"
      }
    }
  },
  {
    "name": "Perish Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "hidden",
      "trigger": "Storyteller Discovery",
      "frequency": "Conditional",
      "target": "Species-specific",
      "effect": "When hit by a move that makes direct contact, the Pok\u00e9mon and the attacker will faint after three turns unless they switch out of battle.",
      "description": "Corebook p.454. When hit by a move that makes direct contact, the Pok\u00e9mon and the attacker will faint after three turns unless they switch out of battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-perish-body"
      }
    }
  },
  {
    "name": "Wandering Spirit",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Swaps abilities with opponents on contact.",
      "description": "Corebook p.469. The Pok\u00e9mon exchanges Abilities with a Pok\u00e9mon that hits it with a move that makes direct contact."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-wandering-spirit"
      }
    }
  },
  {
    "name": "Gorilla Tactics",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Boosts the Pok\u00e9mon's Attack stat but only allows the use of the first selected move.",
      "description": "Corebook p.444. Boosts the Pok\u00e9mon\u2019s Attack stat but only allows the use of the first selected move."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-gorilla-tactics"
      }
    }
  },
  {
    "name": "Neutralizing Gas",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Neutralizes abilities of all Pok\u00e9mon in battle.",
      "description": "Corebook p.453. While the Pok\u00e9mon is in the battle, the effects of all other Pok\u00e9mon's Abilities will be nullified or will not be triggered."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-neutralizing-gas"
      }
    }
  },
  {
    "name": "Pastel Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Prevents the Pok\u00e9mon and its allies from being poisoned.",
      "description": "Corebook p.454. Protects the Pok\u00e9mon and its ally Pok\u00e9mon from being poisoned."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-pastel-veil"
      }
    }
  },
  {
    "name": "Hunger Switch",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "trigger": "Always On / Species Rule",
      "frequency": "Persistent",
      "target": "Self / Scene",
      "effect": "Causes Morpeko to change its form each turn, alternating between Full Belly Mode and Hangry Mode",
      "description": "Corebook p.445. The Pok\u00e9mon changes its form, alternating between its Full Belly Mode and Hangry Mode after the end of every turn."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-hunger-switch"
      }
    }
  }
]);
