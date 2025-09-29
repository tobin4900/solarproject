# Canvas Performance Optimization Plan

## Overview
Optimize the CanvasEditor component to make the canvas get ready faster by implementing pre-rendering, deferred initialization, memoization, and lazy loading.

## Tasks

### 1. Pre-render Blank Canvas
- [x] Modify CanvasEditor to render the canvas element immediately on mount
- [x] Initialize FabricCanvas with basic configuration first
- [x] Load scene data asynchronously in the background
- [x] Update loading state to show canvas ready sooner

### 2. Optimize FabricCanvas Initialization
- [x] Defer brush setup and event listeners until after initial render
- [x] Move non-essential configurations to a separate useEffect
- [x] Ensure canvas is interactive as soon as possible

### 3. Memoize Expensive Operations
- [x] Wrap CanvasEditor with React.memo to prevent unnecessary re-renders
- [x] Use useMemo for canvas configuration objects
- [x] Memoize callback functions that don't change frequently

### 4. Lazy Load Persistence
- [x] Initialize CanvasPersistence only when sceneId changes or when saving/loading
- [x] Use useRef to store persistence instance and initialize lazily
- [x] Avoid creating persistence instance on every render

## Implementation Order
1. Start with pre-rendering blank canvas (biggest impact)
2. Add memoization optimizations
3. Optimize FabricCanvas initialization
4. Implement lazy persistence loading

## Testing
- [x] Verify canvas appears immediately on load
- [x] Ensure all functionality still works after optimizations
- [x] Check that loading times are reduced
