import { memo } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
}

interface BoardConnectorProps {
  connection: Connection;
  fromElement: { position_x: number; position_y: number; width: number; height: number };
  toElement: { position_x: number; position_y: number; width: number; height: number };
  onDelete: (id: string) => void;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const BoardConnector = memo(({
  connection,
  fromElement,
  toElement,
  onDelete,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: BoardConnectorProps) => {
  // Calculate center points of elements
  const fromX = fromElement.position_x + fromElement.width / 2;
  const fromY = fromElement.position_y + fromElement.height / 2;
  const toX = toElement.position_x + toElement.width / 2;
  const toY = toElement.position_y + toElement.height / 2;

  // Calculate control points for a smooth curve
  const dx = toX - fromX;
  const dy = toY - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const curvature = Math.min(distance * 0.3, 100);

  // Determine curve direction based on relative positions
  const controlX1 = fromX + (Math.abs(dx) > Math.abs(dy) ? curvature * Math.sign(dx) : 0);
  const controlY1 = fromY + (Math.abs(dy) >= Math.abs(dx) ? curvature * Math.sign(dy) : 0);
  const controlX2 = toX - (Math.abs(dx) > Math.abs(dy) ? curvature * Math.sign(dx) : 0);
  const controlY2 = toY - (Math.abs(dy) >= Math.abs(dx) ? curvature * Math.sign(dy) : 0);

  const pathD = `M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`;

  // Calculate midpoint for delete button
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  return (
    <g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="cursor-pointer"
    >
      {/* Invisible wider path for easier hover detection */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
      />
      {/* Visible connector line */}
      <path
        d={pathD}
        fill="none"
        stroke={isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        strokeWidth={isHovered ? 3 : 2}
        strokeDasharray={isHovered ? "none" : "8 4"}
        className="transition-all duration-200"
        markerEnd="url(#arrowhead)"
      />
      {/* Delete button on hover */}
      {isHovered && (
        <foreignObject x={midX - 14} y={midY - 14} width={28} height={28}>
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(connection.id);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </foreignObject>
      )}
      {/* Connection dots at endpoints */}
      <circle
        cx={fromX}
        cy={fromY}
        r={isHovered ? 6 : 4}
        fill={isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        className="transition-all duration-200"
      />
      <circle
        cx={toX}
        cy={toY}
        r={isHovered ? 6 : 4}
        fill={isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        className="transition-all duration-200"
      />
    </g>
  );
});

BoardConnector.displayName = "BoardConnector";
