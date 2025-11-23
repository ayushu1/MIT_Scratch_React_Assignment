/**
 * Animation Engine
 * 
 * Executes block-based animations for sprites in a Scratch-like visual programming environment.
 * Uses functional programming principles with pure block handlers and a unified execution system.
 */

import { ANIMATION_DELAYS } from "../constants";

/**
 * Utility function to create a delay promise
 * @param {number} ms - Milliseconds to wait
 * @param {AbortSignal} signal - Optional abort signal
 * @returns {Promise<void>}
 */
const wait = (ms, signal) => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Animation aborted'));
      return;
    }
    const timeoutId = setTimeout(() => {
      if (signal?.aborted) {
        reject(new Error('Animation aborted'));
      } else {
        resolve();
      }
    }, ms);
    
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Animation aborted'));
      });
    }
  });
};

/**
 * Executes a single block for a sprite
 * @param {Object} sprite - Current sprite state
 * @param {Object} block - Block to execute
 * @param {Function} updateSprite - Callback to update sprite state
 * @param {Function} getSpriteState - Callback to get current sprite state
 * @param {Function} checkCollisionsCallback - Optional collision check callback
 * @param {AbortSignal} signal - Optional abort signal
 * @returns {Promise<void>}
 */
async function executeBlock(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  if (signal?.aborted) {
    throw new Error('Animation aborted');
  }
  const handler = BLOCK_HANDLERS[block.type];
  if (handler) {
    await handler(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal);
  }
}

/**
 * Executes nested blocks within a parent block (e.g., REPEAT)
 * @param {Object} sprite - Current sprite state
 * @param {Array<Object>} nestedBlocks - Blocks to execute
 * @param {Function} updateSprite - Callback to update sprite state
 * @param {Function} getSpriteState - Callback to get current sprite state
 * @param {Function} checkCollisionsCallback - Optional collision check callback
 * @param {AbortSignal} signal - Optional abort signal
 * @returns {Promise<void>}
 */
async function executeNestedBlocks(sprite, nestedBlocks, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  for (const block of nestedBlocks) {
    if (signal?.aborted) {
      throw new Error('Animation aborted');
    }
    const currentSprite = getSpriteState(sprite.id);
    await executeBlock(currentSprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal);
  }
}

/**
 * Main function to run all blocks for a sprite
 * @param {Object} sprite - Sprite with blocks to execute
 * @param {Function} updateSprite - Callback to update sprite state
 * @param {Function} getSpriteState - Callback to get current sprite state
 * @param {Function} checkCollisionsCallback - Optional collision check callback
 * @param {AbortSignal} signal - Optional abort signal to cancel animation
 * @returns {Promise<void>}
 */
export async function runSpriteBlocks(sprite, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const blocks = sprite.blocks || [];
  const topLevelBlocks = blocks.filter((b) => !b.parentId);

  for (const block of topLevelBlocks) {
    // Check if animation was cancelled
    if (signal?.aborted) {
      throw new Error('Animation aborted');
    }
    await executeBlock(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal);
  }
}

/**
 * Handles MOVE_STEPS block - moves sprite forward by specified steps
 */
async function handleMoveSteps(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const steps = Number(block.params?.steps || block.params?.value || 0);
  const currentSprite = getSpriteState(sprite.id);
  const angleRad = (currentSprite.angle * Math.PI) / 180;

  const dx = Math.cos(angleRad) * steps;
  const dy = Math.sin(angleRad) * steps;

  updateSprite(sprite.id, {
    x: currentSprite.x + dx,
    y: currentSprite.y + dy,
  });

  // Check for collisions after movement
  if (checkCollisionsCallback) {
    await wait(10, signal); // Small delay to ensure state is updated
    checkCollisionsCallback();
  }

  await wait(ANIMATION_DELAYS.MOVE_STEPS, signal);
}

/**
 * Handles TURN_RIGHT block - rotates sprite by specified degrees
 */
async function handleTurn(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const deg = Number(block.params?.value || block.params?.degrees || 15);
  const currentSprite = getSpriteState(sprite.id);
  const turnAmount = -deg;
  const newAngle = (currentSprite.angle || 0) + turnAmount;

  updateSprite(sprite.id, { angle: newAngle });
  await wait(ANIMATION_DELAYS.TURN, signal);
}

/**
 * Handles GOTO_XY block - moves sprite to specific coordinates
 */
async function handleGoto(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const x = Number(block.params?.x || 0);
  const y = Number(block.params?.y || 0);
  updateSprite(sprite.id, { x, y });
  
  // Check for collisions after movement
  if (checkCollisionsCallback) {
    await wait(10, signal); // Small delay to ensure state is updated
    checkCollisionsCallback();
  }
  
  await wait(ANIMATION_DELAYS.GOTO_XY, signal);
}

/**
 * Handles SAY_FOR_SECONDS block - displays speech bubble
 */
async function handleSay(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const text = block.params?.text || "";
  const seconds = Number(block.params?.seconds || 1);

  updateSprite(sprite.id, { bubble: text });
  await wait(seconds * 1000, signal);
  updateSprite(sprite.id, { bubble: "" });
}

/**
 * Handles THINK_FOR_SECONDS block - displays thought bubble
 */
async function handleThink(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const text = block.params?.text || "";
  const seconds = Number(block.params?.seconds || 1);

  updateSprite(sprite.id, { bubble: `💭 ${text}` });
  await wait(seconds * 1000, signal);
  updateSprite(sprite.id, { bubble: "" });
}

/**
 * Handles REPEAT block - executes nested blocks multiple times
 * Fixed: Changed from `i <= count` to `i < count` to execute correct number of times
 */
async function handleRepeat(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const count = Number(block.params?.count || 1);

  for (let i = 0; i < count; i++) {
    if (signal?.aborted) {
      throw new Error('Animation aborted');
    }
    const currentSprite = getSpriteState(sprite.id);
    const nestedBlocks = (currentSprite.blocks || []).filter(
      (b) => b.parentId === block.id
    );

    await executeNestedBlocks(currentSprite, nestedBlocks, updateSprite, getSpriteState, checkCollisionsCallback, signal);
  }
}

/**
 * Block handler registry - maps block types to their handlers
 * This eliminates code duplication and makes it easy to add new block types
 */
const BLOCK_HANDLERS = {
  MOVE_STEPS: handleMoveSteps,
  TURN_RIGHT: handleTurn,
  TURN_LEFT: handleTurn, // Same handler, direction handled by sign
  GOTO_XY: handleGoto,
  SAY_FOR_SECONDS: handleSay,
  THINK_FOR_SECONDS: handleThink,
  REPEAT: handleRepeat,
};

// Export handlers for testing/debugging if needed
export { executeBlock, BLOCK_HANDLERS };