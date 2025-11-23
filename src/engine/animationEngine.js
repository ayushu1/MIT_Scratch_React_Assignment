import { ANIMATION_DELAYS } from "../constants";

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

async function executeBlock(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  if (signal?.aborted) {
    throw new Error('Animation aborted');
  }
  const handler = BLOCK_HANDLERS[block.type];
  if (handler) {
    await handler(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal);
  }
}

async function executeNestedBlocks(sprite, nestedBlocks, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  for (const block of nestedBlocks) {
    if (signal?.aborted) {
      throw new Error('Animation aborted');
    }
    const currentSprite = getSpriteState(sprite.id);
    await executeBlock(currentSprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal);
  }
}

export async function runSpriteBlocks(sprite, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const blocks = sprite.blocks || [];
  const topLevelBlocks = blocks.filter((b) => !b.parentId);

  for (const block of topLevelBlocks) {
    if (signal?.aborted) {
      throw new Error('Animation aborted');
    }
    await executeBlock(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal);
  }
}

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

  if (checkCollisionsCallback) {
    await wait(10, signal);
    checkCollisionsCallback();
  }

  await wait(ANIMATION_DELAYS.MOVE_STEPS, signal);
}

async function handleTurn(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const deg = Number(block.params?.value || block.params?.degrees || 15);
  const currentSprite = getSpriteState(sprite.id);
  const turnAmount = -deg;
  const newAngle = (currentSprite.angle || 0) + turnAmount;

  updateSprite(sprite.id, { angle: newAngle });
  await wait(ANIMATION_DELAYS.TURN, signal);
}

async function handleGoto(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const x = Number(block.params?.x || 0);
  const y = Number(block.params?.y || 0);
  updateSprite(sprite.id, { x, y });
  
  if (checkCollisionsCallback) {
    await wait(10, signal);
    checkCollisionsCallback();
  }
  
  await wait(ANIMATION_DELAYS.GOTO_XY, signal);
}

async function handleSay(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const text = block.params?.text || "";
  const seconds = Number(block.params?.seconds || 1);

  updateSprite(sprite.id, { bubble: text });
  await wait(seconds * 1000, signal);
  updateSprite(sprite.id, { bubble: "" });
}

async function handleThink(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback, signal) {
  const text = block.params?.text || "";
  const seconds = Number(block.params?.seconds || 1);

  updateSprite(sprite.id, { bubble: `💭 ${text}` });
  await wait(seconds * 1000, signal);
  updateSprite(sprite.id, { bubble: "" });
}

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

const BLOCK_HANDLERS = {
  MOVE_STEPS: handleMoveSteps,
  TURN_RIGHT: handleTurn,
  TURN_LEFT: handleTurn,
  GOTO_XY: handleGoto,
  SAY_FOR_SECONDS: handleSay,
  THINK_FOR_SECONDS: handleThink,
  REPEAT: handleRepeat,
};

export { executeBlock, BLOCK_HANDLERS };