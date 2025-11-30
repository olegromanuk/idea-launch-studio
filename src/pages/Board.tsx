import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Plus, FileDown, ZoomIn, ZoomOut, Maximize2, Grid3X3, Map, Link2, LinkIcon } from "lucide-react";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";
import { ConnectionLayer } from "@/components/board/ConnectionLayer";
import { Connection } from "@/components/board/BoardConnector";

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

const GRID_SIZE = 20;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const PAN_SPEED = 50;

const Board = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string>("");
  
  // Transform state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  
  // Settings
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  
  // Connection state
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectMode, setConnectMode] = useState(false);
  const [drawingConnection, setDrawingConnection] = useState<{ fromId: string; toX: number; toY: number } | null>(null);

  // Board dimensions for minimap
  const BOARD_WIDTH = 3000;
  const BOARD_HEIGHT = 2000;

  useEffect(() => {
    let sessionUserId = localStorage.getItem("boardUserId");
    if (!sessionUserId) {
      sessionUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("boardUserId", sessionUserId);
    }
    setUserId(sessionUserId);
    loadElements(sessionUserId);
    loadConnections(sessionUserId);
  }, []);

  const loadConnections = async (uid: string) => {
    const { data, error } = await supabase
      .from("board_connections")
      .select("*")
      .eq("user_id", uid);

    if (error) {
      console.error("Error loading connections:", error);
      return;
    }

    if (data) {
      setConnections(data.map(c => ({
        id: c.id,
        fromId: c.from_element_id,
        toId: c.to_element_id,
      })));
    }
  };

  const saveConnection = async (fromId: string, toId: string): Promise<Connection | null> => {
    const { data, error } = await supabase
      .from("board_connections")
      .insert({
        user_id: userId,
        from_element_id: fromId,
        to_element_id: toId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving connection:", error);
      toast({
        title: "Error",
        description: "Failed to save connection",
        variant: "destructive",
      });
      return null;
    }

    return {
      id: data.id,
      fromId: data.from_element_id,
      toId: data.to_element_id,
    };
  };

  const deleteConnection = async (connectionId: string) => {
    const { error } = await supabase
      .from("board_connections")
      .delete()
      .eq("id", connectionId);

    if (error) {
      console.error("Error deleting connection:", error);
      toast({
        title: "Error",
        description: "Failed to delete connection",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setSpacePressed(true);
      }
      // Arrow key panning
      if (e.key === 'ArrowLeft') setPan(p => ({ ...p, x: p.x + PAN_SPEED }));
      if (e.key === 'ArrowRight') setPan(p => ({ ...p, x: p.x - PAN_SPEED }));
      if (e.key === 'ArrowUp') setPan(p => ({ ...p, y: p.y + PAN_SPEED }));
      if (e.key === 'ArrowDown') setPan(p => ({ ...p, y: p.y - PAN_SPEED }));
      // Zoom shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        handleZoomReset();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
      } else {
        // Pan with scroll
        setPan(p => ({
          x: p.x - e.deltaX,
          y: p.y - e.deltaY
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Touch gestures for pinch zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let initialDistance = 0;
    let initialZoom = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.sqrt(dx * dx + dy * dy);
        initialZoom = zoom;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scale = distance / initialDistance;
        setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, initialZoom * scale)));
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [zoom]);

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

  const snapToGridValue = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const handleMouseDown = (e: React.MouseEvent, elementId?: string) => {
    // Pan mode (space + drag or middle click)
    if (spacePressed || e.button === 1 || (!elementId && e.button === 0 && !connectMode)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (!elementId) return;
    if ((e.target as HTMLElement).classList.contains('delete-btn')) return;
    if ((e.target as HTMLElement).classList.contains('connect-btn')) return;

    // Connect mode - start drawing a connection
    if (connectMode && elementId) {
      const boardRect = boardRef.current?.getBoundingClientRect();
      if (boardRect) {
        const mouseX = (e.clientX - boardRect.left - pan.x) / zoom;
        const mouseY = (e.clientY - boardRect.top - pan.y) / zoom;
        setDrawingConnection({ fromId: elementId, toX: mouseX, toY: mouseY });
      }
      return;
    }
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    });
    setDraggingElement(elementId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Panning
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    // Drawing connection line
    if (drawingConnection && boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - boardRect.left - pan.x) / zoom;
      const mouseY = (e.clientY - boardRect.top - pan.y) / zoom;
      setDrawingConnection(prev => prev ? { ...prev, toX: mouseX, toY: mouseY } : null);
      return;
    }

    // Element dragging
    if (!draggingElement || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    let newX = (e.clientX - boardRect.left - pan.x) / zoom - dragOffset.x;
    let newY = (e.clientY - boardRect.top - pan.y) / zoom - dragOffset.y;

    newX = snapToGridValue(newX);
    newY = snapToGridValue(newY);

    setElements(prev =>
      prev.map(el =>
        el.id === draggingElement
          ? { ...el, position_x: Math.max(0, newX), position_y: Math.max(0, newY) }
          : el
      )
    );
  };

  const handleMouseUp = async (e: React.MouseEvent, elementId?: string) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // Complete connection if in connect mode
    if (drawingConnection && elementId && elementId !== drawingConnection.fromId) {
      // Check if connection already exists
      const exists = connections.some(
        c => (c.fromId === drawingConnection.fromId && c.toId === elementId) ||
             (c.fromId === elementId && c.toId === drawingConnection.fromId)
      );
      
      if (!exists) {
        const newConnection = await saveConnection(drawingConnection.fromId, elementId);
        if (newConnection) {
          setConnections(prev => [...prev, newConnection]);
          toast({
            title: "Connection created",
            description: "Elements have been linked",
          });
        }
      }
    }
    setDrawingConnection(null);

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

  const handleDeleteConnection = async (connectionId: string) => {
    const success = await deleteConnection(connectionId);
    if (success) {
      setConnections(prev => prev.filter(c => c.id !== connectionId));
      toast({
        title: "Connection removed",
        description: "The link has been deleted",
      });
    }
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

    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    const rgb = element.color.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [59, 130, 246];
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(0, 0, 8, pageHeight, 'F');

    doc.setFontSize(10);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(element.section_key.toUpperCase(), margin, margin);

    doc.setFontSize(32);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(element.section_title, margin, margin + 15);

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 20, pageWidth - margin, margin + 20);

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

  const handleZoomIn = () => setZoom(z => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () => setZoom(z => Math.max(z - ZOOM_STEP, MIN_ZOOM));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Minimap click navigation
  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;
    
    const newPanX = -(clickX * BOARD_WIDTH * zoom - containerRect.width / 2);
    const newPanY = -(clickY * BOARD_HEIGHT * zoom - containerRect.height / 2);
    
    setPan({ x: newPanX, y: newPanY });
  };

  // Calculate viewport for minimap
  const getViewportRect = useCallback(() => {
    if (!containerRef.current) return { x: 0, y: 0, width: 100, height: 100 };
    const container = containerRef.current;
    const viewportWidth = (container.clientWidth / zoom / BOARD_WIDTH) * 100;
    const viewportHeight = (container.clientHeight / zoom / BOARD_HEIGHT) * 100;
    const viewportX = (-pan.x / zoom / BOARD_WIDTH) * 100;
    const viewportY = (-pan.y / zoom / BOARD_HEIGHT) * 100;
    return { x: viewportX, y: viewportY, width: viewportWidth, height: viewportHeight };
  }, [pan, zoom]);

  const viewport = getViewportRect();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card shrink-0">
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
                Drag to move • Scroll to pan • Ctrl+Scroll to zoom • Space+Drag to pan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Snap to grid toggle */}
            <Button
              variant={snapToGrid ? "default" : "outline"}
              size="sm"
              onClick={() => setSnapToGrid(!snapToGrid)}
              title="Snap to grid"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Snap
            </Button>
            
            {/* Minimap toggle */}
            <Button
              variant={showMinimap ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMinimap(!showMinimap)}
              title="Toggle minimap"
            >
              <Map className="w-4 h-4 mr-2" />
              Map
            </Button>
            
            {/* Connect mode toggle */}
            <Button
              variant={connectMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setConnectMode(!connectMode);
                setDrawingConnection(null);
              }}
              title="Draw connections between elements"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Connect
            </Button>

            {/* Zoom controls */}
            <div className="flex items-center gap-1 border border-border rounded-md p-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomOut}
                disabled={zoom <= MIN_ZOOM}
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
                disabled={zoom >= MAX_ZOOM}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleZoomReset}
                title="Reset View (Ctrl+0)"
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
        ref={containerRef}
        className={cn(
          "relative flex-1 overflow-hidden bg-muted/20",
          isPanning || spacePressed ? "cursor-grab" : connectMode ? "cursor-crosshair" : "cursor-default",
          isPanning && "cursor-grabbing"
        )}
        onMouseDown={(e) => handleMouseDown(e)}
        onMouseMove={handleMouseMove}
        onMouseUp={(e) => handleMouseUp(e)}
        onMouseLeave={(e) => handleMouseUp(e)}
      >
        {/* Transformed board content */}
        <div
          ref={boardRef}
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
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

          {/* Connection lines layer */}
          <ConnectionLayer
            connections={connections}
            elements={elements}
            onDeleteConnection={handleDeleteConnection}
            drawingConnection={drawingConnection}
            boardWidth={BOARD_WIDTH}
            boardHeight={BOARD_HEIGHT}
          />

          {elements.map((element) => (
            <Card
              key={element.id}
              className={cn(
                "absolute transition-shadow hover:shadow-xl select-none",
                connectMode ? "cursor-crosshair" : "cursor-move",
                draggingElement === element.id && "shadow-2xl z-50 ring-2 ring-primary",
                connectMode && drawingConnection?.fromId === element.id && "ring-2 ring-primary"
              )}
              style={{
                left: `${element.position_x}px`,
                top: `${element.position_y}px`,
                width: `${element.width}px`,
                minHeight: `${element.height}px`,
                borderLeft: `4px solid ${element.color}`,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, element.id);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                handleMouseUp(e, element.id);
              }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportToPDF(element);
                      }}
                      title="Export to PDF"
                    >
                      <FileDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="delete-btn h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(element.id);
                      }}
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

        {/* Minimap */}
        {showMinimap && (
          <div
            className="absolute bottom-4 right-4 w-48 h-32 bg-card/90 backdrop-blur border border-border rounded-lg overflow-hidden shadow-lg cursor-pointer"
            onClick={handleMinimapClick}
          >
            <div className="relative w-full h-full">
              {/* Elements on minimap */}
              {elements.map((element) => (
                <div
                  key={element.id}
                  className="absolute rounded-sm"
                  style={{
                    left: `${(element.position_x / BOARD_WIDTH) * 100}%`,
                    top: `${(element.position_y / BOARD_HEIGHT) * 100}%`,
                    width: `${(element.width / BOARD_WIDTH) * 100}%`,
                    height: `${(element.height / BOARD_HEIGHT) * 100}%`,
                    backgroundColor: element.color,
                    opacity: 0.7,
                    minWidth: 4,
                    minHeight: 3,
                  }}
                />
              ))}
              {/* Viewport indicator */}
              <div
                className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
                style={{
                  left: `${Math.max(0, viewport.x)}%`,
                  top: `${Math.max(0, viewport.y)}%`,
                  width: `${Math.min(100, viewport.width)}%`,
                  height: `${Math.min(100, viewport.height)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-card/80 backdrop-blur px-3 py-2 rounded-md border border-border">
          <div className="flex gap-4 flex-wrap">
            <span>🖱️ Scroll: Pan</span>
            <span>⌘/Ctrl + Scroll: Zoom</span>
            <span>Space + Drag: Pan</span>
            <span>Arrows: Navigate</span>
            {connectMode && <span className="text-primary font-medium">🔗 Click element → drag to another to connect</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
