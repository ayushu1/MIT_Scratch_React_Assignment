import React, { useState, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { nanoid } from "nanoid";

import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";

import { runSpriteBlocks } from "./engine/animationEngine";
import { checkCollision } from "./engine/collisionEngine";

export default function App() {
  const [sprites, setSprites] = useState([
    {
      id: "sprite1",
      name: "Sprite 1",
      sprite: "cat",
      x: -20,
      y: 0,
      angle: 0,
      bubble: "",
      blocks: [],
        color: "#FFAB19", 
    },
  ]);

  const [selectedSpriteId, setSelectedSpriteId] = useState(sprites[0].id);
  const collisionCooldownRef = useRef(false);
  
  const spritesRef = useRef(sprites);
  
  React.useEffect(() => {
    spritesRef.current = sprites;
  }, [sprites]);

  function getSpriteState(id) {
    return spritesRef.current.find((s) => s.id === id) || { x: 0, y: 0, angle: 0 };
  }

  function updateSprite(id, updates) {
    setSprites((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      checkForCollisions(next);
      return next;
    });
  }

  function checkForCollisions(list) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const A = list[i],
          B = list[j];
        if (checkCollision(A, B)) {
          handleCollision(A, B);
        }
      }
    }
  }

  function handleCollision(A, B) {
    if (collisionCooldownRef.current) return;
    collisionCooldownRef.current = true;

    setSprites((prev) =>
      prev.map((s) => {
        if (s.id === A.id) return { ...s, blocks: B.blocks.slice() };
        if (s.id === B.id) return { ...s, blocks: A.blocks.slice() };
        return s;
      })
    );

    setTimeout(() => {
      collisionCooldownRef.current = false;
    }, 1500);
  }

  function addSprite() {
  const id = nanoid();
  
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.random() * 30; 
  const lightness = 55 + Math.random() * 20; 
  const randomColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  setSprites((prev) => [
    ...prev,
    {
      id,
      name: `Sprite ${prev.length + 1}`,
      sprite: "cat",
      x: prev.length * 20,
      y: 0,
      angle: 0,
      bubble: "",
      blocks: [],
      color: randomColor,
    },
  ]);

  setSelectedSpriteId(id);
}

  async function runProgram() {
    const runners = sprites.map((s) =>
      runSpriteBlocks(s, updateSprite, getSpriteState, () =>
        checkForCollisions(sprites)
      )
    );
    await Promise.all(runners.map((r) => r.catch(() => {})));
  }

  const selectedSprite =
    sprites.find((s) => s.id === selectedSpriteId) || sprites[0];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-blue-100 pt-6 font-sans h-screen">
        <div className="h-full flex flex-row overflow-hidden">
          <div className="flex-1 bg-white border-r border-gray-200 rounded-tr-xl mr-2 flex">
            <Sidebar />
            <MidArea
              selectedSprite={selectedSprite}
              sprites={sprites}
              setSprites={setSprites}
            />
          </div>

          <div className="w-1/3 bg-white border-l border-gray-200 rounded-tl-xl ml-2 flex flex-col">
            <div className="p-2 border-b flex items-center justify-between">
              <div className="font-bold">Preview</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={addSprite}
                  className="px-3 py-1 rounded bg-green-500 text-white text-sm"
                >
                  + Add Sprite
                </button>
                <button
                  onClick={runProgram}
                  className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
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
                <div
                  key={sp.id}
                  onClick={() => setSelectedSpriteId(sp.id)}
                  className={`px-3 py-1 cursor-pointer rounded ${
                    selectedSpriteId === sp.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {sp.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}