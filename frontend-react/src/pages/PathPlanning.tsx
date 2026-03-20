import { useState, useEffect, useCallback } from 'react';
import type { Farmland, PathPlanningResponse } from '../types';
import { farmlandAPI } from '../services/api';
import PathVisualization from '../components/path/PathVisualization';
import PathInfo from '../components/path/PathInfo';

export default function PathPlanning() {
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFarmlandId, setSelectedFarmlandId] = useState<string>('');
  const [swathWidth, setSwathWidth] = useState<number>(10);
  const [useDl, setUseDl] = useState<boolean>(false);

  const [pathData, setPathData] = useState<PathPlanningResponse | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);

  useEffect(() => {
    const fetchFarmlands = async () => {
      try {
        setLoading(true);
        const response = await farmlandAPI.getAll();
        setFarmlands(response.data);
      } catch (err) {
        setError('加载农田列表失败');
        console.error('Failed to fetch farmlands:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmlands();
  }, []);

  const selectedFarmland = farmlands.find((f) => f.id === selectedFarmlandId);

  const handleGeneratePath = () => {
    if (!selectedFarmlandId) {
      setError('请先选择农田');
      return;
    }
    setError(null);
    setShowVisualization(true);
    setPathData(null);
  };

  const handlePathGenerated = useCallback((data: PathPlanningResponse) => {
    setPathData(data);
  }, []);

  const handleExportJson = () => {
    if (!pathData?.path) return;

    const json = JSON.stringify(pathData.path, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flight-path-${selectedFarmlandId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">航线规划</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">规划配置</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              选择农田
            </label>
            <select
              value={selectedFarmlandId}
              onChange={(e) => {
                setSelectedFarmlandId(e.target.value);
                setShowVisualization(false);
                setPathData(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">请选择农田</option>
              {farmlands.map((farmland) => (
                <option key={farmland.id} value={farmland.id}>
                  {farmland.name} ({farmland.area.toFixed(1)} 亩)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              行宽 (米)
            </label>
            <input
              type="number"
              value={swathWidth}
              onChange={(e) => setSwathWidth(Number(e.target.value))}
              min={1}
              max={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              深度学习优化
            </label>
            <div className="flex items-center h-[42px]">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDl}
                  onChange={(e) => setUseDl(e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-600">启用 DL 优化</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              &nbsp;
            </label>
            <button
              onClick={handleGeneratePath}
              disabled={!selectedFarmlandId}
              className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              生成航线
            </button>
          </div>
        </div>
      </div>

      {selectedFarmland && showVisualization && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedFarmland.name} - 航线可视化
                </h2>
              </div>
              <div className="h-[500px]">
                <PathVisualization
                  farmlandId={selectedFarmlandId}
                  boundaryCoords={selectedFarmland.boundary_coords}
                  swathWidth={swathWidth}
                  useDl={useDl}
                  onPathGenerated={handlePathGenerated}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <PathInfo
              pathStats={
                pathData
                  ? {
                      totalDistance: pathData.totalDistance,
                      waypointCount: pathData.path.length,
                      estimatedTime: pathData.estimatedTime,
                      swathWidth,
                    }
                  : null
              }
            />

            {pathData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  导出选项
                </h3>
                <button
                  onClick={handleExportJson}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  导出航点 (JSON)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedFarmlandId && farmlands.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-5xl mb-4">🗺️</div>
          <p className="text-gray-600">请选择一个农田开始规划航线</p>
        </div>
      )}

      {farmlands.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-5xl mb-4">🌾</div>
          <p className="text-gray-600 mb-4">暂无农田数据</p>
          <a
            href="/farmlands"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            创建农田
          </a>
        </div>
      )}
    </div>
  );
}