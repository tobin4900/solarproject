
import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react";
import { Canvas as FabricCanvas, Circle, Rect, IText, PencilBrush } from "fabric";
import * as fabric from "fabric";
import { Toolbar, ToolType } from "./Toolbar";
import { ColorPicker } from "./ColorPicker";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, Eye, Moon, Sun} from "lucide-react";
import { cn } from "@/lib/utils";
import { CanvasPersistence } from "@/lib/canvas-persistence";

interface FabricCanvasElement extends HTMLCanvasElement {
  __fabric_instance?: FabricCanvas;
}

interface CanvasEditorProps {
  sceneId: string;
  isViewOnly?: boolean;
}



const CanvasEditor = ({ sceneId, isViewOnly = false }: CanvasEditorProps) => {
  const canvasRef = useRef<FabricCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [activeColor, setActiveColor] = useState("#6366f1");
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const persistenceRef = useRef<CanvasPersistence | null>(null);
  const currentSceneIdRef = useRef<string | null>(null);
  const isInitialized = useRef(false);
  const isLoadingState = useRef(false);
  const isSavingState = useRef(false);
  const lastSavedState = useRef<string | null>(null);


  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const canvasConfig = useMemo(() => ({
    width: 1000,
    height: 600,
  }), []);

  useEffect(() => {
    if (!canvasRef.current || isInitialized.current) return;

    const canvasElement = canvasRef.current;
    const initCanvas = () => {
      try {
        if (canvasElement.__fabric_instance) {
          canvasElement.__fabric_instance.dispose();
          delete canvasElement.__fabric_instance;
        }

        const canvas = new FabricCanvas(canvasElement, canvasConfig);

        const isDarkTheme = document.documentElement.classList.contains('dark');
        canvas.backgroundColor = isDarkTheme ? 'hsl(210 40% 15%)' : 'hsl(210 50% 95%)';
        canvas.renderAll();

        canvasElement.__fabric_instance = canvas;

        // Set canvas ready immediately
        setFabricCanvas(canvas);
        isInitialized.current = true;
        setIsLoading(false);
        toast.success("Canvas ready!");

        // Defer non-essential setup
        setTimeout(() => {
          const brush = new PencilBrush(canvas);
          brush.color = activeColor;
          brush.width = 3;
          canvas.freeDrawingBrush = brush;

          const handleSave = () => {
            if (!isViewOnly && !isLoadingState.current && !isSavingState.current) {
              saveState(canvas);
              autoSave(canvas);
            }
          };

          canvas.on('object:added', handleSave);
          canvas.on('object:removed', handleSave);
          canvas.on('object:modified', handleSave);
          canvas.on('path:created', handleSave);
          canvas.on('selection:created', () => {});
          canvas.on('selection:updated', () => {});
        }, 0);

        // Load scene data asynchronously in background
        setTimeout(() => {
          getPersistence().loadScene().then((scene) => {
            if (scene && scene.data) {
              try {
                canvas.loadFromJSON(scene.data, () => {
                  const isDarkTheme = document.documentElement.classList.contains('dark');
                  canvas.backgroundColor = isDarkTheme ? 'hsl(210 40% 15%)' : 'hsl(210 50% 95%)';
                  canvas.renderAll();
                  canvas.getObjects().forEach(applyLockState);
                  toast.success("Canvas loaded!");
                  if (!isViewOnly) saveState(canvas);
                });
              } catch (error) {
                console.error("Error loading canvas data:", error);
                if (!isViewOnly) saveState(canvas);
              }
            } else {
              if (!isViewOnly) saveState(canvas);
            }
          }).catch((error) => {
            console.error("Error loading scene:", error);
            toast.error("Failed to load canvas data. Starting with blank canvas.");
            if (!isViewOnly) saveState(canvas);
          });
        }, 0);
      } catch (error) {
        console.error("Failed to initialize canvas:", error);
        toast.error("Failed to initialize canvas");
        setIsLoading(false);
      }
    };

    initCanvas();

    return () => {
      isInitialized.current = false;
      if (persistenceRef.current) {
        persistenceRef.current.cleanup();
      }
      if (canvasElement && canvasElement.__fabric_instance) {
        canvasElement.__fabric_instance.dispose();
        delete canvasElement.__fabric_instance;
      }
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, [sceneId, isViewOnly]);

  const saveState = useCallback((canvas: FabricCanvas) => {
    isSavingState.current = true;
    const state = JSON.stringify(canvas.toJSON());
    
    if (state === lastSavedState.current) {
      isSavingState.current = false;
      return;
    }

    setUndoStack(prev => [...prev.slice(-19), state]);
    setRedoStack([]);
    lastSavedState.current = state;
    isSavingState.current = false;
  }, []);

  const getPersistence = useCallback(() => {
    if (!persistenceRef.current || currentSceneIdRef.current !== sceneId) {
      if (persistenceRef.current) {
        persistenceRef.current.cleanup();
      }
      persistenceRef.current = new CanvasPersistence(sceneId);
      currentSceneIdRef.current = sceneId;
    }
    return persistenceRef.current;
  }, [sceneId]);

  const autoSave = useCallback((canvas: FabricCanvas) => {
    if (!isViewOnly) {
      const data = JSON.stringify(canvas.toJSON());
      getPersistence().saveScene(data);
    }
  }, [isViewOnly, getPersistence]);

  useEffect(() => {
    if (!fabricCanvas) return;

    const canvasBg = isDark ? 'hsl(210 40% 15%)' : 'hsl(210 50% 95%)';
    fabricCanvas.backgroundColor = canvasBg;
    fabricCanvas.renderAll();
  }, [isDark, fabricCanvas]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "pen" && !isViewOnly;
    
    if (activeTool === "pen" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
    }

    if (activeTool === "select") {
      fabricCanvas.defaultCursor = "default";
    } else if (activeTool !== "pen") {
      fabricCanvas.defaultCursor = "crosshair";
    }
  }, [activeTool, activeColor, fabricCanvas, isViewOnly]);

  const [canLock, setCanLock] = useState(false);
  const [canUnlock, setCanUnlock] = useState(false);

  const applyLockState = useCallback((obj: fabric.Object) => {
    if (obj.get('locked')) {
      obj.lockMovementX = true;
      obj.lockMovementY = true;
      obj.lockScalingX = true;
      obj.lockScalingY = true;
      obj.lockRotation = true;
      obj.selectable = true;
      obj.evented = true;
    } else {
      obj.lockMovementX = false;
      obj.lockMovementY = false;
      obj.lockScalingX = false;
      obj.lockScalingY = false;
      obj.lockRotation = false;
      obj.selectable = true;
      obj.evented = true;
    }
  }, []);

  const updateLockStates = useCallback(() => {
    if (!fabricCanvas) {
      setCanLock(false);
      setCanUnlock(false);
      return;
    }
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) {
      setCanLock(false);
      setCanUnlock(false);
      return;
    }
    const anyUnlocked = activeObjects.some(obj => !obj.get('locked'));
    const anyLocked = activeObjects.some(obj => obj.get('locked'));
    setCanLock(anyUnlocked);
    setCanUnlock(anyLocked);
  }, [fabricCanvas]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on('selection:created', updateLockStates);
    fabricCanvas.on('selection:updated', updateLockStates);
    fabricCanvas.on('selection:cleared', () => {
      setCanLock(false);
      setCanUnlock(false);
    });

    return () => {
      fabricCanvas.off('selection:created', updateLockStates);
      fabricCanvas.off('selection:updated', updateLockStates);
      fabricCanvas.off('selection:cleared', () => {
        setCanLock(false);
        setCanUnlock(false);
      });
    };
  }, [fabricCanvas, updateLockStates]);

  const handleLock = useCallback(() => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    activeObjects.forEach(obj => {
      obj.lockMovementX = true;
      obj.lockMovementY = true;
      obj.lockScalingX = true;
      obj.lockScalingY = true;
      obj.lockRotation = true;
      obj.selectable = true;
      obj.evented = true;
      obj.set('locked', true);
    });
    fabricCanvas.requestRenderAll();
    updateLockStates();
    toast.success("Objects locked!");
  }, [fabricCanvas, updateLockStates]);

  const handleUnlock = useCallback(() => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    activeObjects.forEach(obj => {
      obj.lockMovementX = false;
      obj.lockMovementY = false;
      obj.lockScalingX = false;
      obj.lockScalingY = false;
      obj.lockRotation = false;
      obj.selectable = true;
      obj.evented = true;
      obj.set('locked', false);
    });
    fabricCanvas.requestRenderAll();
    updateLockStates();
    toast.success("Objects unlocked!");
  }, [fabricCanvas, updateLockStates]);

  const handleToolChange = useCallback((tool: ToolType) => {
    if (isViewOnly) return;
    
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 100,
        height: 80,
        strokeWidth: 0,
        selectable: true,
        evented: true,
        locked: false,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
      fabricCanvas.renderAll();
      setActiveTool("select");
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: activeColor,
        radius: 50,
        strokeWidth: 0,
        selectable: true,
        evented: true,
        locked: false,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
      fabricCanvas.renderAll();
      setActiveTool("select");
    } else if (tool === "text") {
      const text = new IText("Double click to edit", {
        left: 100,
        top: 100,
        fill: activeColor,
        fontSize: 24,
        fontFamily: "Arial",
        selectable: true,
        evented: true,
        locked: false,
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      fabricCanvas.renderAll();
      setActiveTool("select");
    }
  }, [fabricCanvas, activeColor, isViewOnly]);

  const handleColorChange = useCallback((color: string) => {
    setActiveColor(color);
    
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === "i-text" || activeObject.type === "text") {
        activeObject.set("fill", color);
      } else {
        activeObject.set("fill", color);
      }
      fabricCanvas.renderAll();
    }

    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = color;
    }
  }, [fabricCanvas]);

  // Apply lock state to objects after loading from JSON
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.on('object:added', (e) => {
      if (e.target) {
        applyLockState(e.target);
      }
    });

    fabricCanvas.on('after:render', () => {
      fabricCanvas.getObjects().forEach(applyLockState);
    });
  }, [fabricCanvas, applyLockState]);

  const handleDelete = useCallback(() => {
    if (!fabricCanvas || isViewOnly) return;

    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      fabricCanvas.remove(...activeObjects);
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      toast.success(`Deleted ${activeObjects.length} object(s)`);
    } else {
      const canvasBg = isDark ? 'hsl(210 40% 15%)' : 'hsl(210 50% 95%)';
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = canvasBg;
      fabricCanvas.renderAll();
      toast.success("Canvas cleared!");
      if (!isLoadingState.current && !isSavingState.current) {
        saveState(fabricCanvas);
        autoSave(fabricCanvas);
      }
    }
  }, [fabricCanvas, isViewOnly, isDark, saveState, autoSave]);

  const handleClear = useCallback(() => {
    if (!fabricCanvas || isViewOnly) return;

    const canvasBg = isDark ? 'hsl(210 40% 15%)' : 'hsl(210 50% 95%)';
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = canvasBg;
    fabricCanvas.renderAll();
    toast.success("Canvas cleared!");
    if (!isLoadingState.current && !isSavingState.current) {
      saveState(fabricCanvas);
      autoSave(fabricCanvas);
    }
  }, [fabricCanvas, isViewOnly, isDark, saveState, autoSave]);

  const handleExport = useCallback((format: 'png' | 'svg') => {
    if (!fabricCanvas) return;
    
    if (format === "png") {
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });
      
      const link = document.createElement("a");
      link.download = `canvas-${sceneId}.png`;
      link.href = dataURL;
      link.click();
      
      toast.success("Canvas exported as PNG!");
    } else if (format === "svg") {
      const svgData = fabricCanvas.toSVG();
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.download = `canvas-${sceneId}.svg`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success("Canvas exported as SVG!");
    }
    setShowExportDropdown(false);
  }, [fabricCanvas, sceneId]);

  const toggleExportDropdown = useCallback(() => {
    setShowExportDropdown(prev => !prev);
  }, []);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Canvas link copied to clipboard!");
  }, []);

  const handleUndo = useCallback(() => {
    if (!fabricCanvas || isViewOnly || undoStack.length === 0) return;

    const currentObjects = fabricCanvas.getObjects();
    if (currentObjects.length > 0) {
      const lastObject = currentObjects[currentObjects.length - 1];
      fabricCanvas.remove(lastObject);
      fabricCanvas.renderAll();

      const currentState = JSON.stringify(fabricCanvas.toJSON());
      setRedoStack(prev => [...prev, currentState]);

      const newState = JSON.stringify(fabricCanvas.toJSON());
      setUndoStack(prev => [...prev.slice(0, -1), newState]);
      lastSavedState.current = newState;

      toast.success("Undo successful!");
    } else {
      const canvasBg = isDark ? 'hsl(210 40% 15%)' : 'hsl(210 50% 95%)';
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = canvasBg;
      fabricCanvas.renderAll();
      setUndoStack([]);
      setRedoStack([]);
      lastSavedState.current = null;
      toast.success("Canvas cleared!");
    }
  }, [fabricCanvas, isViewOnly, isDark, undoStack]);

  const handleRedo = useCallback(() => {
    if (!fabricCanvas || isViewOnly || redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    
    const currentState = JSON.stringify(fabricCanvas.toJSON());
    setUndoStack(prev => [...prev, currentState]);
    
    setRedoStack(prev => prev.slice(0, -1));
    lastSavedState.current = nextState;
    
    isLoadingState.current = true;
    fabricCanvas.loadFromJSON(nextState, () => {
      fabricCanvas.renderAll();
      fabricCanvas.getObjects().forEach(applyLockState);
      isLoadingState.current = false;
      toast.success("Redo successful!");
    });
  }, [fabricCanvas, isViewOnly, redoStack]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">
              Canvas Editor
            </h1>
            {isViewOnly && (
              <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                View Only
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? "Light" : "Dark"}
            </Button>

            {!isViewOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!fabricCanvas) {
                  toast.error("Canvas not ready.");
                  return;
                }
                try {
                  const data = JSON.stringify(fabricCanvas.toJSON());
                  await getPersistence().saveNow(data);
                  toast.success("Canvas saved to the cloud!");
              
                  const viewOnlyUrl = `${window.location.origin}/canvas/${sceneId}?viewOnly=true`;
              
                  if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(viewOnlyUrl);
                  } else {
                    const textArea = document.createElement("textarea");
                    textArea.value = viewOnlyUrl;
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                      document.execCommand('copy');
                    } catch (err) {
                      console.error('Fallback: Oops, unable to copy', err);
                    }
                    document.body.removeChild(textArea);
                  }
                  toast.success("View-only link copied!");
                } catch (error) {
                  console.error("Failed to save canvas or copy link:", error);
                  let errorMessage = "Could not save canvas or copy link. Please try again.";
                  if (error instanceof Error) {
                    errorMessage = `${errorMessage} Reason: ${error.message}`;
                  }
                  toast.error(errorMessage);
                }
              }}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy View Link
            </Button>
            )}

            <Button
              onClick={() => window.location.href = "/"}
              variant="outline"
              size="sm"
            >
              New Canvas
            </Button>
          </div>
        </div>

        {!isViewOnly && (
          <div className="flex items-center gap-4 p-4 bg-card border rounded-lg shadow-sm relative">
            <Toolbar
              activeTool={activeTool}
              onToolChange={handleToolChange}
              onDelete={handleDelete}
              onClear={handleClear}
              onExport={toggleExportDropdown}
              onShare={handleShare}
              onUndo={handleUndo}
              onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onLock={handleLock}
        onUnlock={handleUnlock}
        canLock={canLock}
        canUnlock={canUnlock}
      />
      {showExportDropdown && (
        <div className="absolute top-full mt-2 left-48 bg-card border rounded-lg shadow-lg z-10">
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
            onClick={() => handleExport("png")}
          >
            Export as PNG
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
            onClick={() => handleExport("svg")}
          >
            Export as SVG
          </button>
        </div>
      )}
      <div className="w-px h-8 bg-border" />
      <ColorPicker color={activeColor} onChange={handleColorChange} />
    </div>
  )}

        <div className="flex justify-center">
          <div className={cn(
            "bg-card border-2 border-border rounded-lg shadow-lg overflow-hidden relative",
            "transition-all duration-300 hover:shadow-xl"
          )}>
            <canvas ref={canvasRef} className="block" />
            {isLoading && (
              <div className="absolute inset-0 bg-card/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading canvas...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-muted-foreground">
          <p className="text-sm">
            {isViewOnly 
              ? "This canvas is in view-only mode" 
              : "Select tools from the toolbar above to start creating. Use the pen tool to draw freely."
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(CanvasEditor);
