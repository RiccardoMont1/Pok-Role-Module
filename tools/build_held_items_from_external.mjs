import fs from 'node:fs';
import path from 'node:path';

const SYSTEM_ID = 'pok-role-system';
const repoRoot = process.cwd();
const itemsDir = path.resolve(repoRoot, '..', 'external-references', 'Pokerole-Data', 'v3.0', 'Items');
const itemSpritesDir = path.resolve(repoRoot, '..', 'external-references', 'Pokerole-Data', 'images', 'ItemSprites');
const outPath = path.resolve(repoRoot, 'module', 'seeds', 'generated', 'held-item-seeds.mjs');
const RAW_ITEM_SPRITES_BASE = 'https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites';

const IMAGE_FILENAME_ALIASES = Object.freeze({
  'protective-pads': 'protective-pad.png',
  umbrella: 'utility-umbrella.png',
  'white-herb': 'white-herbs.png'
});

const TYPE_MAP = new Map([
  ['normal', 'normal'],
  ['fight', 'fighting'],
  ['fighting', 'fighting'],
  ['flying', 'flying'],
  ['poison', 'poison'],
  ['ground', 'ground'],
  ['rock', 'rock'],
  ['bug', 'bug'],
  ['ghost', 'ghost'],
  ['steel', 'steel'],
  ['fire', 'fire'],
  ['water', 'water'],
  ['grass', 'grass'],
  ['electric', 'electric'],
  ['psychic', 'psychic'],
  ['ice', 'ice'],
  ['dragon', 'dragon'],
  ['dark', 'dark'],
  ['fairy', 'fairy']
]);

const CATEGORY_ORDER = new Map([
  ['TypeBoosting', 0],
  ['MonBoosting', 1],
  ['BattleItem', 2],
  ['', 2],
  ['MegaStone', 3],
  ['ZCrystal', 4]
]);

const BASE_HELD = Object.freeze({
  passiveEffect: '',
  compatiblePokemon: '',
  isZCrystal: false,
  zMoveType: 'none',
  isMegaStone: false,
  damageBonusType: 'none',
  damageBonusDice: 0,
  damageBonusCategory: '',
  highCritical: false,
  highCriticalCategory: '',
  statBonuses: {
    strength: 0,
    dexterity: 0,
    vitality: 0,
    special: 0,
    insight: 0,
    def: 0,
    spDef: 0,
    initiative: 0
  },
  accuracyBonusDice: 0,
  accuracyPenaltyToAttacker: 0,
  reducedLowAccuracy: 0,
  superEffectiveBonusDice: 0,
  lifeOrb: false,
  loadedDice: false,
  metronomeBonus: false,
  focusSash: false,
  choiceType: '',
  choicePowerBonus: 0,
  choicePowerPenalty: 0,
  choiceInitiativeBonus: 0,
  choicePriorityBonus: 0,
  onEnterBattleStatus: '',
  immuneToStatReduction: false,
  destinyKnot: false,
  ejectButton: false,
  redCard: false,
  removeTypeImmunities: false,
  immuneToHazards: false,
  immuneToWeather: false,
  immuneToSpore: false,
  rockyHelmet: false,
  stickyBarb: false,
  powerHerb: false,
  throatSpray: false,
  weaknessPolicy: false,
  whiteHerb: false,
  flinchOnHit: false,
  endOfRoundHeal: 0,
  endOfRoundMaxUses: 0,
  endOfRoundDamage: 0
});

const BATTLE_ITEM_OVERRIDES = Object.freeze({
  'choice-band': { choiceType: 'physical', choicePowerBonus: 3, choicePowerPenalty: 3 },
  'choice-scarf': { statBonuses: { initiative: 3 }, choiceType: 'any', choicePowerPenalty: 3, choiceInitiativeBonus: 3, choicePriorityBonus: 5 },
  'choice-specs': { choiceType: 'special', choicePowerBonus: 3, choicePowerPenalty: 3 },
  'clear-amulet': { immuneToStatReduction: true },
  'destiny-knot': { destinyKnot: true },
  'eject-button': { ejectButton: true },
  'expert-belt': { superEffectiveBonusDice: 1 },
  'focus-sash': { focusSash: true },
  'flame-orb': { onEnterBattleStatus: 'burn' },
  'heavy-duty-boots': { immuneToHazards: true },
  'iron-ball': { statBonuses: { dexterity: -1 } },
  'king\'s-rock': { flinchOnHit: true },
  'leftovers': { endOfRoundHeal: 1, endOfRoundMaxUses: 3 },
  'life-orb': { lifeOrb: true, damageBonusDice: 2, damageBonusType: 'none' },
  'loaded-dice': { loadedDice: true },
  'metronome': { metronomeBonus: true },
  'power-herb': { powerHerb: true },
  'quick-claw': { statBonuses: { initiative: 2 } },
  'razor-claw': { highCritical: true },
  'red-card': { redCard: true },
  'ring-target': { removeTypeImmunities: true },
  'rocky-helmet': { rockyHelmet: true },
  'safety-goggles': { immuneToSpore: true },
  'sticky-barb': { stickyBarb: true, endOfRoundDamage: 1 },
  'throat-spray': { throatSpray: true },
  'toxic-orb': { onEnterBattleStatus: 'poison' },
  'umbrella': { immuneToWeather: true },
  'weakness-policy': { weaknessPolicy: true },
  'white-herb': { whiteHerb: true },
  'wide-lens': { accuracyBonusDice: 2 },
  'zoom-lens': { reducedLowAccuracy: 2 },
  'bright-powder': { accuracyPenaltyToAttacker: 1 }
});

const MON_BOOST_OVERRIDES = Object.freeze({
  'lucky-punch': { highCritical: true, highCriticalCategory: 'physical' },
  'leek': { highCritical: true }
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function repairText(value) {
  const text = `${value ?? ''}`;
  if (!text) return '';
  if (!/[�’��]/.test(text)) return text;
  try {
    const repaired = Buffer.from(text, 'latin1').toString('utf8');
    if (repaired && !repaired.includes('?')) return repaired;
  } catch {}
  return text;
}

function normalizeType(value) {
  const normalized = repairText(value).trim().toLowerCase();
  return (TYPE_MAP.get(normalized) ?? normalized) || 'none';
}

function normalizeCompatiblePokemon(value) {
  const normalized = repairText(value).trim().toLowerCase();
  if (!normalized) return '';
  return normalized
    .split(/\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join(', ');
}

function applyHeldOverrides(target, patch) {
  if (!patch) return target;
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'statBonuses') {
      target.statBonuses = { ...target.statBonuses, ...value };
      continue;
    }
    target[key] = value;
  }
  return target;
}

function parseBoostStats(boostText, value) {
  const normalized = repairText(boostText).trim().toLowerCase();
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  const statBonuses = {};
  if (!normalized || !amount) return statBonuses;
  if (normalized.includes('strength')) statBonuses.strength = amount;
  if (normalized.includes('special')) statBonuses.special = amount;
  if (normalized.includes('dexterity')) statBonuses.dexterity = amount;
  if (normalized.includes('vitality')) statBonuses.vitality = amount;
  if (normalized.includes('insight')) statBonuses.insight = amount;
  if (normalized.includes('initiative')) statBonuses.initiative = amount;
  return statBonuses;
}

function buildHeldData(item) {
  const held = clone(BASE_HELD);
  held.passiveEffect = repairText(item.Description || '').trim();

  const category = `${item.Category ?? ''}`.trim();
  const itemId = `${item._id ?? ''}`.trim().toLowerCase();

  if (category === 'TypeBoosting') {
    held.damageBonusType = normalizeType(item.ForTypes || 'none');
    held.damageBonusDice = Number(item.Value ?? 0) || 0;
    return held;
  }

  if (category === 'MonBoosting') {
    held.compatiblePokemon = normalizeCompatiblePokemon(item.ForPokemon || '');
    held.statBonuses = { ...held.statBonuses, ...parseBoostStats(item.Boost, item.Value) };
    applyHeldOverrides(held, MON_BOOST_OVERRIDES[itemId]);
    return held;
  }

  if (itemId === 'leek') {
    held.compatiblePokemon = normalizeCompatiblePokemon(item.ForPokemon || '');
    applyHeldOverrides(held, MON_BOOST_OVERRIDES[itemId]);
    return held;
  }

  if (category === 'MegaStone') {
    held.isMegaStone = true;
    held.compatiblePokemon = normalizeCompatiblePokemon(item.ForPokemon || '');
    return held;
  }

  if (category === 'ZCrystal') {
    held.isZCrystal = true;
    held.zMoveType = normalizeType(item.ForTypes || 'none') || 'none';
    held.compatiblePokemon = normalizeCompatiblePokemon(item.ForPokemon || '');
    return held;
  }

  if (category === 'BattleItem' || category === '') {
    if (normalizeType(item.Boost || '') === 'accuracy') {
      held.accuracyBonusDice = Number(item.Value ?? 0) || 0;
    }
    if (normalizeCompatiblePokemon(item.ForPokemon || '')) {
      held.compatiblePokemon = normalizeCompatiblePokemon(item.ForPokemon || '');
    }
    applyHeldOverrides(held, BATTLE_ITEM_OVERRIDES[itemId]);
    return held;
  }

  return held;
}

function buildEntry(item) {
  const held = buildHeldData(item);
  const seedId = `held-${item._id}`;
  const imageFileName = resolveItemSpriteFileName(item);
  return {
    name: repairText(item.Name),
    type: 'gear',
    img: imageFileName ? `${RAW_ITEM_SPRITES_BASE}/${imageFileName}` : 'icons/svg/item-bag.svg',
    system: {
      category: 'held',
      pocket: 'main',
      consumable: false,
      canUseInBattle: false,
      target: 'pokemon',
      quantity: 1,
      units: { value: 0, max: 0 },
      heal: {
        hp: 0,
        lethal: 0,
        fullHp: false,
        restoreAwareness: false,
        battleHealingCategory: 'standard'
      },
      status: {
        all: false,
        poison: false,
        sleep: false,
        burn: false,
        frozen: false,
        paralysis: false,
        confusion: false
      },
      description: repairText(item.Description || '').trim(),
      pokeball: {
        sealPower: 0,
        specialEffect: 'none',
        healsOnCapture: false
      },
      held,
      vitamin: { stat: 'none' },
      evolution: { compatiblePokemon: '' }
    },
    flags: {
      [SYSTEM_ID]: {
        seedId,
        sourceDbId: `${item._id ?? ''}`.trim().toLowerCase(),
        source: repairText(item.Source || '').trim()
      }
    }
  };
}

function resolveItemSpriteFileName(item) {
  const itemId = `${item?._id ?? ''}`.trim().toLowerCase();
  if (!itemId) return '';
  const aliasedName = IMAGE_FILENAME_ALIASES[itemId];
  if (aliasedName && fs.existsSync(path.join(itemSpritesDir, aliasedName))) return aliasedName;
  const directName = `${itemId}.png`;
  if (fs.existsSync(path.join(itemSpritesDir, directName))) return directName;
  return '';
}

const rawItems = fs.readdirSync(itemsDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(fs.readFileSync(path.join(itemsDir, file), 'utf8')))
  .filter((item) => `${item.Pocket ?? ''}`.trim() === 'HeldItems');

const entries = rawItems
  .sort((a, b) => {
    const categoryDiff = (CATEGORY_ORDER.get(`${a.Category ?? ''}`.trim()) ?? 99) - (CATEGORY_ORDER.get(`${b.Category ?? ''}`.trim()) ?? 99);
    if (categoryDiff !== 0) return categoryDiff;
    return repairText(a.Name).localeCompare(repairText(b.Name));
  })
  .map(buildEntry);

const output = `export const HELD_ITEM_COMPENDIUM_ENTRIES = ${JSON.stringify(entries, null, 2)};\n`;
fs.writeFileSync(outPath, output, 'utf8');
console.log(`Generated held item entries: ${entries.length}`);



