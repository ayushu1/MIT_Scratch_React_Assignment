/**
 * Block Component
 * 
 * Renders a single block with editable parameters and delete functionality.
 * Used in the script area to display and interact with blocks.
 */

import React from "react";
import { BLOCK_DEFINITIONS } from "../blocks/blockDefinitions";

/**
 * @param {Object} props
 * @param {Object} props.block - Block object with id, type, params, parentId
 * @param {Function} props.onUpdateParam - Callback to update block parameter
 * @param {Function} props.onRemove - Callback to remove block
 * @param {number} props.indent - Indentation level for nested blocks
 * @param {Function} props.onMouseEnter - Optional mouse enter handler
 * @param {Function} props.onMouseLeave - Optional mouse leave handler
 */
export default function Block({
  block,
  onUpdateParam,
  onRemove,
  indent = 0,
  onMouseEnter,
  onMouseLeave,
}) {
  const def = BLOCK_DEFINITIONS[block.type] || { label: block.type, params: {} };
  const parts = def.label.split("__");
  const paramKeys = Object.keys(block.params || {});

  return (
    <div style={{ marginLeft: indent * 18 }} className="mb-2">
      <div
        className={`${
          def.color || "bg-gray-400"
        } text-white p-2 rounded flex justify-between items-center`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div>
          {parts.map((txt, i) => (
            <span key={i} className="mr-1">
              {txt}
              {paramKeys[i] !== undefined && (
                <input
                  key={`${block.id}-${paramKeys[i]}`}
                  value={block.params[paramKeys[i]] ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = Number(value);
                    onUpdateParam(
                      block.id,
                      paramKeys[i],
                      isNaN(numValue) || value === "" ? value : numValue
                    );
                  }}
                  className="ml-2 px-1 text-black rounded w-20"
                />
              )}
            </span>
          ))}
        </div>
        <div>
          <button
            onClick={() => onRemove(block.id)}
            className="text-xs bg-white text-red-600 px-2 py-0.5 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

