import { TileLayer } from 'react-leaflet';
import type { TileLayerProps } from 'react-leaflet';

interface TiandituLayerProps extends Omit<TileLayerProps, 'url'> {
  layerType?: 'img' | 'vec' | 'ter';
  showAnnotation?: boolean;
}

/**
 * 天地图瓦片组件
 * 
 * 支持影像 (img)、矢量 (vec)、地形 (ter) 底图
 * 默认叠加中文注记图层 (cia/cva)
 */
export default function TiandituLayer({
  layerType = 'img',
  showAnnotation = true,
  ...props
}: TiandituLayerProps) {
  // 从环境变量读取 Token
  const token = (import.meta as any).env?.VITE_TIANDITU_TOKEN || '';
  
  if (!token) {
    console.warn('Tianditu token not configured. Please set VITE_TIANDITU_TOKEN in .env');
  }

  // 底图 URL (Web Mercator, EPSG:3857)
  const baseUrl = `https://t0.tianditu.gov.cn/DataServer?T=${layerType}_w&X={x}&Y={y}&L={z}&tk=${token}`;
  
  // 注记 URL
  const annotationType = layerType === 'img' ? 'cia' : layerType === 'vec' ? 'cva' : 'cta';
  const annotationUrl = `https://t0.tianditu.gov.cn/DataServer?T=${annotationType}_w&X={x}&Y={y}&L={z}&tk=${token}`;

  return (
    <>
      <TileLayer
        url={baseUrl}
        maxZoom={18}
        minZoom={3}
        attribution='&copy; <a href="http://www.tianditu.gov.cn">天地图</a>'
        {...props}
      />
      {showAnnotation && (
        <TileLayer
          url={annotationUrl}
          maxZoom={18}
          minZoom={3}
          attribution=''
        />
      )}
    </>
  );
}
