import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { pathPlanningAPI } from '../../services/api';
import type { PathPlanningResponse } from '../../types';
import styles from './PathVisualization.module.css';

interface PathVisualizationProps {
  farmlandId: string;
  boundaryCoords: number[][];
  swathWidth?: number;
  useDl?: boolean;
  onPathGenerated?: (data: PathPlanningResponse) => void;
}

interface Waypoint {
  lat: number;
  lng: number;
  index: number;
}

// Convert canvas coordinates (0-500) to lat/lng for visualization
const convertToLatLng = (coords: number[][], center: [number, number]): Waypoint[] => {
  const scale = 0.001; // Adjust scale for visualization
  return coords.map((point, index) => ({
    lat: center[0] + (point[1] - 250) * scale,
    lng: center[1] + (point[0] - 250) * scale,
    index,
  }));
};

// Calculate center point from boundary coordinates
const getCenter = (boundaryCoords: number[][]): [number, number] => {
  const avgLat = boundaryCoords.reduce((sum, coord) => sum + coord[0], 0) / boundaryCoords.length;
  const avgLng = boundaryCoords.reduce((sum, coord) => sum + coord[1], 0) / boundaryCoords.length;
  return [avgLat, avgLng];
};

export default function PathVisualization({
  farmlandId,
  boundaryCoords,
  swathWidth = 2,
  useDl = false,
  onPathGenerated,
}: PathVisualizationProps) {
  const [pathData, setPathData] = useState<PathPlanningResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const center = getCenter(boundaryCoords);

  const fetchPath = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pathPlanningAPI.generate({
        farmlandId,
        swathWidth,
        useDl,
      });
      setPathData(response.data);
      onPathGenerated?.(response.data);
    } catch (err) {
      setError('生成航线失败，请重试');
      console.error('Failed to generate path:', err);
    } finally {
      setLoading(false);
    }
  }, [farmlandId, swathWidth, useDl, onPathGenerated]);

  useEffect(() => {
    if (farmlandId) {
      fetchPath();
    }
  }, [farmlandId, fetchPath]);

  const polygonPositions: [number, number][] = boundaryCoords.map((coord) => [coord[0], coord[1]]);

  const pathWaypoints = pathData?.path ? convertToLatLng(pathData.path, center) : [];
  const pathPositions: [number, number][] = pathWaypoints.map((wp) => [wp.lat, wp.lng]);

  if (loading) {
    return (
      <div className={styles['visualization-container']}>
        <div className={styles['loading-state']} role="status">
          <div className={styles.spinner} />
          <p>正在生成最佳航线...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['visualization-container']}>
        <div className={styles['error-state']}>
          <div className={styles['error-icon']}>⚠️</div>
          <p>{error}</p>
          <button className={styles['retry-button']} onClick={fetchPath}>
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['visualization-container']}>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        className={styles['map-container']}
        zoomControl={true}
        data-testid="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Farmland boundary polygon */}
        <Polygon
          positions={polygonPositions}
          pathOptions={{
            color: 'var(--accent)',
            fillColor: 'var(--accent)',
            fillOpacity: 0.2,
            weight: 2,
          }}
        >
          <Popup>农田边界</Popup>
        </Polygon>

        {/* Flight path polyline */}
        {pathPositions.length > 0 && (
          <>
            <Polyline
              positions={pathPositions}
              pathOptions={{
                color: '#ef4444',
                weight: 3,
                opacity: 0.8,
                dashArray: '5, 5',
              }}
            />

            {/* Waypoints as circles */}
            {pathWaypoints.map((waypoint, index) => {
              const isStart = index === 0;
              const isEnd = index === pathWaypoints.length - 1;

              return (
                <CircleMarker
                  key={`waypoint-${waypoint.index}`}
                  center={[waypoint.lat, waypoint.lng]}
                  pathOptions={{
                    color: isStart ? '#22c55e' : isEnd ? '#ef4444' : '#3b82f6',
                    fillColor: isStart ? '#22c55e' : isEnd ? '#ef4444' : '#3b82f6',
                    fillOpacity: 0.8,
                    weight: 2,
                  }}
                  radius={isStart || isEnd ? 8 : 5}
                >
                  <Popup>
                    {isStart ? '起点' : isEnd ? '终点' : `航点 ${index + 1}`}
                  </Popup>
                </CircleMarker>
              );
            })}
          </>
        )}
      </MapContainer>
    </div>
  );
}
