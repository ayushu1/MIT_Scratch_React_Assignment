// animationEngine: runs blocks for a sprite using updateSprite/getSpriteState callbacks
export async function runSpriteBlocks(sprite, updateSprite, getSpriteState, checkCollisionsCallback) {
  // runs blocks in order (doesn't block others)
  const blocks = sprite.blocks || [];

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    switch (b.type) {
      case "MOVE_STEPS":
        await handleMoveSteps(sprite, b, updateSprite, getSpriteState, checkCollisionsCallback);
        break;
      case "TURN_RIGHT":
      case "TURN_LEFT":
        await handleTurn(sprite, b, updateSprite);
        break;
      case "GOTO_XY":
        await handleGoto(sprite, b, updateSprite);
        break;
      case "SAY_FOR_SECONDS":
        await handleSay(sprite, b, updateSprite);
        break;
      case "THINK_FOR_SECONDS":
        await handleThink(sprite, b, updateSprite);
        break;
      case "REPEAT":
        await handleRepeat(sprite, b, updateSprite, getSpriteState, checkCollisionsCallback);
        break;
      default:
        break;
    }
  }
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function handleMoveSteps(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback) {
  const steps = Number(block.params.value) || 10;
  const SPEED = 5; // <--- SUPER IMPORTANT ADD THIS

  for (let i = 0; i < steps; i++) {
    const current = getSpriteState(sprite.id);

    const rad = (current.angle || 0) * (Math.PI / 180);
    const dx = Math.cos(rad) * SPEED;
    const dy = Math.sin(rad) * SPEED;

    updateSprite(sprite.id, { x: current.x + dx, y: current.y + dy });

    if (checkCollisionsCallback) checkCollisionsCallback();

    await wait(35);
  }
}



async function handleTurn(sprite, block, updateSprite) {
  const deg = Number(block.params.value) || 15;
  const newAngle = (sprite.angle || 0) + deg;
  updateSprite(sprite.id, { angle: newAngle });
  await wait(80);
}

async function handleGoto(sprite, block, updateSprite) {
  const x = Number(block.params.x) || 0;
  const y = Number(block.params.y) || 0;
  updateSprite(sprite.id, { x, y });
  await wait(120);
}

async function handleSay(sprite, block, updateSprite) {
  const text = block.params.text || "";
  const seconds = Number(block.params.seconds) || 1;
  updateSprite(sprite.id, { bubble: text });
  await wait(seconds * 1000);
  updateSprite(sprite.id, { bubble: "" });
}

async function handleThink(sprite, block, updateSprite) {
  const text = block.params.text || "";
  const seconds = Number(block.params.seconds) || 1;
  updateSprite(sprite.id, { bubble: "💭 " + text });
  await wait(seconds * 1000);
  updateSprite(sprite.id, { bubble: "" });
}

async function handleRepeat(sprite, block, updateSprite, getSpriteState, checkCollisionsCallback) {
  const count = Number(block.params.count) || 1;
  // we assume nested blocks are simply stored in sprite.blocks with parentId equal to this block.id
  for (let i = 0; i < count; i++) {
    const nested = (sprite.blocks || []).filter((b) => b.parentId === block.id);
    for (const nb of nested) {
      // reuse handlers
      switch (nb.type) {
        case "MOVE_STEPS":
          await handleMoveSteps(sprite, nb, updateSprite, getSpriteState, checkCollisionsCallback);
          break;
        case "TURN_RIGHT":
        case "TURN_LEFT":
          await handleTurn(sprite, nb, updateSprite);
          break;
        case "GOTO_XY":
          await handleGoto(sprite, nb, updateSprite);
          break;
        case "SAY_FOR_SECONDS":
          await handleSay(sprite, nb, updateSprite);
          break;
        case "THINK_FOR_SECONDS":
          await handleThink(sprite, nb, updateSprite);
          break;
        default:
          break;
      }
    }
  }
}
