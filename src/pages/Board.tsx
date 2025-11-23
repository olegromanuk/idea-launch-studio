import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardElement {
  id: string;
  section_key: string;
  section_title: string;
  content: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  color: string;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
];

const Board = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Get or create user session ID
    let sessionUserId = localStorage.getItem("boardUserId");
    if (!sessionUserId) {
      sessionUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("boardUserId", sessionUserId);
    }
    setUserId(sessionUserId);
    loadElements(sessionUserId);
  }, []);

  const loadElements = async (uid: string) => {
    const { data, error } = await supabase
      .from("dashboard_elements")
      .select("*")
      .eq("user_id", uid);

    if (error) {
      console.error("Error loading elements:", error);
      return;
    }

    if (data) {
      setElements(data as BoardElement[]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if ((e.target as HTMLElement).classList.contains('delete-btn')) return;
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingElement(elementId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingElement || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const newX = e.clientX - boardRect.left - dragOffset.x;
    const newY = e.clientY - boardRect.top - dragOffset.y;

    setElements(prev =>
      prev.map(el =>
        el.id === draggingElement
          ? { ...el, position_x: newX, position_y: newY }
          : el
      )
    );
  };

  const handleMouseUp = async () => {
    if (!draggingElement) return;

    const element = elements.find(el => el.id === draggingElement);
    if (element) {
      await supabase
        .from("dashboard_elements")
        .update({
          position_x: element.position_x,
          position_y: element.position_y,
        })
        .eq("id", draggingElement);
    }

    setDraggingElement(null);
  };

  const handleDelete = async (elementId: string) => {
    const { error } = await supabase
      .from("dashboard_elements")
      .delete()
      .eq("id", elementId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete element",
        variant: "destructive",
      });
      return;
    }

    setElements(prev => prev.filter(el => el.id !== elementId));
    toast({
      title: "Element deleted",
      description: "The element has been removed from your board",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/canvas")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Canvas
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Interactive Board</h1>
              <p className="text-sm text-muted-foreground">
                Your canvas elements visualization
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            View Dashboard
          </Button>
        </div>
      </div>

      {/* Board Area */}
      <div
        ref={boardRef}
        className="relative w-full h-[calc(100vh-100px)] overflow-auto bg-muted/20"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      >
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="p-8 text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No elements yet</h3>
              <p className="text-muted-foreground mb-4">
                Go to the Canvas page and click "Add to Online Dashboard" on any completed section to add elements here.
              </p>
              <Button onClick={() => navigate("/canvas")}>
                Go to Canvas
              </Button>
            </Card>
          </div>
        )}

        {elements.map((element) => (
          <Card
            key={element.id}
            className={cn(
              "absolute cursor-move transition-shadow hover:shadow-xl",
              draggingElement === element.id && "shadow-2xl z-50"
            )}
            style={{
              left: `${element.position_x}px`,
              top: `${element.position_y}px`,
              width: `${element.width}px`,
              minHeight: `${element.height}px`,
              borderLeft: `4px solid ${element.color}`,
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div
                    className="text-xs uppercase tracking-wide font-semibold mb-1"
                    style={{ color: element.color }}
                  >
                    {element.section_key}
                  </div>
                  <h4 className="font-bold text-lg">{element.section_title}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="delete-btn h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDelete(element.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {element.content}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Board;
