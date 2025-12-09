export const UI_CONFIG = {
  scale: 2,
  // scene control for developer convenience
  skipTitleScene: true,
  // semi-transparent red areas show dynamic extent of dropzones
  showDropZones: false,
  enableShadows: false,
} as const;

export const SCENE_KEYS = {
  PRELOAD: 'PRELOAD',
  TITLE: 'TITLE',
  GAME: 'GAME',
  MENU: 'MENU',
  SCORES: 'SCORES',
  CREDITS: 'CREDITS',
  HELP: 'HELP',
  SETTINGS: 'SETTINGS',
  CARD_BACK_SELECTOR: 'CARD_BACK_SELECTOR',
} as const;

export const ASSET_KEYS = {
  TITLE: 'TITLE',
  CLICK_TO_START: 'CLICK_TO_START',
  CARDS: 'CARDS',
  TABLE_BACKGROUND: 'TABLE_BACKGROUND',
  PARTICLE: 'PARTICLE',
  PLAY_MEDALLION: 'PLAY_MEDALLION',
} as const;

export const AUDIO_KEYS = {
  MUSIC_GAME: 'musicGame',
  DRAW_CARD: 'cardDraw',
  INVALID: 'invalid',
  ABANDON: 'abandon',
  EASY_MOVE: 'easyMove',
  FOUNDATION_ADD: 'foundationAdd',
  TABLEAU_ADD: 'tableauAdd',
  GAME_WIN: 'gameWin',
  PLACE_CARD: 'placeCard',
  SHUFFLE_DECK: 'shuffleDeck',
  REWIND: 'rewind',
  BUTTON_PRESS: 'buttonPress',
  FOUNDATION_PILE_COMPLETED: 'foundationPileCompleted',
  FOUNDATION_PILE_ADDED: 'foundationPileAdded'
};

export const MUSIC_VOLUME_BY_SCENE = {
  [SCENE_KEYS.GAME]: 0.2,
  [SCENE_KEYS.TITLE]: 0.3,
  [SCENE_KEYS.MENU]: 0.3,
  [SCENE_KEYS.SETTINGS]: 0.3,
  [SCENE_KEYS.SCORES]: 0.3,
  [SCENE_KEYS.CREDITS]: 0.3,
  [SCENE_KEYS.HELP]: 0.3,
} as const;

export const CARD_WIDTH = 56 * UI_CONFIG.scale;
export const CARD_HEIGHT = 78 * UI_CONFIG.scale;

export const GAME_WIDTH = 640 * UI_CONFIG.scale;
export const GAME_HEIGHT = 480 * UI_CONFIG.scale;
export const STACK_Y_GAP = 28 * UI_CONFIG.scale;

export const CARD_BACK_OPTIONS = {
  BLANK_1: { frame: 54, name: 'blank-1' },
  BIRDS: { frame: 55, name: 'birds' },
  FEATHERS: { frame: 56, name: 'feathers' },
} as const;

export const DEFAULT_CARD_BACK_FRAME = 55;
