import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';

// Import leaflet-draw to attach Draw to L
import 'leaflet-draw';

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
  const map = useMap();
  const drawControlRef = useRef<L.Control | null>(null);
  const editableLayersRef = useRef<L.FeatureGroup | null>(null);

  const extractCoordinates = (layer: L.Polygon): [number, number][] => {
    const latLngs = layer.getLatLngs();
    
    // Handle nested arrays (multi-polygon case)
    const firstRing = Array.isArray(latLngs[0]) ? latLngs[0] : latLngs;
    
    // Convert LatLng objects to [lng, lat] tuples
    const coordinates: [number, number][] = (firstRing as any[])
      .filter((latlng) => latlng && typeof latlng.lat === 'number' && typeof latlng.lng === 'number')
      .map((latlng) => [latlng.lng, latlng.lat]);
    
    // Ensure polygon is closed (first point equals last point)
    if (
      coordinates.length > 0 &&
      (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1])
    ) {
      coordinates.push([coordinates[0][0], coordinates[0][1]]);
    }
    
    return coordinates;
  };

  useEffect(() => {
    // Initialize feature group for editable layers
    editableLayersRef.current = new L.FeatureGroup();
    map.addLayer(editableLayersRef.current);
    
    // Clear any existing layers in the feature group to ensure clean state
    editableLayersRef.current.clearLayers();

    // Handle draw:created event
    const onDrawCreated = (e: any) => {
      const layer = e.layer;
      
      if (layer instanceof L.Polygon) {
        const coordinates = extractCoordinates(layer);
        onPolygonCreate?.(coordinates);
      }
    };

    // Handle draw:edited event
    const onDrawEdited = (e: any) => {
      const layers = e.layers;
      layers.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Polygon) {
          const coordinates = extractCoordinates(layer);
          onPolygonEdit?.(coordinates);
        }
      });
    };

    // Handle draw:deleted event
    const onDrawDeleted = (e: any) => {
      const layers = e.layers;
      let deletedCount = 0;
      
      layers.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Polygon) {
          deletedCount++;
        }
      });
      
      if (deletedCount > 0) {
        onPolygonDelete?.();
      }
    };

    // Create draw control
    // Access L.Control.Draw from the L namespace (leaflet-draw attaches it there)
    const DrawControl = (L as any).Control.Draw;
    if (DrawControl) {
      drawControlRef.current = new DrawControl({
        edit: {
          featureGroup: editableLayersRef.current,
          edit: {
            selectedPathOptions: {
              color: '#aa3bff',
              fillColor: '#aa3bff',
              fillOpacity: 0.2,
              weight: 2,
            },
          },
          remove: true,
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: false,
            shapeOptions: {
              color: '#aa3bff',
              fillColor: '#aa3bff',
              fillOpacity: 0.2,
              weight: 2,
            },
          },
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
      });
    }

    if (drawControlRef.current) {
      map.addControl(drawControlRef.current);
    }

    // Add event listeners using string event names
    const DrawEvents = (L as any).Draw?.Event || {
      CREATED: 'draw:created',
      EDITED: 'draw:edited',
      DELETED: 'draw:deleted',
    };
    
    map.on(DrawEvents.CREATED, onDrawCreated);
    map.on(DrawEvents.EDITED, onDrawEdited);
    map.on(DrawEvents.DELETED, onDrawDeleted);

    // Cleanup
    return () => {
      if (drawControlRef.current) {
        try {
          map.removeControl(drawControlRef.current);
        } catch (e) {
          // Control may have already been removed
        }
      }
      if (editableLayersRef.current) {
        map.removeLayer(editableLayersRef.current);
      }
      map.off(DrawEvents.CREATED, onDrawCreated);
      map.off(DrawEvents.EDITED, onDrawEdited);
      map.off(DrawEvents.DELETED, onDrawDeleted);
    };
  }, [map, onPolygonCreate, onPolygonEdit, onPolygonDelete]);

  return null;
}
