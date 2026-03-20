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
}

const generateId = (): string => {
  return `polygon-${Math.random().toString(36).substring(2, 9)}`;
};

function GridOverlay() {
  const gridLines: [number, number][][] = [];
  
  for (let x = 0; x <= 500; x += 50) {
    gridLines.push([
      [x, 0],
      [x, 500]
    ]);
  }
  
  for (let y = 0; y <= 500; y += 50) {
    gridLines.push([
      [0, y],
      [500, y]
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
    [500, 0],
    [500, 500],
    [0, 500],
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
}: Pick<MapCanvasProps, 'polygons' | 'editable' | 'onPolygonCreate' | 'onPolygonEdit'>) {
  const mapRef = useRef<L.Map | null>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('view');
  const [currentPolygon, setCurrentPolygon] = useState<PolygonData | null>(null);

  const crsSimple = L.CRS.Simple;

  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [500, 500]
  ];

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      map.fitBounds(bounds);
      
      if (!editable || drawingMode === 'view') {
        map.scrollWheelZoom.disable();
      } else {
        map.scrollWheelZoom.enable();
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
        bounds={bounds}
        style={{ width: '100%', height: '100%' }}
        zoomControl={editable && drawingMode === 'view'}
        scrollWheelZoom={editable && drawingMode === 'view'}
        doubleClickZoom={editable && drawingMode === 'view'}
        dragging={editable}
        className="map-canvas"
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
      >
        <GridOverlay />
        <BoundaryLines />
        
        {displayPolygons.map((polygon) => (
          <Polygon
            key={polygon.id}
            positions={polygon.coordinates.map(([lng, lat]) => [lat, lng])}
            pathOptions={{
              color: polygon.color || '#aa3bff',
              fillColor: polygon.fillColor || '#aa3bff',
              fillOpacity: polygon.fillOpacity || 0.2,
              weight: 2,
            }}
          />
        ))}
        
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
