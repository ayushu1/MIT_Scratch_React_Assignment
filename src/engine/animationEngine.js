// animationEngine: runs blocks for a sprite using updateSprite/getSpriteState callbacks
export async function runSpriteBlocks(sprite, updateSprite, getSpriteState, checkCollisionsCallback) {
  const blocks = sprite.blocks || [];

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];

    // SKIP nested blocks so they only run inside Repeat
    if (b.parentId) continue;

    switch (b.type) {
      case "MOVE_STEPS":
        await handleMoveSteps(sprite, b, updateSprite, getSpriteState);
        break;
      case "TURN_RIGHT":
      case "TURN_LEFT":
        await handleTurn(sprite, b, updateSprite, getSpriteState);
        break;
      case "GOTO_XY":
        await handleGoto(sprite, b, updateSprite, getSpriteState);
        break;
      case "SAY_FOR_SECONDS":
        await handleSay(sprite, b, updateSprite, getSpriteState);
        break;
      case "THINK_FOR_SECONDS":
        await handleThink(sprite, b, updateSprite, getSpriteState);
        break;
      case "REPEAT":
        await handleRepeat(sprite, b, updateSprite, getSpriteState);
        break;
      default:
        break;
    }
  }
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function handleMoveSteps(sprite, block, updateSprite, getSpriteState) {
  const steps = Number(block.params.steps) || Number(block.params.value) || 0;
  
  const currentSprite = getSpriteState(sprite.id);
  const angleRad = (currentSprite.angle * Math.PI) / 180;

  const dx = Math.cos(angleRad) * steps;
  const dy = Math.sin(angleRad) * steps;


  updateSprite(sprite.id, {
    x: currentSprite.x + dx,
    y: currentSprite.y + dy,
  });

  await wait(150);
}

async function handleTurn(sprite, block, updateSprite, getSpriteState) {
  const deg = Number(block.params.value) || Number(block.params.degrees) || 15;
  const currentSprite = getSpriteState(sprite.id);
  
  // Check if it's a left turn (should be negative)
  const turnAmount = block.type === "TURN_LEFT" ? -deg : deg;
  const newAngle = (currentSprite.angle || 0) + turnAmount;
  
  
  updateSprite(sprite.id, { angle: newAngle });
  await wait(200); // Increased wait time to see the rotation
}

async function handleGoto(sprite, block, updateSprite, getSpriteState) {
  const x = Number(block.params.x) || 0;
  const y = Number(block.params.y) || 0;
  updateSprite(sprite.id, { x, y });
  await wait(120);
}

async function handleSay(sprite, block, updateSprite, getSpriteState) {
  const text = block.params.text || "";
  const seconds = Number(block.params.seconds) || 1;
  
  
  updateSprite(sprite.id, { bubble: text });
  await wait(seconds * 1000);
  updateSprite(sprite.id, { bubble: "" });
}

async function handleThink(sprite, block, updateSprite, getSpriteState) {
  const text = block.params.text || "";
  const seconds = Number(block.params.seconds) || 1;
  
  
  updateSprite(sprite.id, { bubble: "💭 " + text });
  await wait(seconds * 1000);
  updateSprite(sprite.id, { bubble: "" });
}

async function handleRepeat(sprite, block, updateSprite, getSpriteState) {
  const count = Number(block.params.count) || 1;

  for (let i = 0; i < count; i++) {

    // Get fresh sprite state at the start of each iteration
    let currentSprite = getSpriteState(sprite.id);
    const nested = (currentSprite.blocks || []).filter(c => c.parentId === block.id);
    

    for (const nb of nested) {
      // Always get fresh state before executing each nested block
      currentSprite = getSpriteState(sprite.id);


      switch (nb.type) {
        case "MOVE_STEPS":
          await handleMoveSteps(currentSprite, nb, updateSprite, getSpriteState);
          break;
        case "TURN_RIGHT":
        case "TURN_LEFT":
          await handleTurn(currentSprite, nb, updateSprite, getSpriteState);
          break;
        case "GOTO_XY":
          await handleGoto(currentSprite, nb, updateSprite, getSpriteState);
          break;
        case "SAY_FOR_SECONDS":
          await handleSay(currentSprite, nb, updateSprite, getSpriteState);
          break;
        case "THINK_FOR_SECONDS":
          await handleThink(currentSprite, nb, updateSprite, getSpriteState);
          break;
        case "REPEAT":
          await handleRepeat(currentSprite, nb, updateSprite, getSpriteState);
          break;
        default:
          break;
      }
    }
  }
}