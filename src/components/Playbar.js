// src/components/Playbar.js
import React from "react";

export default function Playbar({ onPlay, onStop, running }) {
  return (
    <div className="flex items-center gap-3 p-2">
      <button onClick={onPlay} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">
        {running ? "Running..." : "Play"}
      </button>
      <button onClick={onStop} className="px-3 py-1 rounded bg-gray-200 text-sm">Stop</button>
      <div className="text-sm text-gray-600 ml-4">Drag blocks to scripts → press Play</div>
    </div>
  );
}
