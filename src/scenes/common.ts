export const UI_CONFIG = {
  scale: 2,
  // scene control for developer convenience
  skipTitleScene: true,
  // partly transparent red areas show extent of dropzones
  showDropZones: true,
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
  CARD_BACK_SELECTOR: 'CARD_BACK_SELECTOR',
} as const;

export const ASSET_KEYS = {
  TITLE: 'TITLE',
  CLICK_TO_START: 'CLICK_TO_START',
  CARDS: 'CARDS',
  TABLE_BACKGROUND: 'TABLE_BACKGROUND',
  PARTICLE: 'PARTICLE',
} as const;

export const AUDIO_KEYS = {
  DRAW_CARD: 'cardDraw',
  INVALID: 'invalid',
  FOUNDATION_ADD: 'foundationAdd',
  TABLEAU_ADD: 'tableauAdd',
  GAME_WIN: 'gameWin',
  PLACE_CARD: 'placeCard',
  SHUFFLE_DECK: 'shuffleDeck',
  BUTTON_PRESS: 'buttonPress',
  FOUNDATION_PILE_COMPLETED: 'foundationPileCompleted',
  FOUNDATION_PILE_ADDED: 'foundationPileAdded'
};

export const CARD_WIDTH = 56 * UI_CONFIG.scale;
export const CARD_HEIGHT = 78 * UI_CONFIG.scale;

export const GAME_WIDTH = 640 * UI_CONFIG.scale;
export const GAME_HEIGHT = 480 * UI_CONFIG.scale;

export const CARD_BACK_OPTIONS = {
  BLANK_1: { frame: 54, name: 'blank-1' },
  BLANK_2: { frame: 55, name: 'blank-2' },
  FEATHERS: { frame: 56, name: 'feathers' },
} as const;

export const DEFAULT_CARD_BACK_FRAME = 56;
