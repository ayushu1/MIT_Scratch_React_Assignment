import { COLLISION } from "../constants";

export function checkCollision(spriteA, spriteB) {
  if (spriteA.id === spriteB.id) {
    return false;
  }

  const Ax = spriteA.x * COLLISION.SCALE;
  const Ay = spriteA.y * COLLISION.SCALE;
  const Bx = spriteB.x * COLLISION.SCALE;
  const By = spriteB.y * COLLISION.SCALE;

  const A_left = Ax - COLLISION.SPRITE_WIDTH / 2;
  const A_right = Ax + COLLISION.SPRITE_WIDTH / 2;
  const A_top = Ay - COLLISION.SPRITE_HEIGHT / 2;
  const A_bottom = Ay + COLLISION.SPRITE_HEIGHT / 2;

  const B_left = Bx - COLLISION.SPRITE_WIDTH / 2;
  const B_right = Bx + COLLISION.SPRITE_WIDTH / 2;
  const B_top = By - COLLISION.SPRITE_HEIGHT / 2;
  const B_bottom = By + COLLISION.SPRITE_HEIGHT / 2;

  if (A_right < B_left || A_left > B_right) return false;
  if (A_bottom < B_top || A_top > B_bottom) return false;

  return true;
}

export function checkAllCollisions(sprites) {
  const collisions = [];
  const spriteCount = sprites.length;

  for (let i = 0; i < spriteCount; i++) {
    for (let j = i + 1; j < spriteCount; j++) {
      if (checkCollision(sprites[i], sprites[j])) {
        collisions.push({ spriteA: sprites[i], spriteB: sprites[j] });
      }
    }
  }

  return collisions;
}

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
