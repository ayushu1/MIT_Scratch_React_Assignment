/**
 * PreviewArea Component
 * 
 * Renders the stage where sprites are animated and displayed.
 * Optimized with React.memo to prevent unnecessary re-renders.
 */

import React from "react";
import SpritePreview from "./SpritePreview";

/**
 * @param {Object} props
 * @param {Array<Object>} props.sprites - Array of sprite objects to render
 */
const PreviewArea = React.memo(({ sprites }) => {
  return (
    <div className="relative h-full bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100" />
      {sprites.map((sprite) => (
        <SpritePreview key={sprite.id} sprite={sprite} />
      ))}
    </div>
  );
});

PreviewArea.displayName = "PreviewArea";

export default PreviewArea;
