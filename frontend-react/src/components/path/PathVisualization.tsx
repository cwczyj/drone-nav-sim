import { useEffect, useState, useCallback } from 'react';
import { MapContainer, Polygon, Polyline, CircleMarker, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { pathPlanningAPI } from '../../services/api';
import type { PathPlanningResponse } from '../../types';
import styles from './PathVisualization.module.css';

interface PathVisualizationProps {
  farmlandId: string;
  boundaryCoords: number[][];
  swathWidth?: number;
  useDl?: boolean;
  onPathGenerated?: (data: PathPlanningResponse) => void;
  // 所有农田模式下的额外属性
  allFarmlandsMode?: boolean;
  allPathsData?: import('../../types').AllFarmlandsPathResponse;
  mergeFarmlands?: boolean;
}

// Calculate center point from boundary coordinates for map view
const getCenter = (boundaryCoords: number[][]): [number, number] => {
  if (boundaryCoords.length === 0) return [0, 0];
  const avgX = boundaryCoords.reduce((sum, coord) => sum + coord[0], 0) / boundaryCoords.length;
  const avgY = boundaryCoords.reduce((sum, coord) => sum + coord[1], 0) / boundaryCoords.length;
  return [avgY, avgX]; // Note: Leaflet uses [lat, lng] = [y, x]
};

// Calculate bounds from boundary coordinates
const getBounds = (boundaryCoords: number[][]): [[number, number], [number, number]] => {
  if (boundaryCoords.length === 0) {
    return [[-1, -1], [1, 1]];
  }
  const xs = boundaryCoords.map(c => c[0]);
  const ys = boundaryCoords.map(c => c[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  // Add some padding
  const padding = Math.max(maxX - minX, maxY - minY) * 0.1;
  return [
    [minY - padding, minX - padding],
    [maxY + padding, maxX + padding]
  ];
};

// Calculate bounds from view_bounds (backend provided)
const getBoundsFromViewBounds = (viewBounds: {
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
}): [[number, number], [number, number]] => {
  return [
    [viewBounds.min_y, viewBounds.min_x],
    [viewBounds.max_y, viewBounds.max_x]
  ];
};

export default function PathVisualization({
  farmlandId,
  boundaryCoords,
  swathWidth = 2,
  useDl = false,
  onPathGenerated,
  allFarmlandsMode = false,
  allPathsData,
  mergeFarmlands = false,
}: PathVisualizationProps) {
  const [pathData, setPathData] = useState<PathPlanningResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const center = getCenter(boundaryCoords);
  
  // 在合并模式下使用后端返回的 view_bounds 计算缩放级别
  const bounds = mergeFarmlands && allPathsData?.view_bounds
    ? getBoundsFromViewBounds(allPathsData.view_bounds)
    : getBounds(boundaryCoords);

  const fetchPath = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pathPlanningAPI.generate({
        farmland_id: farmlandId,
        swath_width: swathWidth,
        use_dl: useDl,
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
    if (farmlandId && !allFarmlandsMode) {
      fetchPath();
    }
  }, [farmlandId, fetchPath, allFarmlandsMode]);

  // Polygon positions: Leaflet uses [lat, lng] = [y, x]
  const polygonPositions: [number, number][] = boundaryCoords.map((coord) => [coord[1], coord[0]]);

  // Path positions: convert waypoints to [lat, lng] format
  const pathPositions: [number, number][] = allFarmlandsMode && allPathsData?.merged_path
    ? allPathsData.merged_path.map((wp) => [wp[1], wp[0]])
    : pathData?.waypoints 
      ? pathData.waypoints.map((wp) => [wp[1], wp[0]]) 
      : [];

  // 在合并模式下，不显示 loading，直接使用返回的数据
  const showLoading = loading && !allFarmlandsMode;

  if (showLoading) {
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
        crs={L.CRS.Simple}
        bounds={bounds}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        className={styles['map-container']}
        data-testid="map-container"
      >
        <TileLayer
          attribution=''
          url=''
        />

        {/* Farmland boundary polygons */}
        {allFarmlandsMode && allPathsData?.farmland_boundaries ? (
          // 在合并模式下，显示每个农田的边界（不同颜色）
          allPathsData.farmland_boundaries.map((boundary, index) => {
            const positions: [number, number][] = boundary.coords.map((coord) => [coord[1], coord[0]]);
            const colors = ['#aa3bff', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];
            return (
              <Polygon
                key={boundary.farmland_id}
                positions={positions}
                pathOptions={{
                  color: colors[index % colors.length],
                  fillColor: colors[index % colors.length],
                  fillOpacity: 0.15,
                  weight: 2,
                }}
              />
            );
          })
        ) : (
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: '#aa3bff',
              fillColor: '#aa3bff',
              fillOpacity: 0.2,
              weight: 2,
            }}
          />
        )}

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
            {pathPositions.map((pos, index) => {
              const isStart = index === 0;
              const isEnd = index === pathPositions.length - 1;

              return (
                <CircleMarker
                  key={`waypoint-${index}`}
                  center={pos}
                  pathOptions={{
                    color: isStart ? '#22c55e' : isEnd ? '#ef4444' : '#3b82f6',
                    fillColor: isStart ? '#22c55e' : isEnd ? '#ef4444' : '#3b82f6',
                    fillOpacity: 0.8,
                    weight: 2,
                  }}
                  radius={isStart || isEnd ? 8 : 5}
                />
              );
            })}
          </>
        )}
      </MapContainer>
    </div>
  );
}