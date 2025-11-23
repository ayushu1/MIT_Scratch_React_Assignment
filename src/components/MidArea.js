/**
 * MidArea Component
 * 
 * Main script editing area where users can drop and arrange blocks.
 * Handles drag-and-drop of blocks and displays the script for the selected sprite.
 */

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
      // Check if the drop was already handled by a nested drop zone (like RepeatDropZone)
      if (monitor.didDrop()) {
        return; // Don't handle the drop if it was already handled by a child drop zone
      }

      // Only handle drops that weren't handled by nested drop zones
      handleDrop(item, null);
    },
    collect: (m) => ({ isOver: !!m.isOver() }),
  });

  /**
   * Handles dropping a block from the sidebar
   * @param {Object} item - Drag item with blockType
   * @param {string|null} parentId - Parent block ID if dropping into REPEAT
   */
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