export const UI_CONFIG = {
  scale: 1,
  // scene control for developer convenience
  skipTitleScene: true,
  // partly transparent red areas show extent of dropzones
  showDropZones: false,
} as const;

export const SCENE_KEYS = {
  PRELOAD: 'PRELOAD',
  TITLE: 'TITLE',
  GAME: 'GAME',
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
};

export const CARD_WIDTH = 56 * UI_CONFIG.scale;
export const CARD_HEIGHT = 78 * UI_CONFIG.scale;

export const GAME_WIDTH = 640 * UI_CONFIG.scale;
export const GAME_HEIGHT = 480 * UI_CONFIG.scale;
