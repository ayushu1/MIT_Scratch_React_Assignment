import React from "react";
import SpritePreview from "./SpritePreview";

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
