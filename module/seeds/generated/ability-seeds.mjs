export const ABILITY_COMPENDIUM_ENTRIES = Object.freeze([
  {
    "name": "Adaptability",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever this Pokemon uses a Physical or Special Move that matches their Type, add 1 Extra die to the Damage pool of that Move.",
      "secondaryEffects": [],
      "description": "The Pokemon will easily adapt to its surroundings, it will travel with ease, no matter the terrain."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-adaptability",
        "automationStatus": "partial",
        "automationNotes": "STAB bonus is +2 instead of +1. Hardcoded in damage calculation."
      }
    }
  },
  {
    "name": "Aerilate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Normal-Type Moves that the Pokemon uses will deal damage as if they were Flying-Type, affecting STAB, weakness and resistance. Add 1 Extra die to the Damage Pool of Flying moves.",
      "secondaryEffects": [],
      "description": "The Pokemon never touches the ground, a neverending wind current can be felt swirling around it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-aerilate",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Aftermath",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-self-faint",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon faints due to a Non-Ranged Physical Move, the User of that attack is dealt 2 Damage.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "target",
          "effectType": "damage",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "When hurt or upset, the Pokemon will prepare to burst. If hit hard enough, it will explode on contact. They also tend to hold grudges."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-aftermath",
        "automationStatus": "full",
        "automationNotes": "Only if fainted due to Non-Ranged Physical Move"
      }
    }
  },
  {
    "name": "Air Lock",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Negate all the effects of a Weather in the field. If no weather is active, they cannot be activated by Moves or Abilities. If one is already active, it does not disappear but provides no effects. Unique Ability.",
      "secondaryEffects": [],
      "description": "The Pokemon surrounds itself in a vacuum. Every particle of rain, sand, and hail stands floating still around it, and even heat is filtered out of the place."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-air-lock",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Analytic",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon has a lower initiative than its target, Add 1 Extra die to all of their Damage Pools.",
      "secondaryEffects": [],
      "description": "The Pokemon will never charge recklessly, it will take a moment to think about the best decision to make in any situation."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-analytic",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Anger Point",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-critical-hit-received",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a foe lands a Critical Hit on this Pokemon, increase this Pokemon's Strength Attribute by 3.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 3,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon will easily get aggressive. Little to no provocation is needed for it to start throwing a tantrum and ripping everything to shreds."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-anger-point",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Anger Shell",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-hp-half-or-less",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon's HP is half or less, increase its Strength, Special, and Dexterity Attributes by 1 but Reduce its Defense and Sp. Defense by 1.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "combat-stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "defense",
          "amount": -1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "combat-stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "specialDefense",
          "amount": -1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon gets frustrated if things are not going their way, they are prone to break their own shell in their rage."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-anger-shell",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Anticipation",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If any foe knows a Move that would deal Lethal or Super Effective damage against this Pokemon, it will alert its Trainer.",
      "secondaryEffects": [],
      "description": "The Pokemon is always alert for threats and rarely sits to relax. If it perceives a potential danger it will get anxious and start shuddering."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-anticipation",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Arena Trap",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Pokemon entering or already on the foe's side of the field become blocked as long as this Pokemon is on the field. Pokemon with immunity to Ground-Type Moves are not affected.",
      "secondaryEffects": [],
      "description": "The ground around this Pokemon becomes really soft and hard to walk in. When in danger, it will sink the ground around itself creating a shifting sand pit."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-arena-trap",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Armor Tail",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The User and allies in range can't be the target of Physical or Special Moves with the Reaction Added Effect.",
      "secondaryEffects": [],
      "description": "The Pokemon uses its tail as armor. Almost like it had eyes on its back, always alert against surprise attacks."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-armor-tail",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Aroma Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "User and Allies in Range are immune to the \"Love\" Status Condition and the effects of the moves: Taunt, Torment, Spite, Attract, Disable, Encore, and Heal Block.",
      "secondaryEffects": [],
      "description": "This Pokemon lets off a nice smell that helps you to stay relaxed and focused even under stressful situations"
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-aroma-veil",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "As One",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This ability trigger a form change that combines the attributes and movepool of two Allied Pokemon. Choose one ability from each of the two Pokemon forming this union, the joint form of these Pokemon may use those two Abilities at the same time. Unique Ability.",
      "secondaryEffects": [],
      "description": "Two Pokemon join forces, one riding on the other's back. Together, they ride for ruin and the world's ending."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-as-one",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Aura Break",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Invert the effects that the Abilities Dark Aura and Fairy Aura have on their users. If said Abilities would increase a Dice Pool for their User, reduce it instead. Unique Ability.",
      "secondaryEffects": [],
      "description": "Anyone emitting a particularly evil aura will be purified, anyone with an aura of purity will be corrupted by evil, just for coming close to this Pokemon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-aura-break",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Bad Dreams",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "round-end",
      "abilityTarget": "all-foes",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "At the end of the Round, deal 1 Damage to anyone in the battlefield that has the Sleep Status Condition. Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "all-foes",
          "effectType": "damage",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon can transfer its evil intent through the world of dreams, wreaking havoc and bringing fear into the minds of those deep in slumber"
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-bad-dreams",
        "automationStatus": "full",
        "automationNotes": "Only targets with Sleep Status Condition"
      }
    }
  },
  {
    "name": "Ball Fetch",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever you throw a pokeball to a wild Pokemon, if the roll for catching it is unsuccessful, the pokeball won't break. This Pokemon will bring it back to you at the end of the Round instead. ",
      "secondaryEffects": [],
      "description": "The Pokemon is a bit obsessed with playing \"Fetch the Ball\". It can play for hours and hours and never get bored of it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-ball-fetch",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Battery",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Increase by 1 the Special Attribute of all Ally Pokemon in Range. Ally Pokemon get 1 Extra die to all their Special Move's Damage pool. The User does not get these effects.",
      "secondaryEffects": [],
      "description": "This Pokemon's presence creates an electric field that charges up electronics and even makes others feel energized."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-battery",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Battle Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a foe lands a Critical Hit on this Pokemon, it won't get any Bonus Dice on its Damage Dice pool for it.",
      "secondaryEffects": [],
      "description": "The skin of the Pokemon is covered by plates of a very resistant material, like rock, steel, or an exoskeleton."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-battle-armor",
        "automationStatus": "partial",
        "automationNotes": "Blocks critical hits. Hardcoded in damage calculation."
      }
    }
  },
  {
    "name": "Beads of Ruin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "all-in-range",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce by 2 the Special Defense of everyone in the field, except this Pokemon. This Pokemon is immune to the effects of the Abilities: Beads of Ruin, Sword of Ruin, Tablets of Ruin, and Vessel of Ruin. Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "all-foes",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "specialDefense",
          "amount": -2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "There is a cursed artifact on this Pokemon. A burning envy will corrupt the souls of anyone close. This Pokemon loves to create discord amongst others."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-beads-of-ruin",
        "automationStatus": "full",
        "automationNotes": "Reduce SpDEF of everyone except self. Immune to other Ruin abilities"
      }
    }
  },
  {
    "name": "Beast Boost",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-foe-faint",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a foe faints because of an attack dealt by this Ultra-Beast, Increase by 1 their highest Attribute. Up to 3 points can be increased this way. Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 3,
          "linkedEffectId": ""
        }
      ],
      "description": "A wicked satisfaction grows as this creature brings out destruction, for it becomes more savage with every foe that falls to its power."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-beast-boost",
        "automationStatus": "full",
        "automationNotes": "Increase highest Attribute by 1. Up to 3 points"
      }
    }
  },
  {
    "name": "Berserk",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-hp-half-or-less",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon's HP is half or less, Increase its Special Attribute by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon is usually calm in demeanor, but when its life or someone it cares for is in danger, the adrenaline rush will transform it into an enranged beast."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-berserk",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Big Pecks",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon cannot have its Defense reduced.",
      "secondaryEffects": [],
      "description": "This tenacious Pokemon uses its beak to cover its weak spots."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-big-pecks",
        "automationStatus": "partial",
        "automationNotes": "PREVENT: defense reduction. Cannot have Defense reduced."
      }
    }
  },
  {
    "name": "Blaze",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-hp-half-or-less",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Pain Penalization won't reduce successes from Accuracy or Damage rolls of Fire-Type Moves used by this Pokemon. Fire-Type Moves get 2 Extra dice to their Damage Pool when this Pokemon is at half HP or less.",
      "secondaryEffects": [],
      "description": "The inner and outer fire on this Pokemon's body will burn incredibly fierce just before fading."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-blaze",
        "automationStatus": "partial",
        "automationNotes": "When HP ≤ half: +1 damage die for Fire-type moves. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Bulletproof",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce by 1 all damage from Ranged Physical Moves dealt to this Pokemon. Reduce by 1 all damage from Special Moves with the words: Ball, Blast, Bomb, Cannon, Octazooka, Puff, Shot, Sphere, and Wrecker on their name.",
      "secondaryEffects": [],
      "description": "The armor on this Pokemon's body protects it from projectiles and small explosions."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-bulletproof",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Cheek Pouch",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon restores 2 HP whenever it eats a berry with no HP healing effect. (e.g. Pecha Berry, Lum Berry)",
      "secondaryEffects": [],
      "description": "The Pokemon is able to store food and objects inside its stretchy cheeks for later consumption. Often looking adorable while doing so."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-cheek-pouch",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Chilling Neigh",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-foe-faint",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a foe faints because of a Physical or Special Move dealt by this Pokemon, Increase its Strength Attribute by 1. Up to 3 points can be increased this way.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 3,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon emits a chilling and furious neigh. In ancient times of war, hearing it made the opposing armies tremble in fear."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-chilling-neigh",
        "automationStatus": "full",
        "automationNotes": "Up to 3 points"
      }
    }
  },
  {
    "name": "Chlorophyll",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "weather-active",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "sunny,harsh-sunlight",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Sunny Weather is active, Increase this Pokemon's Dexterity Attribute by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon synthesizes sunlight to get energy, if it's kept in a sunny environment it will rarely need to eat."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-chlorophyll",
        "automationStatus": "full",
        "automationNotes": "While Sunny Weather is active: +2 Dexterity"
      }
    }
  },
  {
    "name": "Clear Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Other Pokemon cannot Increase or Reduce the Attributes of this Pokemon. This Pokemon can still Increase or Reduce its own Attributes.",
      "secondaryEffects": [],
      "description": "The Pokemon is completely aware of all its body surroundings, trying to sneak on it will be incredibly difficult."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-clear-body",
        "automationStatus": "partial",
        "automationNotes": "PREVENT: all stat changes by others. Cannot have Attributes changed by others."
      }
    }
  },
  {
    "name": "Cloud Nine",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Negate the effects of Weather Conditions on this Pokemon.",
      "secondaryEffects": [],
      "description": "This Pokemon will easily feel pleased, and it's prone to be heappier than others. No matter if it's sunny or rainy it will never feel gloomy."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-cloud-nine",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Color Change",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon is dealt damage it will temporarily change its type to match the type of the move that just hit it. The effect ends if the Pokemon is removed from battle.",
      "secondaryEffects": [],
      "description": "This Pokemon can change its color and energy to camouflage and merge with the surroundings."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-color-change",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Comatose",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The Pokemon permanently has the “Sleep” Status Ailment but it is immune to its effects. This Pokemon can't be inflicted other Status Ailment or Condition. Moves and Abilities affecting Asleep Pokemon still have an effect on it.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "condition",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "sleep",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "For some reason this Pokemon is always asleep and can't wake up. Still, it is able to understand commands and move just as if it were sleepwalking"
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-comatose",
        "automationStatus": "full",
        "automationNotes": "Permanent Sleep but immune to its effects. Can't have other ailments"
      }
    }
  },
  {
    "name": "Commander",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If there is an Allied Dodonzo on the field, increase its Attributes and Defenses by 2. Dodonzo is blocked for the rest of the scene. All damage that would be dealt to this Pokemon is dealt to Dodonzo instead. Unique Ability.",
      "secondaryEffects": [],
      "description": "The Pokemon has a strategic mind, even if its body is frail it can device clever plans and tell its Dodonzo friend exactly what to do."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-commander",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Competitive",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-stat-lowered",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon gets an Attribute reduced by a foe during a battle, Increase its Special by 2. ",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's determination grows in the face of adversity. It is always trying to compete with those around it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-competitive",
        "automationStatus": "full",
        "automationNotes": "When an Attribute is reduced by a foe"
      }
    }
  },
  {
    "name": "Compound Eyes",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon gets 2 Extra Dice on the Accuracy Pool of any move with Low Accuracy. ",
      "secondaryEffects": [],
      "description": "This Pokemon has peripheral vision that allows it to locate its targets with great precision."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-compound-eyes",
        "automationStatus": "partial",
        "automationNotes": "+1 Accuracy die. Hardcoded in accuracy calculation."
      }
    }
  },
  {
    "name": "Contrary",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If anything would reduce an Attribute of this Pokemon, increase it instead. If anything would increase an Attribute of this Pokemon, reduce it instead.",
      "secondaryEffects": [],
      "description": "Most of the time this pokemon will want to do the opposite of what you want. Sometimes it even contradicts itself."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-contrary",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Corrosion",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Ignore any immunity the foe has to Poison-Type Damage and/or to be inflicted Poison and Badly Poisoned Status Ailments.",
      "secondaryEffects": [],
      "description": "This Pokemon's venom can eat through metal, wood, and most inorganic and organic materials. Be careful not to touch it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-corrosion",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Costar",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If there's an Ally with increased Attributes/Traits as this Pokemon enters the field, copy all of the Increases onto this Pokemon. If more than one Ally has increased Attributes/Traits, choose one to copy from.",
      "secondaryEffects": [],
      "description": "This Pokemon is a true pal, friend, and wingman. It will follow you on any crazy plan you concoct. The player-2 of your dynamic duo."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-costar",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Cotton Down",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "all-foes",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If Pokemon is hit with a Non-Ranged Physical Move, reduce the speed of all Pokemon in an Area close to it.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "all-foes",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": -1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The cotton fluff on this pokemon's body is constantly being shed, it can be used to make beautiful clothes but it's also bothersome to walk on."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-cotton-down",
        "automationStatus": "full",
        "automationNotes": "When hit by Non-Ranged Physical: reduce Dexterity of all nearby Pokemon"
      }
    }
  },
  {
    "name": "Cud Chew",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon has a Berry as a Held item or it is hit by a Berry, it will activate its effects two times during the battle. This effect does stack with the Move “Recycle”.",
      "secondaryEffects": [],
      "description": "This Pokemon regurgitates food back into its mouth whenever it gets hungry. A bit disgusting but the good news is that you'll save a lot on food."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-cud-chew",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Curious Medicine",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes into battle, remove all Attribute Increases and Reductions on all Ally Pokemon in range. Outside of battle, the Pokemon is able to create potions that may heal HP or deal damage at the storyteller's discretion.",
      "secondaryEffects": [],
      "description": "This Pokemon likes to mix disgusting substances to supposedly create medicine. The resulting potions are dubious at best, toxic at worst."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-curious-medicine",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Cursed Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-any",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever this Pokemon is dealt damage with a Physical or Special Move, Roll 3 Chance Dice to Disable that Move. Up to 3 Moves may be disabled this way.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 3,
          "target": "target",
          "effectType": "condition",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "disabled",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon carries a curse within itself. Crossing this Pokemon is not a good idea."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-cursed-body",
        "automationStatus": "full",
        "automationNotes": "Up to 3 Moves may be disabled"
      }
    }
  },
  {
    "name": "Cute Charm",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is hit with a Non-Ranged Physical Move, roll 3 Chance Dice to make the foe fall in Love.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 3,
          "target": "target",
          "effectType": "condition",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "infatuated",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "It may be its twinkly eyes or its rosy cheeks, but other people and Pokemon will try to win this Pokemon's heart."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-cute-charm",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Damp",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "No one in the field will be able to use the moves: Self-Destruct, Explosion, Misty Explosion, Mind Blown, and Burn Up while this Pokemon is in the field. The Ability Aftermath does not activate if this Pokemon is in the field.",
      "secondaryEffects": [],
      "description": "The Pokemon gathers the humidity in the air around itself. Lighting a spark or keeping a fire on, will be almost impossible close to it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-damp",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Dancer",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Once per Round, if a Pokemon uses a Move with the word \"Dance\" (i.e. Dragon Dance, Petal Dance etc.) This Pokemon gets one free action to use the same Move immediately after with the same number of successes on Accuracy; Damage must still be rolled. Rampage Moves are only used once.",
      "secondaryEffects": [],
      "description": "When someone begins to dance, this Pokemon dances too. It expresses its feelings and communicates through little jigs."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-dancer",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Dark Aura",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Increase 2 dice to all Damage Pools of Dark-Type Moves of all Pokemon in the field. This effect does not stack with itself. Pokemon and Trainers on the field will not cooperate with each other. Unique Ability.",
      "secondaryEffects": [],
      "description": "A powerful black aura comes out of this Pokemon, Shrouding the field in darkness and filling everyone's hearts with evil, selfishness and corruption."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-dark-aura",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Dauntless Shield",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever this Pokemon enters battle, Increase 2 its Defense by 2. Outside of battle, this Pokemon is immune to physical damage. Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "defense",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The valorous resolve of this Pokemon makes it impervious to physical damage through sheer will. Its presence can be unnerving."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-dauntless-shield",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Dazzling",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Foes cannot use Reaction Moves against this Pokemon. Maneuvers can still be used.",
      "secondaryEffects": [],
      "description": "Its beautiful scales reflect light in a mirror-like manner, no one can help but to stop in their tracks when they glance at this Pokemon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-dazzling",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Defeatist",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-hp-half-or-less",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon's HP is at half or less, roll its Loyalty requiring 2 successes every action, if the roll fails Reduce by 2 its Strength and Special for that action. If the roll is successful it keeps its attributes unchanged or restore them if they were reduced in a previous action.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": -2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": -2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon is a pessimist by nature. When things get difficult, it will be the first to give up."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-defeatist",
        "automationStatus": "full",
        "automationNotes": "At half or less HP: -2 Strength and -2 Special"
      }
    }
  },
  {
    "name": "Defiant",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-stat-lowered",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon has an Attribute reduced during a battle, Increase its Strength by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon will not yield, the harder the situation gets, the higher its fighting spirit will grow. It may, however, be a bit of a rebel."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-defiant",
        "automationStatus": "full",
        "automationNotes": "When an Attribute is reduced by a foe"
      }
    }
  },
  {
    "name": "Delta Stream",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of Strong Winds Weather. The effects end when the Pokemon leaves the battle. (In case of stalemate, The Pokemon with highest Will might keep the dominant weather) Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "weather",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "strong-winds",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The wind currents blow through the entire battlefield, Pokemon might be blown away if they don't know how to fly."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-delta-stream",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Desolate Land",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of Desolate Weather. The effects end when the Pokemon leaves the battle. (In case of stalemate, The Pokemon with highest Will might keep the dominant weather). Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "weather",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "harsh-sunlight",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The heat is unbearable. Your skin gets red and blistered. All water evaporates, and every step of this Pokemon makes the ground become molten lava."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-desolate-land",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Disguise",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon would receive damage due to a Physical or Special Move, reduce that damage to zero. Entry Hazards, Weather Conditions and Status Ailments do not trigger this Ability. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon wears a convincing disguise of another Pokemon. If it receives damage, the disguise breaks, making it appear as if it received a fatal injury."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-disguise",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Download",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out it will scan its foes and give information about them. It will then Increase 1 Point to either its Strength or Special Attribute at Storyteller's discretion. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon is able to scan and access digital data within computers and download the info into itself. Too much data might make it feel bloated."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-download",
        "automationStatus": "partial",
        "automationNotes": "On entry: scans foes and grants +1 to Strength or Special based on foe's lower defensive stat. Automated in enter-battle processing."
      }
    }
  },
  {
    "name": "Dragon Maw",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Physical or special Dragon-Type Moves that this Pokemons uses have 2 Extra dice on their Damage Pool. This effect does not apply to Moves with set damage.",
      "secondaryEffects": [],
      "description": "This Pokemon's mandibles are full of fury and fierceness. They'll rip and tear without mercy."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-dragon-maw",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Drizzle",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of Rain Weather. The effects end when the Pokemon leaves the battle. (In case of stalemate the Pokemon with higher Will might keep the dominant weather)",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "weather",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "rain",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The sky will keep raining in an apparent never-ending storm for as long as this Pokemon wants to."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-drizzle",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Drought",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of Sunny Weather. The effects end when the Pokemon leaves the battle. (In case of stalemate the Pokemon with higher Will might keep the dominant weather)",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "weather",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "sunny",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Sunlight will be harsly bright, and the heat will increase in the field for as long as this Pokemon wants to."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-drought",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Dry Skin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "water",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Sunny Weather is active, this Pokemon will receive 1 damage at the end of each round. Fire attacks will deal 1 additional Damage to this Pokemon. Water attacks may heal 1 HP to this Pokemon instead of dealing damage.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "heal",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic-numeric",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The skin of this Pokemon needs special care as it is very dry and brittle, it'll require constant hydration and protection against the sun."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-dry-skin",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: Water-type damage. Heal 1 HP when hit by Water. Takes extra Fire damage (hardcoded in damage calc)."
      }
    }
  },
  {
    "name": "Early Bird",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The time this Pokemon would be asleep is reduced by half and it will only need to score 2 successes on its Insight roll to wake up in battle. This effect does not apply for the Move \"Rest\".",
      "secondaryEffects": [],
      "description": "Pokemon with this ability are light sleepers that will easily rise from slumber. They wake up full of energy with just a couple hours of sleep."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-early-bird",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Earth Eater",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "ground",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever this Pokemon is hit by a Ground-Type Move, you may Heal 1 HP instead of receiving damage. Ground-type moves do not deal damage to this Pokemon.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "heal",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic-numeric",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon feeds on the minerals on earth, it loves mud baths and spends most of the time burrowed underneath the ground."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-earth-eater",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: Ground-type damage. Heal 1 HP when hit by Ground"
      }
    }
  },
  {
    "name": "Effect Spore",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If hit by a Non-Ranged Physical Move, the Pokemon rolls 3 Chance Dice to Poison, Paralize or Sleep the foe at random.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 3,
          "target": "target",
          "effectType": "condition",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "poisoned",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "When stressed, this Pokemon will leak spores through its body that scatter in the air causing severe allergies."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-effect-spore",
        "automationStatus": "full",
        "automationNotes": "Random: Poison, Paralyze, or Sleep"
      }
    }
  },
  {
    "name": "Electric Surge",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of the Move Electric Terrain. (In case of stalemate the Pokemon with higher Will might keep the dominant Terrain)",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "terrain",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "electric",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon can surround itself with an electric field that fills the air with tension and keeps everyone on edge."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-electric-surge",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Electromorphosis",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon receives Damage from a Physical or Special Move, Add 2 Extra Dice to the Damage Dice Pool of its next Electric Move.",
      "secondaryEffects": [],
      "description": "This Pokemon can transform any kind of kinetic energy into electricity. Beware to touch it as it always has some excess charge on its body."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-electromorphosis",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Embody Aspect",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Increase by 2 an Attribute of this Pokemon depending on the mask it wears. Teal & Wellspring Mask - Dexterity / Heartflame & Cornerstone Mask - Strength. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon's emotions are deeply affected by the masks it wears, its personality changing completely depending on which one it is using."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-embody-aspect",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Emergency Exit",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever this Pokemon's HP reaches half or less, it will switch out to its pokeball, sending an Ally to take its place. If there is no Ally, the battle may end. This Ability's effect is not affected by Block.",
      "secondaryEffects": [],
      "description": "The Pokemon makes tactical escapes when the situation escalates out of control. You may force him to fight despite this but it won't like it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-emergency-exit",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Fairy Aura",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Increase 2 dice to all Damage Pools of Fairy-Type Moves of all Pokemon in the field. This effect does not stack. Pokemon and Trainers on the field will not attack the user of this Ability. Unique Ability.",
      "secondaryEffects": [],
      "description": "A powerful pink glowing aura comes out of this Pokemon, covering the field in a glimmering light, filling everyone's hearts with peace, hope, and love."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-fairy-aura",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Filter",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a foe uses a Move that would deal Super Effective Damage to this Pokemon, reduce by 1 the total Damage from that attack.",
      "secondaryEffects": [],
      "description": "This Pokemon uses an invisible energy field to filter away harmful energies and substances."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-filter",
        "automationStatus": "partial",
        "automationNotes": "Reduces super-effective damage. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Flame Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When hit by a Non-Ranged Physical Move, this Pokemon rolls 3 Chance Dice to inflict 2nd degree Burn on the foe.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 3,
          "target": "target",
          "effectType": "condition",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "burn2",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon can willingly ignite its body on fire, receiving no harm from it. Objects that come into contact with this Pokemon may catch fire."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-flame-body",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Flare Boost",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-has-condition",
      "abilityTarget": "self",
      "triggerConditionType": "burn",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon gets any degree of Burn, Increase 2 points to its Special Attribute.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "A Pokemon with this Ability benefits from the extreme heat produced by fire. But they might be somewhat of a pyromaniac."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-flare-boost",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Flash Fire",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "fire",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon is hit by a Fire-Type move, add 1 Extra die to the Damage Pool of Fire-type Moves this Pokemon uses until the end of the scene. Fire-type moves do not deal damage to this Pokemon.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 0,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "damage",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 1,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon is capable of consuming other fire sources and adding them to its own. Walking through embers, fire, lava and hell feel like a breeze to it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-flash-fire",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: Fire-type damage. Boosts Fire-type move damage by +1 when hit by Fire."
      }
    }
  },
  {
    "name": "Flower Gift",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Sunny Weather is active, Increase 2 Points to the Strength and Sp.Defense Attribute of the User and its allies in range.",
      "secondaryEffects": [],
      "description": "This Pokemon's petals radiate full of energy when the sun shines bright. The energy irradiated makes those around feel stronger."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-flower-gift",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Flower Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "User and allies in range can't have their Attributes/Traits reduced. User and allies in range can't have any Status Ailment inflicted on them. Previously inflicted or self-inflicted Attribute reductions and/or ailments remain.",
      "secondaryEffects": [],
      "description": "This Pokemon makes flowers grow in gardens and near other Pokemon to protect them from harm."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-flower-veil",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Fluffy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce by 2 the Damage dealt to this Pokemon by All Physical Moves. Increase by 2 the Damage dealt to this Pokemon by Fire-Type Moves.",
      "secondaryEffects": [],
      "description": "This Pokemon's fur is so fluffy you could die. So soft and snuggly that it invites you to hug it. Hand-wash only, tumble dry with no heat, do not iron."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-fluffy",
        "automationStatus": "partial",
        "automationNotes": "Reduces damage from contact moves, but takes extra damage from Fire moves. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Forecast",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The Type of this Pokemon will change depending on the active weather. Fire-Type under Sun, Water-Type under Rain, Ice-Type under Hail/Snow and Rock-Type under Sand.",
      "secondaryEffects": [],
      "description": "This Pokemon can absorb the elements around to adapt and survive even under extreme conditions."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-forecast",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Forewarn",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "In battle, this Pokemon will warn about the strongest move one of its foes has. Storyteller has to reveal it to the trainer of this Pokemon in secret.",
      "secondaryEffects": [],
      "description": "When this Pokemon feels bad intentions or disaster approaching, it will mentally warn its trainer. The trainer must make a roll of Insight to get the message."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-forewarn",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Friend Guard",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon does not receive damage from Moves performed by allies. Added effects may still apply.",
      "secondaryEffects": [],
      "description": "The Pokemon is adorable and evokes parental instincts in others. All of its allies will seek to protect it all the time."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-friend-guard",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Frisk",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon enters the battlefield, Storyteller must reveal its trainer the held item of one foe.",
      "secondaryEffects": [],
      "description": "This Pokemon can see the items others may be carrying, even if they are hidden."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-frisk",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Full Metal Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Other Pokemon cannot Reduce the Attributes of this Pokemon. This Pokemon can still Reduce its own Attributes. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon's body is a thick metal armor, its shiny coat cannot be muddled. Look inside of it and you may be blinded by the sun's brightness."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-full-metal-body",
        "automationStatus": "partial",
        "automationNotes": "PREVENT: all stat reduction by others. Cannot have Attributes reduced by others."
      }
    }
  },
  {
    "name": "Fur Coat",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce by 2 the Damage dealt to this Pokemon by All Physical Moves.",
      "secondaryEffects": [],
      "description": "This Pokemon's fluffy exterior is cuddly, soft, hypoallergenic, and also serves as a cushion against powerful blows."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-fur-coat",
        "automationStatus": "partial",
        "automationNotes": "Reduces damage from Physical moves. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Gale Wings",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Add the Effect \"Reaction 1\" to all Flying-Type Moves of this Pokemon.",
      "secondaryEffects": [],
      "description": "This Pokemon's wings are perfectly designed to ride the roughest winds effortlessly."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-gale-wings",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Galvanize",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Normal-Type Moves that this Pokemon uses will deal damage as if they were Electric-Type, affecting STAB, weakness and resistance. Add 1 Extra Die of Damage to Electric Moves.",
      "secondaryEffects": [],
      "description": "The body of this Pokemon is surrounded by electrical currents, this makes it very energized in everything it does."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-galvanize",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Gluttony",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon can eat any type of food, medicine or herbal medicine with no negative. This pokemon may have up to three berries as held item instead of just one. The berries must not be of the same effect.",
      "secondaryEffects": [],
      "description": "This Pokemon eats all day long, it is always carrying food and has no problem to find food sources since it's not a picky eater. It, however, doesn't share."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-gluttony",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Good As Gold",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Neither foes nor Allies can Target this Pokemon with Support Moves.",
      "secondaryEffects": [],
      "description": "The Pokemon's body is made of the most pure gold you'd ever seen. It knows its worth, so its shine is always unbesmirched."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-good-as-gold",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Gooey",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time a foe hits this Pokemon with a Non-Ranged Physical Move, reduce 1 Point to their Dexterity Attribute.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "target",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": -1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's sticky ooze will rub into anyone that touches it. This may become quite a burden. On the bright side, it is a natural and organic glue."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-gooey",
        "automationStatus": "full",
        "automationNotes": "First time foe hits with Non-Ranged Physical"
      }
    }
  },
  {
    "name": "Gorilla Tactics",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "active",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever this Pokemon comes into battle, choose a Move. This Pokemon can only perform that Move during battle, but can use it up to 5 times per round. Increase this Pokemon's Strength by 1.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon's manners leave a lot to be desired, it is brutish and uncivilized, its only approach to facing problems: \"Smash it!\""
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-gorilla-tactics",
        "automationStatus": "full",
        "automationNotes": "Choose one Move; can only use that Move in battle (up to 5x/round)"
      }
    }
  },
  {
    "name": "Grass Pelt",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "terrain-active",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "grassy",
      "frequency": "",
      "effect": "If Grassy Terrain is active, Increase this Pokemon's Defense by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "defense",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon has a lush coat of grass to protect its body, even if you cut it, it will regrow in a few days."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-grass-pelt",
        "automationStatus": "full",
        "automationNotes": "While Grassy Terrain is active: +2 Defense"
      }
    }
  },
  {
    "name": "Grassy Surge",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of the Move Grassy Terrain. (In case of stalemate the Pokemon with higher Will might keep the dominant Terrain)",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "terrain",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "grassy",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon can surround itself with a grass field that makes it easy to relax and laze around in the sun."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-grassy-surge",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Grim Neigh",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-foe-faint",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a foe faints because of a Physical or Special dealt by this Pokemon, Increase its Special Attribute by 1. Up to 3 points can be increased this way.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 3,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon emits a somber and eerie neigh. In ancient times, hearing it at night was a terrible omen."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-grim-neigh",
        "automationStatus": "full",
        "automationNotes": "Up to 3 points"
      }
    }
  },
  {
    "name": "Guard Dog",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a foe uses a Move, Ability or Item to reduce this Pokemon's Strength Attribute, negate that effect and increase it by 2 instead. This Pokemon is immune to the effect of Switcher Moves that would remove it from battle.",
      "secondaryEffects": [],
      "description": "A territorial and protective Pokemon. It won't ever back down or run away, not even from the most intimidating foes. Very loyal but can also be a bit scary."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-guard-dog",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Gulp Missile",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon uses the Moves Surf or Dive, it will change forms after dealing damage. \"Gulping Form\" at full or more than half HP remaining, \"Gorging Form\" at half or less HP. If the Pokemon is dealt damage by a foe while in any of these Forms, deal 2 Dice of Damage and an effect to that foe. The user returns to its regular form afterwards. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon is an excellent hunter, when diving into a pool of water it will always come out with prey. And it will sometimes use the prey as a weapon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-gulp-missile",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Guts",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-has-condition",
      "abilityTarget": "self",
      "triggerConditionType": "burn,frozen,paralyzed,poisoned,sleep",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While affected by a Status Ailment (Burn, Frozen, Paralysis, Poison, Sleep), Increase this Pokemon's Strength Attribute by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon dares to do everything no one else dares to, and won't lose its determination easily, it may be a little reckless, though."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-guts",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Hadron Engine",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of the Move Electric Terrain. (In the case of a stalemate the Pokemon with higher Will might keep the dominant Terrain). While Electric Terrain is active, increase this Pokemon's Special Attribute by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "terrain",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "electric",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "While Electric Terrain is active",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's body is able to accelerate particles and transform them into energy. Theory is that it's simply bringing forward energy from another universe."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-hadron-engine",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Harvest",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon uses a berry as a held item during a fight, the berry will grow back at the end of the battle.",
      "secondaryEffects": [],
      "description": "This Pokemon will naturally produce edible fruits in a short period of time, if fed with berries it will start growing them too."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-harvest",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Healer",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "round-end",
      "abilityTarget": "ally",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If an Ally on the battle field has a Status Ailment, at the End of the Round this Pokemon rolls 3 Chance Dice to heal it. Outside of battle it can heal Status Ailments by spending 1 Will Point.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 3,
          "target": "self",
          "effectType": "cleanse",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "ally ailment",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon has healing powers, and will use them without hesitation to aid others."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-healer",
        "automationStatus": "full",
        "automationNotes": "3 Chance Dice to heal ally's Status Ailment"
      }
    }
  },
  {
    "name": "Heatproof",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "1st and 2nd Degree Burns deal no Damage to this Pokemon. If this Pokemon is hit by a Fire-Type Move, Reduce the total damage dealt by 2.",
      "secondaryEffects": [],
      "description": "This Pokemon can resist very high temperatures without trouble."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-heatproof",
        "automationStatus": "partial",
        "automationNotes": "Reduces Fire-type damage by 2. Hardcoded in damage calculation."
      }
    }
  },
  {
    "name": "Heavy Metal",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Increase the Pokemon's weight at the storyteller's discretion. Moves with damage based on the weight get their Damage Pool modified according to the increased weight of the user.",
      "secondaryEffects": [],
      "description": "The metal covering the body of the Pokemon is so thick that it can double and sometimes triple the average weight of the Pokemon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-heavy-metal",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Honey Gather",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "A small barrel of honey can be sold for up to $100. Honey attracts wild Pokemon and feeding a Pokemon with it will make it happy.",
      "secondaryEffects": [],
      "description": "The Pokemon produces its own honey, you can get a small barrel of high quality honey every day."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-honey-gather",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Hospitality",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "ally",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it can spend a Will Point to heal up to 3 HP from a damaged Ally. Lethal Damage is not healed with this effect. Outside of battle it can remove the bitter taste from all healing Herbs.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "heal",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 3,
          "healType": "basic-numeric",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon can transform the most bitter herb into a delicious medicinal tea. It will also invite its friends for a cup whenever they have the time."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-hospitality",
        "automationStatus": "full",
        "automationNotes": "Heal up to 3 HP to a damaged Ally. Costs 1 Will. No Lethal healing"
      }
    }
  },
  {
    "name": "Huge Power",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon has a permanent increase to its Strength Attribute. Ranks Starter, Beginner, Standard, and Advanced Increase Strength by 1. Rank Expert and higher Increase Strength by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "rank-expert-double",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon has an unnatural strength that goes way beyond of what its physical appearance would suggest."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-huge-power",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Hunger Switch",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "At the end of the Round, switch this Pokemon's Form, from \"Hangry\" to \"Full-Belly Form\" or vice versa. Outside of battle, the form changes depending on its hunger. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon becomes really upset if it gets hungry, it will bite and act out unless you constantly give it snacks."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-hunger-switch",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Hustle",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon gets an Extra Low Accuracy 1 and adds 2 Extra Dice to the Damage pool for all its Physical Moves.",
      "secondaryEffects": [],
      "description": "The Pokemon will perform everything in a hurry, it keeps itself busy, but it can be kind of sloppy when it rushes something out."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-hustle",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Hydration",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "round-end",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When Rain weather is active, this Pokemon will cure all Status Ailments and Conditions it is affected with at the end of the round.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "cleanse",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "all",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The body of the Pokemon absorbs water and uses its moisture to maintain a healthy state."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-hydration",
        "automationStatus": "full",
        "automationNotes": "While Rain Weather is active"
      }
    }
  },
  {
    "name": "Hyper Cutter",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon can't have its Strength Attribute reduced by Moves, Abilities, or Items. This Pokemon can still Reduce its own Strength Attribute.",
      "secondaryEffects": [],
      "description": "The claws of this Pokemon are very sharp. Their edge can't be dulled."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-hyper-cutter",
        "automationStatus": "partial",
        "automationNotes": "PREVENT: strength reduction. Cannot have Strength reduced by others."
      }
    }
  },
  {
    "name": "Ice Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "round-end",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If Hail/Snow Weather is active, you may restore 1 HP to this Pokemon at the end of the Round. This Pokemon is immune to damage from Hail weather.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "heal",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic-numeric",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon's body is almost frozen, and can cool down enclosed areas in a few minutes. It feels most comfortable when temperatures are below zero."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-ice-body",
        "automationStatus": "full",
        "automationNotes": "While Hail/Snow Weather is active. IMMUNE: hail weather damage"
      }
    }
  },
  {
    "name": "Ice Face",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The Pokemon has 2 Extra HP when it is on \"Ice Face form\". If the Ice receives 2 damage, change the Pokemon's form to \"No-Ice Form\". To restore \"Ice Face Form\" the Pokemon must be out one whole Round while Hail/Snow weather is active. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon's face is covered by a thick block of ice that serves as a cover for its body. If it breaks it will need freezing temperatures to restore the ice block."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-ice-face",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Ice Scales",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce by 2 the Damage dealt to this Pokemon by All Special Moves.",
      "secondaryEffects": [],
      "description": "This Pokemon's body is covered by crystal scales made of ice. Always cold to the touch, it easily deflects most projectiles, energy and light on its surface."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-ice-scales",
        "automationStatus": "partial",
        "automationNotes": "Reduces damage from Special moves. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Illuminate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Increases the chance of random, non-hostile, wild Pokemon encounters. If there were enviromental challenges, or difficulty penalties due to reduced visibility, this Pokemon and it's allies in range are immune to the effects.",
      "secondaryEffects": [],
      "description": "The Pokemon naturally produces a soft and warm light through its body. Other Pokemon approach to it curiously when they see this light."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-illuminate",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Illusion",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it will have the form of another Pokemon in the party, the illusion breaks if it receives damage. Outside of battle it may cast the illusion on itself at will. Unique Ability.",
      "secondaryEffects": [],
      "description": "The Pokemon casts an illusion on itself to look like another creature it has seen. The illusion is indistinguishable from the real one."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-illusion",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Immunity",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon does not receive damage from Poison and Badly Poisoned Status Ailments.",
      "secondaryEffects": [],
      "description": "The Pokemon has a very strong immune system and will rarely get sick. It could even eat rotten food without getting sick."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-immunity",
        "automationStatus": "partial",
        "automationNotes": "IMMUNE: poisoned, badly-poisoned"
      }
    }
  },
  {
    "name": "Imposter",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "As soon as it enters to battle, this Pokemon will be under the effects of the Move Transform (p.505).",
      "secondaryEffects": [],
      "description": "This Pokemon can alter its own cell structure extremely fast to transform into a copy of another being."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-imposter",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Infiltrator",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon ignores all Shield Moves, Force Fields, Substitutes and Cover active on the foe's side of the field.",
      "secondaryEffects": [],
      "description": "The Pokemon is very stealthy with its movements, it is naturally harder to detect and can easily sneak in heavily guarded places."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-infiltrator",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Innards Out",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-self-faint",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon would faint due to damage from a Physical or Special Move, inflict damage on the attacker equal to the remaining HP the user had.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "target",
          "effectType": "damage",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "As it has no extremities, this Pokemon expels its own internal organs to use them as limbs or to defend itself from harm. Gross but effective."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-innards-out",
        "automationStatus": "full",
        "automationNotes": "Damage = remaining HP before fainting"
      }
    }
  },
  {
    "name": "Inner Focus",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon does not Flinch. The Ability Intimidate does not have any effect against this Pokemon. Outside of battle this Pokemon is able to resist intimidation tactics, fear and stress better than others.",
      "secondaryEffects": [],
      "description": "The Pokemon is extrmely serious and focused on everything it does. It remains calm and never backs down, even if it's getting severly injured."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-inner-focus",
        "automationStatus": "partial",
        "automationNotes": "IMMUNE: flinch. Intimidate has no effect."
      }
    }
  },
  {
    "name": "Insomnia",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon is immune to the Sleep Status. Moves and Items that self-inflict Sleep will fail.",
      "secondaryEffects": [],
      "description": "The Pokemon does not ever sleep, it will be awake no matter the hour. Maybe it doesn't need to or maybe it's just worried."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-insomnia",
        "automationStatus": "partial",
        "automationNotes": "IMMUNE: sleep"
      }
    }
  },
  {
    "name": "Intimidate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "all-foes",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes into battle, Reduce by 1 the Strength of All foes in Range. This effect will last for as long as this Pokemon is out. Outside of battle, wild Pokemon will avoid the party if this Pokemon is out.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "all-foes",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": -1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon has an overwhelming presence that inspires both fear and respect from others."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-intimidate",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Intrepid Sword",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever this Pokemon enters battle, Increase its Strength by 2. Outside of battle, this Pokemon can cut through any surface. Unique Ability",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This audacious Pokemon is fearless to any challenge, its strength increases through sheer will. Its presence can be very menacing."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-intrepid-sword",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Iron Barbs",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is hit with a Non-Ranged Physical Move choose one: - Deal 1 Neutral Damage against the attacker. - Roll 2 Dice of Typeless Damage against the attacker.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "target",
          "effectType": "damage",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon is covered with sharp steel quills that hurt anyone who may touch them carelessly"
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-iron-barbs",
        "automationStatus": "full",
        "automationNotes": "Deal 1 damage to attacker when hit by Non-Ranged Physical Move"
      }
    }
  },
  {
    "name": "Iron Fist",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Add 1 Dice to the Damage Pool of Fist Based moves.",
      "secondaryEffects": [],
      "description": "The hands of this Pokemon are very strong and heavy, when curled into fists they can go through anything."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-iron-fist",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Justified",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "dark",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a Dark-Type Move hits this Pokemon, Increase its Strength by 1. Up to 3 points can be increased this way.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 3,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon has an innate sense of justice, wrongdoings will make them really angry."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-justified",
        "automationStatus": "full",
        "automationNotes": "Up to 3 points"
      }
    }
  },
  {
    "name": "Keen Eye",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon cannot have successes removed from its Accuracy rolls by Moves, Items or Abilities.",
      "secondaryEffects": [],
      "description": "These Pokemon have an exceptional sight. Locating small or far away objects is a lot easier for them."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-keen-eye",
        "automationStatus": "partial",
        "automationNotes": "Prevents Accuracy reduction. Hardcoded in stat prevention."
      }
    }
  },
  {
    "name": "Klutz",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Held items won't have any effect on this Pokemon. Items that allow the Pokemon to Mega Evolve, use Z-Moves, go Dynamax/Gigantamax or Change type are not affected.",
      "secondaryEffects": [],
      "description": "This Pokemon does not understand how to use tools correctly, usually using them in unexpected ways."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-klutz",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Leaf Guard",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Sunny Weather is active, this Pokemon can't have any Status Ailments or Conditions inflicted. Previously inflicted ailments/conditions remain.",
      "secondaryEffects": [],
      "description": "The leaves on this Pokemon's body expand with the sun to completely cover and shield it from superficial damage. They may need to be pruned often."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-leaf-guard",
        "automationStatus": "partial",
        "automationNotes": "While Sunny Weather is active: IMMUNE to all Status Ailments and Conditions. Automated in condition immunity check."
      }
    }
  },
  {
    "name": "Levitate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon has immunity to Ground-Type moves and effects active on the battlefield such as Terrains and certain Entry Hazards.",
      "secondaryEffects": [],
      "description": "The Pokemon floats to move around without ever touching the ground."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-levitate",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Libero",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever this Pokemon is about to roll the Accuracy of a Move, change its type to match that of the Move. If the Move is Physical or Special and deals damage, use the appropriate STAB on the Damage Roll.",
      "secondaryEffects": [],
      "description": "This Pokemon always has its mind in the game. It will favor a defensive position and make the best special passes when it finally attacks."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-libero",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Light Metal",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce the Pokemon's weight at storyteller's discretion. Moves with damage based on weight get their Damage Pool modified according to the reduced weight of the user.",
      "secondaryEffects": [],
      "description": "The Material covering its body will be light as a feather, causing this Pokemon to weigh half or even just a quarter of what it is supposed to."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-light-metal",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Lightning Rod",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "electric",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon is immune to Electric-Type Damage. If anyone on the field uses a Single-Target Electric-Type Move, it will be redirected towards this Pokemon. The first time this Pokemon is hit by an Electric-Type move, Increase its Special by 1.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon will attract lightning and electricity to itself to charge its power. Great for preventing power surges. Bad for your electricity bill."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-lightning-rod",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: Electric-type damage. Redirects single-target Electric moves. First hit by Electric: +1 Special"
      }
    }
  },
  {
    "name": "Limber",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon is immune to Paralysis Status Ailment.",
      "secondaryEffects": [],
      "description": "The muscles of this Pokemon are incredibly flexible and elastic. Easing their movement, agility, and grace."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-limber",
        "automationStatus": "partial",
        "automationNotes": "IMMUNE: paralyzed"
      }
    }
  },
  {
    "name": "Lingering Aroma",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon hits or gets hit with a Non-Ranged Physical Move, the foe's ability is changed to Lingering Aroma.",
      "secondaryEffects": [],
      "description": "The Pokemon has a very strong smell, it may be pleasant or disgusting, but the smell will impregnate into everything and be very difficult to remove."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-lingering-aroma",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Liquid Ooze",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is hit by a Move that would asborb it's vital energy (Leech Seed, Mega Drain, Dream Eater, Drain Punch, etc.) it will deal damage to the foe instead of healing",
      "secondaryEffects": [],
      "description": "The Pokemon produces a pestilent and toxic ooze within its body. Do not attempt to eat it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-liquid-ooze",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Liquid Voice",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Sound-Based Moves this Pokemon uses are considered to be Water-Type.",
      "secondaryEffects": [],
      "description": "Sound waves from its voice turn the moisture in the air into water, seemingly conjuring dew, rain, and even cascades out of a song."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-liquid-voice",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Long Reach",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Moves used by this Pokemon are considered to have the \"Ranged\" Added Effect",
      "secondaryEffects": [],
      "description": "The Pokemon is able to attack through the shadows of objects and foes meanwhile the real targets suffer the damage."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-long-reach",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Magic Bounce",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Support Moves used by a foe that target this Pokemon or its side of the field will have their effects redirected into the foe's instead.",
      "secondaryEffects": [],
      "description": "The Pokemon will use psychic control on its foe to make it indirectly harm itself, making it look like magic."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-magic-bounce",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Magic Guard",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The Pokemon only receives damage from Physical and Special Moves, Ongoing Damage, Confusion status, Pain Split, Destiny Bond, Perish Song & Self-Damaging Moves. Immune to damage from: Abilities, Status Ailments, Entry Hazards, Recoil, Held Items, or Weather. It can still have Status Ailments inflicted.",
      "secondaryEffects": [],
      "description": "The Pokemon is covered by a faint energy that stops any minor harm that comes its way. This gives the pokemon a bit of an ethereal glow in the dark."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-magic-guard",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Magician",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon will steal the Held Item of a foe it just hit with a Physical or Special Move. If it already has a Held Item you may choose to switch it for the one it stole. For information on held Items see p.83.",
      "secondaryEffects": [],
      "description": "This Pokemon excells at performing simple magic tricks that amaze others, such as conjuring and vanishing objects nearby in the blink of an eye."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-magician",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Magma Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon is immune to the Frozen Status Ailment. ",
      "secondaryEffects": [],
      "description": "The body of the Pokemon is always hot to the touch, it can heat a large room just by standing inside and can also endure high temperatures."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-magma-armor",
        "automationStatus": "partial",
        "automationNotes": "IMMUNE: frozen"
      }
    }
  },
  {
    "name": "Magnet Pull",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Other than the user, all Steel-Type Pokemon on the field are Blocked.",
      "secondaryEffects": [],
      "description": "This Pokemon can activate a magnetic field around itself to attract all kinds of metals and disrupt electric devices."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-magnet-pull",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Marvel Scale",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-has-condition",
      "abilityTarget": "self",
      "triggerConditionType": "burn,frozen,paralyzed,poisoned,sleep",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon has a Status Ailment, Increase its Defense Attribute by 2",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "defense",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The beautiful scales of this Pokemon will harden when its body is under stress."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-marvel-scale",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Mega Launcher",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Add 2 Extra Dice to the Damage pool of moves with the keyword \"Pulse\" and \"Aura\" on their name. Healing Moves with the keyword \"Pulse\" become Complete Heals",
      "secondaryEffects": [],
      "description": "The cannons on this Pokemon's body allow it to fire extremely powerful attacks."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mega-launcher",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Merciless",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If the Foe is inflicted with Poison or Badly Poison, all of this Pokemon Moves are considered to be Critical Hits. This Pokemon will not hold back when using Lethal Damage Moves at Storyteller's discretion.",
      "secondaryEffects": [],
      "description": "Once this Pokemon senses weakness, it begins acting according to their brutal nature. They can be cruel if not put in their place."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-merciless",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Mimicry",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If there is a Terrain Move active on the field (i.e. Electric Terrain, Psyichic Terrain etc.) Change this Pokemon's main type to match that of the active Terrain. Restore its original main type if the terrain effects end.",
      "secondaryEffects": [],
      "description": "This Pokemon's body is perfect for camouflaging in the ground. It can sometimes get lost but you will find it if some unfortunate victim steps on it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mimicry",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Mind's Eye",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "At night time, all Moves used by this Pokemon are considered to have the “Never Miss” Added Effect. It can hit Ghost-Type Pokemon with Normal-Type and Fight-Type Moves, dealing Regular Damage.",
      "secondaryEffects": [],
      "description": "With an unparalleled cosmic awareness, this Pokemon is able to see the future accurately. It is said you can see your own demise by looking into its dead eye."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mind's-eye",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Minus",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If an ally Pokemon on the field has the ability \"Plus\" (p.559), Increase by 2 the Special Attribute of this Pokemon.",
      "secondaryEffects": [],
      "description": "This Pokemon has a natural Negative charge. It will attract Positive charge and repel other negative charge. They are prone to feel blue."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-minus",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Mirror Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Effects Reducing Attributes/Traits used by a foe, that target this Pokemon or its side of the field will have their effects redirected into the foe's instead.",
      "secondaryEffects": [],
      "description": "The Pokemon's body is covered with a shiny armor. Said armor will repel and bounce back anything intending to weaken it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mirror-armor",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Misty Surge",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of the Move Misty Terrain. (In case of stalemate the Pokemon with higher Will might keep the dominant Terrain)",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "terrain",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "misty",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon can surround itself with a Misty Field that is eerily quiet, it feels peaceful and soothing but also lonesome and isolated."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-misty-surge",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Mold Breaker",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a foe Pokemon has a Type, an immunity, or an Ability that would prevent this Pokemon from dealing Damage with a Move, ignore it.",
      "secondaryEffects": [],
      "description": "This Pokemon will find unusual ways to achieve its goals. They are inventive and go around problems."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mold-breaker",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Moody",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "round-end",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "At the end of the Round, reset Attributes modified by Moody, then Reduce a random Attribute by 1 and Increase another random Attribute by 1. ",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": -1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon will have some severe mood swings, and be temperamental most of the time. Hopefully it's just a phase."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-moody",
        "automationStatus": "full",
        "automationNotes": "Reset previous Moody changes, then random -1 and +1"
      }
    }
  },
  {
    "name": "Motor Drive",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "electric",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon is hit by an Electric-type move, Increase 1 Point to its Dexterity Attribute. This Pokemon doesn't receive damage from Electric-type moves.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon absorbs electricity and stores it as energy to run faster or to power up machinery. An electric car's best friend."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-motor-drive",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: Electric-type damage. First time hit by Electric: +1 Dexterity"
      }
    }
  },
  {
    "name": "Moxie",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-foe-faint",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a foe faints because of a Physical or Special Move used by this Pokemon, Increase its Strength Attribute by 1. Up to 3 points can be increased this way.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 3,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon is naturally fierce and will try to get to a position of power by defeating the alphas in the pack."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-moxie",
        "automationStatus": "full",
        "automationNotes": "Up to 3 points"
      }
    }
  },
  {
    "name": "Multiscale",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While this Pokemon at full health, Reduce by 1 the damage taken by the next Physical or Special Move it receives.",
      "secondaryEffects": [],
      "description": "This Pokemon is covered by two layers of hard scales, if one layer is damaged it will be shed and regrown later."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-multiscale",
        "automationStatus": "partial",
        "automationNotes": "Halves damage when at full HP. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Multitype",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Only Arceus may have this Ability. This Pokemon can freely change its Type at will in any moment of the battle. This Ability can't be copied, switched, transfered, changed, ignored, or negated in any way. Unique Ability",
      "secondaryEffects": [],
      "description": "All the energies that created the universe flow raw through this Pokemon's body and it harnesses whichever is more convenient at the moment."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-multitype",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Mummy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon hits or gets hit with a Non-Ranged Physical Move, the foe's Ability is changed to Mummy. ",
      "secondaryEffects": [],
      "description": "This Pokemon will curse whoever dares to inflict harm upon them, the curse may even last for generations and will need the aid of a medium to lift it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mummy",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Mycelium Might",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Support Moves used by this Pokemon are considered to have the \"Never Miss\" and \"Late Reaction 1\" Added Effect",
      "secondaryEffects": [],
      "description": "The Pokemon releases invisible fungus spores continuosly, by the time you realize you have a complete fungal infestation around you."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-mycelium-might",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Natural Cure",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "round-end",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "At the end of the Round, if this Pokemon has a Status Ailment or Condition, Roll 3 Chance Dice to heal it.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 3,
          "target": "self",
          "effectType": "cleanse",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "all",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's body will generate substances to heal itself. They can be used to create medicine."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-natural-cure",
        "automationStatus": "full",
        "automationNotes": "Roll 3 Chance Dice to heal"
      }
    }
  },
  {
    "name": "Neuroforce",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon will deal 1 Extra Damage on any Move that is Super Effective against a foe.",
      "secondaryEffects": [],
      "description": "This Pokemon's psychic power is overwhelming and can be felt even by simply standing nearby. It will exploit any weakness it finds in your mind."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-neuroforce",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Neutralizing Gas",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All foes in range will have the effects of their Abilities negated as long as this Pokemon is on the field.",
      "secondaryEffects": [],
      "description": "The Pokemon is surrounded by a sweet-smelling but noxious gas. Most poeple and Pokemon can't help but to stop and smell it, though."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-neutralizing-gas",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "No Guard",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "At the start of the Round, you may declare you won't use Shield Moves, Evasion or Clash Maneuvers. If you do, roll all moves of this Pokemon as if they had no Low Accuracy.",
      "secondaryEffects": [],
      "description": "This Pokemon can focus on attacking perfectly but will be open to the attacks of its foes as it won't focus on anything but its precision."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-no-guard",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Normalize",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All the moves known by this Pokemon are considered Normal-Type. Affecting STAB, weaknesses, immunities, and resistances. Add 1 Extra die of Damage Pool of Normal Moves.",
      "secondaryEffects": [],
      "description": "The Pokemon's actions are never impressive, always dull and never seem to accomplish anything exceptional."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-normalize",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Oblivious",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon is not affected by the Love Status. It is immune to the effects of moves that affect its feelings such as Taunt, Charm, Captivate etc. at Storyteller's discretion.",
      "secondaryEffects": [],
      "description": "This Pokemon will rarely have a satisfactory social interaction; too self-absorbed to take hints or cues in any relationship."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-oblivious",
        "automationStatus": "partial",
        "automationNotes": "IMMUNE: infatuated"
      }
    }
  },
  {
    "name": "Opportunist",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a Pokemon on the foe's side of the field increases a trait or Attribute, increase the same Trait or Attribute on this Pokemon. In case of stalemate, keep the highest number.",
      "secondaryEffects": [],
      "description": "This Pokemon seizes any chance it has to gain something. They tend to be streetsmart and make use whatever little chance they get."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-opportunist",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Orichalcum Pulse",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of the Sunny Weather. (In case of stalemate the Pokemon with higher Will might keep the dominant Terrain). While Sunny Weather is active, increase this Pokemon's Strength Attribute by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "weather",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "sunny",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "While Sunny Weather is active",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's body is able to transform light waves into matter. Theory says that it's bringing forth light that was emitted billions of years ago."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-orichalcum-pulse",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Overcoat",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon won't recieve damage from active weather.",
      "secondaryEffects": [],
      "description": "The Pokemon will have a protective coat surrounding its body that allows it to live under extreme weather conditions."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-overcoat",
        "automationStatus": "partial",
        "automationNotes": "Immune to weather damage. Hardcoded in weather damage processing."
      }
    }
  },
  {
    "name": "Overgrow",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-hp-half-or-less",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Pain Penalization won't reduce successes from Accuracy or Damage rolls of Grass-Type Moves used by this Pokemon. Grass-Type Moves get 2 Extra dice to their Damage Pool when this Pokemon is at half HP or less.",
      "secondaryEffects": [],
      "description": "When this Pokemon is hurt, it will grow huge plants on its body to defend itself, these plants are very strong but wither quickly."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-overgrow",
        "automationStatus": "partial",
        "automationNotes": "When HP ≤ half: +1 damage die for Grass-type moves. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Own Tempo",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon is not affected by the Confused Status Condition.",
      "secondaryEffects": [],
      "description": "This Pokemon will do everything at its own pace, peer pressure will be ignored. Its behavior reflexive and calm... maybe too calm."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-own-tempo",
        "automationStatus": "partial",
        "automationNotes": "IMMUNE: confused"
      }
    }
  },
  {
    "name": "Parental Bond",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All of the Damage Pools of this Pokemon get rolled twice. Choose the highest roll to deal damage to the foe.",
      "secondaryEffects": [],
      "description": "The Pokemon and its youngling are really close to each other, they do everything together. The parent is very protective."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-parental-bond",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Pastel Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "User and Allies in range are immune to Poison and Badly Poison. If the condition was inflicted before this Pokemon came out, it remains.",
      "secondaryEffects": [],
      "description": "The Pokemon is surrounded by a soft-colored glimmer. This energy feels pure and full of innocence. Unattainable and otherworldly."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-pastel-veil",
        "automationStatus": "partial",
        "automationNotes": "IMMUNE: poisoned, badly-poisoned (self + allies in range)"
      }
    }
  },
  {
    "name": "Perish Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is hit with Non-Ranged Physical Move, the foe will receive its remaining HP as damage and faint after three Rounds unless it is removed from battle.",
      "secondaryEffects": [],
      "description": "This Pokemon silently curses those who cross it. Condemning their souls to suffer as it has suffered. Avoid this Pokemon, lest you suffer its grudge."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-perish-body",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Pickpocket",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is not holding an Item it will steal the held Item of the foe it just hit with a Non-Ranged Physical Move.",
      "secondaryEffects": [],
      "description": "The Pokemon will instinctively steal from others. It takes whatever it can when people are not looking."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-pickpocket",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Pickup",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon was out of its Pokeball, at the end of the scene see what it found for you at Storyteller's discretion. The higher the Rank of this Pokemon the more valuable the items it will find.",
      "secondaryEffects": [],
      "description": "This Pokemon will often gather objects and keep a small hoard of treasure it may share with you."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-pickup",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Pixilate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Normal-Type Moves that the Pokemon uses will deal damage as if they were Fairy-Type. Affecting STAB, weakness and resistance. Add 1 Extra die to the Damage Pool of Fairy Moves.",
      "secondaryEffects": [],
      "description": "This Pokemon scatters fairy dust that brings happy thoughts to the mind. Everything it does looks incredibly adorable."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-pixilate",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Plus",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If an ally Pokemon has the ability \"Minus\", Increase by 2 the Special Attribute of this Pokemon.",
      "secondaryEffects": [],
      "description": "This Pokemon has a natural Positive charge. It will attract negative charge and repel other positive charge. It has a red blush all the time."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-plus",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Poison Heal",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon becomes poisoned or badly poisoned. It will Heal 1 HP at the end of each round instead of receiving damage. The Poison will be completely absorbed and healed after 3 Rounds.",
      "secondaryEffects": [],
      "description": "The Pokemon has an immunity to any poison and also assimilates venom as an energy source."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-poison-heal",
        "automationStatus": "partial",
        "automationNotes": "If poisoned or badly poisoned: heals 1 HP per round instead of taking damage. Automated in poison damage processing."
      }
    }
  },
  {
    "name": "Poison Point",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is hit by a Non-Ranged Physical Move, Roll 3 Chance Dice to inflict Poison on the foe.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 3,
          "target": "target",
          "effectType": "condition",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "poisoned",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The pointy thorns and scales on this Pokemon release a venom that will infect anyone who touches them roughly. Wear gloves when handling them."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-poison-point",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Poison Puppeteer",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-deal-damage",
      "abilityTarget": "foe",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a Target gets the Poison or Badly Poison Status ailments as the direct result of a Move used by this Pokemon, inflict Confusion on them as well. Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "target",
          "effectType": "condition",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "confused",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon secrets a powerful neurotoxin, its venom won't only damage the body of foes but their minds as well."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-poison-puppeteer",
        "automationStatus": "full",
        "automationNotes": "Only if move caused Poison or Badly Poison"
      }
    }
  },
  {
    "name": "Poison Touch",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-deal-damage",
      "abilityTarget": "foe",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon hits a foe with a Non-Ranged Physical Move, Roll 2 Chance Dice to Inflict Poison on the foe.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "on-hit",
          "chance": 2,
          "target": "target",
          "effectType": "condition",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "poisoned",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "Venomous substances will ooze through the body of this Pokemon, you'll become very sick if it touches you."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-poison-touch",
        "automationStatus": "full",
        "automationNotes": "When hitting with Non-Ranged Physical Move"
      }
    }
  },
  {
    "name": "Power Construct",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "At the end of the Round, if this Pokemon has half or less of its HP, change its Form to the next one. When this Pokemon changes Form, remove Status Ailments & restore its full HP & Will. Unique Ability.",
      "secondaryEffects": [],
      "description": "Small cells gather around this Pokemon and are absorbed into its body. It grows bigger and stronger as more cells come together."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-power-construct",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Power Spot",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Add 1 Extra die to the Damage Pools from Physical and Special Moves by Allies in Range. This Effect does not stack in the same Allies if multiple Pokemon have this Ability.",
      "secondaryEffects": [],
      "description": "The Pokemon releases a mysterious energy that messes up with electronics and compasses but can somehow make you feel very energized."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-power-spot",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Power of Alchemy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "For the next 24 Hours the Pokemon copies the ability of a fainted Ally. Multiple Abilities may be copied this way, but only one may be active during combat. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon can absorb the essence of everything it touches, fusing with the chemical composition and even the genes of discarded trash."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-power-of-alchemy",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Prankster",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Support Moves used by this Pokemon are considered to have: \"Reaction 1\" as Added Effect.",
      "secondaryEffects": [],
      "description": "This Pokemon will always have a mischievous twinkle in its eyes, no one around will be safe from its pranks."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-prankster",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Pressure",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "all-foes",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, All foes in Range spend half (rounded up) of their remaining Will Points without gaining any effect for it. This effect does not stack.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "all-foes",
          "effectType": "will",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": -50,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "Being around this Pokemon will be very stressing and demanding, only the bravest dare to face them one-on-one."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-pressure",
        "automationStatus": "full",
        "automationNotes": "Foes spend half (rounded up) of remaining Will"
      }
    }
  },
  {
    "name": "Primordial Sea",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of Typhoon Weather. The effects end when the Pokemon leaves the battle. (In case of stalemate, The Pokemon with highest Will might keep the dominant weather). Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "weather",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "typhoon",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The torrential rain barely lets you breathe, the field quickly becomes flooded and you must swim to stay afloat. No fire can be ignited at a time like this."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-primordial-sea",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Prism Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce by 2 the total Damage dealt to this Pokemon by a Super Effective Move.",
      "secondaryEffects": [],
      "description": "This Pokemon's body is an incredibly resilient armor. It can withstand even hits that should shatter it into pieces."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-prism-armor",
        "automationStatus": "partial",
        "automationNotes": "Reduces super-effective damage. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Propeller Tail",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Ignore the effects of Moves or Abilities that would change this Pokemon's Moves into another target. (i.e. The Move \"Follow Me\", the Ability \"Lightining Rod\" etc.)",
      "secondaryEffects": [],
      "description": "The Pokemon's tail allows it to maneuver very easily while in the water. It has no problem making sudden sharp turns to pursue and catch its prey."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-propeller-tail",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Protean",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Before this Pokemon uses a Physical or Special Move, change its Type to that of the Move it intends to use. Use the appropriate STAB on the Damage Pool.",
      "secondaryEffects": [],
      "description": "This Pokemon's versitile body gives it profeciency on practically everything it sets out to do."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-protean",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Protosynthesis",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "weather-active",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "sunny,harsh-sunlight",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Sunny Weather is active, increase this Pokemon's highest Attribute by 1. If their highest Attribute is Dexterity, increase it by 2. Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 0,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "highest",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 1,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's primal energy is barely contained. Sunlight powers them up and brings up a wilder and savage behaviour."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-protosynthesis",
        "automationStatus": "full",
        "automationNotes": "While Sunny Weather is active: +1 to highest Attribute (+2 if Dexterity)"
      }
    }
  },
  {
    "name": "Psychic Surge",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of the Move Psychic Terrain. (In case of stalemate the Pokemon with higher Will might keep the dominant Terrain)",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "terrain",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "psychic",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon can surround itself with a psychic field that makes everyone pause, hearing things that are not there."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-psychic-surge",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Punk Rock",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Sound-Based Moves this Pokemon uses get 1 Extra die to their Damage Pool. Sound-Based Moves used against this Pokemon have their total Damage reduced by 2.",
      "secondaryEffects": [],
      "description": "The Pokemon loves music and loud noises. It is constantly jamming with its air guitar and can easily improvise a music number out of nothing."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-punk-rock",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Pure Power",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon has a permanent increase to its Strength Attribute. Ranks Starter, Rookie, Standard, and Advanced Increase Strength by 1. Rank Expert and higher Increase Strength by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "rank-expert-double",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon makes use of its psychic powers to move objects several times bigger."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-pure-power",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Purifying Salt",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon can't have any Status Ailment infliced on them. Previously inflicted Ailments remain. Ghost-Type Moves used against this Pokemon have their total Damage Reduced by 3.",
      "secondaryEffects": [],
      "description": "The Pokemon produces a high quality salt that wards off against any bacteria, impurity, and even keep those pesky evil spirits at bay."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-purifying-salt",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Quark Drive",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "terrain-active",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "electric",
      "frequency": "",
      "effect": "If Electric Terrain is active, increase this Pokemon's highest Attribute by 1. If their highest Attribute is Dexterity, increase it by 2. Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 0,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "highest",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 1,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon is energized to a sub-atomic level, its power barely contained. A power grid could destabilize their elecron charge out of this dimension."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-quark-drive",
        "automationStatus": "full",
        "automationNotes": "While Electric Terrain is active: +1 to highest Attribute (+2 if Dexterity)"
      }
    }
  },
  {
    "name": "Queenly Majesty",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Foes cannot use Reaction Moves against this Pokemon.",
      "secondaryEffects": [],
      "description": "This Pokemon's presence commands awe and respect. Others have no choice but to do as it says, whoever tries to outplay it, will feel its discontent"
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-queenly-majesty",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Quick Draw",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Roll 3 Chance Dice at the beginning of each Round. If successful, this Pokemon goes first in the initiative order of that Round. In ccase of stalemate, regular initiative order prevails.",
      "secondaryEffects": [],
      "description": "This Pokemon shot first. They edited it to look like it didn't, but we know it shot first!"
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-quick-draw",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Quick Feet",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-has-condition",
      "abilityTarget": "self",
      "triggerConditionType": "burn,frozen,paralyzed,poisoned,sleep",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While affected by a Status Ailment (Burn, Frozen, Paralysis, Poison, Sleep), Increase this Pokemon's Dexterity Attribute by 2. If inflicted by Paralysis, this Ability prevents its effects.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "Most of the time this Pokemon will seem to be in a hurry. When pressured, it will move faster than normal."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-quick-feet",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "RKS System",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Change the Pokemon's Type to match the Disc on its Held Item slot. (i.e. Electric Disc makes this Pokemon become an Electric Type). Unique Ability.",
      "secondaryEffects": [],
      "description": "The Pokemon's physiology morphs according to the data disc inserted in its RKS-drive. There are 17 discs, one for each Type. (No disc is Normal Type)."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rks-system",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Rain Dish",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "round-end",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Rain Weather is active, you may restore 1 HP to this Pokemon at the end of each Round.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "heal",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic-numeric",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon will store rain water for drink and nourishment."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rain-dish",
        "automationStatus": "full",
        "automationNotes": "While Rain Weather is active"
      }
    }
  },
  {
    "name": "Rattled",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "bug,dark,ghost",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon is hit by a Bug, Dark, or Ghost-Type Move, or if a foe has the Ability \"Intimidate\", Increase its Dexterity Attribute by 1.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "When this scaredy Pokemon becomes startled or scared it will make haste to get away from danger."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rattled",
        "automationStatus": "full",
        "automationNotes": "Also triggers when Intimidate lowers stats"
      }
    }
  },
  {
    "name": "Receiver",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "For the next 24 Hours the Pokemon copies the ability of a fainted Ally. Only one Ability may be copied this way. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon is used to learning the tactic behavior of other Pokemon with which they have a bond."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-receiver",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Reckless",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon performs a Move with Recoil as an Added Effect, Add 2 Extra dice to the Damage Pool of that Move.",
      "secondaryEffects": [],
      "description": "The Pokemon will often get into risky situations in order to get what it wants. They are prone to risk their lives without thinking of the consequences."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-reckless",
        "automationStatus": "partial",
        "automationNotes": "+1 damage die for recoil moves. Hardcoded in damage calculation."
      }
    }
  },
  {
    "name": "Refrigerate",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Normal-Type Moves that the Pokemon uses will deal damage as if they were Ice-Type. Affecting STAB, weakness and resistance. Add 1 Extra die to the Damage Pool of Ice moves.",
      "secondaryEffects": [],
      "description": "This Pokemon's body works akin to a freezer, it can freeze things just by touching them."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-refrigerate",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Regenerator",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon may Heal up to 4 HP or up to 2 HP in case of Lethal Damage on its own every day. The Pokemon must be out of combat to benefit from this effect.",
      "secondaryEffects": [],
      "description": "The body of this Pokemon will regenerate from damage really quick, wounds that would take days to heal will get better in a few hours."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-regenerator",
        "automationStatus": "partial",
        "automationNotes": "Heals 1 HP when switching out. Automated in switch-out processing."
      }
    }
  },
  {
    "name": "Ripen",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Moves that use berries for Added Effects will have 2 Extra Dice on their Damage Pool (i.e. \"Natural Gift\" etc.) Increase the Healing properties of Berries at Storyteller's discretion.",
      "secondaryEffects": [],
      "description": "The Pokemon can ripen fruits and berries in no time to make them Extra sweet and delicious, healing berries will have their effects boosted."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-ripen",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Rivalry",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon targets a foe of the same gender, Increase its Strength Attribute by 1. If the targeted foe is the opposite gender, Reduce its Strength Attribute by 1.",
      "secondaryEffects": [],
      "description": "The Pokemon will be very competitive with others to prove its position as the alpha of the group, however, it will try to gain the favor of possible mates."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rivalry",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Rock Head",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon will not receive damage from Recoil.",
      "secondaryEffects": [],
      "description": "The head and body of the Pokemon are so resistant that they barely feel anything. Careful as they bump into things without even noticing."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rock-head",
        "automationStatus": "partial",
        "automationNotes": "Immune to recoil damage. Hardcoded in recoil damage processing."
      }
    }
  },
  {
    "name": "Rocky Payload",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Physical or Special Rock-Type Moves this Pokemon uses get 1 Extra die to their Damage Pool.",
      "secondaryEffects": [],
      "description": "The Pokemon always carries a hidden stash of rocks. It has the bad habit of making them fall on top of others."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rocky-payload",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Rough Skin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is hit with a Non-Ranged Physical Move choose one: - Deal 1 Neutral Damage against the attacker. - Roll 2 Dice of Typeless Damage against the attacker.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "target",
          "effectType": "damage",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "Use protection on your hands when touching this Pokemon. Its body is covered by sharp scales or barbs that get hooked into the skin."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-rough-skin",
        "automationStatus": "full",
        "automationNotes": "Deal 1 damage to attacker when hit by Non-Ranged Physical Move"
      }
    }
  },
  {
    "name": "Run Away",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon cannot be Blocked. It may also obtain bonus dice to escape from battle, Pokeballs or captivity at Storyteller's discretion.",
      "secondaryEffects": [],
      "description": "This Pokemon is a master of escape. It will be difficult to catch as it can squeeze through the tiniest gaps to get away."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-run-away-ability",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Sand Force",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Sandstorm Weather is active, if this Pokemon uses a Physical or Special Ground, Steel or Rock-Type Move, add 1 Extra die to the Damage Pool of that Move. The Pokemon is immune to damage from Sandstorm Weather.",
      "secondaryEffects": [],
      "description": "The Pokemon controls the particles of sand around the battlefield to give a boost to its attacks."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sand-force",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Sand Rush",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "weather-active",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "sandstorm",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Sandstorm Weather is active, increase the Dexterity Attibute of this Pokemon by 1. The Pokemon is immune to damage from Sandstorm Weather.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "While sand whips across the battlefield, the Pokemon can paddle through it as if it was water."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sand-rush",
        "automationStatus": "full",
        "automationNotes": "While Sandstorm is active: +1 Dexterity. Immune to Sandstorm damage"
      }
    }
  },
  {
    "name": "Sand Spit",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is hit with a Non-Ranged Physical Move, it starts the effects of Sandstorm Weather. The effect lasts 4 rounds. This effect does not reactivate until the Sandstorm Weather is removed.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "weather",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "sandstorm",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon slithers through the desert sand, eating some of it in the process, if it gets hit (or sneezes) a sandstorm will blow up."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sand-spit",
        "automationStatus": "full",
        "automationNotes": "Start Sandstorm when hit by Non-Ranged Physical Move"
      }
    }
  },
  {
    "name": "Sand Stream",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of Sandstorm Weather. The effects end when the Pokemon leaves the battle. (In case of stalemate the Pokemon with higher Will, might keep the dominant weather)",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "weather",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "sandstorm",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon can activate a raging sandstorm around itself that will last for as long as it wants."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sand-stream",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Sand Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Sandstorm Weather is active, this Pokemon can use the Evasion Maneuver up to 5 times per Round. The Pokemon is immune to damage from Sandstorm weather.",
      "secondaryEffects": [],
      "description": "The Pokemon's body is easily concealed by sand particles in the air."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sand-veil",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Sap Sipper",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "grass",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon is hit by a Grass-type attack, Increase its Strength Attribute by 1 instead of dealing damage. Grass-type moves do not deal damage to this Pokemon.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's diet consists strickly of plants, it is particularly fond of sweet sap for nourishment."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sap-sipper",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: Grass-type damage. First time hit by Grass: +1 Strength"
      }
    }
  },
  {
    "name": "Schooling",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon is at half HP or less it will call for its Allies, when the Allies arrive replace the change to Wishiwashi School-Form at full HP. Increase its Rank two above your own. Restore Wishiwashi base Form at the end of the battle. Healing/Fainting/Recalling prevents the allies from arriving. Unique Ability.",
      "secondaryEffects": [],
      "description": "When this Pokemon is threatened, it calls thousands of allies to create an uncontrollable monster. The closer to the sea, the faster they arrive."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-schooling",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Scrappy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon can hit Ghost-type Pokemon with Normal and Fighting Type Moves. Apply resistances or weaknesses to the foe if it has a secondary type.",
      "secondaryEffects": [],
      "description": "This Pokemon does not believe in ghosts."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-scrappy",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Screen Cleaner",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon enters the field, remove any active Force Fields (i.e. Light Screen, Reflect etc.) on both sides of the field.",
      "secondaryEffects": [],
      "description": "This Pokemon is constantly cleaning an invisible screen, it cleans them so well that even real glass screens can disappear after it is done with them."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-screen-cleaner",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Seed Sower",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-any",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is hit with a Physical or Special Move, it starts the effects of Grassy Terrain. The effect lasts 4 rounds. This effect does not reactivate until the Terrain is removed.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "terrain",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "grassy",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon leaves a trail of sapling sprouts wherever it goes. Hitting or shocking it will make a rain of seeds fall to the ground."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-seed-sower",
        "automationStatus": "full",
        "automationNotes": "Start Grassy Terrain when hit by Physical or Special Move"
      }
    }
  },
  {
    "name": "Serene Grace",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon adds 2 Extra Chance Dice to all Moves with effects that use them. (e.g. A move has 3 Chance Dice to Flinch the foe, this Pokemon will roll 5 Dice)",
      "secondaryEffects": [],
      "description": "This Pokemon will bring good luck as if it was blessed by the heavens. Its presence is soothing, it makes you feel calm and full of joy."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-serene-grace",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Shadow Shield",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is at full health, Reduce by 2 the damage dealt by the next Physical or Special Move targeting it. This effect cannot be ignored by Moves or Abilities.",
      "secondaryEffects": [],
      "description": "When it is at full strength, this Pokemon's ghostly body cannot be touched or pierced by anything, it can even go through walls as if they weren't there."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shadow-shield",
        "automationStatus": "partial",
        "automationNotes": "Halves damage when at full HP. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Shadow Tag",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Targets in Range become Blocked. Ghost-type Pokemon are immune to this effect. Pokemon with the same ability are immune to this effect.",
      "secondaryEffects": [],
      "description": "The Pokemon can physically take a hold of shadows to make them act on their own or capture their victims."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shadow-tag",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Sharpness",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Add 1 Extra die to the Damage Pool of all Cutter Moves.",
      "secondaryEffects": [],
      "description": "This Pokemon's scales are laminated and its edges are incredibly sharp, allowing them to cut through ropes, nets and foes with ease."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sharpness",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Shed Skin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "round-end",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "At the end of the round, if this Pokemon has a Status Ailment/Condition, Roll 3 Chance Dice to heal it. If affected by multiple Ailments/Conditons, one will be healed at random.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 3,
          "target": "self",
          "effectType": "cleanse",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "random one",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's body is constantly growing skin anew and molting the old one when it becomes too damaged."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shed-skin",
        "automationStatus": "full",
        "automationNotes": "Roll 3 Chance Dice. One ailment healed at random"
      }
    }
  },
  {
    "name": "Sheer Force",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever this Pokemon uses a Physical or Special Move with Added Effects, you may choose to ignore them and add 2 Extra Dice to the Damage Pool instead. Added Effects from Items trigger this effect but do not stack.",
      "secondaryEffects": [],
      "description": "This Pokemon is only interested in showing off its incredible battle prowess."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sheer-force",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Shell Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever a foe lands a Critical Hit on this Pokemon, it won't get Bonus Damage Dice for that attack.",
      "secondaryEffects": [],
      "description": "This Pokemon's shell protects its vulnerable spots from its opponents."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shell-armor",
        "automationStatus": "partial",
        "automationNotes": "Blocks critical hits. Hardcoded in damage calculation."
      }
    }
  },
  {
    "name": "Shield Dust",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon is not affected by any effects triggered by Chance Dice of foes.",
      "secondaryEffects": [],
      "description": "This Pokemon constantly generates specs of dust to shield and protect itself."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shield-dust",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Shields Down",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Only Minior can use this Ability. After reaching half or less of its HP in battle, replace Minior by Minior (Core) at full HP. While in Core Form this Pokemon is Immune to Status Ailments. To restore it to its base form, the core must be set free and then recaptured after it returns a few days later. Unique Ability",
      "secondaryEffects": [],
      "description": "The Pokemon's core is protected by a sturdy shield, if the shield is shattered the Pokemon starts acting crazy."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-shields-down",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Simple",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon gets an Attribute reduced, reduce it by 1 more Point. If this Pokemon gets an Attribute increased, increase it by 1 more Point.",
      "secondaryEffects": [],
      "description": "This Pokemon's ingenious mind is easily swayed by not only its own, but also outside influences. It often finds the most simple solution to a problem."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-simple",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Skill Link",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Add 2 Extra Dice to the Accuracy roll of all Double, Triple, or Successive Actions this Pokemon use.",
      "secondaryEffects": [],
      "description": "This Pokemon can proficiently chain a flurry of attacks and it is one heck of a juggler. It also enjoys repetition and sequences."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-skill-link",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Slow Start",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "During the first three Rounds of a battle, this Pokemon will always go last in the initiative order. After those Rounds are over, Increase its Strength and Dexterity Attributes by 2 and now it will always go first in the initiative order. This effect resets if the Pokemon is called out of combat.",
      "secondaryEffects": [],
      "description": "The Pokemon has remained dormant for thousand of years, its movements are heavy and slow, run away before it unleashes its full power."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-slow-start",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Slush Rush",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "weather-active",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "hail,snow",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Hail/Snow Weather is active, increase the Dexterity Attribute of this Pokemon by 1. The Pokemon is immune to damage from Hail/Snow Weather.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon is used to run and hunt on icy terrain, moving swiftly through the snow during blizzards and ice storms."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-slush-rush",
        "automationStatus": "full",
        "automationNotes": "While Hail/Snow is active: +1 Dexterity. Immune to Hail damage"
      }
    }
  },
  {
    "name": "Sniper",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon lands a Critical Hit, it will get 3 Bonus Dice to the Damage Pool of its Move instead of the regular 2.",
      "secondaryEffects": [],
      "description": "This Pokemon will stealthily locate itself in an advantageous position to strike its foe's weak spots."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sniper",
        "automationStatus": "partial",
        "automationNotes": "Critical hit bonus is +3 dice instead of +2. Hardcoded in damage calculation."
      }
    }
  },
  {
    "name": "Snow Cloak",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Hail/Snow Weather is active, this Pokemon can use the Evasion Maneuver up to 5 times per Round. The Pokemon is immune to damage from Hail/Snow weather.",
      "secondaryEffects": [],
      "description": "This Pokemon's skin blends well with the surrounding snow and hail, you can barely see it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-snow-cloak",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Snow Warning",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes out, it automatically starts the effects of Hail/Snow Weather. The effects end when the Pokemon leaves the battle. (In case of stalemate the Pokemon with higher Will might keep the dominant weather)",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "weather",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "hail",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon is able to call a terrible hailstorm at will. Snow will cover the battlefield and sharp ice shards will come plummeting from the sky."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-snow-warning",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Solar Power",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "round-end",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "sunny",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Sunny Weather is active, Increase this Pokemon's Special Attribute by 2 and deal 1 damage to it at the end of the Round.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "damage",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon is capable of overcharging itself with energy from the sun, making it more powerful but also taking a toll on its body."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-solar-power",
        "automationStatus": "full",
        "automationNotes": "While Sunny Weather is active"
      }
    }
  },
  {
    "name": "Solid Rock",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is hit by a Move that is Super-Effective, reduce by 1 the total Damage dealt to it.",
      "secondaryEffects": [],
      "description": "This Pokemon's body is composed of extremely hard rock, protecting it from everything, even its own weaknesses."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-solid-rock",
        "automationStatus": "partial",
        "automationNotes": "Reduces super-effective damage. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Soul Heart",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-foe-faint",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a foe faints because of a Physical or Special Move used by this Pokemon, Increase its Special Attribute by 1. Up to 3 points can be increased this way.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 3,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon is naturally caring and nurturing and if there's a threat to its loved ones, its soul will be made stronger out of love."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-soul-heart",
        "automationStatus": "full",
        "automationNotes": "Up to 3 points"
      }
    }
  },
  {
    "name": "Soundproof",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon is immune to the Damage and Added Effects of all Sound-based moves.",
      "secondaryEffects": [],
      "description": "This Pokemon's body is structured to protect it from noises that might disturb its peace and focus. So it's not ignoring you, it just can't hear you."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-soundproof",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Speed Boost",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "round-end",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "At the end of the Round, Increase this Pokemon's Dexterity Attribute by 1. Up to 3 Points might be added this way.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 3,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon will start maneuvering at an accelerated rate, it will move as if it blinked from place to place."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-speed-boost",
        "automationStatus": "full",
        "automationNotes": "Up to 3 points may be added"
      }
    }
  },
  {
    "name": "Stakeout",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever a foe Pokemon is switched out this Pokemon will inflict 1 Extra Damage on its first successful attack to the newly switched in foe.",
      "secondaryEffects": [],
      "description": "The Pokemon is constantly surveilling its environment, looking out for possible prey, attacking them when they are most vulnerable."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stakeout",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Stall",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon always goes last in the the initiative order.",
      "secondaryEffects": [],
      "description": "This Pokemon is indecisive and always lets others act first before making its mind on what action to take."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stall",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Stalwart",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Ignore any Moves or Abilities that would redirect this Pokemon's Moves into another Target. (i.e. The Move \"Follow Me\", the Ability \"Lightining Rod\" etc.)",
      "secondaryEffects": [],
      "description": "The Pokemon naturally has a high sense of duty and loyalty, once you give it a task it will not stay until its quest is complete."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stalwart",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Stamina",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-any",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon receives Damage from a Physical or Special Move, Increase its Defense and Special Defense by 1.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "defense",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "specialDefense",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon cannot get tired. It regains its fortitude when it feels weak. Even when it barely eats or sleeps."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stamina",
        "automationStatus": "full",
        "automationNotes": "First time this Pokemon receives damage"
      }
    }
  },
  {
    "name": "Stance Change",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Only Aegislash may use this Ability. At the beginning of the round, choose a Form. While in Sword Stance it can only use Physical or Special Moves. While in Shield Stance, it can only use Support Moves. Adjust its Attributes according to the Rank and Limits it has for each Form. Keep the highest HP shared for both forms.",
      "secondaryEffects": [],
      "description": "This Pokemon can change forms and become a mighty shield or a powerful blade. Its attributes switch upon a change of stance."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stance-change",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Static",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When hit by a Non-Ranged Physical Move, this Pokemon rolls 3 Chance Dice to inflict Paralysis on the foe.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 3,
          "target": "target",
          "effectType": "condition",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "paralyzed",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's body is always ready to let off a jolt of static electricity at the slightest touch."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-static",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Steadfast",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-any",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon is affected by Flinch, Increase its Dexterity Attribute by 1.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon may have a stern exterior but it is reliable and even more when adversity strikes."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-steadfast",
        "automationStatus": "full",
        "automationNotes": "First time affected by Flinch"
      }
    }
  },
  {
    "name": "Steam Engine",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "fire,water",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon is dealt damage with a Fire or Water-Type Move. Increase 3 Points to its Dexterity Atribute.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 3,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon works as a steam furnace, with a bit of fire and water it can move anything at great speeds. It also loves to eat coal."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-steam-engine",
        "automationStatus": "full",
        "automationNotes": "First time hit by Fire or Water"
      }
    }
  },
  {
    "name": "Steelworker",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Steel-Type Moves used by this Pokemon get 1 Extra Die to their Damage Pool.",
      "secondaryEffects": [],
      "description": "The Pokemon is capable of molding and eating steel, giving shape and a sharper edge to any metal it touches."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-steelworker",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Steely Spirit",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Steel-Type Moves used by this Pokemon and Allies in Range get 1 Extra Die to their Damage Pool.",
      "secondaryEffects": [],
      "description": "The Pokemon has a balky behaviour most of the time. if it sets its mind to something it will see it done. Infuriating and inspiring at the same time."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-steely-spirit",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Stench",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce the chance of wild Pokemon encounters at Storyteller's discretion. Whenever this Pokemon is hit with a Non-Ranged Physical Move, Roll 1 Chance Die to Flinch the foe. ",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 1,
          "target": "target",
          "effectType": "condition",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "flinch",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon can emit a smell so unpleasant it repels other people and Pokemon."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-stench",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Sticky Hold",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon's Held Item cannot be removed, stolen or swapped by Moves or Abilities.",
      "secondaryEffects": [],
      "description": "This Pokemon's body is always oozing adhesive substances, if something gets glued, it will be very difficult to remove."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sticky-hold",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Storm Drain",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "water",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokémon is immune to Water-Type Damage. If another Pokémon on the field uses a Single-Target Water-Type Move, it will be redirected towards this Pokémon. The first time this Pokémon is hit by a Water-Type move, Increase its Special by 1.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon absorbs moisture and liquids like a sponge, then uses them to increase its power and last more time outside of water."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-storm-drain",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: Water-type damage. Redirects single-target Water moves. First hit by Water: +1 Special"
      }
    }
  },
  {
    "name": "Strong Jaw",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Add 1 Extra Die to the Damage Pool of all Bite Moves.",
      "secondaryEffects": [],
      "description": "The Pokemon's strong jaw gives it tremendous biting power. Its teeth can tear through almost anything."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-strong-jaw",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Sturdy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon would reach 0 HP due to damage from a Move, it will remain at 1 HP instead. Status Ailments/Conditions, Weather, and Self-inflicted damage do not trigger this effect. The Pokemon can only benefit from Sturdy once per scene.",
      "secondaryEffects": [],
      "description": "This Pokemon's body is extremely resistant to damage, it can withstand almost anything."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sturdy",
        "automationStatus": "partial",
        "automationNotes": "Survives lethal damage at 1 HP when at full HP. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Suction Cups",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The Pokemon is immune to effects that force switches from foes. Outside of battle, reduce difficulty to catch wet and/or slippery Pokemon at Storyteller's discretion.",
      "secondaryEffects": [],
      "description": "This Pokemon's limbs contain suckers that allow it to stay rooted in place. It can stick to any kind of surface, even upside down."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-suction-cups",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Super Luck",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Physical and Special Moves of this Pokemon have \"High Critical\" as an Added Effect. If the Move already had \"High Critical\" the effect stacks and this Pokemon only requires 1 more Success on the Accuracy roll to land a Critical instead of 2.",
      "secondaryEffects": [],
      "description": "This Pokemon has an incredible good luck, good things happen to it regularly."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-super-luck",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Supersweet Syrup",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Increase the chance of wild Pokemon encounters at Storyteller's discretion. All foes in Range cannot evade Moves performed by this Pokemon.",
      "secondaryEffects": [],
      "description": "This Pokemon is incredibly sweet in both demeanor and flavour. Many find it irresistible to lick it, trying to reach its center."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-supersweet-syrup",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Supreme Overlord",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon comes into battle, Increase its Strength and Special Attributes by 1 for every Ally that has Fainted in-battle. Up to 3 points can be increased this way.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 3,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 3,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon has a commanding aura and is obsessively ridden with the need to rule over everything, even the ashes of a kingdom."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-supreme-overlord",
        "automationStatus": "full",
        "automationNotes": "+1 STR and SPC per fainted ally. Up to 3 points"
      }
    }
  },
  {
    "name": "Surge Surfer",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "terrain-active",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "electric",
      "frequency": "",
      "effect": "While Electric Terrain is active, increase this Pokemon's Dexterity Attribute by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's magnetic field allows it to stand and surf on top of electric currents as if it were floating."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-surge-surfer",
        "automationStatus": "full",
        "automationNotes": "While Electric Terrain is active: +2 Dexterity"
      }
    }
  },
  {
    "name": "Swarm",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-hp-half-or-less",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Pain Penalization won't reduce successes from Accuracy or Damage rolls of Bug-Type Moves used by this Pokemon. Bug-Type Moves get 2 Extra dice to their Damage Pool when this Pokemon is at half HP or less.",
      "secondaryEffects": [],
      "description": "The Pokemon enters a hive mind state when its life is on the line, calling upon a swarm to aid it in battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-swarm",
        "automationStatus": "partial",
        "automationNotes": "When HP ≤ half: +1 damage die for Bug-type moves. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Sweet Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Increase the chance of wild Pokemon encounters at Storyteller's discretion. The Pokemon and allies in range are immune to the Sleep status.",
      "secondaryEffects": [],
      "description": "This Pokemon's delicious aroma will wake the appetite of all Pokemon nearby."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sweet-veil",
        "automationStatus": "partial",
        "automationNotes": "IMMUNE: sleep (self + allies in range)"
      }
    }
  },
  {
    "name": "Swift Swim",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "weather-active",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "rain,typhoon",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While Rain Weather is active, Increase this Pokemon's Dexterity Attribute by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon will move faster in water than on land, even a puddle-covered roadway will allow it to use its full speed."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-swift-swim",
        "automationStatus": "full",
        "automationNotes": "While Rain Weather is active: +2 Dexterity"
      }
    }
  },
  {
    "name": "Sword of Ruin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "all-in-range",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce by 2 the Defense of everyone in the field, except this Pokemon. This Pokemon is immune to the effects of the Abilities: Beads of Ruin, Sword of Ruin, Tablets of Ruin, and Vessel of Ruin. Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "all-foes",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "defense",
          "amount": -2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "There is a cursed artifact on this Pokemon. A cold hatred takes harbor inside everyone's hearts. This Pokemon loves to instigate conflict amongst others."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-sword-of-ruin",
        "automationStatus": "full",
        "automationNotes": "Reduce DEF of everyone except self. Immune to other Ruin abilities"
      }
    }
  },
  {
    "name": "Symbiosis",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If an ally loses or spends its Held Item, this Pokemon will immediately give the one it's holding to the ally as a free action. ",
      "secondaryEffects": [],
      "description": "This Pokemon enjoys forming a mutually-beneficial relationship with any ally it teams up with."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-symbiosis",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Synchronize",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-any",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever a foe inflicts a Status Ailment or Condition to this Pokemon, the same Status is inflicted into the foe. this Ability does not ignore a foe's immunity to certain Status Ailments/Conditions.",
      "secondaryEffects": [],
      "description": "The Pokemon can share its mood, feelings and sensations with others, specially with those who caused it pain."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-synchronize",
        "automationStatus": "partial",
        "automationNotes": "Mirror any status inflicted by foe onto foe"
      }
    }
  },
  {
    "name": "Tablets of Ruin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "all-in-range",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce by 2 the Strength of everyone in the field, except this Pokemon. This Pokemon in immune to the effects of the Abilities: Beads of Ruin, Sword of Ruin, Tablets of Ruin, and Vessel of Ruin. Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "all-foes",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": -2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "There is a cursed artifact on this Pokemon. A putrid moldy sickness consumes everyone's body. This Pokemon loves to enfeeble and weaken others."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-tablets-of-ruin",
        "automationStatus": "full",
        "automationNotes": "Reduce STR of everyone except self. Immune to other Ruin abilities"
      }
    }
  },
  {
    "name": "Tangled Feet",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "While this Pokemon is Confused, Add Extra \"Reduced Accuracy\" to all of the foe's Moves that Target this Pokemon.",
      "secondaryEffects": [],
      "description": "The Pokemon moves in a very strange and particular way when dizzy or confused, this usually works to its advantage."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-tangled-feet",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Tangling Hair",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-contact",
      "abilityTarget": "attacker",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time a foe hits this Pokemon with a Non-Ranged Physical Move, Reduce its Dexterity Attribute by 1.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "target",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": -1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's hair is thick and tough, it easily tangles anyone who comes close to it. Brush it twice a day to keep it silky and shiny."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-tangling-hair",
        "automationStatus": "full",
        "automationNotes": "First time foe hits with Non-Ranged Physical"
      }
    }
  },
  {
    "name": "Technician",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Add 1 Extra die to the Damage pool of all Physical or Special Moves with Power 1 or 2 this Pokemon performs.",
      "secondaryEffects": [],
      "description": "This Pokemon is meticulous and precise in tasks that everyone else would perform roughly and without care."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-technician",
        "automationStatus": "partial",
        "automationNotes": "+1 damage die for moves with power ≤ 2. Hardcoded in damage calculation."
      }
    }
  },
  {
    "name": "Telepathy",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon won't receive damage from Moves performed by its allies.",
      "secondaryEffects": [],
      "description": "This Pokemon can communicate using telepathy. It can send messages to other minds but it cannot receive messages back."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-telepathy",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Tera Shell",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Only Terapagos may use this Ability. While this Pokemon is at full health it receives Not-Very-Effective Damage from all Physical or Special Moves. Unique Ability",
      "secondaryEffects": [],
      "description": "Few Pokemon witnessed Arceus bestow the universe with energy, from them only one managed to encompass a piece of it all within itself."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-tera-shell",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Tera Shift",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Only Terapagos may use this Ability. At the beginning of a new Round, you may change Terapagos into its Terastral Form, if you do, Restore its full HP, Will, and heal it from any Status. Unique Ability.",
      "secondaryEffects": [],
      "description": "There is a flow of energy within this Pokemon that encompases all Types in existance. This energy is as old as the universe itself."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-tera-shift",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Teraform Zero",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Only Terapagos may use this Ability. Remove all Active Effects on the battlefield and negate any Effect on the Battlefield while this Pokemon is out. (Force Fields, Entry Hazards, Terrain, Weather, Abilities etc.) Unique Ability.",
      "secondaryEffects": [],
      "description": "In this form, Terapagos once held the newly-created world on top of itself. It is well within its power to restore it to its most ancient state."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-teraform-zero",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Teravolt",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a Type, Move, Item or Ability would prevent this Pokemon from targeting a foe or inflicting an effect, ignore it. (e.g. A Pokemon with Immunity can be Poisoned, Ground-Type Pokemon can be hit with Electric Moves, etc.) Unique Ability.",
      "secondaryEffects": [],
      "description": "There's a ball of blue lightning coming out of this Pokemon that prevents its foes from being out of reach, no matter what you do, it will zap you."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-teravolt",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Thermal Exchange",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "fire",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon is immune to all Burn degrees. The first time this Pokemon is hit by a Fire-Type Move, Increase its Strength Attribute by 1. This effect does not prevent damage from Fire-Type Moves.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's body is so gelid it violently reacts to any sudden temperature change."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-thermal-exchange",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: burn. First time hit by Fire"
      }
    }
  },
  {
    "name": "Thick Fat",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce by 1 the damage taken from Fire and Ice-Type moves.",
      "secondaryEffects": [],
      "description": "This Pokemon's body has a thick layer of blubber that protects it against against harsh temperatures."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-thick-fat",
        "automationStatus": "partial",
        "automationNotes": "Reduces damage from Fire and Ice-type moves. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Tinted Lens",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a foe has a Type resistance to a Move performed by this Pokemon, ignore it. If the foe has a double Type resistance, only one resistance can be ignored.",
      "secondaryEffects": [],
      "description": "This Pokemon's goggle-like eyes can find the good side in every bad situation, even when there is none."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-tinted-lens",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Torrent",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-hp-half-or-less",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Pain Penalization won't reduce successes from Accuracy or Damage rolls of Water-Type Moves used by this Pokemon. Water-Type Moves get 2 Extra dice to their Damage Pool when this Pokemon is at half HP or less.",
      "secondaryEffects": [],
      "description": "This Pokemon builds up pressure to shoot water streams. When that pressure cannot be held in, it is released through uncontrollable torrents."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-torrent",
        "automationStatus": "partial",
        "automationNotes": "When HP ≤ half: +1 damage die for Water-type moves. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Tough Claws",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Add 1 Extra die to the Damage Pool of all non-Ranged Physical Moves this Pokemon performs.",
      "secondaryEffects": [],
      "description": "This Pokemon's claws are so sturdy, they can tear through almost anything."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-tough-claws",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Toxic Boost",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "self-has-condition",
      "abilityTarget": "self",
      "triggerConditionType": "poisoned,badly-poisoned",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon gets the Poison or Badly Poison Status, Increase its Strength Attribute by 2.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "strength",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The blood of this Pokemon boils whenever it is afflicted by Poison, this fever induces an uncontrollable rage."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-toxic-boost",
        "automationStatus": "full",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Toxic Chain",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-deal-damage",
      "abilityTarget": "foe",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon hits a foe with a Non-Ranged Physical Move, Roll 3 Chance Dice to Inflict Badly Poison on the foe.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "on-hit",
          "chance": 3,
          "target": "target",
          "effectType": "condition",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "badly-poisoned",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 0,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The chain that binds this Pokemon is both corroded and corrosive as a result of their greed that can poison the spirit and mind as well as your body."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-toxic-chain",
        "automationStatus": "full",
        "automationNotes": "When hitting with Non-Ranged Physical Move"
      }
    }
  },
  {
    "name": "Toxic Debris",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon is hit with a Non-Ranged Physical Move, scatter Toxic Spikes (p.509) into the foe's side of the field.",
      "secondaryEffects": [],
      "description": "This Pokemon can encapsulate toxins inside the layers of brittle crystal covering its body, be careful not to shatter it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-toxic-debris",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Trace",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon copies the Ability of a random foe when it comes out. The effect ends if this Pokemon is removed from the battle. Unique Abilities can't be copied.",
      "secondaryEffects": [],
      "description": "This Pokemon mimics the special characteristics of the others, making them look as if they were its own."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-trace",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Transistor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Add 2 Extra dice to the Damage Pool of all Physical or Special Electric-Type Moves that this Pokemon performs.",
      "secondaryEffects": [],
      "description": "This Pokemon's body stores and boosts electric charges. It will constantly be releasing menacing lightning all over the place."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-transistor",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Triage",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Support Moves of this Pokemon with the effect of Basic Heal, Cure Status are considered to have: \"Reaction 1\" as Added Effect.",
      "secondaryEffects": [],
      "description": "The Pokemon feels the urgency to treat the injured; it is also very quick to stitch and make knots. A skill often used to instantly mend wounds."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-triage",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Truant",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Roll this Pokemon's Loyalty every other turn, and score at least 2 successes. If the roll fails this Pokemon refuses to act. If it is successful it may act normally.",
      "secondaryEffects": [],
      "description": "This Pokemon is extremely lazy. They won't make even the tiniest effort to do anything even in the heat of battle."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-truant",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Turboblaze",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If a Type, Move, Item or Ability would prevent this Pokemon from targeting a foe or inflicting an effect, ignore it. (e.g. A Pokemon with Immunity can be Poisoned, Ground-Type Pokemon can be hit with Electric Moves, etc.) Unique Ability.",
      "secondaryEffects": [],
      "description": "The Pokemon surrounds everything with a giant ball of swirling flames that prevents its foes from being out of reach, there is no escaping the heat."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-turboblaze",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Unaware",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon ignores any Increase or Reduction on the foe's Attributes. This effect applies when dealing and receiving damage from a foe.",
      "secondaryEffects": [],
      "description": "The Pokemon is oblivious to many details in its surroundings, it will rarely take notice of things going on."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-unaware",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Unburden",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "custom",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon spends or loses its held item and is no longer holding any, Increase 2 Points to its Dexterity Attribute.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon is most comfortable when it is freed from having to carry stuff around. It loves to be able to move without restrictions."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-unburden",
        "automationStatus": "full",
        "automationNotes": "First time this Pokemon spends or loses its held item"
      }
    }
  },
  {
    "name": "Unnerve",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Foes cannot consume their held berry or recycled berries while this Pokemon is in the field.",
      "secondaryEffects": [],
      "description": "It may be its powerful gaze or its menacing presence, but others near this Pokemon become really nervous to the point where they lose their appetite."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-unnerve",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Unseen Fist",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Shield Moves, Force Fields, Substitute decoys and cover are ignored by this Pokemon's Non-Ranged Physical Moves. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon moves and fights with amazing speed, you can't really see their movements and your foe's can't either."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-unseen-fist",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Vessel of Ruin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "enter-battle",
      "abilityTarget": "all-in-range",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce by 2 the Special of everyone in the field, except this Pokemon. This Pokemon is immune to the effects of the Abilities: Beads of Ruin, Sword of Ruin, Tablets of Ruin, and Vessel of Ruin. Unique Ability.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "all-foes",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "special",
          "amount": -2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "There is a cursed artifact on this Pokemon. A dreadful tremor of fear invades everyone. This Pokemon loves to terrorize and frighten others."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-vessel-of-ruin",
        "automationStatus": "full",
        "automationNotes": "Reduce SPC of everyone except self. Immune to other Ruin abilities"
      }
    }
  },
  {
    "name": "Victory Star",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "All Physical and Special Moves of the user and allies in range are considered to have: \"Never Miss\" as Added Effect. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon's presence is an incredible boost for morale. Those who get its favor will be guided to victory."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-victory-star",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Vital Spirit",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon is immune to the Sleep status. Moves or Items that self-inflict Sleep will fail.",
      "secondaryEffects": [],
      "description": "The Pokemon is incredibly active and energetic. It needs constant activity and exercise or else it will act destructive. It never sleeps."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-vital-spirit",
        "automationStatus": "partial",
        "automationNotes": "IMMUNE: sleep"
      }
    }
  },
  {
    "name": "Volt Absorb",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "electric",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon is hit by an Electric-Type Move, you may restore 1 HP instead of receiving damage. Electric-Type Moves do not deal damage to this Pokemon.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "heal",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic-numeric",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's body is practically a battery that is always happy to become charged to full capacity."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-volt-absorb",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: Electric-type damage. Heal 1 HP when hit by Electric"
      }
    }
  },
  {
    "name": "Wandering Spirit",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "If this Pokemon hits a foe with a Non-Ranged Physical Move, switch its Ability with the foe's. Unique Abilities can't be switched.",
      "secondaryEffects": [],
      "description": "The Pokemon is a wandering ghost with a haunted expression on its face. It won't heed your call and might get lost floating aimlessly. Get to a medium to heal it."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-wandering-spirit",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Water Absorb",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "water",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "When this Pokemon is hit by a Water-Type Move, you may restore 1 HP instead of receiving damage. Water-Type Moves do not deal damage to this Pokemon.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "heal",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "none",
          "amount": 1,
          "healType": "basic-numeric",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The Pokemon's body is mostly made of water, it stores water inside itself and uses it for nourishment."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-water-absorb",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: Water-type damage. Heal 1 HP when hit by Water"
      }
    }
  },
  {
    "name": "Water Bubble",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce by 1 the total damage dealt to this Pokemon by Fire-Type Moves. 1st and 2nd Degree Burns deal no Damage to this Pokemon. Add 2 Extra Dice to the Damage Pool of this Pokemon's Water-Type Moves.",
      "secondaryEffects": [],
      "description": "The Pokemon is shielded by a water bubble. Strangely, the bubble is filled with clear water inside instead of air."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-water-bubble",
        "automationStatus": "partial",
        "automationNotes": "Reduces Fire-type damage by 2 (defender). +1 Water damage die (attacker). Hardcoded in damage calculation."
      }
    }
  },
  {
    "name": "Water Compaction",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "water",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The fist time this Pokemon is hit by a Water-Type Move, Increase its Defense by 2. Water-type moves do not deal damage to this Pokemon.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "defense",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "The body of the Pokemon can absorb water at an astounding rate, its body hardens as it quickly dries."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-water-compaction",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: Water-type damage. First time hit by Water: +2 Defense"
      }
    }
  },
  {
    "name": "Water Veil",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The Pokemon is immune to all Burn degrees.",
      "secondaryEffects": [],
      "description": "This Pokemon is always wet and producing water to keep itself moist. Thanks to this, the Pokemon can stay away from a body of water for a long time."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-water-veil",
        "automationStatus": "partial",
        "automationNotes": "IMMUNE: burn"
      }
    }
  },
  {
    "name": "Weak Armor",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-physical",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon is hit by any Physical Move, Increase its Dexterity Attribute by 1 and Reduce its Defense by 1.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "dexterity",
          "amount": 1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        },
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "defense",
          "amount": -1,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's protective outer layers can come off, allowing it to move freely and be more agile."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-weak-armor",
        "automationStatus": "full",
        "automationNotes": "First time hit by any Physical Move"
      }
    }
  },
  {
    "name": "Well-Baked Body",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "on-hit-by-type",
      "abilityTarget": "self",
      "triggerConditionType": "fire",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "The first time this Pokemon is hit by a Fire-Type Move, Increase its Defense by 2. Fire-type moves do not deal damage to this Pokemon.",
      "secondaryEffects": [
        {
          "section": 0,
          "label": "",
          "trigger": "always",
          "chance": 0,
          "target": "self",
          "effectType": "stat",
          "durationMode": "combat",
          "durationRounds": 1,
          "specialDuration": [],
          "conditional": false,
          "activationCondition": "",
          "condition": "none",
          "weather": "none",
          "terrain": "none",
          "stat": "defense",
          "amount": 2,
          "healType": "basic",
          "healMode": "fixed",
          "healProfile": "standard",
          "healingCategory": "standard",
          "notes": "",
          "maxStacks": 0,
          "linkedEffectId": ""
        }
      ],
      "description": "This Pokemon's body develops a thick bread-like crust when it is exposed to heat, filling the air with a buttery aroma."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-well-baked-body",
        "automationStatus": "full",
        "automationNotes": "IMMUNE: Fire-type damage. First time hit by Fire: +2 Defense"
      }
    }
  },
  {
    "name": "White Smoke",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Other Pokemon cannot reduce the Attributes of this Pokemon. This Pokemon can still Reduce its own Attributes.",
      "secondaryEffects": [],
      "description": "The Pokemon is constantly releasing fumes of white smoke making it difficult to be seen. It uses the smoke to conceal itself."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-white-smoke",
        "automationStatus": "partial",
        "automationNotes": "PREVENT: all stat reduction by others. Cannot have Attributes reduced by others."
      }
    }
  },
  {
    "name": "Wimp Out",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever this Pokemon reaches half or less of its total HP, it will switch out to its pokeball, sending an Ally to take its place. If there is no Ally, the battle may end. This Ability's effect is not affected by Block.",
      "secondaryEffects": [],
      "description": "The Pokemon goes into a lot of stress whenever its exoskeleton is weakened, it can escape from any situation out of sheer cowardice."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-wimp-out",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Wind Power",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Whenever this Pokemon receives damage from a wind Move, Add 2 Extra Dice to the Damage pool of the next Electric-Type Move this Pokemon performs. This effect does not stack.",
      "secondaryEffects": [],
      "description": "This Pokemon uses wind currents to charge itself with electricity, tie a cable to its leg while it flies and get yourself an eco-friendly generator."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-wind-power",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Wind Rider",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Add 1 Extra Die to the Damage Pool of all Wind Moves.",
      "secondaryEffects": [],
      "description": "This Pokemon can soar no matter if there is a light breeze or a wind tempest raging, a true master of the sky."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-wind-rider",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Wonder Guard",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "This Pokemon only receives damage from Status Ailments/Conditions, and Moves that deal Super Effective damage against it. This Pokemon is immune to damage from other sources like weather conditions and entry hazards. Unique Ability.",
      "secondaryEffects": [],
      "description": "This Pokemon's body is protected by an incredible otherworldly aura. Most things get through as if nothing was there."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-wonder-guard",
        "automationStatus": "partial",
        "automationNotes": "Only super-effective moves can deal damage to this Pokemon. Automated in damage calculation."
      }
    }
  },
  {
    "name": "Wonder Skin",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Reduce up to 2 Chance Dice from Effects of Moves or Abilities that target this Pokemon. (Example: The move Ember has 1 Chance Dice to Burn the foe, against this Pokemon it has zero Chance Dice).",
      "secondaryEffects": [],
      "description": "The skin of this Pokemon is covered by a thin protective veil that allows it to weaken dangerous hazards."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-wonder-skin",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Zen Mode",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Only Darmanitan may use this Ability. When at half or less of its HP, change to Zen Mode Form at the end of the Round. Use its Zen Mode Form from then on. Adjust its Attributes according to the Rank and Limits it has for each Form. Unique Ability.",
      "secondaryEffects": [],
      "description": "Under extreme stress, this Pokemon will unlock its hidden psychic abilities through the power of meditation, it will go back to normal the next day."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-zen-mode",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  },
  {
    "name": "Zero to Hero",
    "type": "ability",
    "img": "icons/svg/aura.svg",
    "system": {
      "abilityType": "passive",
      "abilityTrigger": "always",
      "abilityTarget": "self",
      "triggerConditionType": "",
      "triggerConditionWeather": "",
      "triggerConditionTerrain": "",
      "frequency": "",
      "effect": "Only Palafin may use this Ability. After switching out, change to Hero Form. Use its Hero Form when it switches back in. Adjust its Attributes according to the Rank and Limits it has for each Form. Unique Ability.",
      "secondaryEffects": [],
      "description": "The Pokemon has a secret super-hero identity that even its trainer is unaware of as they conveniently retreat when the super-hero arrives."
    },
    "flags": {
      "pok-role-system": {
        "seedId": "ability-zero-to-hero",
        "automationStatus": "none",
        "automationNotes": ""
      }
    }
  }
]);
