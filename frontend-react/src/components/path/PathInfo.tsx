import styles from './PathVisualization.module.css';

interface PathStats {
  totalDistance: number;
  waypointCount: number;
  estimatedTime: number;
  swathWidth: number;
}

interface PathInfoProps {
  pathStats: PathStats | null;
}

export default function PathInfo({ pathStats }: PathInfoProps) {
  if (!pathStats) {
    return (
      <div className={styles['info-panel']}>
        <p className={styles['info-placeholder']}>暂无航线数据</p>
      </div>
    );
  }

  const formatDistance = (distance: number): string => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km`;
    }
    return `${distance.toFixed(1)} m`;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  return (
    <div className={styles['info-panel']}>
      <h3 className={styles['panel-title']}>航线统计</h3>
      
      <div className={styles['stats-grid']}>
        <div className={styles['stat-item']}>
          <div className={styles['stat-icon']}>📏</div>
          <div className={styles['stat-content']}>
            <span className={styles['stat-label']}>总距离</span>
            <span className={styles['stat-value']}>{formatDistance(pathStats.totalDistance)}</span>
          </div>
        </div>

        <div className={styles['stat-item']}>
          <div className={styles['stat-icon']}>🎯</div>
          <div className={styles['stat-content']}>
            <span className={styles['stat-label']}>航点数量</span>
            <span className={styles['stat-value']}>{pathStats.waypointCount}</span>
          </div>
        </div>

        <div className={styles['stat-item']}>
          <div className={styles['stat-icon']}>⏱️</div>
          <div className={styles['stat-content']}>
            <span className={styles['stat-label']}>预计飞行时间</span>
            <span className={styles['stat-value']}>{formatTime(pathStats.estimatedTime)}</span>
          </div>
        </div>

        <div className={styles['stat-item']}>
          <div className={styles['stat-icon']}>📐</div>
          <div className={styles['stat-content']}>
            <span className={styles['stat-label']}>行宽</span>
            <span className={styles['stat-value']}>{pathStats.swathWidth.toFixed(1)} m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
