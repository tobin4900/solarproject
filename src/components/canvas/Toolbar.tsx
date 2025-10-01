import { Button } from "@/components/ui/button";
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  PenTool,
  Trash2,
  Download,
  Share2,
  Undo2,
  Lock,
  Unlock,
} from "lucide-react";

export type ToolType = "select" | "rectangle" | "circle" | "text" | "pen";

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onDelete: () => void;
  onClear: () => void;
  onExport: () => void;
  onShare: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onLock: () => void;
  onUnlock: () => void;
  canLock: boolean;
  canUnlock: boolean;
}

export const Toolbar = ({
  activeTool,
  onToolChange,
  onDelete,
  onClear,
  onExport,
  onShare,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onLock,
  onUnlock,
  canLock,
  canUnlock,
}: ToolbarProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={activeTool === "select" ? "default" : "outline"}
        size="icon"
        onClick={() => onToolChange("select")}
        title="Select Tool"
      >
        <MousePointer2 className="w-5 h-5" />
      </Button>
      <Button
        variant={activeTool === "rectangle" ? "default" : "outline"}
        size="icon"
        onClick={() => onToolChange("rectangle")}
        title="Rectangle Tool"
      >
        <Square className="w-5 h-5" />
      </Button>
      <Button
        variant={activeTool === "circle" ? "default" : "outline"}
        size="icon"
        onClick={() => onToolChange("circle")}
        title="Circle Tool"
      >
        <Circle className="w-5 h-5" />
      </Button>
      <Button
        variant={activeTool === "text" ? "default" : "outline"}
        size="icon"
        onClick={() => onToolChange("text")}
        title="Text Tool"
      >
        <Type className="w-5 h-5" />
      </Button>
      <Button
        variant={activeTool === "pen" ? "default" : "outline"}
        size="icon"
        onClick={() => onToolChange("pen")}
        title="Pen Tool"
      >
        <PenTool className="w-5 h-5" />
      </Button>
      <Button variant="outline" size="icon" onClick={onDelete} title="Delete Selected">
        <Trash2 className="w-5 h-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={canLock ? onLock : onUnlock}
        disabled={!canLock && !canUnlock}
        title={canLock ? "Lock Selected" : "Unlock Selected"}
      >
        {canLock ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
      </Button>

      <Button variant="outline" size="icon" onClick={onExport} title="Export as PNG or SVG">
        <Download className="w-5 h-5" />
      </Button>
      <Button variant="outline" size="icon" onClick={onShare} title="Share Canvas">
        <Share2 className="w-5 h-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
      >
        <Undo2 className="w-5 h-5" />
      </Button>
    </div>
  );
};