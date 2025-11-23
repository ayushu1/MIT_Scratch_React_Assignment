import React, { createContext, useContext, useReducer, useRef, useCallback } from "react";
import { nanoid } from "nanoid";
import { DEFAULT_SPRITE, COLLISION } from "../constants";
import { checkAllCollisions } from "../engine/collisionEngine";

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

function spriteReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_SPRITE: {
      // Generate random color for new sprite
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

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(spriteReducer, initialState);
  const collisionCooldownRef = useRef(false);

  const getSpriteState = useCallback(
    (spriteId) => {
      return state.sprites.find((s) => s.id === spriteId) || {};
    },
    [state.sprites]
  );

  const updateSprite = useCallback(
    (spriteId, updates) => {
      dispatch({ type: ActionTypes.UPDATE_SPRITE, payload: { spriteId, updates } });
    },
    []
  );

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

  const addSprite = useCallback(() => {
    const id = nanoid();
    dispatch({
      type: ActionTypes.ADD_SPRITE,
      payload: { id, name: `Sprite ${state.sprites.length + 1}` },
    });
  }, [state.sprites.length]);

  const addBlock = useCallback(
    (block) => {
      dispatch({
        type: ActionTypes.ADD_BLOCK,
        payload: { spriteId: state.selectedSpriteId, block },
      });
    },
    [state.selectedSpriteId]
  );

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

  const removeBlock = useCallback(
    (blockId) => {
      dispatch({
        type: ActionTypes.REMOVE_BLOCK,
        payload: { spriteId: state.selectedSpriteId, blockId },
      });
    },
    [state.selectedSpriteId]
  );

  const setSelectedSpriteId = useCallback((spriteId) => {
    dispatch({ type: ActionTypes.SET_SELECTED_SPRITE, payload: spriteId });
  }, []);

  const value = {
    sprites: state.sprites,
    selectedSpriteId: state.selectedSpriteId,
    selectedSprite: state.sprites.find((s) => s.id === state.selectedSpriteId) || state.sprites[0],
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

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
