import React from "react";
import { useDrop } from "react-dnd";
import { nanoid } from "nanoid";
import { DragItemTypes } from "../dnd/DragItemTypes";
import { BLOCK_DEFINITIONS } from "../blocks/blockDefinitions";
import { useAppContext } from "../context/AppContext";

export default function RepeatDropZone({ blockId, children }) {
  const { addBlock } = useAppContext();

  const [{ isOver }, drop] = useDrop({
    accept: DragItemTypes.BLOCK,
    drop: (item) => {
      const def = BLOCK_DEFINITIONS[item.blockType];
      if (!def) return undefined;

      const newBlock = {
        id: nanoid(),
        type: def.type,
        parentId: blockId,
        params: { ...(def.params || {}) },
      };

      addBlock(newBlock);
      return { handled: true, parentId: blockId };
    },
    collect: (m) => ({ isOver: m.isOver() }),
  });

  return (
    <div
      ref={drop}
      className={`ml-4 mt-2 p-2 rounded border ${
        isOver ? "border-green-500 bg-green-50" : "border-gray-200 bg-gray-100"
      }`}
    >
      <div className="text-xs text-gray-600 mb-2">
        (Drop blocks here to include inside Repeat)
      </div>

      {children}
    </div>
  );
}
