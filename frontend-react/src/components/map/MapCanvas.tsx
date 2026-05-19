import { useEffect, useRef, useState } from 'react';
import { MapContainer, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapCanvas.css';
import DrawingControls, { type DrawingMode } from './DrawingControls';
import PolygonDrawing from './PolygonDrawing';
import TiandituLayer from './TiandituLayer';
import { YOUYU_REGION, calculateBoundsFromMultiplePolygons } from '../../utils/geography';

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

const generateColorForPolygon = (coordinates: [number, number][], index: number): { color: string; fillColor: string } => {
  const centerX = coordinates.reduce((sum, [x]) => sum + x, 0) / coordinates.length;
  const centerY = coordinates.reduce((sum, [, y]) => sum + y, 0) / coordinates.length;
  
  const hue = (centerX * 0.5 + centerY * 0.5 + index * 35) % 360;
  const saturation = 70 + (index % 3) * 10;
  const lightness = 45 + (index % 4) * 5;
  
  return {
    color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    fillColor: `hsl(${hue}, ${saturation}%, ${lightness + 10}%)`,
  };
};

function FitBounds({ polygons }: { polygons: PolygonData[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (polygons.length > 0) {
      const allCoords = polygons.map(p => p.coordinates);
      const bounds = calculateBoundsFromMultiplePolygons(allCoords);
      map.fitBounds([
        [bounds.minLat, bounds.minLng],
        [bounds.maxLat, bounds.maxLng]
      ]);
    } else {
      map.fitBounds([
        [YOUYU_REGION.bounds.minLat, YOUYU_REGION.bounds.minLng],
        [YOUYU_REGION.bounds.maxLat, YOUYU_REGION.bounds.maxLng]
      ]);
    }
  }, [polygons, map]);
  
  return null;
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
        center={[YOUYU_REGION.center.latitude, YOUYU_REGION.center.longitude]}
        zoom={13}
        maxZoom={18}
        minZoom={3}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={editable && drawingMode !== 'view'}
        doubleClickZoom={editable && drawingMode !== 'view'}
        dragging={true}
        className="map-canvas"
      >
        <TiandituLayer layerType="img" showAnnotation={true} />
        <FitBounds polygons={displayPolygons} />
        
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
