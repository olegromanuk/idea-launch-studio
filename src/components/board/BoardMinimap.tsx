import { useRef, useEffect, useState } from "react";
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

interface BoardMinimapProps {
  elements: BoardElement[];
  zoom: number;
  boardRef: React.RefObject<HTMLDivElement>;
  onNavigate: (x: number, y: number) => void;
}

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;

export const BoardMinimap = ({ elements, zoom, boardRef, onNavigate }: BoardMinimapProps) => {
  const minimapRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [bounds, setBounds] = useState({ minX: 0, minY: 0, maxX: 1000, maxY: 800 });

  // Calculate bounds of all elements
  useEffect(() => {
    if (elements.length === 0) {
      setBounds({ minX: 0, minY: 0, maxX: 1000, maxY: 800 });
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    elements.forEach(el => {
      minX = Math.min(minX, el.position_x);
      minY = Math.min(minY, el.position_y);
      maxX = Math.max(maxX, el.position_x + el.width);
      maxY = Math.max(maxY, el.position_y + el.height);
    });

    // Add padding
    const padding = 100;
    setBounds({
      minX: Math.min(0, minX - padding),
      minY: Math.min(0, minY - padding),
      maxX: Math.max(1000, maxX + padding),
      maxY: Math.max(800, maxY + padding),
    });
  }, [elements]);

  // Update viewport indicator based on scroll position
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const updateViewport = () => {
      const boardWidth = bounds.maxX - bounds.minX;
      const boardHeight = bounds.maxY - bounds.minY;
      
      const scaleX = MINIMAP_WIDTH / boardWidth;
      const scaleY = MINIMAP_HEIGHT / boardHeight;
      const scale = Math.min(scaleX, scaleY);

      const visibleWidth = board.clientWidth / zoom;
      const visibleHeight = board.clientHeight / zoom;
      
      setViewport({
        x: ((board.scrollLeft / zoom) - bounds.minX) * scale,
        y: ((board.scrollTop / zoom) - bounds.minY) * scale,
        width: visibleWidth * scale,
        height: visibleHeight * scale,
      });
    };

    updateViewport();
    board.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);

    return () => {
      board.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, [boardRef, zoom, bounds]);

  const handleMinimapClick = (e: React.MouseEvent) => {
    const rect = minimapRef.current?.getBoundingClientRect();
    if (!rect || !boardRef.current) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const boardWidth = bounds.maxX - bounds.minX;
    const boardHeight = bounds.maxY - bounds.minY;
    
    const scaleX = MINIMAP_WIDTH / boardWidth;
    const scaleY = MINIMAP_HEIGHT / boardHeight;
    const scale = Math.min(scaleX, scaleY);

    const targetX = (clickX / scale) + bounds.minX - (boardRef.current.clientWidth / zoom / 2);
    const targetY = (clickY / scale) + bounds.minY - (boardRef.current.clientHeight / zoom / 2);

    onNavigate(targetX * zoom, targetY * zoom);
  };

  const boardWidth = bounds.maxX - bounds.minX;
  const boardHeight = bounds.maxY - bounds.minY;
  const scaleX = MINIMAP_WIDTH / boardWidth;
  const scaleY = MINIMAP_HEIGHT / boardHeight;
  const scale = Math.min(scaleX, scaleY);

  return (
    <div 
      className="absolute bottom-4 right-4 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
      style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
    >
      <div 
        ref={minimapRef}
        className="relative w-full h-full bg-muted/30 cursor-pointer"
        onClick={handleMinimapClick}
      >
        {/* Render miniature elements */}
        {elements.map((element) => (
          <div
            key={element.id}
            className="absolute rounded-sm opacity-80"
            style={{
              left: `${(element.position_x - bounds.minX) * scale}px`,
              top: `${(element.position_y - bounds.minY) * scale}px`,
              width: `${Math.max(element.width * scale, 4)}px`,
              height: `${Math.max(element.height * scale, 4)}px`,
              backgroundColor: element.color,
            }}
          />
        ))}
        
        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-primary bg-primary/10 rounded-sm pointer-events-none"
          style={{
            left: `${Math.max(0, viewport.x)}px`,
            top: `${Math.max(0, viewport.y)}px`,
            width: `${Math.min(viewport.width, MINIMAP_WIDTH - viewport.x)}px`,
            height: `${Math.min(viewport.height, MINIMAP_HEIGHT - viewport.y)}px`,
          }}
        />
      </div>
      
      {/* Label */}
      <div className="absolute top-1 left-1 text-[10px] text-muted-foreground font-medium">
        Navigator
      </div>
    </div>
  );
};
