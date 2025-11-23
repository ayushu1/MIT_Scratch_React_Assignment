/**
 * Block Definitions
 * 
 * Single canonical source of truth for all block types.
 * Used by Sidebar (for display), MidArea (for editing), and animation engine (for execution).
 * 
 * Each block definition contains:
 * - type: Unique identifier for the block
 * - label: Display text with "__" placeholders for parameters
 * - color: Tailwind CSS color class for visual categorization
 * - params: Default parameter values
 */

export const BLOCK_DEFINITIONS = {
  MOVE_STEPS: {
    type: "MOVE_STEPS",
    label: "Move __ steps",
    color: "bg-blue-500",
    params: { value: 10 },
  },

  TURN_RIGHT: {
    type: "TURN_RIGHT",
    label: "Turn __ degrees",
    color: "bg-blue-500",
    params: { value: 15 },
  },

  // TURN_LEFT: {
  //   type: "TURN_LEFT",
  //   label: "Turn __ degrees",
  //   color: "bg-blue-500",
  //   params: { value: -15 },
  // },

  GOTO_XY: {
    type: "GOTO_XY",
    label: "Go to x: __ y: __",
    color: "bg-blue-500",
    params: { x: 0, y: 0 },
  },

  REPEAT: {
    type: "REPEAT",
    label: "Repeat __ times",
    color: "bg-yellow-500",
    params: { count: 3 },
  },

  SAY_FOR_SECONDS: {
    type: "SAY_FOR_SECONDS",
    label: "Say __ for __ seconds",
    color: "bg-purple-500",
    params: { text: "Hello!", seconds: 2 },
  },

  THINK_FOR_SECONDS: {
    type: "THINK_FOR_SECONDS",
    label: "Think __ for __ seconds",
    color: "bg-purple-500",
    params: { text: "Hmm...", seconds: 2 },
  },
};
