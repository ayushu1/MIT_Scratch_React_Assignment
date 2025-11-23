/**
 * Application-wide constants
 */

// Animation timing constants (in milliseconds)
export const ANIMATION_DELAYS = {
  MOVE_STEPS: 150,
  TURN: 200,
  GOTO_XY: 120,
  DEFAULT: 100,
};

// Collision detection constants
export const COLLISION = {
  SPRITE_WIDTH: 80,
  SPRITE_HEIGHT: 80,
  SCALE: 5,
  COOLDOWN_MS: 1500, // Cooldown between collision swaps
};

// Preview/Stage constants
export const STAGE = {
  SCALE: 5,
  CENTER_X: 200,
  CENTER_Y: 160,
};

// Default sprite configuration
export const DEFAULT_SPRITE = {
  sprite: "cat",
  x: -20,
  y: 0,
  angle: 0,
  bubble: "",
  blocks: [],
  color: "#FFAB19",
};

