import React from "react";
import CatSprite from "./CatSprite";

const SCALE = 5;
const STAGE_CENTER_X = 200;
const STAGE_CENTER_Y = 160;

export default function PreviewArea({ sprites }) {
  return (
    <div className="relative h-full bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100" />

      {sprites.map((s) => {
        const left = STAGE_CENTER_X + s.x * SCALE;
        const top = STAGE_CENTER_Y - s.y * SCALE;

        return (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left,
              top,
              transform: `translate(-50%, -50%) rotate(${s.angle}deg)`,
              transition: "left 0.1s linear, top 0.1s linear, transform 0.1s linear",
            }}
          >
            {/* Render Sprite SVG */}
            {s.sprite === "cat" && <CatSprite />}

            {/* Speech / Thought bubble */}
            {s.bubble && (
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
                {s.bubble}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
