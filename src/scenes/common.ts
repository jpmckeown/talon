export const UI_CONFIG = {
  // scene control for developer convenience
  skipTitleScene: true,
  // partly transparent red areas show extent of dropzones
  showDropZones: true,
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
} as const;

export const AUDIO_KEYS = {
  DRAW_CARD: 'cardDraw',
  INVALID: 'invalid',
  FOUNDATION_ADD: 'foundationAdd',
  TABLEAU_ADD: 'tableauAdd',
  GAME_WIN: 'gameWin',
};

export const CARD_WIDTH = 56;
export const CARD_HEIGHT = 78;
