export const GAME_STATES = Object.freeze({
  MAIN_MENU: 'MAIN_MENU',
  NEW_RUN_SETUP: 'NEW_RUN_SETUP',
  WORLD_MAP: 'WORLD_MAP',
  MOVEMENT: 'MOVEMENT',
  COMBAT: 'COMBAT',
  EVENT: 'EVENT',
  TOWN: 'TOWN',
  SHOP: 'SHOP',
  INN: 'INN',
  BLACKSMITH: 'BLACKSMITH',
  QUEST_BOARD: 'QUEST_BOARD',
  LEVEL_UP: 'LEVEL_UP',
  INVENTORY: 'INVENTORY',
  CHARACTER_SHEET: 'CHARACTER_SHEET',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
});

export function mapTownSectionToState(sectionId) {
  switch (sectionId) {
    case 'market':
      return GAME_STATES.SHOP;
    case 'contracts':
      return GAME_STATES.QUEST_BOARD;
    case 'inn':
      return GAME_STATES.INN;
    case 'trainer':
      return GAME_STATES.LEVEL_UP;
    case 'forge':
    case 'pipesmith':
      return GAME_STATES.BLACKSMITH;
    default:
      return GAME_STATES.TOWN;
  }
}
