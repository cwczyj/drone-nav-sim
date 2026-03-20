import { useEffect, useRef, useState } from 'react';
import { MapContainer, Polygon, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapCanvas.css';
import DrawingControls, { type DrawingMode } from './DrawingControls';
import PolygonDrawing from './PolygonDrawing';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface PolygonData {
  id: string;
  coordinates: [number, number][];
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
}

export interface MapCanvasProps {
  polygons?: PolygonData[];
  onPolygonCreate?: (polygon: PolygonData) => void;
  onPolygonEdit?: (polygon: PolygonData) => void;
  editable?: boolean;
  showGrid?: boolean;
}

const generateId = (): string => {
  return `polygon-${Math.random().toString(36).substring(2, 9)}`;
};

// Generate distinct colors for polygons based on their position
const generateColorForPolygon = (coordinates: [number, number][], index: number): { color: string; fillColor: string } => {
  // Calculate centroid of the polygon
  const centerX = coordinates.reduce((sum, [x]) => sum + x, 0) / coordinates.length;
  const centerY = coordinates.reduce((sum, [, y]) => sum + y, 0) / coordinates.length;
  
  // Use HSL color space to generate distinct colors
  // Hue is based on position to ensure nearby polygons have different colors
  const hue = (centerX * 0.5 + centerY * 0.5 + index * 35) % 360;
  const saturation = 70 + (index % 3) * 10; // 70-90%
  const lightness = 45 + (index % 4) * 5;   // 45-60%
  
  return {
    color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    fillColor: `hsl(${hue}, ${saturation}%, ${lightness + 10}%)`,
  };
};

function GridOverlay() {
  const gridSize = 1000;
  const gridLines: [number, number][][] = [];
  
  for (let x = 0; x <= gridSize; x += 100) {
    gridLines.push([
      [x, 0],
      [x, gridSize]
    ]);
  }
  
  for (let y = 0; y <= gridSize; y += 100) {
    gridLines.push([
      [0, y],
      [gridSize, y]
    ]);
  }

  return (
    <>
      {gridLines.map((line, index) => (
        <Polyline
          key={`grid-${index}`}
          positions={line}
          pathOptions={{
            color: '#9ca3af',
            weight: 0.5,
            opacity: 0.3,
            dashArray: '5, 5',
            interactive: false,
          }}
        />
      ))}
    </>
  );
}

function BoundaryLines() {
  const boundary: [number, number][] = [
    [0, 0],
    [1000, 0],
    [1000, 1000],
    [0, 1000],
    [0, 0]
  ];

  return (
    <Polyline
      positions={boundary}
      pathOptions={{
        color: '#08060d',
        weight: 2,
        opacity: 0.8,
        interactive: false,
      }}
    />
  );
}

export default function MapCanvas({
  polygons = [],
  editable = false,
  onPolygonCreate,
  onPolygonEdit,
  showGrid = true,
}: Pick<MapCanvasProps, 'polygons' | 'editable' | 'onPolygonCreate' | 'onPolygonEdit' | 'showGrid'>) {
  const mapRef = useRef<L.Map | null>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('view');
  const [currentPolygon, setCurrentPolygon] = useState<PolygonData | null>(null);

  const crsSimple = L.CRS.Simple;

  // Extended bounds to allow zooming out further
  const extendedBounds: L.LatLngBoundsExpression = [
    [-200, -200],
    [1200, 1200]
  ];

  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [1000, 1000]
  ];

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      map.fitBounds(bounds);
      
      // Enable scroll wheel zoom when not in view mode
      if (editable && drawingMode !== 'view') {
        map.scrollWheelZoom.enable();
      } else {
        map.scrollWheelZoom.disable();
      }
    }
  }, [editable, drawingMode]);

  const handlePolygonCreate = (coordinates: [number, number][]) => {
    const newPolygon: PolygonData = {
      id: generateId(),
      coordinates,
      color: '#aa3bff',
      fillColor: '#aa3bff',
      fillOpacity: 0.2,
    };
    setCurrentPolygon(newPolygon);
    onPolygonCreate?.(newPolygon);
  };

  const handlePolygonEdit = (coordinates: [number, number][]) => {
    if (currentPolygon) {
      const updatedPolygon: PolygonData = {
        ...currentPolygon,
        coordinates,
      };
      setCurrentPolygon(updatedPolygon);
      onPolygonEdit?.(updatedPolygon);
    }
  };

  const handlePolygonDelete = () => {
    setCurrentPolygon(null);
  };

  const displayPolygons = currentPolygon ? [...polygons, currentPolygon] : polygons;

  return (
    <div className="map-canvas-container">
      <DrawingControls
        mode={drawingMode}
        onModeChange={setDrawingMode}
        disabled={!editable}
      />
      <MapContainer
        ref={mapRef}
        crs={crsSimple}
        bounds={extendedBounds}
        maxBounds={extendedBounds}
        maxBoundsViscosity={0.8}
        minZoom={-2}
        maxZoom={5}
        zoom={1}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={editable && drawingMode !== 'view'}
        doubleClickZoom={editable && drawingMode !== 'view'}
        dragging={true}
        className="map-canvas"
      >
        {showGrid && <GridOverlay />}
        {showGrid && <BoundaryLines />}
        
        {displayPolygons.map((polygon, index) => {
          // Auto-generate color if not provided
          const colorConfig = polygon.color 
            ? { color: polygon.color, fillColor: polygon.fillColor || polygon.color }
            : generateColorForPolygon(polygon.coordinates, index);
          
          return (
            <Polygon
              key={polygon.id}
              positions={polygon.coordinates.map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                color: colorConfig.color,
                fillColor: colorConfig.fillColor,
                fillOpacity: polygon.fillOpacity || 0.2,
                weight: 2,
              }}
            />
          );
        })}
        
        {editable && drawingMode !== 'view' && (
          <PolygonDrawing
            mode={drawingMode}
            onPolygonCreate={handlePolygonCreate}
            onPolygonEdit={handlePolygonEdit}
            onPolygonDelete={handlePolygonDelete}
          />
        )}
      </MapContainer>
    </div>
  );
}
