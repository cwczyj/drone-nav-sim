import { useRef, useState } from 'react';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import type { DrawingMode } from './DrawingControls';
import './PolygonDrawing.css';

export interface PolygonDrawingProps {
  mode: DrawingMode;
  onPolygonCreate?: (coordinates: [number, number][]) => void;
  onPolygonEdit?: (coordinates: [number, number][]) => void;
  onPolygonDelete?: () => void;
}

export default function PolygonDrawing({
  onPolygonCreate,
  onPolygonEdit,
  onPolygonDelete,
}: PolygonDrawingProps) {
  const editableLayersRef = useRef<L.FeatureGroup | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<L.Polygon | null>(null);

  const extractCoordinates = (layer: L.Layer): [number, number][] => {
    const latLngs = (layer as L.Polygon).getLatLngs() as L.LatLng[];
    const coordinates: [number, number][] = latLngs.map((latlng) => [
      latlng.lng,
      latlng.lat,
    ]);
    
    if (
      coordinates.length > 0 &&
      coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1]
    ) {
      coordinates.push([coordinates[0][0], coordinates[0][1]]);
    }
    
    return coordinates;
  };

  const handleCreated = (e: any) => {
    const layer = e.layer;
    
    if (layer instanceof L.Polygon) {
      if (currentPolygon) {
        editableLayersRef.current?.removeLayer(currentPolygon);
      }
      
      setCurrentPolygon(layer);
      editableLayersRef.current?.addLayer(layer);
      
      const coordinates = extractCoordinates(layer);
      onPolygonCreate?.(coordinates);
    }
  };

  const handleEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polygon) {
        const coordinates = extractCoordinates(layer);
        onPolygonEdit?.(coordinates);
      }
    });
  };

  const handleDeleted = (e: any) => {
    const layers = e.layers;
    let deletedCount = 0;
    
    layers.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polygon) {
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      setCurrentPolygon(null);
      onPolygonDelete?.();
    }
  };

  const handleMounted = (editControl: any) => {
    const map = editControl._map;
    if (map) {
      (map as any).drawControl = editControl;
    }
  };

  return (
    <FeatureGroup ref={editableLayersRef}>
      <EditControl
        position="topright"
        onMounted={handleMounted}
        onCreated={handleCreated}
        onEdited={handleEdited}
        onDeleted={handleDeleted}
        edit={{
          edit: {
            selectedPathOptions: {
              color: '#aa3bff',
              fillColor: '#aa3bff',
              fillOpacity: 0.2,
              weight: 2,
            },
          },
          remove: true,
        }}
        draw={{
          polygon: {
            allowIntersection: false,
            showArea: false,
            shapeOptions: {
              color: '#aa3bff',
              fillColor: '#aa3bff',
              fillOpacity: 0.2,
              weight: 2,
            },
            icon: new L.Icon.Default(),
          },
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        }}
      />
    </FeatureGroup>
  );
}
