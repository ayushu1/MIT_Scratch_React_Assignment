import React, { useRef, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { AppProvider, useAppContext } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import { runSpriteBlocks } from "./engine/animationEngine";
import { checkAllCollisions } from "./engine/collisionEngine";
import { COLLISION } from "./constants";

function AppContent() {
  const {
    sprites,
    selectedSpriteId,
    selectedSprite,
    addSprite,
    updateSprite,
    getSpriteState,
    setSelectedSpriteId,
  } = useAppContext();

  const spritesRef = useRef(sprites);
  const collisionCooldownRef = useRef(new Map());
  const runningAnimationsRef = useRef(new Map());
  const animationControllersRef = useRef(new Map());
  const checkCollisionsRef = useRef(null);

  React.useEffect(() => {
    spritesRef.current = sprites;
  }, [sprites]);

  const updateSpriteWithRef = useCallback((spriteId, updates) => {
    spritesRef.current = spritesRef.current.map((s) =>
      s.id === spriteId ? { ...s, ...updates } : s
    );
    updateSprite(spriteId, updates);
  }, [updateSprite]);

  const getSpriteStateForEngine = useCallback(
    (id) => {
      return spritesRef.current.find((s) => s.id === id) || { x: 0, y: 0, angle: 0 };
    },
    []
  );

  const restartSpriteAnimation = useCallback(async (spriteId) => {
    const controller = animationControllersRef.current.get(spriteId);
    if (controller) {
      controller.abort();
    }

    await new Promise(resolve => setTimeout(resolve, 150));
    
    const sprite = spritesRef.current.find((s) => s.id === spriteId);
    if (!sprite || !sprite.blocks || sprite.blocks.length === 0) {
      return;
    }

    const newController = new AbortController();
    animationControllersRef.current.set(spriteId, newController);
    runningAnimationsRef.current.set(spriteId, true);

    try {
      await runSpriteBlocks(
        sprite,
        updateSpriteWithRef,
        getSpriteStateForEngine,
        checkCollisionsRef.current,
        newController.signal
      );
    } catch (error) {
      if (error.message !== 'Animation aborted' && error.name !== 'AbortError') {
        console.error('Animation error:', error);
      }
    } finally {
      animationControllersRef.current.delete(spriteId);
      runningAnimationsRef.current.delete(spriteId);
    }
  }, [updateSpriteWithRef, getSpriteStateForEngine]);

  const handleCollision = useCallback((spriteA, spriteB) => {
    const pairKey = [spriteA.id, spriteB.id].sort().join('-');
    
    if (collisionCooldownRef.current.get(pairKey)) return;

    collisionCooldownRef.current.set(pairKey, true);
    
    const spriteABlocks = spriteA.blocks.slice();
    const spriteBBlocks = spriteB.blocks.slice();
    
    updateSprite(spriteA.id, { blocks: spriteBBlocks });
    updateSprite(spriteB.id, { blocks: spriteABlocks });

    spritesRef.current = spritesRef.current.map((s) => {
      if (s.id === spriteA.id) return { ...s, blocks: spriteBBlocks };
      if (s.id === spriteB.id) return { ...s, blocks: spriteABlocks };
      return s;
    });

    setTimeout(() => {
      restartSpriteAnimation(spriteA.id);
      restartSpriteAnimation(spriteB.id);
    }, 100);

    setTimeout(() => {
      collisionCooldownRef.current.delete(pairKey);
    }, COLLISION.COOLDOWN_MS);
  }, [updateSprite, restartSpriteAnimation]);

  const checkCollisions = useCallback(() => {
    setTimeout(() => {
      const currentSprites = spritesRef.current;
      if (!currentSprites || currentSprites.length < 2) return;
      
      const collisions = checkAllCollisions(currentSprites);
      if (collisions.length > 0) {
        for (const { spriteA, spriteB } of collisions) {
          const pairKey = [spriteA.id, spriteB.id].sort().join('-');
          if (!collisionCooldownRef.current.get(pairKey)) {
            handleCollision(spriteA, spriteB);
            break;
          }
        }
      }
    }, 50);
  }, [handleCollision]);

  React.useEffect(() => {
    checkCollisionsRef.current = checkCollisions;
  }, [checkCollisions]);

  const runProgram = useCallback(async () => {
    animationControllersRef.current.forEach((controller) => controller.abort());
    animationControllersRef.current.clear();
    runningAnimationsRef.current.clear();
    collisionCooldownRef.current.clear();

    const runners = sprites.map(async (s) => {
      if (!s.blocks || s.blocks.length === 0) return;
      
      const controller = new AbortController();
      animationControllersRef.current.set(s.id, controller);
      runningAnimationsRef.current.set(s.id, true);

      try {
        await runSpriteBlocks(
          s,
          updateSpriteWithRef,
          getSpriteStateForEngine,
          checkCollisionsRef.current,
          controller.signal
        );
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Animation error:', error);
        }
      } finally {
        animationControllersRef.current.delete(s.id);
        runningAnimationsRef.current.delete(s.id);
      }
    });
    
    await Promise.all(runners.map((r) => r.catch(() => {})));
  }, [sprites, updateSpriteWithRef, getSpriteStateForEngine]);

  return (
    <div className="bg-blue-100 pt-6 font-sans h-screen">
      <div className="h-full flex flex-row overflow-hidden">
        <div className="flex-1 bg-white border-r border-gray-200 rounded-tr-xl mr-2 flex">
          <Sidebar />
          <MidArea />
        </div>

        <div className="w-1/3 bg-white border-l border-gray-200 rounded-tl-xl ml-2 flex flex-col">
          <div className="p-2 border-b flex items-center justify-between">
            <div className="font-bold">Preview</div>
            <div className="flex items-center gap-2">
              <button
                onClick={addSprite}
                className="px-3 py-1 rounded bg-green-500 text-white text-sm hover:bg-green-600 transition-colors"
              >
                + Add Sprite
              </button>
              <button
                onClick={runProgram}
                className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
              >
                Play
              </button>
            </div>
          </div>

          <div className="flex-1 p-2">
            <PreviewArea sprites={sprites} />
          </div>

          <div className="p-2 flex flex-row gap-2">
            {sprites.map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSelectedSpriteId(sp.id)}
                className={`px-3 py-1 cursor-pointer rounded transition-colors ${
                  selectedSpriteId === sp.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {sp.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </DndProvider>
  );
}