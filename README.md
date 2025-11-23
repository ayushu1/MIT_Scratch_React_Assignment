# Scratch Starter Project (React)
A small, educational Scratch-like starter built with React and Webpack. It demonstrates a block-based drag-and-drop UI, sprite management, and a simple animation/collision engine — a great foundation for experimenting with visual programming concepts.

## Demo
🚀 **[Live Demo on Vercel](https://scratch-starter-project-phi.vercel.app/)**

🎥 **[Watch Demo Video](https://drive.google.com/file/d/1K0f2bqX2rieLYcI7TV6JWBJUAweVWcIb/view?usp=drive_link)**

Or open the app locally (instructions below) and try dragging blocks into the script area, add sprites, and use the preview area to see behaviors.

## Features
- React-based UI with componentized layout (sidebar, sprite list, preview area, script area).
- Drag & drop using `react-dnd`.
- Simple animation and collision engine under `src/engine`.
- Tailwind for utility styles.

## Quick start
Requirements:
- Node.js (14+ recommended)
- npm (or yarn)

Install dependencies:
```bash
npm install
```

Start development server:
```bash
npm start
```
This runs webpack-dev-server (see `webpack.dev.js`). Open http://localhost:3000 in your browser.

Build for production:
```bash
npm run build
```
This creates an optimized bundle via `webpack.prod.js`.

## Project structure (key files)
- `public/` — static files and icons used by the app (index.html, images, manifest).
- `src/index.js` — app entry point.
- `src/index.css` — global styles (Tailwind + custom CSS).
- `src/App.js` — top-level app container.
- `src/components/` — React UI components (PreviewArea, Sidebar, SpriteList, etc.).
- `src/blocks/blockDefinitions.js` — block definitions used in the drag/drop UI.
- `src/engine/` — `animationEngine.js` and `collisionEngine.js` for runtime behavior.
- `webpack.*.js` — webpack configs for development and production.

## Development notes
- The project uses `react-dnd` with the HTML5 backend for drag-and-drop of blocks. See `src/dnd/DragItemTypes.js` and components that use the DnD hooks.
- Sprite visuals are in `src/components/CatSprite.js` and images are under `public/`.
- If you add new assets into `public/`, they will be copied as-is by the dev server.

## NPM scripts
- `npm start` — start dev server (webpack-dev-server + hot reload).
- `npm run build` — create production bundle.

These are defined in `package.json`.

## Deployment
This project is deployed on Vercel. Any pushes to the main branch will automatically trigger a new deployment.
