import type { LayoutGraph, LayoutNode } from "@commons-sim/shared";

export function LayoutCanvas(props: {
  layout: LayoutGraph;
  selectedLayoutNodeId?: string;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <div className="layout-canvas">
      <svg viewBox="-520 -520 1040 1040" role="img" aria-label={props.layout.title}>
        {props.layout.nodes.map((node) => (
          <LayoutShape
            key={node.id}
            node={node}
            selected={props.selectedLayoutNodeId === node.id}
            onSelect={() => props.onSelectNode(node.id)}
          />
        ))}
      </svg>
    </div>
  );
}

function LayoutShape(props: { node: LayoutNode; selected: boolean; onSelect: () => void }) {
  const geometry = props.node.geometry;
  const className = `layout-node node-${props.node.kind} ${props.selected ? "selected-node" : ""}`;

  if (geometry.type === "ring") {
    return (
      <circle
        className={className}
        cx={geometry.center.x}
        cy={-geometry.center.y}
        r={(geometry.innerRadius + geometry.outerRadius) / 2}
        strokeWidth={Math.max(3, geometry.outerRadius - geometry.innerRadius)}
        onClick={props.onSelect}
      />
    );
  }

  if (geometry.type === "regular-polygon") {
    return <polygon className={className} points={regularPolygonPoints(geometry)} onClick={props.onSelect} />;
  }

  if (geometry.type === "path") {
    return (
      <polyline
        className={className}
        points={geometry.points.map((point) => `${point.x},${-point.y}`).join(" ")}
        strokeWidth={geometry.width ?? 8}
        onClick={props.onSelect}
      />
    );
  }

  if (geometry.type === "rectangle") {
    return (
      <rect
        className={className}
        x={geometry.origin.x}
        y={-geometry.origin.y - geometry.height}
        width={geometry.width}
        height={geometry.height}
        onClick={props.onSelect}
      />
    );
  }

  if (geometry.type === "polygon") {
    return <polygon className={className} points={geometry.points.map((point) => `${point.x},${-point.y}`).join(" ")} onClick={props.onSelect} />;
  }

  return (
    <path
      className={className}
      d={`M ${geometry.center.x} ${-geometry.center.y} L ${geometry.outerRadius} ${-geometry.outerRadius}`}
      onClick={props.onSelect}
    />
  );
}

function regularPolygonPoints(geometry: Extract<LayoutNode["geometry"], { type: "regular-polygon" }>) {
  const rotation = (geometry.rotationDegrees * Math.PI) / 180;
  return Array.from({ length: geometry.sideCount }, (_, index) => {
    const angle = rotation + (index / geometry.sideCount) * Math.PI * 2;
    const x = geometry.center.x + Math.cos(angle) * geometry.radius;
    const y = -(geometry.center.y + Math.sin(angle) * geometry.radius);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}
