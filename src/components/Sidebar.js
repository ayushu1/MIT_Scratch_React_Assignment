import React from "react";
import { useDrag } from "react-dnd";
import { BLOCK_DEFINITIONS } from "../blocks/blockDefinitions";
import { DragItemTypes } from "../dnd/DragItemTypes";

function DraggableBlock({ def }) {
  const [{ isDragging }, dragRef] = useDrag({
    type: DragItemTypes.BLOCK,
    item: { blockType: def.type },
    collect: (m) => ({ isDragging: !!m.isDragging() }),
  });

  // render label, show first param preview
  const labelParts = def.label.split("__");

  return (
    <div
      ref={dragRef}
      className={`${def.color} text-white px-2 py-1 my-2 rounded cursor-move select-none`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {labelParts.map((p, i) => (
        <span key={i}>
          {p}
          {i === 0 && Object.keys(def.params)[0] && (
            <span className="mx-1 px-1 bg-white text-black rounded">
              {Object.values(def.params)[0]}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

export default function Sidebar() {
  const defs = Object.values(BLOCK_DEFINITIONS);
  const motion = defs.filter((d) => d.color.includes("blue"));
  const control = defs.filter((d) => d.color.includes("yellow"));
  const looks = defs.filter((d) => d.color.includes("purple"));

  return (
    <div className="w-60 flex-none h-full overflow-y-auto p-3 border-r border-gray-200">
      <div className="font-bold mb-2">Blocks</div>

      <div className="font-semibold text-sm text-blue-700">Motion</div>
      {motion.map((d) => (
        <DraggableBlock key={d.type} def={d} />
      ))}

      <div className="font-semibold text-sm text-yellow-700 mt-4">Control</div>
      {control.map((d) => (
        <DraggableBlock key={d.type} def={d} />
      ))}

      <div className="font-semibold text-sm text-purple-700 mt-4">Looks</div>
      {looks.map((d) => (
        <DraggableBlock key={d.type} def={d} />
      ))}
    </div>
  );
}
