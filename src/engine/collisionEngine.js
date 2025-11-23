/**
 * Collision Engine
 * 
 * Handles collision detection between sprites using Axis-Aligned Bounding Box (AABB) algorithm.
 * Optimized with early exit conditions and debouncing support.
 */

import { COLLISION } from "../constants";

/**
 * Checks if two sprites are colliding using AABB collision detection
 * @param {Object} spriteA - First sprite with x, y coordinates
 * @param {Object} spriteB - Second sprite with x, y coordinates
 * @returns {boolean} True if sprites are colliding
 */
export function checkCollision(spriteA, spriteB) {
  // Early exit if sprites are the same
  if (spriteA.id === spriteB.id) {
    return false;
  }

  // Scale coordinates to match preview area scale
  const Ax = spriteA.x * COLLISION.SCALE;
  const Ay = spriteA.y * COLLISION.SCALE;
  const Bx = spriteB.x * COLLISION.SCALE;
  const By = spriteB.y * COLLISION.SCALE;

  // Calculate bounding boxes
  const A_left = Ax - COLLISION.SPRITE_WIDTH / 2;
  const A_right = Ax + COLLISION.SPRITE_WIDTH / 2;
  const A_top = Ay - COLLISION.SPRITE_HEIGHT / 2;
  const A_bottom = Ay + COLLISION.SPRITE_HEIGHT / 2;

  const B_left = Bx - COLLISION.SPRITE_WIDTH / 2;
  const B_right = Bx + COLLISION.SPRITE_WIDTH / 2;
  const B_top = By - COLLISION.SPRITE_HEIGHT / 2;
  const B_bottom = By + COLLISION.SPRITE_HEIGHT / 2;

  // AABB collision check with early exit optimizations
  // Sprites don't collide if one is completely to the left, right, above, or below the other
  if (A_right < B_left || A_left > B_right) return false;
  if (A_bottom < B_top || A_top > B_bottom) return false;

  return true;
}

/**
 * Checks all sprite pairs for collisions
 * @param {Array<Object>} sprites - Array of sprite objects
 * @returns {Array<{spriteA: Object, spriteB: Object}>} Array of collision pairs
 */
export function checkAllCollisions(sprites) {
  const collisions = [];
  const spriteCount = sprites.length;

  // Only check unique pairs (i < j) to avoid duplicate checks
  for (let i = 0; i < spriteCount; i++) {
    for (let j = i + 1; j < spriteCount; j++) {
      if (checkCollision(sprites[i], sprites[j])) {
        collisions.push({ spriteA: sprites[i], spriteB: sprites[j] });
      }
    }
  }

  return collisions;
}

/**
 * Creates a debounced collision checker
 * @param {Function} callback - Function to call with collision results
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced collision checker function
 */
export function createDebouncedCollisionChecker(callback, delay = 100) {
  let timeoutId = null;

  return (sprites) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const collisions = checkAllCollisions(sprites);
      callback(collisions);
      timeoutId = null;
    }, delay);
  };
}
