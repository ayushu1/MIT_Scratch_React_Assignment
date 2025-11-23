import React from "react";
import CatSprite from "./CatSprite";
import { STAGE } from "../constants";

const SpritePreview = React.memo(({ sprite }) => {
  const left = STAGE.CENTER_X + sprite.x * STAGE.SCALE;
  const top = STAGE.CENTER_Y - sprite.y * STAGE.SCALE;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        transform: `translate(-50%, -50%) rotate(${sprite.angle}deg)`,
        transition: "left 0.1s linear, top 0.1s linear, transform 0.1s linear",
      }}
    >
      {sprite.sprite === "cat" && <CatSprite color={sprite.color || "#FFAB19"} />}

      {sprite.bubble && (
        <div
          style={{
            marginTop: "-10px",
            background: "white",
            padding: "6px 8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "12px",
            position: "absolute",
            left: "50%",
            top: "-12px",
            transform: "translate(-50%, -100%)",
          }}
        >
          {sprite.bubble}
        </div>
      )}
    </div>
  );
});

SpritePreview.displayName = "SpritePreview";

export default SpritePreview;

