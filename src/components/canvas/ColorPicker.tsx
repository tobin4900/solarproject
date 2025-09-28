import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const presetColors = [
    "#000000", 
    "#ffffff", 
    "#ef4444", 
    "#f97316", 
    "#eab308", 
    "#22c55e", 
    "#06b6d4", 
    "#3b82f6", 
    "#6366f1", 
    "#a855f7", 
    "#ec4899", 
    "#64748b", 
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 border-2 transition-smooth hover:shadow-button"
          style={{ backgroundColor: color }}
          title="Change Color"
        >
          {color === "#ffffff" || color === "white" ? (
            <Palette className="h-4 w-4 text-gray-700" />
          ) : (
            <div className="w-full h-full rounded-sm" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-4">
          <div>
            <Label htmlFor="color-input" className="text-sm font-medium">
              Custom Color
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="color-input"
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-12 h-10 p-1 border-2"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Preset Colors</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => onChange(presetColor)}
                  className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};