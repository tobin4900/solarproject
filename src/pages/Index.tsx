import { useEffect, useState } from "react";
import { generateSceneId } from "@/lib/scene-utils";
import { Button } from "@/components/ui/button";
import { Plus, Palette, Share, Zap, Moon, Sun } from "lucide-react";

const Index = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleNewCanvas = () => {
    const sceneId = generateSceneId();
    window.location.href = `/canvas/${sceneId}`;
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="absolute top-4 right-4">
        <Button onClick={toggleTheme} variant="outline" size="icon">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 text-primary">
            Creative Canvas Studio
          </h1>
          <p className="text-xl text-secondary-foreground mb-12 leading-relaxed">
            Design stunning visuals effortlessly with our intuitive canvas editor.
            Start creating and sharing your masterpieces instantly.
          </p>
          
          <Button 
            onClick={handleNewCanvas}
            className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 shadow-lg hover:shadow-xl"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start New Design
          </Button>

          <div className="grid md:grid-cols-3 gap-8 mt-20 text-left">
            <div className="p-6 bg-card text-card-foreground rounded-lg shadow-md border hover:shadow-lg transition-shadow">
              <Palette className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Advanced Drawing Tools</h3>
              <p className="text-muted-foreground">Pen, shapes, text, and colors - everything you need to create.</p>
            </div>
            <div className="p-6 bg-card text-card-foreground rounded-lg shadow-md border hover:shadow-lg transition-shadow">
              <Share className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Sharing</h3>
              <p className="text-muted-foreground">Share your canvas with anyone via a simple link. No accounts needed.</p>
            </div>
            <div className="p-6 bg-card text-card-foreground rounded-lg shadow-md border hover:shadow-lg transition-shadow">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Auto-Save</h3>
              <p className="text-muted-foreground">Your work is automatically saved as you create. Never lose progress.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
