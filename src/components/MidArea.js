import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { nanoid } from "nanoid";
import { DragItemTypes } from "../dnd/DragItemTypes";
import { BLOCK_DEFINITIONS } from "../blocks/blockDefinitions";

export default function MidArea({ selectedSprite, sprites, setSprites }) {
  const [hoverRepeatId, setHoverRepeatId] = useState(null);

  // Main drop target for whole script area
  const [{ isOver }, drop] = useDrop({
    accept: DragItemTypes.BLOCK,
    drop: (item) => handleDrop(item),
    collect: (m) => ({ isOver: !!m.isOver() }),
  });

  function handleDrop(item) {
    const def = BLOCK_DEFINITIONS[item.blockType];
    if (!def) return;

    // Use canonical def.params
    const newBlock = {
      id: nanoid(),
      type: def.type,
      parentId: hoverRepeatId || null, // if user hovered a Repeat, child is attached
      params: { ...(def.params || {}) },
    };

    setSprites((prev) =>
      prev.map((sp) =>
        sp.id === selectedSprite.id ? { ...sp, blocks: [...sp.blocks, newBlock] } : sp
      )
    );
  }

  // update a param for a block
  function updateBlockParam(blockId, key, value) {
    setSprites((prev) =>
      prev.map((sp) =>
        sp.id === selectedSprite.id
          ? {
              ...sp,
              blocks: sp.blocks.map((b) =>
                b.id === blockId ? { ...b, params: { ...b.params, [key]: value } } : b
              ),
            }
          : sp
      )
    );
  }

  // remove block and any children nested inside it
  function removeBlock(blockId) {
    setSprites((prev) =>
      prev.map((sp) =>
        sp.id === selectedSprite.id
          ? { ...sp, blocks: sp.blocks.filter((b) => b.id !== blockId && b.parentId !== blockId) }
          : sp
      )
    );
  }

  // render blocks with nesting (parentId === null for top-level)
  function renderBlocks(parentId = null, indent = 0) {
    const blocks = selectedSprite.blocks.filter((b) => b.parentId === parentId);
    return blocks.map((b) => {
      const def = BLOCK_DEFINITIONS[b.type] || { label: b.type, params: {} };
      const parts = def.label.split("__");
      const paramKeys = Object.keys(b.params || {});

      return (
        <div key={b.id} style={{ marginLeft: indent * 18 }} className="mb-2">
          <div
            className={`${def.color || "bg-gray-400"} text-white p-2 rounded flex justify-between items-center`}
            onMouseEnter={() => def.type === "REPEAT" && setHoverRepeatId(b.id)}
            onMouseLeave={() => def.type === "REPEAT" && setHoverRepeatId((cur) => (cur === b.id ? null : cur))}
          >
            <div>
              {parts.map((txt, i) => (
                <span key={i} className="mr-1">
                  {txt}
                  {paramKeys[i] !== undefined && (
                    <input
                      value={b.params[paramKeys[i]]}
                      onChange={(e) =>
                        updateBlockParam(
                          b.id,
                          paramKeys[i],
                          isNaN(e.target.value) ? e.target.value : Number(e.target.value)
                        )
                      }
                      className="ml-2 px-1 text-black rounded w-20"
                    />
                  )}
                </span>
              ))}
            </div>
            <div>
              <button
                onClick={() => removeBlock(b.id)}
                className="text-xs bg-white text-red-600 px-2 py-0.5 rounded"
              >
                Delete
              </button>
            </div>
          </div>

          {/* If this block is a REPEAT, render inner drop-zone and nested blocks */}
          {def.type === "REPEAT" && (
            <div
              className={`ml-4 mt-2 p-2 rounded border ${hoverRepeatId === b.id ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-100"}`}
              onMouseEnter={() => setHoverRepeatId(b.id)}
              onMouseLeave={() => setHoverRepeatId((cur) => (cur === b.id ? null : cur))}
            >
              <div className="text-xs text-gray-600 mb-2">(Drop blocks here to include inside Repeat)</div>
              {/* render children recursively */}
              {renderBlocks(b.id, indent + 1)}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <div ref={drop} className={`flex-1 p-4 ${isOver ? "bg-green-50" : "bg-gray-50"} overflow-auto`}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Scripts — {selectedSprite.name}</div>
        <div className="text-xs text-gray-500">Drop blocks here</div>
      </div>

      {selectedSprite.blocks.length === 0 && <div className="text-gray-400">No blocks yet — drag from left.</div>}

      <div className="space-y-2">{renderBlocks()}</div>
    </div>
  );
}
