import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Plus, FileDown, ZoomIn, ZoomOut, Maximize2, Grid3X3, Map, Link2, Sparkles, MoreVertical, MousePointer2, Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";
import { ConnectionLayer } from "@/components/board/ConnectionLayer";
import { Connection } from "@/components/board/BoardConnector";
import { AddElementDialog } from "@/components/board/AddElementDialog";
import { BoardManager } from "@/components/board/BoardManager";
import { AIDiagramGenerator } from "@/components/board/AIDiagramGenerator";

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

  // Dialog state
  const [showAddElement, setShowAddElement] = useState(false);
  const [showAIDiagram, setShowAIDiagram] = useState(false);
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  
  // Edit state
  const [editingElement, setEditingElement] = useState<BoardElement | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

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
      // Don't capture Space when focused on input elements
      const activeElement = document.activeElement;
      const isInputFocused = activeElement instanceof HTMLInputElement || 
                             activeElement instanceof HTMLTextAreaElement ||
                             activeElement?.getAttribute('contenteditable') === 'true';
      
      if (e.code === 'Space' && !e.repeat && !isInputFocused) {
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

  const loadElements = async (uid: string, boardId?: string | null) => {
    let query = supabase
      .from("dashboard_elements")
      .select("*")
      .eq("user_id", uid);
    
    if (boardId) {
      query = query.eq("board_id", boardId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading elements:", error);
      return;
    }

    if (data) {
      setElements(data as BoardElement[]);
    }
  };

  // Reload elements when board changes
  useEffect(() => {
    if (userId) {
      loadElements(userId, currentBoardId);
    }
  }, [currentBoardId, userId]);

  const handleAddElement = async (elementData: {
    section_key: string;
    section_title: string;
    content: string;
    color: string;
    width: number;
    height: number;
  }) => {
    const newElement = {
      user_id: userId,
      section_key: elementData.section_key,
      section_title: elementData.section_title,
      content: elementData.content,
      color: elementData.color,
      width: elementData.width,
      height: elementData.height,
      position_x: 100 + Math.random() * 200,
      position_y: 100 + Math.random() * 200,
      board_id: currentBoardId,
    };

    const { data, error } = await supabase
      .from("dashboard_elements")
      .insert(newElement)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add element",
        variant: "destructive",
      });
      return;
    }

    setElements((prev) => [...prev, data as BoardElement]);
    toast({
      title: "Element added",
      description: `"${elementData.section_title}" has been added to the board`,
    });
  };

  const handleAIDiagramGenerate = async (generatedElements: Array<{
    section_key: string;
    section_title: string;
    content: string;
    color: string;
    position_x: number;
    position_y: number;
  }>) => {
    const elementsToInsert = generatedElements.map((el) => ({
      user_id: userId,
      section_key: el.section_key,
      section_title: el.section_title,
      content: el.content,
      color: el.color,
      position_x: el.position_x,
      position_y: el.position_y,
      width: 300,
      height: 200,
      board_id: currentBoardId,
    }));

    const { data, error } = await supabase
      .from("dashboard_elements")
      .insert(elementsToInsert)
      .select();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add diagram elements",
        variant: "destructive",
      });
      return;
    }

    setElements((prev) => [...prev, ...(data as BoardElement[])]);
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

  const handleEditElement = (element: BoardElement) => {
    setEditingElement(element);
    setEditTitle(element.section_title);
    setEditContent(element.content);
  };

  const handleSaveEdit = async () => {
    if (!editingElement) return;
    
    const { error } = await supabase
      .from("dashboard_elements")
      .update({
        section_title: editTitle,
        content: editContent,
      })
      .eq("id", editingElement.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update element",
        variant: "destructive",
      });
      return;
    }

    setElements(prev =>
      prev.map(el =>
        el.id === editingElement.id
          ? { ...el, section_title: editTitle, content: editContent }
          : el
      )
    );
    
    setEditingElement(null);
    toast({
      title: "Element updated",
      description: "Your changes have been saved",
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
    <div className="h-screen bg-[#050505] flex flex-col overflow-hidden">
      {/* Blueprint Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
        }}
      />

      {/* Glass Navigation */}
      <nav className="sticky top-0 z-50 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Grid3X3 className="w-6 h-6 text-[#38BDF8]" />
            <span className="font-bold tracking-[0.2em] text-xs uppercase text-white">Logomir</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-mono tracking-widest text-zinc-500">
            <button 
              onClick={() => navigate("/projects")}
              className="hover:text-[#38BDF8] transition-colors uppercase"
            >
              Projects
            </button>
            <button className="text-[#38BDF8] uppercase">Canvas_View</button>
            <button 
              onClick={() => navigate("/canvas")}
              className="hover:text-[#38BDF8] transition-colors uppercase"
            >
              Roadmap
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              STATUS: SYNCED
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38BDF8] to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              {userId.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative w-full px-8 pt-6 pb-4 z-10 flex-shrink-0">
        {/* Header Section */}
        <div className="relative z-10 mb-8 flex justify-between items-end max-w-7xl mx-auto">
          <div>
            <p className="font-mono text-[#38BDF8] text-[10px] tracking-widest mb-2">SYSTEM.ANALYSIS_BOARD.V2</p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Project <span className="text-[#38BDF8]">Analysis</span> Canvas
            </h1>
            <p className="text-zinc-500 mt-3 max-w-xl text-sm leading-relaxed">
              Visualizing core architectural components and logic flow for solo product building.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAddElement(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              Add Component
            </Button>
            <Button
              onClick={() => setShowAIDiagram(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono bg-[#38BDF8] text-black font-bold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(56,189,248,0.4)] uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4" />
              AI Diagram
            </Button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BoardManager
              userId={userId}
              currentBoardId={currentBoardId}
              onBoardChange={setCurrentBoardId}
              onBoardCreated={(board) => setCurrentBoardId(board.id)}
            />
            
            <div className="h-6 w-px bg-white/10 mx-2" />
            
            <Button
              variant={snapToGrid ? "default" : "outline"}
              size="sm"
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={cn(
                "text-[10px] font-mono uppercase tracking-wider",
                snapToGrid 
                  ? "bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/30" 
                  : "border-white/10 text-zinc-400 hover:text-white"
              )}
            >
              <Grid3X3 className="w-4 h-4 mr-1.5" />
              Snap
            </Button>
            
            <Button
              variant={showMinimap ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMinimap(!showMinimap)}
              className={cn(
                "text-[10px] font-mono uppercase tracking-wider",
                showMinimap 
                  ? "bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/30" 
                  : "border-white/10 text-zinc-400 hover:text-white"
              )}
            >
              <Map className="w-4 h-4 mr-1.5" />
              Map
            </Button>
            
            <Button
              variant={connectMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setConnectMode(!connectMode);
                setDrawingConnection(null);
              }}
              className={cn(
                "text-[10px] font-mono uppercase tracking-wider",
                connectMode 
                  ? "bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/30" 
                  : "border-white/10 text-zinc-400 hover:text-white"
              )}
            >
              <Link2 className="w-4 h-4 mr-1.5" />
              Connect
            </Button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#141820]/80 backdrop-blur border border-white/10 rounded-lg px-3 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-[#38BDF8] hover:bg-transparent"
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-[11px] font-mono text-white px-3 min-w-[4rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-[#38BDF8] hover:bg-transparent"
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-[#38BDF8] hover:bg-transparent"
              onClick={handleZoomReset}
              title="Reset View (Ctrl+0)"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Board Area */}
      <div
        ref={containerRef}
        className={cn(
          "relative flex-1 min-h-0 overflow-hidden",
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
              linear-gradient(to right, rgba(56, 189, 248, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56, 189, 248, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            backgroundColor: '#0a0a0a',
          }}
        >
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-[#141820] border border-[#262c3a] p-10 text-center max-w-md shadow-2xl">
                {/* Corner accents */}
                <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#38BDF8]" />
                <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-[#38BDF8]" />
                <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-[#38BDF8]" />
                <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-[#38BDF8]" />
                
                <div className="w-16 h-16 mx-auto mb-4 bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-[#38BDF8]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No elements yet</h3>
                <p className="text-zinc-400 mb-6 text-sm">
                  Click "Add Component" or use "AI Diagram" to start building your analysis canvas.
                </p>
                <Button 
                  onClick={() => setShowAddElement(true)}
                  className="bg-[#38BDF8] text-black font-bold hover:opacity-90 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                >
                  Add First Component
                </Button>
              </div>
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

          {/* Canvas Cards */}
          {elements.map((element) => (
            <div
              key={element.id}
              className={cn(
                "absolute select-none transition-all duration-300",
                "bg-[#141820] border border-[#262c3a] shadow-2xl",
                "hover:translate-y-[-4px] hover:border-[#38BDF8] hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]",
                connectMode ? "cursor-crosshair" : "cursor-move",
                draggingElement === element.id && "shadow-2xl z-50 ring-2 ring-[#38BDF8] shadow-[0_0_30px_rgba(56,189,248,0.3)]",
                connectMode && drawingConnection?.fromId === element.id && "ring-2 ring-[#38BDF8]"
              )}
              style={{
                left: `${element.position_x}px`,
                top: `${element.position_y}px`,
                width: `${element.width}px`,
                minHeight: `${element.height}px`,
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
              {/* Connection nodes */}
              <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-[#38BDF8] rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
              <div className="absolute -bottom-1.5 left-1/2 w-3 h-3 bg-[#38BDF8] rounded-full border-2 border-[#050505]" />
              <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-[#38BDF8] rounded-full border-2 border-[#050505]" />
              <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-[#38BDF8] rounded-full border-2 border-[#050505]" />
              
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span 
                    className="text-[9px] font-mono uppercase tracking-tighter px-2 py-0.5 rounded"
                    style={{ 
                      color: element.color,
                      backgroundColor: `${element.color}15`,
                      border: `1px solid ${element.color}30`
                    }}
                  >
                    {element.section_key}
                  </span>
                  <button className="text-zinc-600 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="font-semibold text-white text-base">{element.section_title}</h3>
                
                <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {element.content}
                </p>
                
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: element.color }}
                    />
                    <span>Active Node</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="delete-btn h-7 w-7 text-zinc-500 hover:bg-[#38BDF8]/10 hover:text-[#38BDF8]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditElement(element);
                      }}
                      title="Edit element"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="delete-btn h-7 w-7 text-zinc-500 hover:bg-[#38BDF8]/10 hover:text-[#38BDF8]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportToPDF(element);
                      }}
                      title="Export to PDF"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="delete-btn h-7 w-7 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(element.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Toolbar */}
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-[#141820]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl px-8 py-4 flex items-center gap-8 z-50">
          <button 
            onClick={() => setConnectMode(false)}
            className={cn(
              "transition-all transform hover:scale-110",
              !connectMode ? "text-[#38BDF8]" : "text-zinc-500 hover:text-[#38BDF8]"
            )}
          >
            <MousePointer2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={cn(
              "transition-all transform hover:scale-110",
              snapToGrid ? "text-[#38BDF8]" : "text-zinc-500 hover:text-[#38BDF8]"
            )}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button 
            className="text-[#38BDF8] bg-[#38BDF8]/10 rounded-xl p-2 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
            onClick={() => setShowAIDiagram(true)}
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button 
            onClick={() => setShowAddElement(true)}
            className="text-zinc-500 hover:text-[#38BDF8] transition-all transform hover:scale-110"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setConnectMode(!connectMode)}
            className={cn(
              "transition-all transform hover:scale-110",
              connectMode ? "text-[#38BDF8]" : "text-zinc-500 hover:text-[#38BDF8]"
            )}
          >
            <Link2 className="w-5 h-5" />
          </button>
        </div>

        {/* Minimap */}
        {showMinimap && (
          <div
            className="absolute bottom-4 right-4 w-48 h-32 bg-[#141820]/90 backdrop-blur border border-[#262c3a] rounded-lg overflow-hidden shadow-lg cursor-pointer"
            onClick={handleMinimapClick}
          >
            <div className="relative w-full h-full">
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
              <div
                className="absolute border-2 border-[#38BDF8] bg-[#38BDF8]/10 pointer-events-none"
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
        <div className="absolute bottom-4 left-4 text-[10px] font-mono text-zinc-500 bg-[#141820]/80 backdrop-blur px-4 py-2.5 rounded-lg border border-white/5">
          <div className="flex gap-4 flex-wrap">
            <span>Scroll: Pan</span>
            <span>⌘+Scroll: Zoom</span>
            <span>Space+Drag: Pan</span>
            {connectMode && <span className="text-[#38BDF8] font-medium">🔗 Click → Drag → Connect</span>}
          </div>
        </div>
      </div>

      {/* AI Analyst Panel */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-[#141820]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl w-80 p-5 transition-all hover:border-[#38BDF8]/30 duration-500">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">AI Analyst</h4>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38BDF8]" />
            </span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-lg p-4 mb-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              <span className="font-bold text-[#38BDF8] mr-1">Insight:</span> 
              {elements.length === 0 
                ? "Start adding components to build your analysis canvas. Use AI Diagram for quick generation."
                : `Detected ${elements.length} components. Consider adding connections to visualize relationships.`
              }
            </p>
          </div>
          <button 
            onClick={() => setShowAIDiagram(true)}
            className="w-full text-[10px] font-mono font-bold uppercase tracking-widest py-3 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-white/5"
          >
            Generate Architecture
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <AddElementDialog
        open={showAddElement}
        onOpenChange={setShowAddElement}
        onAdd={handleAddElement}
      />

      <AIDiagramGenerator
        open={showAIDiagram}
        onOpenChange={setShowAIDiagram}
        onGenerate={handleAIDiagramGenerate}
      />

      {/* Edit Element Dialog */}
      <Dialog open={!!editingElement} onOpenChange={(open) => !open && setEditingElement(null)}>
        <DialogContent className="bg-[#141820] border-[#262c3a] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Pencil className="w-4 h-4 text-[#38BDF8]" />
              Edit Element
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update the title and content of this element.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-[#0a0a0a] border-[#262c3a] text-white focus:border-[#38BDF8]"
                placeholder="Element title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Content</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="bg-[#0a0a0a] border-[#262c3a] text-white focus:border-[#38BDF8] min-h-[200px]"
                placeholder="Element content..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingElement(null)}
              className="border-[#262c3a] text-zinc-400 hover:text-white hover:bg-[#262c3a]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#38BDF8] text-black font-bold hover:opacity-90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Board;
