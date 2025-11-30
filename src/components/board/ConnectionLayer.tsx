import { useState, memo } from "react";
import { BoardConnector, Connection } from "./BoardConnector";

interface BoardElement {
  id: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
}

interface ConnectionLayerProps {
  connections: Connection[];
  elements: BoardElement[];
  onDeleteConnection: (id: string) => void;
  drawingConnection: { fromId: string; toX: number; toY: number } | null;
  boardWidth: number;
  boardHeight: number;
}

export const ConnectionLayer = memo(({
  connections,
  elements,
  onDeleteConnection,
  drawingConnection,
  boardWidth,
  boardHeight,
}: ConnectionLayerProps) => {
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);

  const getElement = (id: string) => elements.find(el => el.id === id);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={boardWidth}
      height={boardHeight}
      style={{ overflow: "visible" }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="hsl(var(--muted-foreground))"
          />
        </marker>
        <marker
          id="arrowhead-active"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="hsl(var(--primary))"
          />
        </marker>
      </defs>

      <g className="pointer-events-auto">
        {connections.map((connection) => {
          const fromElement = getElement(connection.fromId);
          const toElement = getElement(connection.toId);
          
          if (!fromElement || !toElement) return null;

          return (
            <BoardConnector
              key={connection.id}
              connection={connection}
              fromElement={fromElement}
              toElement={toElement}
              onDelete={onDeleteConnection}
              isHovered={hoveredConnection === connection.id}
              onMouseEnter={() => setHoveredConnection(connection.id)}
              onMouseLeave={() => setHoveredConnection(null)}
            />
          );
        })}
      </g>

      {/* Drawing preview line */}
      {drawingConnection && (() => {
        const fromElement = getElement(drawingConnection.fromId);
        if (!fromElement) return null;

        const fromX = fromElement.position_x + fromElement.width / 2;
        const fromY = fromElement.position_y + fromElement.height / 2;

        return (
          <g>
            <line
              x1={fromX}
              y1={fromY}
              x2={drawingConnection.toX}
              y2={drawingConnection.toY}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="8 4"
              markerEnd="url(#arrowhead-active)"
            />
            <circle
              cx={fromX}
              cy={fromY}
              r={6}
              fill="hsl(var(--primary))"
            />
            <circle
              cx={drawingConnection.toX}
              cy={drawingConnection.toY}
              r={6}
              fill="hsl(var(--primary))"
              opacity={0.5}
            />
          </g>
        );
      })()}
    </svg>
  );
});

ConnectionLayer.displayName = "ConnectionLayer";
