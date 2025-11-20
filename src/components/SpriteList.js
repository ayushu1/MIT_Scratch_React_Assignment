import React from "react";

export default function SpriteList({ sprites, selectedId, onSelect, onAdd }) {
  return (
    <div className="w-full p-2 border-b border-gray-200 bg-gray-50 flex flex-row items-center justify-between">
      <div className="flex flex-row gap-2">
        {sprites.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`px-3 py-1 text-sm rounded 
              ${selectedId === s.id ? "bg-blue-500 text-white" : "bg-white text-gray-700 border"}`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="px-3 py-1 bg-green-500 text-white rounded text-sm"
      >
        + Add Sprite
      </button>
    </div>
  );
}
