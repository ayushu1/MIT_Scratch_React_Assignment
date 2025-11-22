import React from "react";
import { useDrop } from "react-dnd";
import { DragItemTypes } from "../dnd/DragItemTypes";
import { BLOCKS } from "../blocks/blockDefinitions";

export default function ScriptArea({ scripts, onAddBlock, onUpdateInput }) {
  const [{ isOver }, dropRef] = useDrop({
    accept: DragItemTypes.BLOCK,
    drop: (item) => onAddBlock(item.blockId),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={dropRef}
      className={`flex-1 h-full overflow-auto p-4 transition-all 
      ${isOver ? "bg-green-100" : "bg-gray-50"}`}
    >
      <div className="font-semibold text-gray-700 mb-3">Scripts</div>

      {scripts.length === 0 && (
        <div className="text-gray-400 text-sm">
          Drag blocks here to build script.
        </div>
      )}

      {scripts.map((block, index) => (
        <ScriptBlock
          key={index}
          block={block}
          onUpdateInput={onUpdateInput}
          index={index}
        />
      ))}
    </div>
  );
}

function ScriptBlock({ block, onUpdateInput, index }) {
  const def = BLOCKS.find((b) => b.id === block.id);
  if (!def) return null;

  const parts = def.label.split("__");

  return (
    <div
      className={`p-2 my-2 rounded shadow-sm text-sm text-white 
      ${getCategoryColor(def.category)}`}
    >
      {parts.map((text, i) => (
        <React.Fragment key={i}>
          {text}

          {def.inputs[i] && (
            <input
              type="text"
              className="mx-1 px-1 text-black bg-white rounded w-16"
              value={block.values[def.inputs[i]]}
              onChange={(e) =>
                onUpdateInput(index, def.inputs[i], e.target.value)
              }
            />
          )}
        </React.Fragment>
      ))}

      {def.hasNested && (
        <div className="ml-4 mt-2 p-2 bg-white rounded text-black">
          <div className="text-xs text-gray-600 mb-1">Repeat inner blocks</div>
        </div>
      )}
    </div>
  );
}

/* ------------------- COLOR HELPERS ------------------- */
function getCategoryColor(category) {
  switch (category) {
    case "motion":
      return "bg-blue-500";
    case "looks":
      return "bg-purple-500";
    case "control":
      return "bg-yellow-500";
    default:
      return "bg-gray-400";
  }
}
