export const QUEST_TYPES = {
  MAIN: 'main',
  REGION: 'region',
  TOWN: 'town',
  PERSONAL: 'personal',
};

function reward({ gold = 0, xp = 0, reputation = {}, items = [] } = {}) {
  return { gold, xp, reputation, items };
}

function worldChange({ addFlags = [], unlockRegions = [], unlockTowns = [] } = {}) {
  return { addFlags, unlockRegions, unlockTowns };
}

export const QUESTS = [
  {
    id: 'mq_01_shadows_on_the_road',
    type: QUEST_TYPES.MAIN,
    act: 1,
    title: 'Тіні на дорозі',
    townId: 'start_village',
    regionId: 'starter_lowlands',
    recommendedLevel: [1, 2],
    prerequisites: [],
    summary: 'Староста просить перевірити покинуту дорогу і зниклий обоз біля лісових руїн.',
    objective: 'Дійти до лісових руїн і зібрати перші сліди скверни.',
    targetNodeId: 'forest_ruins',
    reward: reward({ gold: 35, xp: 80, reputation: { crown: 1 } }),
    worldChangesOnComplete: worldChange({ addFlags: ['mq01_road_checked'], unlockTowns: ['south_outpost'] }),
    nextQuestIds: ['mq_02_silent_outpost'],
  },
  {
    id: 'mq_02_silent_outpost',
    type: QUEST_TYPES.MAIN,
    act: 1,
    title: 'Мовчазний форпост',
    townId: 'south_outpost',
    regionId: 'southern_greenbelt',
    recommendedLevel: [1, 3],
    prerequisites: ['mq_01_shadows_on_the_road'],
    summary: 'Південний форпост замовк. Треба дістатись туди і зрозуміти, що сталося.',
    objective: 'Дістатись до Південного форпосту і доповісти про побачене.',
    targetNodeId: 'south_outpost',
    reward: reward({ gold: 45, xp: 110, reputation: { crown: 1 } }),
    worldChangesOnComplete: worldChange({ addFlags: ['mq02_outpost_contact'] }),
    nextQuestIds: ['mq_03_black_ash'],
  },
  {
    id: 'mq_03_black_ash',
    type: QUEST_TYPES.MAIN,
    act: 1,
    title: 'Чорний попіл',
    townId: 'main_city',
    regionId: 'trade_marches',
    recommendedLevel: [2, 4],
    prerequisites: ['mq_02_silent_outpost'],
    summary: 'Знахідки з дороги треба доставити у велике місто, де є архів і ті, хто вміє читати старі знаки.',
    objective: 'Довезти чорний попіл у Заводське.',
    targetNodeId: 'main_city',
    reward: reward({ gold: 55, xp: 120, reputation: { archive: 1, guild: 1 } }),
    worldChangesOnComplete: worldChange({ addFlags: ['mq03_ash_delivered'], unlockTowns: ['main_city'] }),
    nextQuestIds: ['mq_04_archive_of_the_gate'],
  },
  {
    id: 'mq_04_archive_of_the_gate',
    type: QUEST_TYPES.MAIN,
    act: 2,
    title: 'Архів старої брами',
    townId: 'main_city',
    regionId: 'trade_marches',
    recommendedLevel: [3, 5],
    prerequisites: ['mq_03_black_ash'],
    summary: 'У Заводському згадують стару браму в горах. Перший ключ до неї веде через гільдійські записи.',
    objective: 'Знайти слід старої брами біля Гільдії мисливців.',
    targetNodeId: 'guild_board',
    reward: reward({ gold: 70, xp: 150, reputation: { archive: 2 } }),
    worldChangesOnComplete: worldChange({ addFlags: ['mq04_archive_opened'] }),
    nextQuestIds: ['mq_05_broken_caravan'],
  },
  {
    id: 'mq_05_broken_caravan',
    type: QUEST_TYPES.MAIN,
    act: 2,
    title: 'Розбитий караван',
    townId: 'main_city',
    regionId: 'trade_marches',
    recommendedLevel: [4, 6],
    prerequisites: ['mq_04_archive_of_the_gate'],
    summary: 'Караван із позначеним вантажем зник на східній дорозі. Віз слід знайти до того, як вантаж дістанеться культу.',
    objective: 'Оглянути караванний пост і знайти, куди повели вантаж.',
    targetNodeId: 'caravan_post',
    reward: reward({ gold: 80, xp: 170, reputation: { guild: 2 } }),
    worldChangesOnComplete: worldChange({ addFlags: ['mq05_caravan_found'], unlockTowns: ['port'] }),
    nextQuestIds: ['mq_06_black_tide'],
  },
  {
    id: 'mq_06_black_tide',
    type: QUEST_TYPES.MAIN,
    act: 2,
    title: 'Чорна хвиля',
    townId: 'port',
    regionId: 'coastline_reaches',
    recommendedLevel: [5, 7],
    prerequisites: ['mq_05_broken_caravan'],
    summary: 'Сліди з каравану ведуть у порт, де заражений вантаж уже псує воду і людей.',
    objective: 'Дістатись до порту і знайти джерело зараженого вантажу.',
    targetNodeId: 'port',
    reward: reward({ gold: 95, xp: 210, reputation: { guild: 1, church: 1 } }),
    worldChangesOnComplete: worldChange({ addFlags: ['mq06_port_contact'], unlockRegions: ['coastline_reaches', 'eastern_passes'] }),
    nextQuestIds: ['rq_signal_fire', 'tq_zavodske_night_alarm'],
  },

  {
    id: 'rq_signal_fire',
    type: QUEST_TYPES.REGION,
    title: 'Сигнальний вогонь',
    townId: 'south_outpost',
    regionId: 'eastern_passes',
    recommendedLevel: [5, 7],
    prerequisites: ['mq_06_black_tide'],
    summary: 'Варта на східній башті мовчить. Якщо вогонь не запалити, шлях у передгір’я буде втрачено.',
    objective: 'Дістатись до Східної башти і відновити сигнальний вогонь.',
    targetNodeId: 'east_watchtower',
    reward: reward({ gold: 90, xp: 180, reputation: { crown: 2 } }),
    worldChangesOnComplete: worldChange({ addFlags: ['rq_signal_fire_done'] }),
    nextQuestIds: [],
  },
  {
    id: 'rq_alpha_beast',
    type: QUEST_TYPES.REGION,
    title: 'Лігво звіра',
    townId: 'hunter_hamlet',
    regionId: 'western_wildwoods',
    recommendedLevel: [3, 5],
    prerequisites: ['mq_01_shadows_on_the_road'],
    summary: 'Мисливці просять вирізати звіра, який жене з лісу всіх живих.',
    objective: 'Дістатись до лігва звіра і зачистити місце.',
    targetNodeId: 'beast_den',
    reward: reward({ gold: 48, xp: 105 }),
    worldChangesOnComplete: worldChange({ addFlags: ['rq_alpha_beast_done'], unlockTowns: ['hunter_hamlet'] }),
    nextQuestIds: [],
  },

  {
    id: 'tq_zavodske_night_alarm',
    type: QUEST_TYPES.TOWN,
    title: 'Нічний дзвін',
    townId: 'main_city',
    regionId: 'trade_marches',
    recommendedLevel: [4, 6],
    prerequisites: ['mq_06_black_tide'],
    summary: 'Уночі хтось нишпорить біля складів. Варта просить перевірити караванний шлях.',
    objective: 'Оглянути караванний пост після тривоги.',
    targetNodeId: 'caravan_post',
    reward: reward({ gold: 32, xp: 75, reputation: { crown: 1 } }),
    worldChangesOnComplete: worldChange({ addFlags: ['tq_city_alarm_done'] }),
    nextQuestIds: [],
  },
  {
    id: 'tq_start_missing_child',
    type: QUEST_TYPES.TOWN,
    title: 'Зникла дитина',
    townId: 'start_village',
    regionId: 'starter_lowlands',
    recommendedLevel: [1, 2],
    prerequisites: [],
    summary: 'Дитина з села побігла за мисливською стежкою і не повернулась.',
    objective: 'Обстежити Вовчий бір і повернутись із відповіддю.',
    targetNodeId: 'wolf_woods',
    reward: reward({ gold: 18, xp: 50 }),
    worldChangesOnComplete: worldChange({ addFlags: ['tq_child_found'] }),
    nextQuestIds: [],
  },
  {
    id: 'tq_harbor_missing_captain',
    type: QUEST_TYPES.TOWN,
    title: 'Зниклий капітан',
    townId: 'port',
    regionId: 'coastline_reaches',
    recommendedLevel: [6, 8],
    prerequisites: ['mq_06_black_tide'],
    summary: 'Капітан сторожового човна зник біля маяка після нічного патруля.',
    objective: 'Дістатись до маяка і з’ясувати долю капітана.',
    targetNodeId: 'lighthouse',
    reward: reward({ gold: 68, xp: 120, reputation: { guild: 1 } }),
    worldChangesOnComplete: worldChange({ addFlags: ['tq_captain_found'] }),
    nextQuestIds: [],
  },

  {
    id: 'pq_sergo_old_debt',
    type: QUEST_TYPES.PERSONAL,
    title: 'Старий борг',
    heroId: 'sergo',
    townId: 'south_outpost',
    regionId: 'southern_greenbelt',
    recommendedLevel: [3, 5],
    prerequisites: ['mq_02_silent_outpost'],
    summary: 'Серго має незакритий борг перед гарнізоном і не хоче більше тікати від нього.',
    objective: 'Повернутись у Південний форпост і поговорити з вартовими.',
    targetNodeId: 'south_outpost',
    reward: reward({ gold: 40, xp: 90, reputation: { crown: 2 } }),
    worldChangesOnComplete: worldChange({ addFlags: ['pq_sergo_stage1_done'] }),
    nextQuestIds: [],
  },
];

export const STORY_ARCS = {
  act1: {
    id: 'act1',
    name: 'Тривога на околицях',
    questIds: ['mq_01_shadows_on_the_road', 'mq_02_silent_outpost', 'mq_03_black_ash'],
  },
  act2: {
    id: 'act2',
    name: 'Міста і перші печаті',
    questIds: ['mq_04_archive_of_the_gate', 'mq_05_broken_caravan', 'mq_06_black_tide'],
  },
};

export const INITIAL_WORLD_STATE = {
  flags: ['story_act1_started'],
  unlockedRegions: ['starter_lowlands', 'southern_greenbelt'],
  unlockedTowns: ['start_village', 'south_outpost'],
  reputation: {
    crown: 0,
    church: 0,
    guild: 0,
    archive: 0,
  },
  activeQuestIds: ['mq_01_shadows_on_the_road'],
  completedQuestIds: [],
  failedQuestIds: [],
};

export function makeStoryState(state = INITIAL_WORLD_STATE) {
  return structuredClone(state);
}

export function getQuestById(id) {
  return QUESTS.find((quest) => quest.id === id) || null;
}

export function getActiveStoryQuests(worldState) {
  return (worldState?.activeQuestIds || [])
    .map((questId) => getQuestById(questId))
    .filter(Boolean);
}

export function hasCompletedQuest(worldState, questId) {
  return Boolean(worldState?.completedQuestIds?.includes(questId));
}

export function hasFlag(worldState, flag) {
  return Boolean(worldState?.flags?.includes(flag));
}

export function isQuestUnlocked(quest, worldState, heroLevel = 1) {
  if (!quest || !worldState) return false;
  if ((worldState.completedQuestIds || []).includes(quest.id)) return false;
  if ((worldState.failedQuestIds || []).includes(quest.id)) return false;
  if ((worldState.activeQuestIds || []).includes(quest.id)) return false;
  if (quest.recommendedLevel && heroLevel < quest.recommendedLevel[0]) return false;
  return (quest.prerequisites || []).every((req) => hasCompletedQuest(worldState, req) || hasFlag(worldState, req));
}

export function listAvailableQuests(worldState, heroLevel = 1, filters = {}) {
  return QUESTS.filter((quest) => {
    if (!isQuestUnlocked(quest, worldState, heroLevel)) return false;
    if (filters.type && quest.type !== filters.type) return false;
    if (filters.regionId && quest.regionId !== filters.regionId) return false;
    if (filters.townId && quest.townId !== filters.townId) return false;
    if (filters.heroIds?.length && quest.heroId && !filters.heroIds.includes(quest.heroId)) return false;
    return true;
  });
}

export function getTownQuestBoard(townId, worldState, heroLevel = 1, heroIds = []) {
  return listAvailableQuests(worldState, heroLevel, { townId, heroIds });
}

export function getMainQuestLog(worldState, heroLevel = 1) {
  return listAvailableQuests(worldState, heroLevel, { type: QUEST_TYPES.MAIN });
}

export function getPersonalQuests(heroIds, worldState, heroLevel = 1) {
  return listAvailableQuests(worldState, heroLevel, { heroIds });
}

export function acceptQuest(worldState, questId) {
  if (!worldState.activeQuestIds.includes(questId)) {
    worldState.activeQuestIds.push(questId);
  }
  return worldState;
}

export function applyWorldChanges(worldState, changes = {}) {
  for (const flag of changes.addFlags || []) {
    if (!worldState.flags.includes(flag)) worldState.flags.push(flag);
  }
  for (const regionId of changes.unlockRegions || []) {
    if (!worldState.unlockedRegions.includes(regionId)) worldState.unlockedRegions.push(regionId);
  }
  for (const townId of changes.unlockTowns || []) {
    if (!worldState.unlockedTowns.includes(townId)) worldState.unlockedTowns.push(townId);
  }
  return worldState;
}

export function applyReputation(worldState, rewardData = {}) {
  for (const [factionId, amount] of Object.entries(rewardData.reputation || {})) {
    worldState.reputation[factionId] = (worldState.reputation[factionId] || 0) + amount;
  }
  return worldState;
}

export function completeQuest(worldState, questId) {
  const quest = getQuestById(questId);
  if (!quest) return null;

  worldState.activeQuestIds = worldState.activeQuestIds.filter((id) => id !== questId);
  if (!worldState.completedQuestIds.includes(questId)) {
    worldState.completedQuestIds.push(questId);
  }

  applyReputation(worldState, quest.reward);
  applyWorldChanges(worldState, quest.worldChangesOnComplete);

  for (const nextQuestId of quest.nextQuestIds || []) {
    const nextQuest = getQuestById(nextQuestId);
    if (!nextQuest) continue;
    if (nextQuest.type === QUEST_TYPES.MAIN && isQuestUnlocked(nextQuest, worldState, 99)) {
      acceptQuest(worldState, nextQuestId);
    }
  }

  return quest;
}

export function getPrimaryStoryQuest(worldState) {
  const active = getActiveStoryQuests(worldState);
  return active.find((quest) => quest.type === QUEST_TYPES.MAIN)
    || active.find((quest) => quest.type === QUEST_TYPES.REGION)
    || active[0]
    || null;
}
