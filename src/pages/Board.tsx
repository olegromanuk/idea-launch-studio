import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Plus, Save, FileDown, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";
import { BoardMinimap } from "@/components/board/BoardMinimap";

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
  const [zoom, setZoom] = useState(1);

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
    const newX = (e.clientX - boardRect.left) / zoom - dragOffset.x;
    const newY = (e.clientY - boardRect.top) / zoom - dragOffset.y;

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

  const handleExportToPDF = (element: BoardElement) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Background color
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Color accent bar (left side)
    const rgb = element.color.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [59, 130, 246];
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(0, 0, 8, pageHeight, 'F');

    // Section key (small text at top)
    doc.setFontSize(10);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(element.section_key.toUpperCase(), margin, margin);

    // Section title (large heading)
    doc.setFontSize(32);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(element.section_title, margin, margin + 15);

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 20, pageWidth - margin, margin + 20);

    // Content
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    
    const maxWidth = pageWidth - (margin * 2);
    const lines = doc.splitTextToSize(element.content, maxWidth);
    let yPosition = margin + 30;
    
    lines.forEach((line: string) => {
      if (yPosition < pageHeight - margin) {
        doc.text(line, margin, yPosition);
        yPosition += 7;
      }
    });

    // Footer with date
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      margin,
      pageHeight - 10
    );

    const filename = `${element.section_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pdf`;
    doc.save(filename);

    toast({
      title: "PDF Exported",
      description: `${element.section_title} has been exported successfully`,
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  const handleMinimapNavigate = (x: number, y: number) => {
    if (boardRef.current) {
      boardRef.current.scrollTo({ left: x, top: y, behavior: 'smooth' });
    }
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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-border rounded-md p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2 min-w-[4rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomIn}
                disabled={zoom >= 2}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomReset}
                title="Reset Zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
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
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            width: `${100 / zoom}%`,
            height: `${100 / zoom}%`,
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
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="delete-btn h-8 w-8 hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleExportToPDF(element)}
                    title="Export to PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="delete-btn h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDelete(element.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {element.content}
              </div>
            </div>
          </Card>
        ))}
        </div>

        {/* Minimap Navigator */}
        <BoardMinimap
          elements={elements}
          zoom={zoom}
          boardRef={boardRef}
          onNavigate={handleMinimapNavigate}
        />
      </div>
    </div>
  );
};

export default Board;
