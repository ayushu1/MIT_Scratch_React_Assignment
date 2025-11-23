/**
 * App Context
 * 
 * Centralized state management for the Scratch-style playground.
 * Manages sprites, selected sprite, and provides actions for state updates.
 */

import React, { createContext, useContext, useReducer, useRef, useCallback } from "react";
import { nanoid } from "nanoid";
import { DEFAULT_SPRITE, COLLISION } from "../constants";
import { checkAllCollisions } from "../engine/collisionEngine";

/**
 * @typedef {Object} Sprite
 * @property {string} id - Unique sprite identifier
 * @property {string} name - Display name
 * @property {string} sprite - Sprite type (e.g., "cat")
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} angle - Rotation angle in degrees
 * @property {string} bubble - Speech/thought bubble text
 * @property {Array<Object>} blocks - Array of block definitions
 * @property {string} color - Sprite color
 */

/**
 * Action types for reducer
 */
const ActionTypes = {
  ADD_SPRITE: "ADD_SPRITE",
  UPDATE_SPRITE: "UPDATE_SPRITE",
  SET_SELECTED_SPRITE: "SET_SELECTED_SPRITE",
  ADD_BLOCK: "ADD_BLOCK",
  UPDATE_BLOCK_PARAM: "UPDATE_BLOCK_PARAM",
  REMOVE_BLOCK: "REMOVE_BLOCK",
  SWAP_SPRITE_BLOCKS: "SWAP_SPRITE_BLOCKS",
  SET_SPRITES: "SET_SPRITES",
};

/**
 * Reducer function for sprite state management
 * @param {Object} state - Current state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New state
 */
function spriteReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_SPRITE: {
      const hue = Math.floor(Math.random() * 360);
      const saturation = 60 + Math.random() * 30;
      const lightness = 55 + Math.random() * 20;
      const randomColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      const newSprite = {
        ...DEFAULT_SPRITE,
        id: action.payload.id,
        name: action.payload.name,
        x: state.sprites.length * 20,
        color: randomColor,
      };

      return {
        ...state,
        sprites: [...state.sprites, newSprite],
        selectedSpriteId: action.payload.id,
      };
    }

    case ActionTypes.UPDATE_SPRITE: {
      const { spriteId, updates } = action.payload;
      return {
        ...state,
        sprites: state.sprites.map((s) =>
          s.id === spriteId ? { ...s, ...updates } : s
        ),
      };
    }

    case ActionTypes.SET_SELECTED_SPRITE:
      return {
        ...state,
        selectedSpriteId: action.payload,
      };

    case ActionTypes.ADD_BLOCK: {
      const { spriteId, block } = action.payload;
      return {
        ...state,
        sprites: state.sprites.map((s) =>
          s.id === spriteId
            ? { ...s, blocks: [...s.blocks, block] }
            : s
        ),
      };
    }

    case ActionTypes.UPDATE_BLOCK_PARAM: {
      const { spriteId, blockId, key, value } = action.payload;
      return {
        ...state,
        sprites: state.sprites.map((s) =>
          s.id === spriteId
            ? {
                ...s,
                blocks: s.blocks.map((b) =>
                  b.id === blockId
                    ? { ...b, params: { ...b.params, [key]: value } }
                    : b
                ),
              }
            : s
        ),
      };
    }

    case ActionTypes.REMOVE_BLOCK: {
      const { spriteId, blockId } = action.payload;
      return {
        ...state,
        sprites: state.sprites.map((s) =>
          s.id === spriteId
            ? {
                ...s,
                blocks: s.blocks.filter(
                  (b) => b.id !== blockId && b.parentId !== blockId
                ),
              }
            : s
        ),
      };
    }

    case ActionTypes.SWAP_SPRITE_BLOCKS: {
      const { spriteAId, spriteBId } = action.payload;
      return {
        ...state,
        sprites: state.sprites.map((s) => {
          if (s.id === spriteAId) {
            const spriteB = state.sprites.find((sp) => sp.id === spriteBId);
            return { ...s, blocks: spriteB ? spriteB.blocks.slice() : s.blocks };
          }
          if (s.id === spriteBId) {
            const spriteA = state.sprites.find((sp) => sp.id === spriteAId);
            return { ...s, blocks: spriteA ? spriteA.blocks.slice() : s.blocks };
          }
          return s;
        }),
      };
    }

    case ActionTypes.SET_SPRITES:
      return {
        ...state,
        sprites: action.payload,
      };

    default:
      return state;
  }
}

/**
 * Initial state
 */
const initialState = {
  sprites: [
    {
      id: "sprite1",
      name: "Sprite 1",
      ...DEFAULT_SPRITE,
    },
  ],
  selectedSpriteId: "sprite1",
};

/**
 * App Context
 */
const AppContext = createContext(null);

/**
 * App Provider Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(spriteReducer, initialState);
  const collisionCooldownRef = useRef(false);

  /**
   * Get current sprite state by ID
   * @param {string} spriteId - Sprite ID
   * @returns {Sprite|Object} Sprite object or empty object if not found
   */
  const getSpriteState = useCallback(
    (spriteId) => {
      return state.sprites.find((s) => s.id === spriteId) || {};
    },
    [state.sprites]
  );

  /**
   * Check for collisions and handle them
   * @param {Array<Sprite>} spritesToCheck - Array of sprites to check
   */
  const checkForCollisions = useCallback((spritesToCheck) => {
    if (collisionCooldownRef.current) return;

    const collisions = checkAllCollisions(spritesToCheck);
    if (collisions.length > 0) {
      const { spriteA, spriteB } = collisions[0];
      handleCollision(spriteA, spriteB);
    }
  }, []);

  /**
   * Update sprite state
   * @param {string} spriteId - Sprite ID
   * @param {Object} updates - Partial sprite updates
   */
  const updateSprite = useCallback(
    (spriteId, updates) => {
      dispatch({ type: ActionTypes.UPDATE_SPRITE, payload: { spriteId, updates } });

      // Check for collisions after update - use current state
      // Note: This will check with the previous state, collision check in App.js uses ref
      // which is more accurate for animation engine
    },
    []
  );

  /**
   * Handle collision between two sprites (swap their blocks)
   * @param {Sprite} spriteA - First sprite
   * @param {Sprite} spriteB - Second sprite
   */
  const handleCollision = useCallback((spriteA, spriteB) => {
    if (collisionCooldownRef.current) return;

    collisionCooldownRef.current = true;
    dispatch({
      type: ActionTypes.SWAP_SPRITE_BLOCKS,
      payload: { spriteAId: spriteA.id, spriteBId: spriteB.id },
    });

    setTimeout(() => {
      collisionCooldownRef.current = false;
    }, COLLISION.COOLDOWN_MS);
  }, []);

  /**
   * Add a new sprite
   */
  const addSprite = useCallback(() => {
    const id = nanoid();
    dispatch({
      type: ActionTypes.ADD_SPRITE,
      payload: { id, name: `Sprite ${state.sprites.length + 1}` },
    });
  }, [state.sprites.length]);

  /**
   * Add a block to the selected sprite
   * @param {Object} block - Block to add
   */
  const addBlock = useCallback(
    (block) => {
      dispatch({
        type: ActionTypes.ADD_BLOCK,
        payload: { spriteId: state.selectedSpriteId, block },
      });
    },
    [state.selectedSpriteId]
  );

  /**
   * Update a block parameter
   * @param {string} blockId - Block ID
   * @param {string} key - Parameter key
   * @param {any} value - Parameter value
   */
  const updateBlockParam = useCallback(
    (blockId, key, value) => {
      dispatch({
        type: ActionTypes.UPDATE_BLOCK_PARAM,
        payload: {
          spriteId: state.selectedSpriteId,
          blockId,
          key,
          value,
        },
      });
    },
    [state.selectedSpriteId]
  );

  /**
   * Remove a block
   * @param {string} blockId - Block ID to remove
   */
  const removeBlock = useCallback(
    (blockId) => {
      dispatch({
        type: ActionTypes.REMOVE_BLOCK,
        payload: { spriteId: state.selectedSpriteId, blockId },
      });
    },
    [state.selectedSpriteId]
  );

  /**
   * Set selected sprite ID
   * @param {string} spriteId - Sprite ID to select
   */
  const setSelectedSpriteId = useCallback((spriteId) => {
    dispatch({ type: ActionTypes.SET_SELECTED_SPRITE, payload: spriteId });
  }, []);

  const value = {
    // State
    sprites: state.sprites,
    selectedSpriteId: state.selectedSpriteId,
    selectedSprite: state.sprites.find((s) => s.id === state.selectedSpriteId) || state.sprites[0],

    // Actions
    addSprite,
    updateSprite,
    getSpriteState,
    addBlock,
    updateBlockParam,
    removeBlock,
    setSelectedSpriteId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to use App Context
 * @returns {Object} Context value with state and actions
 * @throws {Error} If used outside AppProvider
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
