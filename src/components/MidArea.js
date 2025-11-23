import React from "react";
import { useDrop } from "react-dnd";
import { nanoid } from "nanoid";
import { DragItemTypes } from "../dnd/DragItemTypes";
import { BLOCK_DEFINITIONS } from "../blocks/blockDefinitions";
import BlockList from "./BlockList";
import { useAppContext } from "../context/AppContext";

export default function MidArea() {
  const { selectedSprite, addBlock, updateBlockParam, removeBlock } = useAppContext();

  const [{ isOver }, drop] = useDrop({
    accept: DragItemTypes.BLOCK,
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      handleDrop(item, null);
    },
    collect: (m) => ({ isOver: !!m.isOver() }),
  });

  function handleDrop(item, parentId = null) {
    const def = BLOCK_DEFINITIONS[item.blockType];
    if (!def) return;

    const newBlock = {
      id: nanoid(),
      type: def.type,
      parentId,
      params: { ...(def.params || {}) },
    };

    addBlock(newBlock);
  }

  return (
    <div
      ref={drop}
      className={`flex-1 p-4 ${
        isOver ? "bg-green-50" : "bg-gray-50"
      } overflow-auto`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Scripts — {selectedSprite.name}</div>
        <div className="text-xs text-gray-500">Drop blocks here</div>
      </div>

      {selectedSprite.blocks.length === 0 && (
        <div className="text-gray-400">No blocks yet drag from left.</div>
      )}

      <BlockList
        blocks={selectedSprite.blocks}
        onUpdateParam={updateBlockParam}
        onRemove={removeBlock}
      />
    </div>
  );
}