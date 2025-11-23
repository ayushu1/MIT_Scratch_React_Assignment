import React, { useState } from "react";
import Block from "./Block";
import RepeatDropZone from "./RepeatDropZone";
import { BLOCK_DEFINITIONS } from "../blocks/blockDefinitions";

export default function BlockList({
  blocks,
  onUpdateParam,
  onRemove,
  parentId = null,
  indent = 0,
}) {
  const [hoverRepeatId, setHoverRepeatId] = useState(null);

  const filteredBlocks = blocks.filter((b) => b.parentId === parentId);

  if (filteredBlocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {filteredBlocks.map((block) => {
        const def = BLOCK_DEFINITIONS[block.type] || {};
        const isRepeat = block.type === "REPEAT";

        return (
          <div key={block.id}>
            <Block
              block={block}
              onUpdateParam={onUpdateParam}
              onRemove={onRemove}
              indent={indent}
              onMouseEnter={
                isRepeat
                  ? () => setHoverRepeatId(block.id)
                  : undefined
              }
              onMouseLeave={
                isRepeat
                  ? () => setHoverRepeatId((cur) => (cur === block.id ? null : cur))
                  : undefined
              }
            />

            {isRepeat && (
              <RepeatDropZone blockId={block.id}>
                <BlockList
                  blocks={blocks}
                  onUpdateParam={onUpdateParam}
                  onRemove={onRemove}
                  parentId={block.id}
                  indent={indent + 1}
                />
              </RepeatDropZone>
            )}
          </div>
        );
      })}
    </div>
  );
}

