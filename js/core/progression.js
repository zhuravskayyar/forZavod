import heroesData from '../data/heroes.js';
import ITEMS from '../data/items.js';
import { MAX_LEVEL, getXpToNextLevel } from '../data/xpTable.js';

export const HERO_STAT_KEYS = ['str', 'vit', 'agi', 'int', 'wil', 'luck'];
export const LEVELUP_STAT_KEYS = ['str', 'vit', 'agi', 'int', 'wil'];
export const HERO_STAT_LABELS = {
  str: 'Strength',
  vit: 'Vitality',
  agi: 'Agility',
  int: 'Intelligence',
  wil: 'Willpower',
  luck: 'Luck',
};

const CLASS_PROFILES = {
  blacksmith: {
    hpPerLevel: 7,
    autoStatOrder: ['vit', 'str', 'wil'],
    baseWeaponDamage: 5,
    baseSpellPower: 0,
    baseArmor: 2,
  },
  woodcutter: {
    hpPerLevel: 6,
    autoStatOrder: ['str', 'vit', 'agi'],
    baseWeaponDamage: 6,
    baseSpellPower: 0,
    baseArmor: 2,
  },
  hunter: {
    hpPerLevel: 5,
    autoStatOrder: ['agi', 'str', 'luck'],
    baseWeaponDamage: 4,
    baseSpellPower: 0,
    baseArmor: 1,
  },
  scholar: {
    hpPerLevel: 4,
    autoStatOrder: ['int', 'wil', 'agi'],
    baseWeaponDamage: 1,
    baseSpellPower: 6,
    baseArmor: 0,
  },
  alchemist: {
    hpPerLevel: 5,
    autoStatOrder: ['wil', 'int', 'agi'],
    baseWeaponDamage: 2,
    baseSpellPower: 4,
    baseArmor: 1,
  },
  herbalist: {
    hpPerLevel: 5,
    autoStatOrder: ['wil', 'int', 'vit'],
    baseWeaponDamage: 1,
    baseSpellPower: 5,
    baseArmor: 1,
  },
  default: {
    hpPerLevel: 5,
    autoStatOrder: ['vit', 'str', 'agi'],
    baseWeaponDamage: 3,
    baseSpellPower: 2,
    baseArmor: 1,
  },
};

const STARTING_LOADOUTS = {
  blacksmith: { weapon: 'iron_sword_01', armor: 'chain_vest_01', inventory: ['field_bandage_01'] },
  woodcutter: { weapon: 'iron_sword_01', armor: 'quilted_armor_01', inventory: ['field_bandage_01'] },
  hunter: { weapon: 'hunter_bow_01', armor: 'quilted_armor_01', inventory: ['field_bandage_01', 'focus_tonic_01'] },
  scholar: { weapon: 'ash_staff_01', armor: 'mystic_robe_01', inventory: ['focus_tonic_01'] },
  alchemist: { weapon: 'ash_staff_01', armor: 'mystic_robe_01', inventory: ['field_bandage_01', 'antidote_01'] },
  herbalist: { weapon: 'ash_staff_01', armor: 'mystic_robe_01', inventory: ['field_bandage_01', 'antidote_01'] },
  default: { weapon: null, armor: null, inventory: [] },
};

const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));
const HERO_BY_ID = new Map(heroesData.map((hero) => [hero.id, hero]));

function cloneItem(item) {
  return item ? structuredClone(item) : null;
}

function createItemInstanceId(itemId = 'item') {
  if (globalThis.crypto?.randomUUID) {
    return `${itemId}__${globalThis.crypto.randomUUID()}`;
  }
  return `${itemId}__${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function stampItemInstance(item) {
  if (!item) return null;
  return {
    ...item,
    instanceId: item.instanceId || createItemInstanceId(item.id || 'item'),
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getClassProfile(classKey) {
  return CLASS_PROFILES[classKey] || CLASS_PROFILES.default;
}

function getHeroSource(entry = {}) {
  return HERO_BY_ID.get(entry.heroId || entry.id) || null;
}

function getDefaultBaseStats(source) {
  return {
    str: source?.str ?? 5,
    vit: source?.vit ?? 5,
    agi: source?.agi ?? 5,
    int: source?.int ?? 5,
    wil: source?.tal ?? source?.wil ?? 5,
    luck: source?.luck ?? Math.max(3, Math.round(((source?.agi ?? 5) + (source?.tal ?? 5)) / 3)),
  };
}

function hydrateItem(itemOrId) {
  if (!itemOrId) return null;
  if (typeof itemOrId === 'string') return stampItemInstance(cloneItem(ITEM_BY_ID.get(itemOrId)));
  if (itemOrId.id && ITEM_BY_ID.has(itemOrId.id)) {
    return stampItemInstance({ ...cloneItem(ITEM_BY_ID.get(itemOrId.id)), ...structuredClone(itemOrId) });
  }
  return stampItemInstance(structuredClone(itemOrId));
}

function hydrateInventory(list = []) {
  return list
    .map((entry) => hydrateItem(entry))
    .filter(Boolean);
}

function getStartingLoadout(classKey) {
  return STARTING_LOADOUTS[classKey] || STARTING_LOADOUTS.default;
}

function ensureEquipment(entry = {}, classKey) {
  const loadout = getStartingLoadout(classKey);
  return {
    weapon: hydrateItem(entry.weapon || loadout.weapon),
    armor: hydrateItem(entry.armor || loadout.armor),
    accessory1: hydrateItem(entry.accessory1),
    accessory2: hydrateItem(entry.accessory2),
  };
}

function collectBonuses(items = []) {
  const total = {};
  items.filter(Boolean).forEach((item) => {
    Object.entries(item.stats || {}).forEach(([key, value]) => {
      total[key] = (total[key] || 0) + value;
    });
  });
  return total;
}

function normalizeEquipment(hero) {
  const slots = ensureEquipment(hero.equipment, hero.classKey);
  hero.equipment = slots;
  return slots;
}

function isItemRefMatch(item, itemRef) {
  if (!item || !itemRef) return false;
  return item.instanceId === itemRef || item.id === itemRef;
}

export function getItemById(itemId) {
  return cloneItem(ITEM_BY_ID.get(itemId));
}

export function canHeroEquipItem(hero, item) {
  if (!hero || !item || item.type === 'consumable') return false;
  if ((item.levelRequirement || 1) > (hero.level || 1)) return false;
  if (!item.classRestriction?.length) return true;
  return item.classRestriction.includes(hero.classKey);
}

export function serializeHero(hero) {
  return {
    heroId: hero.id,
    name: hero.name,
    cls: hero.cls,
    classKey: hero.classKey,
    summary: hero.summary,
    skills: hero.skills,
    playerLabel: hero.playerLabel,
    playerColor: hero.playerColor,
    portrait: hero.portrait,
    views: hero.views,
    level: hero.level,
    xp: hero.xp,
    xpToNext: hero.xpToNext,
    unspentStatPoints: hero.unspentStatPoints,
    perkPoints: hero.perkPoints,
    baseStats: structuredClone(hero.baseStats),
    hp: hero.hp,
    focus: hero.focus,
    pipeLevel: hero.pipeLevel || 1,
    curses: Array.isArray(hero.curses) ? [...hero.curses] : [],
    devotion: hero.devotion || null,
    devotionName: hero.devotionName || null,
    inventory: structuredClone(hero.inventory || []),
    equipment: structuredClone(hero.equipment || {}),
    statusEffects: structuredClone(hero.statusEffects || []),
    injuries: structuredClone(hero.injuries || []),
  };
}

export function createRuntimeHero(entry = {}, index = 0) {
  const source = getHeroSource(entry);
  const classKey = entry.classKey || source?.classKey || 'default';
  const baseStats = {
    ...getDefaultBaseStats(source),
    ...(entry.baseStats || {}),
  };
  const startingLoadout = getStartingLoadout(classKey);
  const inventorySeed = Array.isArray(entry.inventory) && entry.inventory.length
    ? entry.inventory
    : startingLoadout.inventory;
  const hero = {
    id: entry.heroId || entry.id || source?.id || `hero-${index + 1}`,
    name: entry.name || source?.nameEn || `Hero ${index + 1}`,
    cls: entry.cls || source?.class || 'Adventurer',
    classKey,
    playerLabel: entry.playerLabel || `P${index + 1}`,
    playerColor: entry.playerColor || ['#4e8fe0', '#b058d9', '#7c7cff', '#53c2a1'][index] || '#6d7f8a',
    summary: entry.summary || (source?.summaryUk || source?.summaryEn
      ? { uk: source?.summaryUk || '', en: source?.summaryEn || '' }
      : null),
    skills: entry.skills || source?.skills || [],
    portrait: entry.portrait || source?.portrait || source?.views?.front || '',
    views: entry.views || source?.views || {},
    level: Math.max(1, entry.level || 1),
    xp: Math.max(0, entry.xp || 0),
    xpToNext: entry.xpToNext || getXpToNextLevel(entry.level || 1),
    unspentStatPoints: Math.max(0, entry.unspentStatPoints || entry.statPoints || 0),
    perkPoints: Math.max(0, entry.perkPoints || 0),
    baseStats,
    stats: structuredClone(baseStats),
    derived: {},
    hp: entry.hp ?? source?.hp ?? 30,
    maxHp: entry.maxHp ?? source?.hp ?? 30,
    focus: entry.focus ?? source?.focus ?? 3,
    maxFocus: entry.maxFocus ?? source?.focus ?? 3,
    movePoints: 0,
    maxMovePoints: 0,
    stepsTaken: 0,
    turnRolled: false,
    turnEnded: false,
    lastRollTotal: 0,
    lastRollTrail: [],
    tile: null,
    inventory: hydrateInventory(inventorySeed),
    equipment: ensureEquipment(entry.equipment || {}, classKey),
    statusEffects: Array.isArray(entry.statusEffects) ? structuredClone(entry.statusEffects) : [],
    injuries: Array.isArray(entry.injuries) ? structuredClone(entry.injuries) : [],
    render: entry.render || null,
    pipeLevel: Math.max(1, entry.pipeLevel || 1),
    curses: Array.isArray(entry.curses) ? [...entry.curses] : [],
    devotion: entry.devotion || null,
    devotionName: entry.devotionName || null,
    template: {
      baseStats: structuredClone(baseStats),
      startingHp: entry.maxHp ?? source?.hp ?? 30,
      startingFocus: entry.maxFocus ?? source?.focus ?? 3,
    },
  };
  return recalculateHero(hero);
}

export function recalculateHero(hero) {
  const profile = getClassProfile(hero.classKey);
  const equipment = normalizeEquipment(hero);
  const equippedItems = Object.values(equipment);
  const bonuses = collectBonuses(equippedItems);
  const stats = {
    str: hero.baseStats.str + (bonuses.str || 0),
    vit: hero.baseStats.vit + (bonuses.vit || 0),
    agi: hero.baseStats.agi + (bonuses.agi || 0),
    int: hero.baseStats.int + (bonuses.int || 0),
    wil: hero.baseStats.wil + (bonuses.wil || 0),
    luck: hero.baseStats.luck + (bonuses.luck || 0),
  };
  const vitDelta = hero.baseStats.vit - hero.template.baseStats.vit;
  const wilDelta = hero.baseStats.wil - hero.template.baseStats.wil;
  const maxHp = Math.max(
    1,
    hero.template.startingHp
      + (hero.level - 1) * profile.hpPerLevel
      + vitDelta * 4
      + (bonuses.hpMax || 0),
  );
  const maxFocus = clamp(
    hero.template.startingFocus + Math.floor(wilDelta / 2) + (bonuses.focusMax || 0),
    1,
    5,
  );
  const armor = Math.max(0, profile.baseArmor + Math.floor(stats.vit / 2) + (bonuses.armor || 0));
  const physicalDamage = Math.max(
    0,
    profile.baseWeaponDamage + stats.str * 2 + Math.floor((hero.level - 1) / 2) + (bonuses.weaponDamage || 0) + (bonuses.physicalDamage || 0),
  );
  const magicDamage = Math.max(
    0,
    profile.baseSpellPower + stats.int * 2 + Math.floor((hero.level - 1) / 2) + (bonuses.spellPower || 0) + (bonuses.magicDamage || 0),
  );
  hero.stats = stats;
  hero.derived = {
    hpMax: maxHp,
    hpCurrent: clamp(hero.hp ?? maxHp, 0, maxHp),
    focusMax: maxFocus,
    focusCurrent: clamp(hero.focus ?? maxFocus, 0, maxFocus),
    physicalDamage,
    magicDamage,
    armor,
    initiative: stats.agi * 2 + Math.floor(stats.wil / 2) + (bonuses.initiative || 0),
    critChance: clamp(3 + stats.luck + (bonuses.critChance || 0), 0, 35),
    dodgeChance: clamp(Math.floor(stats.agi * 1.5) + (bonuses.dodgeChance || 0), 0, 45),
    focusRegen: Math.max(0, Math.floor(stats.wil / 4)),
    healingPower: stats.int + stats.wil + (bonuses.healingPower || 0),
    statusResistance: clamp(stats.wil * 4 + (bonuses.statusResistance || 0), 0, 80),
  };
  hero.maxHp = hero.derived.hpMax;
  hero.hp = hero.derived.hpCurrent;
  hero.maxFocus = hero.derived.focusMax;
  hero.focus = hero.derived.focusCurrent;
  hero.xpToNext = hero.level >= MAX_LEVEL ? 0 : getXpToNextLevel(hero.level);
  return hero;
}

export function gainHeroXp(hero, amount) {
  const gain = Math.max(0, Math.floor(amount || 0));
  const profile = getClassProfile(hero.classKey);
  const levels = [];
  hero.xp += gain;

  while (hero.level < MAX_LEVEL && hero.xp >= hero.xpToNext) {
    hero.xp -= hero.xpToNext;
    hero.level += 1;
    const autoStat = profile.autoStatOrder[(hero.level - 2) % profile.autoStatOrder.length] || 'vit';
    hero.baseStats[autoStat] += 1;
    hero.unspentStatPoints += 1;
    if (hero.level >= 3 && hero.level % 3 === 0) {
      hero.perkPoints += 1;
    }
    levels.push({ level: hero.level, autoStat });
  }

  recalculateHero(hero);

  if (levels.length) {
    hero.hp = Math.min(hero.maxHp, hero.hp + profile.hpPerLevel + levels.length * 2);
    hero.focus = Math.min(hero.maxFocus, hero.focus + levels.length);
  }

  return {
    xpGained: gain,
    levels,
  };
}

export function allocateHeroStatPoint(hero, statKey) {
  if (!hero || !LEVELUP_STAT_KEYS.includes(statKey)) return false;
  if ((hero.unspentStatPoints || 0) <= 0) return false;
  hero.baseStats[statKey] += 1;
  hero.unspentStatPoints -= 1;
  recalculateHero(hero);
  return true;
}

export function spendHeroFocus(hero, amount = 1) {
  if (!hero || amount <= 0 || hero.focus < amount) return false;
  hero.focus -= amount;
  hero.derived.focusCurrent = hero.focus;
  return true;
}

export function restoreHeroFocus(hero, amount = 1) {
  if (!hero) return 0;
  const next = Math.min(hero.maxFocus, hero.focus + amount);
  const restored = next - hero.focus;
  hero.focus = next;
  hero.derived.focusCurrent = hero.focus;
  return restored;
}

export function addItemToInventory(hero, itemOrId) {
  const item = hydrateItem(itemOrId);
  if (!hero || !item) return null;
  hero.inventory.push(item);
  return item;
}

export function removeInventoryItem(hero, itemId) {
  if (!hero || !itemId) return null;
  const index = hero.inventory.findIndex((item) => isItemRefMatch(item, itemId));
  if (index === -1) return null;
  return hero.inventory.splice(index, 1)[0] || null;
}

export function equipInventoryItem(hero, itemId) {
  if (!hero) return { ok: false, reason: 'no_hero' };
  const item = hero.inventory.find((entry) => isItemRefMatch(entry, itemId));
  if (!item) return { ok: false, reason: 'not_in_inventory' };
  if (!canHeroEquipItem(hero, item)) return { ok: false, reason: 'restricted' };
  const slot = item.slot;
  const previous = hero.equipment[slot] || null;
  hero.equipment[slot] = item;
  hero.inventory = hero.inventory.filter((entry) => entry !== item);
  if (previous) hero.inventory.push(previous);
  recalculateHero(hero);
  return { ok: true, item, previous };
}

export function sellInventoryItem(hero, itemId) {
  const sold = removeInventoryItem(hero, itemId);
  if (!sold) return null;
  return sold.priceSell || Math.max(1, Math.round((sold.priceBuy || 0) * 0.45));
}

export function useConsumable(hero, itemId) {
  const item = hero?.inventory.find((entry) => isItemRefMatch(entry, itemId) && entry.type === 'consumable');
  if (!hero || !item) return { ok: false };
  removeInventoryItem(hero, item.instanceId || itemId);

  const messages = [];
  item.effects.forEach((effect) => {
    if (effect.type === 'heal') {
      hero.hp = Math.min(hero.maxHp, hero.hp + effect.amount);
      hero.derived.hpCurrent = hero.hp;
      messages.push(`+${effect.amount} HP`);
    }
    if (effect.type === 'focus') {
      const restored = restoreHeroFocus(hero, effect.amount);
      messages.push(`+${restored} Focus`);
    }
    if (effect.type === 'cleanse') {
      hero.statusEffects = (hero.statusEffects || []).filter((status) => status.id !== effect.status);
      hero.curses = (hero.curses || []).filter((status) => status !== effect.status);
      hero.poisoned = false;
      messages.push('Cleanse');
    }
  });

  return {
    ok: true,
    item,
    message: messages.join(' • '),
  };
}

export function buildShopStock(itemIds = []) {
  return itemIds.map((itemId) => hydrateItem(itemId)).filter(Boolean);
}
